# webappfind

Allows double-click or "Open with..." right-click on "view" or "edit" executable files on one's desktop (currently, executables are for Windows only) to be sent to Firefox (via command line arguments) which are intercepted by a Firefox add-on which checks for an optional filetypes.json file within the same directory as the right-clicked file to determine more precise handling. Based on what is chosen/found and on user preferences, a handler web application will be sought to open the file of the designated type (including generic or custom types) as well as allow saves to be made back to the file, if the "edit" type was chosen and a suitable handler found.

Unlike a more generic solution, such as with a Firefox add-on or [AsYouWish](https://github.com/brettz9/asyouwish/)-enabled site, *webappfind* minimizes security and privacy risks by only allowing files designated in the above manner to be available to the relevant web application.

More to come, including full readme and functional demos.
