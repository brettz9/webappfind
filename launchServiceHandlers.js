const {MacOSDefaults} = require('macos-defaults');

const mod = new MacOSDefaults();

function cloneJSON (json) {
    return JSON.parse(JSON.stringify(json));
}

function addLaunchServiceHandlers (serviceHandlers) {
    return mod.write({
        domain: 'com.apple.LaunchServices/com.apple.launchservices.secure.plist',
        key: 'LSHandlers',
        value: ['array-add', serviceHandlers]
    });
}

function setLaunchServiceHandlers (serviceHandlers) {
    return mod.write({
        domain: 'com.apple.LaunchServices/com.apple.launchservices.secure.plist',
        key: 'LSHandlers',
        value: ['array', serviceHandlers]
    });
}

function addRolesForMode ({mode, params, appID}) {
    const roles = [];
    switch (mode) {
    case 'view':
        roles.push('LSHandlerRoleViewer');
        break;
    case 'edit':
        roles.push('LSHandlerRoleViewer', 'LSHandlerRoleEditor');
        break;
    case 'shell':
        roles.push('LSHandlerRoleShell');
        break;
    // Todo: Add these options to UI
    case 'editOnly': // Should this just be `LSHandlerRoleAll`?
        roles.push('LSHandlerRoleEditor');
        break;
    case 'all':
        roles.push('LSHandlerRoleAll');
        break;
    }
    roles.forEach((role) => {
        params[role] = appID;
    });
}

function addContentTypeHandlerIfNotExisting ({contentType, mode, appID}) {
    return getLaunchServiceHandlers({contentType}).then(({foundHandler: handler}) => {
        if (handler) {
            return {added: false, handler};
        }
        const params = {
            LSHandlerContentType: contentType
        };
        addRolesForMode({mode, params, appID});
        return addLaunchServiceHandlers([params]).then(() => {
            return {added: true, params};
        });
    });
}

function addExtensionHandlerIfNotExisting ({extension, mode, appID}) {
    return getLaunchServiceHandlers({contentTag: extension}).then(({foundHandler: handler}) => {
        if (handler) {
            return {added: false, handler};
        }
        const params = {
            LSHandlerContentTag: extension,
            LSHandlerContentTagClass: 'public.filename-extension'
        };
        addRolesForMode({mode, params, appID});
        return addLaunchServiceHandlers([params]).then(() => {
            return {added: true, params};
        });
    });
}

/*
// Examples

const handlersCSS = await getLaunchServiceHandlers({contentType: 'public.css'});
// console.log('handlers', handlers.LSHandlerPreferredVersions);
console.log('handlersCSS', handlersCSS.LSHandlerRoleAll);
const handlersByTag = await getLaunchServiceHandlers({contentTag: 'sqlite'});
console.log('handlersByTag', handlersByTag.LSHandlerRoleAll);
// const handlersCSSMimeType = await getLaunchServiceHandlers({contentTag: 'text/css', type: 'mime'}); // https://superuser.com/questions/421792/how-to-associate-mime-type-with-a-handler-in-os-x
*/
function getLaunchServiceHandlers ({contentTag, contentType, type = 'extension'}) {
    switch (type) {
    default: {
        if (type) { // Allow user to specify their own manually
            break;
        }
    } // Fallthrough
    case 'extension':
        type = 'public.filename-extension';
        break;
    case 'mime': {
        type = 'public.mime-type';
        break;
    }
    }

    return mod.read({
        domain: 'com.apple.LaunchServices/com.apple.launchservices.secure',
        key: 'LSHandlers'
    }).then((LSHandlers) => {
        // console.log('LSHandlers', LSHandlers);
        if (contentType) {
            const foundIndex = LSHandlers.findIndex(({LSHandlerContentType}) => {
                return LSHandlerContentType && contentType === LSHandlerContentType;
            });
            // Allow `contentTag` to execute if this fails
            if (foundIndex > -1) {
                return {
                    foundIndex,
                    foundHandler: foundIndex > -1 ? LSHandlers[foundIndex] : null,
                    allHandlers: LSHandlers
                };
            }
        }
        if (type === 'public.mime-type') { // For MIME type, we allow `contentType` as parameter since it really is one
            contentTag = contentType;
        }
        if (!contentTag) {
            throw new Error('`getLaunchServiceHandlers()` is missing a `contentTag` or `contentType` argument');
        }
        const foundIndex = LSHandlers.findIndex(({LSHandlerContentTag, LSHandlerContentTagClass}) => {
            return LSHandlerContentTag &&
                LSHandlerContentTagClass === type &&
                contentTag === LSHandlerContentTag;
        });
        return {
            foundIndex,
            foundHandler: foundIndex > -1 ? LSHandlers[foundIndex] : null,
            allHandlers: LSHandlers
        };
    });
}

function addOrReplaceExtensionHandler ({extension, mode, appID}) {
    return getLaunchServiceHandlers({contentTag: extension}).then(({
        foundIndex: index,
        foundHandler: handler,
        allHandlers
    }) => {
        const params = {
            LSHandlerContentTag: extension,
            LSHandlerContentTagClass: 'public.filename-extension'
        };
        addRolesForMode({mode, params, appID});
        if (!handler) {
            // Use less risky approach of `array-add`
            return addLaunchServiceHandlers([params]).then(() => {
                return {added: true, replaced: false, params, allHandlers};
            });
        }
        // Since there is no API to replace a particular handler, we have to
        // replace all of the handlers, substituting the old with the new
        const LSHandlersClone = cloneJSON(allHandlers);
        LSHandlersClone.splice(index, 1, params);
        return setLaunchServiceHandlers(LSHandlersClone).then(() => {
            return {added: true, replaced: true, params, allHandlers: LSHandlersClone};
        });
    });
}

function addOrReplaceContentTypeHandler ({contentType, mode, appID}) {
    return getLaunchServiceHandlers({contentType}).then(({
        foundIndex: index,
        foundHandler: handler,
        allHandlers
    }) => {
        const params = {
            LSHandlerContentType: contentType
        };
        addRolesForMode({mode, params, appID});
        if (!handler) {
            // Use less risky approach of `array-add`
            return addLaunchServiceHandlers([params]).then(() => {
                return {added: true, replaced: false, params, allHandlers};
            });
        }
        // Since there is no API to replace a particular handler, we have to
        // replace all of the handlers, substituting the old with the new
        const LSHandlersClone = cloneJSON(allHandlers);
        LSHandlersClone.splice(index, 1, params);
        return setLaunchServiceHandlers(LSHandlersClone).then(() => {
            return {added: true, replaced: true, params, allHandlers: LSHandlersClone};
        });
    });
}

exports.addContentTypeHandlerIfNotExisting = addContentTypeHandlerIfNotExisting;
exports.addExtensionHandlerIfNotExisting = addExtensionHandlerIfNotExisting;
exports.addLaunchServiceHandlers = addLaunchServiceHandlers;
exports.setLaunchServiceHandlers = setLaunchServiceHandlers;
exports.getLaunchServiceHandlers = getLaunchServiceHandlers;
exports.addOrReplaceExtensionHandler = addOrReplaceExtensionHandler;
exports.addOrReplaceContentTypeHandler = addOrReplaceContentTypeHandler;
