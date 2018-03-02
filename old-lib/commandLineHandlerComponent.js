// commandLineHandlerComponent.js - webappfind's module
// author: brettz9

/*globals module, require */

// https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsICategoryManager
// https://developer.mozilla.org/en-US/docs/Chrome/Command_Line

module.exports = function registerComponent (cmdConfig) {
    'use strict';
    var CommandLineHandler, factory,
        chrome = require('chrome'),
        Class = require('sdk/core/heritage').Class,
        xpcom = require('sdk/platform/xpcom'),
        Unknown = xpcom.Unknown, Factory = xpcom.Factory,
        // XPCOM module doesn't add categories for us, so we need chrome to handle
        Cc = chrome.Cc,
        Ci = chrome.Ci,
        catMan = Cc['@mozilla.org/categorymanager;1'].getService(Ci.nsICategoryManager),
        // configuration-specific
        commandLineName = cmdConfig.name,
        helpInfo = cmdConfig.help,
        handler = cmdConfig.handler,
        classDescription = cmdConfig.description,
        contractId = '@mozilla.org/commandlinehandler/general-startup;1?type=' + commandLineName;

    // Define a component
    CommandLineHandler = Class({
        'extends': Unknown,
        //get wrappedJSObject() this,
        classDescription: classDescription, // Does not seem to be used per Cc['@mozilla.org/commandlinehandler/general-startup;1?type=webappfind'].QueryInterface(Ci.nsIClassInfo).classDescription
        // The SDK adds a "description" to heritage's Class, but from a quick look, Class does not seem to convert "description" into "classDescription"
        interfaces: ['nsICommandLineHandler'],
        // nsICommandLineHandler
        helpInfo: helpInfo, // Not used per http://forums.mozillazine.org/viewtopic.php?p=2025775&sid=d0ee64ccb490e98d481b854cae0fec31#p2025775 ?
        handle: handler
      //,hello: function() {return 'Hello World';}
    });

    // Create and register the factory
    factory = Factory({
        contract: contractId,
    //  id: '{7f397cba-7a9a-4a05-9ca7-a5b8d7438c6c}', // doesn't working with both an ID and contract ID
        Component: CommandLineHandler
    });

    catMan.addCategoryEntry('command-line-handler', 'm-' + commandLineName, contractId, false, true);

    // XPCOM clients can retrieve and use this new
    // component in the normal way
    /* works (with wrappedJSObject line above uncommented):
    var wrapper = Cc[contractId].createInstance(Ci.nsISupports),
        helloWorld = wrapper.wrappedJSObject;
    console.log(helloWorld.hello());
    */
};
