:: For details on where one may put this, http://superuser.com/a/722699/156958 and http://answers.microsoft.com/en-us/windows/forum/windows_vista-desktop/how-to-locate-the-sendto-folder-in-vista/78b16711-1135-4eb0-851a-8abae9bfe9ed
:: Place this file at "shell:SendTo" e.g., the location, C:\Users\Brett\AppData\Roaming\Microsoft\Windows\SendTo
"%ProgramFiles(x86)%\Mozilla Firefox\firefox.exe" -remote "openurl(about:newtab)" "%1"
