const {MacOSDefaults} = require('macos-defaults');

const mod = new MacOSDefaults();

function addLaunchServiceHandler (serviceHandler) {
    return mod.write({
        domain: 'com.apple.LaunchServices/com.apple.launchservices.secure.plist',
        key: 'LSHandlers',
        value: ['array-add', [serviceHandler]]
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
    // Todo: Add these options to UI
    case 'editOnly': // Should this just be `LSHandlerRoleAll`?
        roles.push('LSHandlerRoleEditor');
        break;
    case 'shell':
        roles.push('LSHandlerRoleShell');
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
    return getLaunchServiceHandlers({contentType}).then((handler) => {
        if (handler) {
            return {added: false, handler};
        }
        const params = {
            LSHandlerContentType: contentType
        };
        addRolesForMode({mode, params, appID});
        return addLaunchServiceHandler(params).then(() => {
            return {added: true};
        });
    });
}

function addExtensionHandlerIfNotExisting ({extension, mode, appID}) {
    return getLaunchServiceHandlers({contentTag: extension}).then((handler) => {
        if (handler) {
            return {added: false, handler};
        }
        const params = {
            LSHandlerContentTag: extension,
            LSHandlerContentTagClass: 'public.filename-extension'
        };
        addRolesForMode({mode, params, appID});
        return addLaunchServiceHandler(params).then(() => {
            return {added: true};
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
            const result = LSHandlers.find(({LSHandlerContentType}) => {
                return LSHandlerContentType && contentType === LSHandlerContentType;
            });
            // Allow `contentTag` to execute if this fails
            if (result) {
                return result;
            }
        }
        if (type === 'public.mime-type') { // For MIME type, we allow `contentType` as parameter since it really is one
            contentTag = contentType;
        }
        if (!contentTag) {
            throw new Error('`getLaunchServiceHandlers()` is missing a `contentTag` or `contentType` argument');
        }
        return LSHandlers.find(({LSHandlerContentTag, LSHandlerContentTagClass}) => {
            return LSHandlerContentTag &&
                LSHandlerContentTagClass === type &&
                contentTag === LSHandlerContentTag;
        });
    });
}

exports.addContentTypeHandlerIfNotExisting = addContentTypeHandlerIfNotExisting;
exports.addExtensionHandlerIfNotExisting = addExtensionHandlerIfNotExisting;
exports.addLaunchServiceHandler = addLaunchServiceHandler;
exports.getLaunchServiceHandlers = getLaunchServiceHandlers;
