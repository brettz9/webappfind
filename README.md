# webappfind

Allows double-click or "Open with..." right-click on "view" or "edit" executable files on one's desktop (currently, executables are for Windows only) to be sent to Firefox (via command line arguments) which are intercepted by a Firefox add-on which checks for an optional filetypes.json file within the same directory as the right-clicked file to determine more precise handling. Based on what is chosen/found and on user preferences, a handler web application will be sought to open the file of the designated type (including generic or custom types) as well as allow saves to be made back to the file, if the "edit" type was chosen and a suitable handler found.

Unlike a more generic solution, such as with a Firefox add-on or [AsYouWish](https://github.com/brettz9/asyouwish/)-enabled site, *webappfind* minimizes security and privacy risks by only allowing files designated in the above manner to be available to the relevant web application.

# Possible future todos
1. Support other OSes.
1. Installer to facilitate setting up of OpenWith per user choices (whether for right-click, associating certain types with handler to open when file is double-clicked, or hard-coded options)?
1. Option to confirm reading and/or saving of data upon each attempt
1. Create demo supporting docx format (rather than requiring export to HTML for Word docs)
1. Listen for unregistration of protocols to disable acting on future messages from them (only relevant for pages already loaded in this session)
1. (More to come)

More to come, including full readme and functional demos.
