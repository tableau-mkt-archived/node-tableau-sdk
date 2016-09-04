#ifndef EXCEPTION_H
#define EXCEPTION_H

#include <iostream>
#include <node.h>
#include <node_object_wrap.h>

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
