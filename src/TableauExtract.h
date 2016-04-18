#ifndef EXTRACT_H
#define EXTRACT_H

#include <iostream>
#include <node.h>
#include <node_object_wrap.h>

#if defined(__APPLE__) && defined(__MACH__)
#include <TableauExtract/TableauExtract_cpp.h>
#else
#include "TableauExtract_cpp.h"
#endif

namespace NodeTde {

class Extract : public node::ObjectWrap {
 public:
  static void Init(v8::Local<v8::Object> exports);
  Tableau::Extract* GetExtract();

 private:
  explicit Extract(std::wstring path);
  ~Extract();

  static void New(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void Close(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void HasTable(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void AddTable(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void OpenTable(const v8::FunctionCallbackInfo<v8::Value>& args);
  static v8::Persistent<v8::Function> constructor;

  Tableau::Extract* nativeExtract_;
  std::shared_ptr<Tableau::Table> nativeTable_;
};

}

#endif
