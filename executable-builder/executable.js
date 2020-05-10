/* eslint-env webextensions, browser */
/* eslint-disable default-case,
  node/no-unsupported-features/node-builtins */

import {jml, $, $$, nbsp} from '/vendor/jamilih/dist/jml-es-noinnerh.js';
import {_} from '/utils/i18n.js';
import {Dialog} from '/utils/dialogs.js';
import {
  serialize as formSerialize, deserialize as formDeserialize
} from '/vendor/form-serialization/dist/index-es.js';
import * as BrowserHistory from '/executable-builder/BrowserHistory.js';
import * as FileBridge from '/node-bridges/FileBridge.js';
import * as ExecutableBuilder from '/executable-builder/ExecutableBuilder.js';
import * as EnvironmentBridge from '/node-bridges/EnvironmentBridge.js';
import * as ProfileBridge from '/node-bridges/ProfileBridge.js';
import * as TemplateFileBridge from '/node-bridges/TemplateFileBridge.js';
// import * as ExecBridge from '/node-bridges/ExecBridge.js';
import loadStylesheets from '/vendor/load-stylesheets/dist/index-es.js';

const uiLanguage = browser.i18n.getUILanguage();
const dialogs = new Dialog({locale: uiLanguage});

/*
Todos:
1. Build command line output including path flag (Windows info)
  1. Use command line http://www.registryonwindows.com/registry-command-line.php
    (invokable from browser add-on) to add to registry re: "open with" values or
    use js-ctypes or command line for integrating with deeper Windows
    (and Linux) functionality? e.g., adding items for 'open with'?
    1. http://msdn.microsoft.com/en-us/library/windows/desktop/cc144158%28v=vs.85%29.aspx
      1. See http://www.enzinger.net/en/FileAsso.html regarding
        SHChangeNotify SHCNE_ASSOCCHANGED to avoid need for restart!
      1. Use DefaultIcon instead of building a shortcut?
    1. http://stackoverflow.com/questions/21082752/ftype-assoc-priority-and-adding-to-openwithlist-from-the-command-line/24343882?iemail=1&noredirect=1#24343882
    1. http://msdn.microsoft.com/en-us/library/windows/desktop/cc144148%28v=vs.85%29.aspx#fa_optional_keys_attributes
    1. http://msdn.microsoft.com/en-us/library/windows/desktop/hh127445%28v=vs.85%29.aspx
    1. http://msdn.microsoft.com/en-us/library/bb166549%28v=vs.80%29.aspx
    1. http://msdn.microsoft.com/en-us/library/bb166181%28v=vs.80%29.aspx
    1. http://msdn.microsoft.com/en-us/library/bb165967%28v=vs.80%29.aspx
    1. http://msdn.microsoft.com/en-us/library/windows/desktop/cc144152%28v=vs.85%29.aspx
    1. http://msdn.microsoft.com/en-us/library/windows/desktop/hh127451%28v=vs.85%29.aspx
    1. http://msdn.microsoft.com/en-us/library/aa911706.aspx
    1. http://msdn.microsoft.com/en-us/library/windows/desktop/cc144156%28v=vs.85%29.aspx
    1. example: http://msdn.microsoft.com/en-us/library/bb165967.aspx
    1. http://vim.wikia.com/wiki/Windows_file_associations
    1. http://vim.wikia.com/wiki/Launch_files_in_new_tabs_under_Windows#Using_File_Associations
    1. http://ss64.com/nt/reg.html
    1. http://superuser.com/a/700773/156958 ?
    1. Option to associate with Windows 'verbs' (i.e., Open, Edit, Print, Play,
      Preview or custom):
      1. http://msdn.microsoft.com/en-us/library/bb165967.aspx
      1. http://msdn.microsoft.com/en-us/library/windows/desktop/cc144175%28v=vs.85%29.aspx
    1. Creating Windows context menus including submenus!
      1. http://msdn.microsoft.com/en-us/library/windows/desktop/cc144171%28v=vs.85%29.aspx
      1. http://msdn.microsoft.com/en-us/library/windows/desktop/cc144173%28v=vs.85%29.aspx
    1. Avoid need for separate batch by specifying executable and path
      with needed command line options in registry?
    1. Command line standards!!: http://technet.microsoft.com/en-us/library/ee156811.aspx
1. Search for other 'todo' instances below
*/

