/*globals exports, require */
/*jslint todo: true*/

/*
README TODOS:

0. Deficiencies of WebStorageAPI relative to this solution: https://wiki.mozilla.org/WebAPI/DeviceStorageAPI
    a. "type" is fixed to a particular location on one's hard drive (not by file type)
    b. typing system is also not extensible by users (even if general WebActivity API is)
    c. forces implementers to support all file types (at least within that folder)
    d. doesn't allow specification of hierarchies of types (e.g., myJson->json->js) for
        fallbacks for as-yet-unregistered types or for alternate editor types
    e. doesn't allow recommendation of default handlers when opening a file for the first time
0. (Current) Advantages of WebStorageAPI
    a. Already offers a way to:
        i. enumerate files in a directory (useful above AYW too if one wishes to launch web app
           at a specific directory from file system, e.g., to build a list of files in a web app
           at a particular path, or trigger an upload, etc.)
        ii. add or delete files (useful above AYW if desiring to add files of a particular format
           on one's desktop)
        iii. listen for creation/deletion/modified (probably most useful for our
            purposes here, e.g., for version tracking)

1. Between AsYouWish one-off permissions and add-on sites;
I could add it to AYW, but may be more helpful for now to isolate
the functionality in hopes of approval (though a mechanism besides
registerProcol would be better in order to clarify to users exactly
what such a registration entails)
2. I could allow the command line to listen for calls to a specific
(hard-coded) web app in which to open the file for viewing or editing, etc.
*/

/**
* This is an active module of the brettz9 Add-on
* @todo code to unregister component, remove category from category manager
*/

(function () {'use strict';

function l(msg) {
    console.log(msg);
}

exports.main = function() {

    var data = require('sdk/self').data,
        pageMod = require('sdk/page-mod'),
        MatchPattern = require('sdk/page-mod/match-pattern').MatchPattern,
        relayResponse = require('./relayResponse'),
        webAppFindResponses = require('./webAppFindResponses'),
        fileBrowserResponses = require('./fileBrowserResponses');
    
    var commandLineObj = require('./componentRegistrations')();
    
    /*
    // If we can get nsICommandHandler registration working, we shouldn't need this, even for file:
    pageMod.PageMod({
        include: '*',
        contentScriptFile: data.url('postMessageRelay.js'),
        contentScriptWhen: 'ready',
        attachTo: [
            'top',
//            'existing',
            'frame'
        ],
        onAttach: function (worker) {
            var commandLineObj = require('./componentRegistrations')({
                'view': function () {
                    worker.port.emit('webappfindStart');
                }
            });
            //(relayResponse.bind(webAppFindResponses)())(worker);
        }
    });
    */
/*
    pageMod.PageMod({
      include: 'file://                  *', // new MatchPattern(/file:[^.]*  /), // not working for some reason
      contentScriptFile: [data.url('jml.js'), data.url('directoryMod.js')],
      contentScriptWhen: 'ready',
      contentScriptOptions: { // any JSON-serializable key/values
        folderImage: data.url('Yellow_folder_icon_open.png')
      },
      //contentStyleFile: '',
      attachTo: [
        'top',
        // 'existing', // todo: reenable this later as very useful!
        'frame'
      ],
      onAttach: relayResponse.bind(fileBrowserResponses)()
    });

*/

};

}());
