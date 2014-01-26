/* run this program using the console pauser or add your own getch, system("pause") or input loop */

// Required for console app
// #include <iostream>
#include <windows.h>
#include <sstream>
#include "config.h"
using namespace std;
// #include <string>
//#include <vector>
//#include <wchar.h>

string ExeDir() {
    char buffer[MAX_PATH];
    GetModuleFileName(NULL, buffer, MAX_PATH);
    string::size_type pos = string(buffer).find_last_of("\\/");
    return string(buffer).substr(0, pos);
}


// Required for console app
/*
NOTE: For Dev-C++ compiling, I disabled a console window by:
1. right-clicking this project in the Project tab
2. choosing "Project Options"
3. selecting the "Compiler" tab
4. choosing the "Linker" subtab
5. changing "Do not create a console window (-mwindows)" to "Yes"
*/
int main(int argc, char** argv) {
	stringstream params;
	string modeStr;
	
	switch (mode) {
		case Route:
			modeStr = "route"; // Not yet supported
			break;
		case Create:
			modeStr = "create"; // Not yet supported
			break;
		case View:
			modeStr = "view";
			break;
		case BinaryView:
			modeStr = "binaryview";
			break;
		case Edit:
			modeStr = "edit";
			break;
		case BinaryEdit:
			modeStr = "binaryedit";
			break;
		case Validate:
			modeStr = "validate"; // Not yet supported
			break;
	}
	
	// https://developer.mozilla.org/en-US/docs/Mozilla/Command_Line_Options
	// http://www-archive.mozilla.org/unix/remote.html
	params << "-remote \"openurl(about:newtab)\"" // Unlike "-silent", this param gives the Firefox window focus
		<< " -webappmode " << modeStr
		<< " -webappdoc " << " \"" << argv[1] << "\"";


	SHELLEXECUTEINFO sei={0};
	sei.cbSize       = sizeof(SHELLEXECUTEINFO);
	sei.fMask        = SEE_MASK_NOCLOSEPROCESS; // ?
	sei.hwnd         = NULL;  // This app's window handle
	sei.lpVerb       = "open";
	sei.lpFile       = browserPath.c_str();
	// ("web-app-handler.html?id=" + NumberToString(uniqueID)).c_str(), // Parameters - HTML file within this exe directory to relay message to Firefox (do instead as chrome: URL within addon?)
	// "resource://jid0-szjdb0ri3fdiz7bdwtp8qqcffws-at-jetpack/brettz9/data/?id=",
	sei.lpParameters = params.str().c_str();
	sei.lpDirectory  = NULL; // ExeDir().c_str();
	sei.nShow        = SW_SHOWMAXIMIZED;
	sei.hInstApp     = NULL;
	
	
	if (ShellExecuteEx(&sei)) { // I have sei.hProcess, but how best to utilize it from here?
		WaitForInputIdle(&sei.hProcess, INFINITE);
		//WaitForSingleObject(sei.hProcess, INFINITE);
	}

	// system("pause"); // Use this for console pause
	return 0;
}