(async () => {
/*
function l (msg) {
  console.log(msg);
}
*/
const os = browser.runtime.PlatformOs;
const nbsp3 = ` ${nbsp} `;

let pathInputCtr = 0, fileExtIDCtr = 0, winOpenCtr = 0;

function templateExistsInMenu (val) {
  return [...$('[name=templates]').options].some((option) => {
    return option.text === val;
  });
}
function getHardPath (dir) {
  return paths[dir];
}
function createRevealButton (sel) {
  return ['input', {
    type: 'button',
    class: 'revealButton',
    dataset: {sel}
  }];
}
function createFileExtensionControls () {
  /*
  Todos:
  1. Associate file extensions to file type, and file type to executable: ftype/assoc
  1. Make as default (or only use with open with...)); OpenWithProgids ?
  1. reg query (add?)
    HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\FileExts\.svg\OpenWithList
  1. List all file types in pull-down in case someone wants to create an
    explicit file type for a given extension (or just a file type in
    case the registry already handles extension-to-type associations)
    ('assoc' for all <.fileext>=<filetype>, 'assoc + <filetype>' to
    get <.fileext>=<long name>; 'ftype' for all <filetype>='<exe path>' %1, etc.)
  1. List all existing extension-to-type associations, extension-to-long-name,
    type-to-exe, or extension-to-exe
  1. See discussion on icons below for app ID association (and adding to
    recent docs or jump list customization)
  1. Optionally pin apps programmatically to task bar (when task bar path
    is chosen), supporting dragging and dropping to it or requiring a
    hard-coded document path/URL
  1. Support drag-and-drop of files to this dialog (to supply document path or
    URL if it is a URL)
  */

  /*

1. Add `CFBundleDocumentTypes` (content types and/or extensions)
2. Could add `UTExportedTypeDeclarations`/`UTImportedTypeDeclarations` for using or making known
  a. `UTExportedTypeDeclarations`
    1. Declaring so others might use our type (and they might invoke our app with some data)
  b. `UTImportedTypeDeclarations`
    1. Let third-party apps know about our support of their types (e.g., to show in their "Open in")
      1. We could provide WebAppFind sites with an API to receive a list of these apps and their info
  c. Regular file open/edit communication apparently can just occur via LaunchServices (and `UTImportedTypeDeclarations` discovery?)
  d. For other inter-app communication, however (besides file
    opening/saving/executing, like copy-paste, drag-and-drop, app services like
    dictionary look-up, and others (workspace/subprocesses/remote messaging)
    etc.), see https://developer.apple.com/library/archive/referencelibrary/GettingStarted/GS_InterapplicationCommunication/_index.html
  e. Resources
    1. https://stackoverflow.com/questions/21937978/what-are-utimportedtypedeclarations-and-utexportedtypedeclarations-used-for-on-i
    2. https://developer.apple.com/library/archive/documentation/FileManagement/Conceptual/understanding_utis/understand_utis_declare/understand_utis_declare.html
3. Make Mac App known:
  a. https://ss64.com/osx/lsregister.html
  b. /System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister
4. If file-specific, accept file as argument, and use `xattr`
  a. https://ss64.com/osx/xattr.html
  b. `com.apple.LaunchServices.OpenWith`: https://superuser.com/a/1254271/156958
  c. `ls -la@` can get the info
5. Register with Launch Services for defaults
  a. Ensure not already present:
    1. defaults read com.apple.LaunchServices/com.apple.launchservices.secure.plist LSHandlers
  b. defaults write com.apple.LaunchServices/com.apple.launchservices.secure.plist LSHandlers -array-add ......
  c. While extension setting is clear, unclear on preferred MIME type setting means: https://apple.stackexchange.com/questions/328325/preferred-way-to-set-default-application-by-content-mime-type-from-the-command-l
6. killall Finder
7. If not providing mdls tool, inform users of how to use
  `mdls` per https://apple.stackexchange.com/a/9883/206073
8. Apparently no application-agnostic way to map MIME to extension: https://apple.stackexchange.com/questions/328330/map-mime-type-to-extension-application-agnostically-via-command-line

For reading Mac association of MIME to file type,

defaults read /System/Library/CoreServices/CoreTypes.bundle/Contents/Info.plist

MIMETypeToExtensionMap =   {
    "application/andrew-inset" =     (
      ez
    );
    ...

// For building `kMDItemContentTypeTree` (hierarchy of content types, e.g., jsoncshcmea->json->text)?
// optionally specifies extension and/or mime type

// https://stackoverflow.com/questions/21937978/what-are-utimportedtypedeclarations-and-utexportedtypedeclarations-used-for-on-i
UTImportedTypeDeclarations
  UTTypeConformsTo =     (
      "public.xml",
      "public.audiovisual-content",
      "public.3d-content"
    );
    UTTypeDescription = "Digital Asset Exchange (DAE)";
    UTTypeIdentifier = "org.khronos.collada.digital-asset-exchange";
    UTTypeTagSpecification =     {
      "public.filename-extension" =       (
        dae
      );
    };
  }

UTExportedTypeDeclarations =   (
...
{
       UTTypeConformsTo =       (
         "public.text",
         "public.item",
         "public.calendar-event"
       );
       UTTypeDescription = "VCS File";
       UTTypeIconFiles =       (
         "calendar_20x20.png",
         "calendar_20x20@2x.png",
         "calendar_145x145.png",
         "calendar_145x145@2x.png"
       );
       UTTypeIdentifier = "com.apple.ical.vcs";
       UTTypeTagSpecification =       {
         "public.filename-extension" =         (
           vcs,
           vcal
         );
         "public.mime-type" =         (
           "text/x-vcalendar"
         );
       };
     },

  */
  const fileExtensionID = ++fileExtIDCtr;
  return ['div', {id: 'fileExtensionInfoHolder' + fileExtensionID}, [
    ['label', [
      _('file_extension_associate_open_with'),
      ['input', {
        name: 'fileExtensionAssociateOpenWith[]',
        size: 10,
        class: 'fileExtension'
      }]
    ]],
    ['br'],
    ['label', [
      _('make_default_handler_for_extension'),
      ['input', {
        type: 'checkbox',
        name: 'makeDefaultHandlerForExtension[]'
      }]
    ]],
    ['br'],
    ['label', [
      _('file_content_type_associate'),
      ['input', {
        name: 'fileContentTypeAssociate[]',
        size: 10,
        class: 'fileExtension'
      }]
    ]],
    ['br'],
    ['label', [
      _('make_default_handler_for_content_type'),
      ['input', {
        type: 'checkbox',
        name: 'makeDefaultHandlerForContentType[]'
      }]
    ]],
    ['button', {
      class: 'addFileExtensionInfo',
      dataset: {groupID: fileExtensionID, type: 'add', group: 'fileExtension'}
    }, [
      _('plus')
    ]],
    ['button', {
      class: 'removeFileExtensionInfo',
      dataset: {groupID: fileExtensionID, type: 'remove', group: 'fileExtension'}
    }, [
      _('minus')
    ]],
    ['hr']
  ]];
}

/**
* Creates paths where one can save the executable, e.g., desktop,
* start-up, start menu, task bar, quick launch (with click to reveal
* any of these folders once added); creates an input type which
* does auto-complete for paths.
* @returns {JamilihArray}
*/
function createPathInput () {
  const i = ++pathInputCtr;
  return ['div', {id: 'executablePathHolder' + i}, [
    ['label', [
      _('executable_name'),
      ['input', {
        name: 'executableName', // name: 'executableName[]',
        required: 'true',
        class: 'executableName'
      }]
    ]],
    nbsp3,
    ['label', {title: _('executable_id_tooltip')}, [
      _('executable_id'),
      ['input', {
        name: 'executableID', // name: 'executableID[]',
        class: 'executableID',
        pattern: '[a-zA-Z.\\d-]+', // The following in one place allows for digits and another does not https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/CoreFoundationKeys.html#//apple_ref/doc/uid/TP40009249-SW9
        placeholder: (
          // dot, hyphen, upper/lower case allowed
          reverseDNS || 'com.my-domain'
        ) + '.my-App-ID'
      }]
    ]],
    /*
    // TODO: Reenable for Windows at least when ready
    nbsp3,
    ['label', [
      _('preserve_shortcut'),
      ['input', {
        name: 'preserve_shortcut[]',
        type: 'checkbox',
        class: 'preserveShortcut'
      }]
    ]],
    nbsp3,
    ['label', {for: 'convertToExe' + i}, [
      _('change_batch_exe')
    ]],
    ['input', {
      type: 'checkbox',
      id: 'convertToExe' + i,
      name: 'convertToExe[]',
      class: 'convertToExe',
      $on: {
        click: ({target}) => {
          if (!target.checked) {
            target.nextElementSibling.remove();
            return;
          }
          target.nextElementSibling.before(jml(
            'div', {class: 'sedPreserveHolder'}, [
              ['label', {title: _('preserve_sed_file_explanation')}, [
                _('preserve_sed_file'),
                ['input', {
                  class: 'sedPreserve',
                  dataset: {i},
                  type: 'checkbox'
                }]
              ]],
              nbsp3,
              ['label', {title: _('preserve_batch_file_explanation')}, [
                _('preserve_batch_file'),
                ['input', {
                  class: 'batchPreserve',
                  dataset: {i},
                  type: 'checkbox'
                }]
              ]]
            ]
          ));
        }
      }}
    ],
    */
    ['br'],
    ['label', {for: 'executablePath' + i}, [
      _('executable_save_directory')
    ]],
    ['input', {
      type: 'text',
      id: 'executablePath' + i,
      name: 'executablePath', // name: 'executablePath[]',
      list: 'datalist', autocomplete: 'off',
      required: 'true', size: 100, value: '', dataset: {executablePathInput: i},
      class: 'dirPath'
    }],
    /*
    // Todo: We might reenable this if we implement a
    //   Ajax+Node-based file picker (could even use
    //   Miller columns, etc.)
    ['button', {dataset: {dirPick: i}}, [
      _('browse_file')
    ]],
    ` ${_('or')} `,
    */
    ['select', {dataset: {executablePathSelect: 'executablePath' + i}}, [
      ['option', {value: ''}, [_('or_choose_location')]],
      ['option', {value: getHardPath('Executable')}, [
        _('executable_within_profile_folder')
      ]],
      ['option', {value: getHardPath('Desk')}, [_('Desktop')]],
      ['option', {value: getHardPath('Strt')}, [_('Start_up')]],
      (os === 'win'
        ? ['option', {value: getHardPath('Progs')}, [
          _('Start_menu')
        ]]
        : ''
      ),
      (os === 'win'
        ? ['option', {value: getHardPath('TaskBar')}, [
          _('Task_bar')
        ]]
        : ''
      ),
      ['option', {value: getHardPath('ProfD')}, [_('Profile_folder')]],
      ['option', {value: getHardPath('ProgF')}, [_('Programs')]]
    ]],
    createRevealButton('#executablePath' + i)
    /*
    // Not sure why I was trying to allow multiple `executablePath`/`executableName`
    ['button', {
      class: 'addExecutableInfo',
      dataset: {pathInputID: i, type: 'add'}
    }, [
      _('plus')
    ]],
    ['button', {
      class: 'removeExecutableInfo',
      dataset: {pathInputID: i, type: 'remove'}
    }, [
      _('minus')
    ]],
    ['hr']
    */
  ]];
}

/*
// TODO: Reenable when ready
function getProfiles () {
  return profiles.map((optVal) => {
    return ['option', [optVal]];
  });
}
*/

/*
// TODO: Reenable for Windows at least when ready
function modifierKeypress (e) {
  // Windows only allows ctrl+alt+XX for a shortcut; otherwise, we could use https://gist.github.com/brettz9/8661692
  if (
    // The following are disallowed in Windows shortcuts: Esc, Enter, Tab, Spacebar, PrtScn, Shift, or Backspace (see http://windows.microsoft.com/en-hk/windows/create-keyboard-shortcuts-open-programs#1TC=windows-7 )
    e.charCode === 32 || // Space bar is found here
    [27, 13, 9, 32, 44, 16, 8, // Esc, Enter, Tab, Spacebar, PrtScn, Shift, Backspace (we really only need for space, enter, tab, and backspace here as the others don't do anything with keypress)
      46, 35, 36, 33, 34, 37, 38, 39, 40, 93 // also prevent Del, End, Home, PgUp, PgDown, Arrows (left, up, right, down), ?
    ].includes(e.keyCode)
  ) {
    e.target.value = '';
  } else {
    e.target.value = _('alt_ctrl', String.fromCharCode(e.charCode).toUpperCase()); // We upper-case as Windows auto-upper-cases in the UI
  }
  e.preventDefault();
}
*/
function createAssociatedDesktopFileControls () {
  const associatedDesktopFileID = ++fileExtIDCtr;
  return ['div', {id: 'associatedDesktopFileInfoHolder' + associatedDesktopFileID}, [
    ['label', {for: 'associateDesktopFilePath' + associatedDesktopFileID}, [
      _('associate_desktop_file'),
      ' '
    ]],

    ['select', {
      id: 'associateDesktopFilePathSelect' + associatedDesktopFileID,
      dataset: {
        executablePathSelect: 'associateDesktopFilePath' + associatedDesktopFileID
      }
    }, [
      ['option', {value: ''}, [_('choose_location')]],
      ['option', {value: getHardPath('Docs')}, [_('Documents')]],
      ['option', {value: getHardPath('Desk')}, [_('Desktop')]]
    ]],
    ['input', {
      type: 'text',
      id: 'associateDesktopFilePath' + associatedDesktopFileID,
      name: 'associateDesktopFilePath[]',
      list: 'associateDesktopFilePathDatalist',
      autocomplete: 'off',
      size: 70, value: ''
    }],
    /*
    // Todo: We might reenable this if we implement a
    //   Ajax+Node-based file picker (could even use
    //   Miller columns, etc.)
    ' ',
    ['button', {id: 'associateDesktopFilePick'}, [
      _('browse_file')
    ]],
    */
    createRevealButton('[name=associateDesktopFilePath' + associatedDesktopFileID + ']'),
    ['datalist', {id: 'associateDesktopFilePathDatalist'}],
    ['button', {
      class: 'addAssociatedFileInfo',
      dataset: {groupID: associatedDesktopFileID, type: 'add', group: 'associatedDesktopFile'}
    }, [
      _('plus')
    ]],
    ['button', {
      class: 'removeAssociatedFileInfo',
      dataset: {groupID: associatedDesktopFileID, type: 'remove', group: 'associatedDesktopFile'}
    }, [
      _('minus')
    ]]
  ]];
}
function createTemplatedForm () {
  return ['form', {id: 'dynamic', $on: {submit (e) {
    e.preventDefault();
  }}}, [
    ['label', [
      _('template_name'),
      ' ',
      ['input', {name: 'templateName'}]
    ]],
    nbsp3,
    ['label', [
      _('description'),
      ' ',
      ['textarea', {name: 'description'}]
    ]],
    ['fieldset', {id: 'pathHolder'}, [
      ['legend', [_('executable_directories')]],
      ['datalist', {id: 'datalist'}],
      createPathInput()
    ]],
    /*
    // TODO: Reenable for Windows at least when ready
    ['div', [
      ['label', [
        _('window_style'),
        ' ',
        ['select', {name: 'windowStyleSelect'}, [
          ['option', {
            value: '1',
            title: _('window_activate_restore_explanation')
          }, [_('window_activate_restore')]],
          ['option', {
            value: '3',
            title: _('window_activate_maximize_explanation')
          }, [_('window_activate_maximize')]],
          ['option', {
            value: '7',
            title: _('window_minimize_explanation')
          }, [_('window_minimize')]]
        ]]
      ]],
      ['br'],
      ['label', [
        _('global_hot_key'),
        ' ',
        ['input', {
          name: 'hotKey',
          $on: {keypress: modifierKeypress}
        }]
      ]],
      */
    /*
      // TODO: Reenable when ready
      ['br'],
      ['label', {for: 'iconPath'}, [
        _('icon_path_executable'),
        ' '
      ]],
      ['select', {id: 'iconPathSelect'}, [
        ['option', {value: ''}, [_('choose_location')]],
        ['option', {value: getHardPath('Desk')}, [_('Desktop')]],
        ['option', {value: getHardPath('Pict')}, [_('Pictures')]],
        ['option', {value: getHardPath('browserIcon')}, [_('browser_icon')]]
      ]],
      ['input', {
        type: 'text', id: 'iconPath', name: 'iconPath', list: 'datalist', autocomplete: 'off',
        size: 70, value: ''
      }],
      ' ',
      */
    /*
      // Todo: We might reenable this if we implement a
      //   Ajax+Node-based file picker (could even use
      //   Miller columns, etc.)
      ['button', {id: 'iconPick'}, [
        _('browse_file')
      ]],
      createRevealButton('[name=iconPath]'),
      ` ${_('or')} `,
      */
    /*
      Todo:
      1. Icon (Use export-as-png in SVG Edit; need filetypes.json ICO
      handler--allow testing by previewing as favicon)
        1. (Paths where to read into a list of available
        ico files, subject to a filetypes.json file in those
        directories) (might utilize those paths already added for saving)
        1. If filetypes.json has an icons section, use that by default instead?
        1. open SVG or ICO but save back at least to ICO and
          ideally to SVG (but multiple file saving not supported
          currently by WebAppFind, so do through add-on for now)
      1. Ensure icon will work by assigning appIDs to specific windows,
        profile (processes?), or app (idea to list browser tabs in jump
        list?); SHAddToRecentDocs may add app ID AND add the
        potentially useful behavior of putting web apps into recent
        docs (if add support, make this optional)
          Windows: Separate windows get app IDs (SHGetPropertyStoreForWindow)
          Process: SetCurrentProcessExplicitAppUserModelID
          File association registration (ProgIDs; in Win7, add AppUserModelID)
          Jump list destinations/tasks: ICustomDestinationList
          Shortcut (PKEY_AppUserModel_ID)
          SHAddToRecentDocs
      ['button', {
        id: 'openOrCreateICO',
        title: _('create_edit_ico_file_explanation')
      }, [
        _('create_edit_ico_file')
      ]]
    ]],
    */
    // TODO: Put this into a radio stack of 2-3 options (with the
    //      others hidden at a time); (3 options total if reenabling
    //      hard-coded URL)
    ['fieldset', [
      ['legend', [_('file_type_association')]],
      ['div', {id: 'fileExtensionHolder'}, [
        createFileExtensionControls()
      ]],
      ` ${_('or').toUpperCase()} `,
      ['label', {for: 'desktopFilePath'}, [
        _('hard_coded_desktop_file'),
        ' '
      ]],
      ['select', {id: 'desktopFilePathSelect'}, [
        ['option', {value: ''}, [_('choose_location')]],
        ['option', {value: getHardPath('Docs')}, [_('Documents')]],
        ['option', {value: getHardPath('Desk')}, [_('Desktop')]]
      ]],
      ['input', {
        type: 'text', id: 'desktopFilePath', name: 'desktopFilePath',
        list: 'desktopFilePathDatalist', autocomplete: 'off',
        size: 70, value: ''
      }],
      /*
      // Todo: We might reenable this if we implement a
      //   Ajax+Node-based file picker (could even use
      //   Miller columns, etc.)
      ' ',
      ['button', {id: 'desktopFilePick'}, [
        _('browse_file')
      ]],
      */
      createRevealButton('[name=desktopFilePath]'),
      ['datalist', {id: 'desktopFilePathDatalist'}],
      /*
      , ['br'],
      ` ${_('or').toUpperCase()} `,
      ['label', [
        // Esp. if implementing PUT, can send back to
        //  this location where obtained
        _('hard_coded_url_document_file'),
        ' ',
        ['input', {
          type: 'url', name: 'documentURLBox',
          list: 'documentURLDatalist', autocomplete: 'off',
          size: 100, value: ''
        }],
        ['datalist', {id: 'documentURLDatalist'}]
      ]]
      */
      ['br'],
      ` ${_('or').toUpperCase()} `,
      ['label', [
        _('string'),
        ['input', {type: 'checkbox', name: 'string'}]
      ]]
    ]],
    /*
    // Todo: Should be able to enable this by running `xattr`, but
    //   we have to figure out how to get hex for our app and `com.apple.LaunchServices.OpenWith`
    // a. https://eclecticlight.co/2017/12/20/xattr-com-apple-launchservices-openwith-sets-a-custom-app-to-open-a-file/
    // b. https://ss64.com/osx/xattr.html
    // c. `com.apple.LaunchServices.OpenWith`: https://superuser.com/a/1254271/156958
    // d. `ls -la@` can get the info
    ['fieldset', [
      ['legend', [_('specific_files_for_opening')]],
      ['div', {id: 'associatedDesktopFileHolder'}, [
        createAssociatedDesktopFileControls()
      ]]
    ]],
    ['br'],
    */
    // */
    /*
    // TODO: Reenable when ready
    ['div', [
      ['label', [
        ['input', {
          type: 'radio',
          value: 'open_with_webappfind',
          name: 'executableType',
          checked: 'checked'
        }],
        _('open_with_webappfind')
      ]],
      ['label', [
        ['input', {
          type: 'radio',
          value: 'open_hard_coded_url_only',
          name: 'executableType'
        }],
        _('open_hard_coded_url_only')
      ]],
      ['label', [
        ['input', {
          type: 'radio',
          value: 'dont_open_url',
          name: 'executableType'
        }],
        _('dont_open_url')
      ]]
    ]],
    */
    /*
    Todo:
    1. Separate executables like Prism?: hard-code a profile (create
      one programmatically for user in an install script?)
      1. Use ProfileBridge.createProfile
        1. e.g., firefox.exe -no-remote -P executable http://example.com
    1. Whether to auto-create a new profile just for this combination
      of options and a -no-remote call to allow executable-like
      behavior (creates a separate icon instance in the task bar
      though not a separate icon unless, again, the icon is
      attached to a short cut)
    */
    /*
    // TODO: Reenable for Windows at least when ready
    ['div', [
      ['label', {for: 'profileName'}, [
        _('profile_for_executable'),
        ' '
      ]],
      ['select', {id: 'profileNameSelect'}, getProfiles()],
      ' ',
      ['input', {id: 'profileName', name: 'profileName'}],
      ' ',
      ['button', {id: 'manageProfiles'}, [
        _('manage_profiles')
      ]]
    ]],
    */
    ['label', [
      _('filePicker'),
      ['input', {type: 'checkbox', name: 'filePicker'}]
    ]],
    ['br'],
    ['label', [
      _('mode'),
      ' ',
      ['select', {name: 'mode'}, [
        ['option', {value: 'view'}, [_('view_mode')]],
        ['option', {value: 'edit'}, [_('edit_mode')]],
        ['option', {value: 'shell'}, [_('shell_mode')]]
      ]]
    ]],
    nbsp3,
    ['label', [
      _('binary'),
      ['input', {type: 'checkbox', name: 'binary'}]
    ]],
    /*
    // TODO: Reenable for Windows at least when ready
    // TODO: Change to array of custom modes
    nbsp3,
    ['label', [
      _('custom_mode'),
      ' ',
      ['input', {name: 'customMode'}]
    ]],
    */
    /*
    // TODO: Reenable for Windows at least when ready
    ['br'],
    ['label', [
      _('webappfind_preference_overrides'),
      ' '
    ]],
    */
    ['br'],
    // Creates an autocomplete for URLs
    // Todo:
    // 1. An optional, hard-coded web app URL (to circumvent the
    //   normal detection procedures and always open with a
    //   given web app)
    ['label', [
      _('hard_coded_web_app_URI'),
      ' ',
      ['input', {
        type: 'url', name: 'site',
        list: 'urlDatalist', autocomplete: 'off',
        size: 100, value: ''
      }],
      ['datalist', {id: 'urlDatalist'}]
    ]],
    ['label', [
      ['div', [
        _('arguments_json')
      ]],
      ['div', {id: 'argumentsJSONDescription'}, [
        _('arguments_json_description')
      ]],
      ['textarea', {
        id: 'args',
        name: 'args',
        $custom: {
          $validate ({format}) {
            try {
              const parsed = JSON.parse(this.value);
              if (format) {
                this.value = JSON.stringify(parsed, null, 2);
              }
              // Remove any error state
              this.setCustomValidity('');
            } catch (err) {
              this.setCustomValidity(err);
            }
          }
        },
        $on: {
          input () {
            this.$validate({format: false});
          },
          change () {
            this.$validate({format: true});
          }
        }
      }]
    ]],
    ['br'],
    ['br'],
    /*
    // Todo: implement
    ['label', [
      _('behavior_upon_URL_open'),
      ' ',
      ['select', {name: 'behaviorUponURLOpen'}, [
        ['option', {value: 'new-tab'}, [_('behavior_new_tab')]],
        ['option', {value: 'new-window'}, [_('behavior_new_window')]],
        ['option', {value: 'hidden-window'}, [_('behavior_hidden_window')]]
      ]]
    ]],
    ['br'],
    */
    //  Todo: 1. Whether web app to open by default in full-screen
    //       mode (could just let web app and user handle, but
    //       user may prefer to bake it in to a particular
    //       executable only)
    /*
    ['label', [
      _('open_fullscreen_mode'),
      ['input', {name: 'open_fullscreen_mode', type: 'checkbox'}]
    ]],
    ['br'],
    */
    //  Todo: 1. Batch file building section; Raw textarea (OR
    //        (only?) when webappfind is also installed...)
    /*
    ['label', [
      _('extra_batch_file_commands'),
      ' ',
      ['br'],
      ['textarea', {name: 'extra_batch_file_commands'}]
    ]],
    ['br'],
    //  Todo: 1. Strings
    ['label', [
      _('hard_coded_string_to_pass'),
      ' ',
      ['br'],
      ['textarea', {name: 'hard_coded_string_to_pass'}]
    ]],
    ['br'],
    //  Todo: 1. JavaScript (implement with CodeMirror or option to
    //        load JS file (itself invocable with WebAppFind)
    //        instead)
    ['label', [
      _('hard_coded_eval_string_to_pass'),
      ' ',
      ['br'],
      ['textarea', {name: 'hard_coded_eval_string_to_pass'}]
    ]],
    ['br'],
    //  Todo: 1. Arguments
    ['label', [
      _('extra_command_line_args'),
      ' ',
      // ['br'],
      ['input', {size: 100, name: 'extra_command_line_args'}]
    ]],
    ['br'],
    */
    ['button', {id: 'createExecutable'}, [
      _('create_executable_save_template')
    ]],
    nbsp3,
    ['button', {id: 'runCommands'}, [
      _('run_commands_save_template')
    ]]
  ]];
}

// BEGIN EVENT ATTACHMENT

function openOrCreateICOResponse () {
  // TODO:
}

// COPIED FROM filebrowser-enhanced directoryMod.js (RETURN ALL MODIFICATIONS THERE)
function autocompletePathsResponse ({listID, optValues}) {
  const datalist = $('#' + listID);
  while (datalist.firstChild) {
    datalist.firstChild.remove();
  }
  optValues.forEach((value) => {
    jml('option', {
      // text: value,
      value
    }, datalist);
  });
}

function autocompleteURLHistoryResponse ({listID, optValues}) { // , optIcons
  const datalist = $('#' + listID);
  while (datalist.firstChild) {
    datalist.firstChild.remove();
  }
  optValues.forEach((value, i) => {
    jml('option', {
      // text: value,
      value
      // Works as a regular option, but not a datalist option (including
      //  if option text is provided)
      // Can't use currently due to https://bugzilla.mozilla.org/show_bug.cgi?id=1411120#c6
      // style: 'background: no-repeat url(' + optIcons[i] + ');'
    }, datalist);
  });
}

function deleteTemplateResponse ({fileName}) {
  $('[name=templates]').remove(
    [...$('[name=templates]').options].findIndex((option) => {
      return option.text === fileName;
    })
  );
  // dialogs.alert(message);
}

function populateFormFromJSON (json) {
  [
    // ['executable_name', 'ExecutableInfo'],
    ['fileExtensionAssociateOpenWith', 'FileExtensionInfo']
    // ['associateDesktopFilePath', 'AssociatedFileInfo']
  ].forEach(([name, baseName]) => {
    const jsonLength = name in json ? json[name].length : 0;
    const formLength = $$(`[name="${name}[]"]`).length; // $('#dynamic')[name + '[]'] only got one item
    let diff = Math.abs(jsonLength - formLength);
    if (!diff) {
      return;
    }
    const sel = '.' + (jsonLength > formLength ? 'add' : 'remove') + baseName;
    while (diff) {
      $(sel).click();
      diff--;
    }
  });
  // json['executable_name'].length
  // json['fileExtensionAssociateOpenWith'].length
  console.log('json', json);
  const form = $('#dynamic');
  form.reset();
  formDeserialize(form, json);
}

function fileOrDirResult ({path, selector}) {
  if (path) {
    $(selector).value = path;
  }
}
const filePickResult = fileOrDirResult;
const dirPickResult = fileOrDirResult;

function saveTemplateResult ({templateName}) {
  if (!templateExistsInMenu(templateName)) {
    $('[name=templates]').add(jml('option', [templateName]));
  }
  // dialogs.alert(message);
}

function init () {
  window.addEventListener('input', async function ({target}) {
    const {name, value, nextElementSibling, dataset: {executablePathInput}} = target;

    if (!value) {
      return;
    }
    if (executablePathInput) {
      if ([...nextElementSibling.classList].includes('pinAppHolder')) {
        nextElementSibling.remove();
      }
      if (value === getHardPath('TaskBar')) {
        // Todo: Possible to allow pinning to task bar without
        //     saving the executable/batch there?
        nextElementSibling.before(jml(
          'div', {class: 'pinAppHolder'}, [
            ['label', {title: _('pin_app_task_bar_explanation')}, [
              _('pin_app_task_bar'),
              ['input', {
                class: 'pinApp',
                dataset: {i: executablePathInput},
                type: 'checkbox'
              }]
            ]]
          ]
        ));
      }
      const response = await FileBridge.autocompletePaths({
        value,
        listID: target.getAttribute('list'),
        dirOnly: true
      });
      autocompletePathsResponse(response);
      return;
    }
    switch (name) {
    case 'customMode': {
      target.value = target.value.replace(/[^a-z]/, '');
      break;
    } case 'site': case 'documentURLBox': {
      /*
      if (value.length < 9) { // http://.
        return;
      }
      */
      const response = await BrowserHistory.autocompleteURLHistory({
        value,
        listID: target.getAttribute('list')
      });
      autocompleteURLHistoryResponse(response);
      break;
    // eslint-disable-next-line default-case-last
    } default: {
      if (!name.startsWith('associateDesktopFilePath')) {
        break;
      }
    } // Fallthrough
    case 'desktopFilePath': case 'iconPath': {
      const response = await FileBridge.autocompletePaths({
        value,
        listID: target.getAttribute('list')
      });
      autocompletePathsResponse(response);
      break;
    }
    }
  });

  window.addEventListener('change', async function ({target}) {
    const {name, value, id} = target;
    if (id === 'siteRecommended') {
      if (!value) {
        populateFormFromJSON({});
        return;
      }
      populateFormFromJSON(metas[value]);
      return;
    }
    const fileName = value;
    switch (name) {
    case 'templateName': {
      if ($('#rememberTemplateChanges').checked &&
        templateExistsInMenu(fileName)
      ) {
        try {
          await dialogs.confirm(_('overwrite_template_ok'));
        } catch (cancelled) {
          return;
        }
        target.value = '';
      }
      break;
    } case 'templates': {
      if (!fileName) {
        populateFormFromJSON({});
        return;
      }
      // $('#templateName').value = fileName;
      const response = await TemplateFileBridge.getTemplate({fileName});
      const json = JSON.parse(response);
      populateFormFromJSON(json);
      break;
    }
    }
  });

  // Todo: Support keypress
  window.addEventListener('click', async function ({target}) {
    const {
      parentNode, value, nodeName,
      dataset: {
        type, dirPick, pathInputID, groupID, group, sel,
        executablePathSelect = (
          parentNode && parentNode.dataset && parentNode.dataset.executablePathSelect
        )
      }
    } = target;

    if (dirPick) {
      // Value can be blank (if user just wishes to browse)
      const result = await FileBridge.dirPick({
        locale: uiLanguage,
        dirPath: $('#executablePath' + dirPick).value,
        selectFolder: dirPick
      });
      dirPickResult({...result, selector: '#executablePath' + dirPick});
    } else if (pathInputID) {
      const holderID = 'executablePathHolder' + pathInputID;
      const parentHolderSel = '#pathHolder';
      switch (type) {
      case 'add': {
        const input = jml(...createPathInput());
        const nextSibling = $('#' + holderID).nextElementSibling;
        if (nextSibling) {
          nextSibling.before(input);
        } else {
          $(parentHolderSel).append(input);
        }
        break;
      } case 'remove': {
        if ($(parentHolderSel).children.length <= 3) { // Legend, datalist, and a single path control
          return;
        }
        $('#' + holderID).remove();
        break;
      }
      }
    } else if (executablePathSelect) {
      if (!value) {
        return;
      }
      $('#' + executablePathSelect).value = value;
      // We need the input event to go off so as to display the checkbox if this is the task bar
      const keyEv = new KeyboardEvent('input', {
        bubbles: true,
        cancelable: true,
        key: 'Enter',
        // ctrlKey: false,
        // altKey: false,
        // shiftKey: false,
        // metaKey: false,
        keyCode: 13 // Sets deprecated code
        // charCode: 0
      });
      $('#' + executablePathSelect).dispatchEvent(keyEv);
    } else if (groupID) {
      let holder, parentHolderSel, method;
      switch (group) {
      case 'fileExtension': {
        holder = 'fileExtensionInfoHolder';
        parentHolderSel = '#fileExtensionHolder';
        method = createFileExtensionControls;
        break;
      }
      case 'associatedDesktopFile': {
        holder = 'associatedDesktopFileInfoHolder';
        parentHolderSel = '#associatedDesktopFileHolder';
        method = createAssociatedDesktopFileControls;
        break;
      }
      }
      const holderID = holder + groupID;
      switch (type) {
      case 'add': {
        const input = jml(...method());
        const {nextElementSibling} = $('#' + holderID);
        if (nextElementSibling) {
          nextElementSibling.before(input);
        } else {
          $(parentHolderSel).append(input);
        }
        break;
      } case 'remove': {
        if ($(parentHolderSel).children.length <= 1) { // A single path control
          return;
        }
        $('#' + holderID).remove();
        break;
      }
      }
    } else if (sel) {
      let selVal = $(sel).value;
      if (selVal.startsWith('resource:')) {
        selVal = selVal.slice(0, selVal.lastIndexOf('/') + 1);
        window.open(selVal, 'resource' + (winOpenCtr++));
        return;
      }
      if (selVal) {
        FileBridge.reveal({fileName: selVal});
      } else {
        dialogs.alert(_('choose_file_to_reveal'));
      }
    } else {
      let {id} = target;
      if (nodeName.toLowerCase() === 'option') {
        switch (parentNode.id) {
        // eslint-disable-next-line default-case-last
        default:
          if (!parentNode.id.startsWith('associateDesktopFilePath')) {
            break;
          }
        // Fallthrough
        case 'iconPathSelect':
        case 'profileNameSelect':
        case 'associateDesktopFilePath':
        case 'desktopFilePathSelect':
          ({id} = parentNode);
          break;
        }
      }
      switch (id) {
      case 'deleteTemplate': {
        let fileName;
        try {
          fileName = $('[name=templates]').selectedOptions[0].value;
          if (!fileName) {
            dialogs.alert(_('must_choose_one_to_delete'));
            return;
          }
          await dialogs.confirm(_('delete_template_ok'));
        } catch (cancelled) {
          // console.log(cancelled);
          return;
        }
        const response = await TemplateFileBridge.deleteTemplate({fileName});
        deleteTemplateResponse(response);
        break;
      }
      // eslint-disable-next-line default-case-last
      default: {
        if (!id.startsWith('associateDesktopFilePath') &&
          !id.startsWith('associateDesktopFilePick')
        ) {
          break;
        }
      }
      // Fallthrough
      case 'desktopFilePathSelect':
      case 'iconPathSelect': {
        if (!value) {
          return;
        }
        $('#' + id.replace(/Select$/, '')).value = value;
        break;
      } case 'desktopFilePick': case 'iconPick': {
        // Value can be blank (if user just wishes to browse)
        const selector = '#' + id.replace(/Pick$/, 'Path');
        const result = await FileBridge.filePick({
          locale: uiLanguage,
          dirPath: $(selector).value,
          defaultExtension: 'ico' // Todo: Fix for desktopFilePick
        });
        filePickResult({...result, selector});
        break;
      } case 'openOrCreateICO': {
        const response = await ExecutableBuilder.openOrCreateICO();
        openOrCreateICOResponse(response);
        break;
      } case 'profileNameSelect': {
        $('[name=profileName]').value = value;
        break;
      } case 'manageProfiles': {
        ProfileBridge.manageProfiles();
        break;
      } case 'createExecutable': {
        // Todo: Auto-name executable and auto-add path by default
        if (!$('.executableName').value) {
          dialogs.alert(_('must_add_one_executable_name'));
          return;
        }
        if (!$('.dirPath').value) {
          dialogs.alert(_('must_add_executable_path'));
          return;
        }
      } // Fallthrough
      case 'runCommands': {
        const templateName = $('[name=templateName]').value || null;
        const formSerialized = formSerialize($('#dynamic'), {empty: true, hash: true});
        if ($('#rememberTemplateChanges').checked &&
          templateName !== null
        ) {
          // Save the file, over-writing any existing file
          const content = JSON.stringify(formSerialized);
          console.log('serialized-content', content);
          const response = await TemplateFileBridge.saveTemplate({
            templateName,
            content
          });
          saveTemplateResult(response);
        }
        // Todo: Allow addition (for viewers) to Mac
        //  Services menu (see source of a service workflow
        //  as created by Automator, modify file, and add
        //  to `~/Library/Services`)
        //  Unfortunately, `man automator` indicates there is no command
        //   line way to create workflows, and though can invoke
        //   `automator myworkflow.workflow`, Automator doesn't have
        //   workflows for creating workflows (though might have
        //   Applescript to use Accessibility UI to do so, through
        //   Automator's "Watch Me Do" to record first time)
        // Todo: Give alerts, e.g., if trying to set defaults and no ID
        // Todo: Could expose to UI and pass in the following (if user
        //   actually wants an executable that prompts for a file rather
        //   than expecting a file argument)
        // - `fileSelectMessage`
        // - `fileSelectType`
        await ExecutableBuilder.saveExecutables(formSerialized);
        console.log('resuming after executable save');

        // metas

        // $('.fileExtension').value // defaultFileExtension

        // Todo: File association bridge file and handle response
        // FileAssociationBridge.associateFileExtension(...);

        // Todo (high priority): Utilize for default file associations
        // (fileExtensionAssociateOpenWith), makeDefaultHandlerForExtension
        // (fileContentTypeAssociate), makeDefaultHandlerForContentType

        /*
          await ExecBridge.cmd({args: []});
          dialogs.alert('Command run!');
        */

        /*
        // Todo: Reenable for Windows (we may be able to avoid
        //  most or all of this just using the results of
        //  `formSerialize` above
        function reduceToCheckedValue (sel) {
          return $$(sel).reduce(toCheckedValue, {});
        }
        function reduceToValue (sel) {
          return $$(sel).map((i) => i.value);
        }
        const preserveShortcuts = reduceToValue('.preserveShortcut');
        const convertToExes = reduceToValue('.convertToExe');
        const pinApps = reduceToCheckedValue('.pinApp');
        const sedPreserves = reduceToCheckedValue('.sedPreserve');
        const batchPreserves = reduceToCheckedValue('.batchPreserve');
        const options = {
          preserveShortcuts,
          convertToExes,
          pinApps,
          sedPreserves,
          batchPreserves,
          profileName: $('[name=profileName]').value || null,
          iconPath: $('[name=iconPath]').value || null,
          windowStyle: $('[name=windowStyleSelect]').value || null,
          hotKey: $('[name=hotKey]').value || null,
          webappcustommode: $('[name=customMode]').value || null,
          $('[name=documentURLBox]').value || null,
        };
        console.log('options', options);
        */
        break;
      }
      }
    }
  });
  const hasMetas = metas && metas.length;
  if (hasMetas) {
    const aliases = {
      file: 'desktopFilePath',
      id: 'executableID',
      extensions: 'fileExtensionAssociateOpenWith',
      contentTypes: 'fileContentTypeAssociate',
      defaultExtensions: 'makeDefaultHandlerForExtension',
      defaultContentTypes: 'makeDefaultHandlerForContentType'
    };

    const props = [
      ...Object.keys(aliases),
      'executableName',
      'executablePath',
      'filePicker',
      'string',
      'mode',
      'site',
      'binary',
      'args'
    ];

    metas = metas.map((meta) => {
      const validated = {};
      const usp = new URLSearchParams(meta);
      [...usp].forEach(([prop, val]) => {
        if (!props.includes(prop)) {
          console.warn('Discarding unrecognized property:', prop);
          return;
        }
        switch (prop) {
        case 'args': {
          let parsed;
          try {
            // Format before adding to form
            parsed = JSON.parse(val);
          } catch (err) {
            console.warn('Discarding `args`; must be valid JSON');
            return;
          }
          val = JSON.stringify(parsed, null, 2);
          break;
        } case 'extensions': case 'contentTypes': {
          // Per https://tools.ietf.org/html/rfc2045#section-5.1 ,
          //   white space is disallowed in `x-token` and `token`
          //   (`ietf-token` doesn't specify it clearly), so we
          //   use it as our separator
          val = val.split(/ /);
          break;
        } case 'defaultExtensions': case 'defaultContentTypes': {
          val = val.split(/ /);
          const correspProp = prop === 'defaultExtensions'
            ? 'extensions'
            : 'contentTypes';
          let cmpArr = usp.get(correspProp);
          if (!cmpArr) {
            console.warn(prop + ' should be accompanied by ' + correspProp);
            return;
          }
          cmpArr = cmpArr.split(/ /);
          val = cmpArr.map((item) => {
            return val.includes(item) ? 'on' : '';
          });
          break;
        }
        }
        prop = {}.hasOwnProperty.call(aliases, prop) ? aliases[prop] : prop;
        validated[prop] = val;
      });
      return validated;
    });
    console.log('metas2', metas);
  }
  jml('div', [
    (hasMetas
      ? ['div', [
        ['select', {id: 'siteRecommended'}, [
          ['option', {value: ''}, [_('prepopulate_site_recommended')]],
          ...metas.map(({executableName}, i) => {
            return ['option', {value: i}, [executableName || _('unnamed')]];
          })
        ]],
        ` ${_('or').toUpperCase()} `
      ]]
      : ''
    ),
    ['select', {name: 'templates'}, [
      ['option', {value: ''}, [_('choose_template')]],
      ...templates.map((template) => {
        return ['option', [template]];
      })
    ]],
    ['button', {id: 'deleteTemplate'}, [_('delete_template')]],
    ['br', 'br'],
    ['label', [
      _('remember_template_changes'),
      ' ',
      // We don't give a `name` here as we don't want to
      //  remember this during serialization
      ['input', {
        id: 'rememberTemplateChanges',
        type: 'checkbox',
        checked: 'checked'
      }]
    ]],
    ['br', 'br'],
    createTemplatedForm()
  ], document.body);
}

// We could abstract this, but it's light enough for now to keep flexible
const [paths, templates] = await Promise.all([
  /*, profiles */
  EnvironmentBridge.getHardPaths(),
  TemplateFileBridge.getTemplates(),
  loadStylesheets([
    '/vendor/dialog-polyfill/dialog-polyfill.css',
    'executable.css'
  ])
  // TODO: Reenable for Windows at least when ready
  // , ProfileBridge.getProfiles()
]);
console.log('ttt', templates);

// To send messages within add-on
// browser.runtime.sendMessage(Object.assign(obj || {}, {type}));

// Not visible but we'll add in case we later move to own window
document.title = _('executable_builder_title');

let reverseDNS, metas, hostname;
try {
  const [result] = await browser.tabs.executeScript({
    code: `
  ({
    metas: [...document.querySelectorAll('meta[name="webappfind"]')].map((m) => m.content),
    hostname: location.hostname
  })
  `,
    runAt: 'document_end'
  });
  ({metas, hostname} = result);
  // Todo: Use metas
  console.log('metas', metas, 'hostname', hostname);
  reverseDNS = hostname.split('.').reverse().join('.');
  console.log('reverseDNS', reverseDNS);
} catch (err) {
  console.log('err', err);
  // Might have been opened on tab like empty tab to which we don't have (or need) access
}

init();

// console.log('metas-browser-action', metas);
})();
