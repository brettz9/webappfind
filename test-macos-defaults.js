const {MacOSDefaults} = require('macos-defaults');
const mod = new MacOSDefaults();
const mdls = require('mdls');

mdls('/Users/brett/macOS-defaults/test/parser.js', (err, data) => {
    // Note: the prefix "kMD" is stripped
    if (err) {
        console.log(err);
        return;
    }
    console.log('ItemContentType', data.ItemContentType);
    // Todo: This may also be useful if handler not found of that type
    console.log('ItemContentTypeTree', data.ItemContentTypeTree);
});

/*
// Todo: Should add support of unescaped dates to `macos-defaults` (as returned by this test)
const {execSync} = require('child_process');
const PlistParser = require('macos-defaults/PlistParser');
const plist = '{' +
    execSync('mdls "/Users/brett/Library/Preferences/com.apple.iWork.Numbers.plist"', {encoding: 'utf-8'}) +
    '}';
console.log('plist', plist);
const parser = new PlistParser({
    plist,
    // allowAngledBracketStrings: true,
    allowMissingSeparators: true
});
const info = parser.start();
console.log(info);
*/

/*
// These are apparently potentially available
LSHandlerRoleAll
LSHandlerRoleViewer
LSHandlerRoleEditor
LSHandlerRoleShell

Also has `LSHandlerPreferredVersions` (which may have its own `LSHandlerRoleAll` at least, e.g., set to `-`)
*/
async function getLaunchServiceHandlers ({contentTag, contentType}) {
    const LSHandlers = await mod.read('com.apple.LaunchServices/com.apple.launchservices.secure', 'LSHandlers');
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
    if (!contentTag) {
        throw new Error('`getLaunchServiceHandlers()` is missing a `contentTag` or `contentType` argument');
    }
    return LSHandlers.find(({LSHandlerContentTag, LSHandlerContentTagClass}) => {
        return LSHandlerContentTag &&
            LSHandlerContentTagClass === 'public.filename-extension' &&
            contentTag === LSHandlerContentTag;
    });
}
(async () => {
const handlersCSS = await getLaunchServiceHandlers({contentType: 'public.css'});
// console.log('handlers', handlers.LSHandlerPreferredVersions);
console.log('handlersCSS', handlersCSS.LSHandlerRoleAll);

const handlersByTag = await getLaunchServiceHandlers({contentTag: 'sqlite'});
console.log('handlersByTag', handlersByTag.LSHandlerRoleAll);
})();
