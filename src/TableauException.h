#ifndef EXCEPTION_H
#define EXCEPTION_H

#include <iostream>
#include <node.h>
#include <node_object_wrap.h>

#if defined(__APPLE__) && defined(__MACH__)
#include <TableauExtract/TableauExtract_cpp.h>
#else
#include "TableauExtract_cpp.h"
#endif

#define THROW_TABLEAU_EXCEPTION( exc ) \
  do { \
    Isolate* isolate = args.GetIsolate(); \
    \
    wstring wErrorMessage = exc.GetMessage(); \
    string errorMessage(wErrorMessage.begin(), wErrorMessage.end()); \
    \
    isolate->ThrowException(String::NewFromUtf8(isolate, errorMessage.c_str())); \
    return; \
  } while (0) 


#endif
