/* eslint-disable node/no-unsupported-features/es-syntax */

const {MacOSDefaults} = require('macos-defaults');

const mod = new MacOSDefaults();
const mdls = require('mdls');

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
async function getLaunchServiceHandlers ({contentTag, contentType, type = 'extension'}) {
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
}
(async () => {
try {
  const data = await mdls('/Users/brett/macOS-defaults/test/parser.js');
  // Note: the prefix "kMD" is stripped
  console.log('ItemContentType', data.ItemContentType);
  // Todo: This may also be useful if handler not found of that type
  console.log('ItemContentTypeTree', data.ItemContentTypeTree);
} catch (err) {
  console.log(err);
  return;
}

const handlersCSS = await getLaunchServiceHandlers({contentType: 'public.css'});
// console.log('handlers', handlers.LSHandlerPreferredVersions);
console.log('handlersCSS', handlersCSS.LSHandlerRoleAll);

const handlersByTag = await getLaunchServiceHandlers({contentTag: 'sqlite'});
console.log('handlersByTag', handlersByTag.LSHandlerRoleAll);

// const handlersCSSMimeType = await getLaunchServiceHandlers({contentTag: 'text/css', type: 'mime'}); // https://superuser.com/questions/421792/how-to-associate-mime-type-with-a-handler-in-os-x
})();
