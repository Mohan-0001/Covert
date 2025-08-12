// #include <windows.h>
// #include <iostream>

// // These are missing in older MinGW headers
// #define WDA_NONE                    0x00000000
// #define WDA_MONITOR                 0x00000001
// #define WDA_EXCLUDEFROMCAPTURE     0x00000011

// // Add function prototype if not declared
// extern "C" BOOL __stdcall SetWindowDisplayAffinity(HWND hWnd, DWORD dwAffinity);

// int main(int argc, char* argv[]) {
//     if (argc < 2) {
//         std::cerr << "❌ Please provide the window title as an argument.\n";
//         return 1;
//     }

//     const char* windowTitle = argv[1];

//     HWND hwnd = FindWindowA(NULL, windowTitle);
//     if (hwnd == NULL) {
//         std::cerr << "❌ Window not found with title: " << windowTitle << "\n";
//         return 1;
//     }

//     BOOL result = SetWindowDisplayAffinity(hwnd, WDA_EXCLUDEFROMCAPTURE);
//     if (result) {
//         std::cout << "✅ Window is now hidden from screen sharing.\n";
//     } else {
//         std::cerr << "❌ Failed to apply display affinity. Try running as Administrator.\n";
//     }

//     return 0;
// }


#include <windows.h>
#include <iostream>

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cerr << "❌ Usage: HideFromCapture.exe \"Exact Window Title\"\n";
        return 1;
    }

    const char* windowTitle = argv[1];

    HWND hwnd = FindWindowA(NULL, windowTitle);
    if (!hwnd) {
        std::cerr << "❌ Window not found with title: " << windowTitle << "\n";
        return 2;
    }

    if (SetWindowDisplayAffinity(hwnd, WDA_EXCLUDEFROMCAPTURE)) {
        std::cout << "✅ Window is now hidden from screen sharing.\n";
    } else {
        std::cerr << "❌ Failed to apply display affinity. Try running as Administrator.\n";
        return 3;
    }

    return 0;
}
