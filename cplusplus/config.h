#ifndef CONFIG_ADDED_H
#define CONFIG_ADDED_H
#include <string>

// Other possibilities: Delete, VersionControl, Query, Search, ExtensionTypeHierarchyHandler, PreConvert, PostConvert
enum Method {Route, Create, View, BinaryView, Edit, BinaryEdit, Validate}; // prototype
extern enum Method method;
extern const std::string browserPath;
#endif

