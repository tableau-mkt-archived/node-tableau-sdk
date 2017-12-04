#ifndef ROW_H
#define ROW_H

#include <iostream>
#include <node.h>
#include <node_object_wrap.h>

#if defined(__APPLE__) && defined(__MACH__)
#include <TableauHyperExtract/TableauHyperExtract_cpp.h>
#else
#include "TableauHyperExtract_cpp.h"
#endif

namespace NodeTde {

class Row : public node::ObjectWrap {
 public:
  static void Init(v8::Local<v8::Object> exports);
  Tableau::Row* GetRow();

 private:
  explicit Row(Tableau::TableDefinition* tableDef);
  ~Row();

  static void New(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void Close(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void SetNull(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void SetInteger(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void SetLongInteger(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void SetDouble(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void SetBoolean(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void SetString(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void SetCharString(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void SetDate(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void SetDateTime(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void SetDuration(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void SetSpatial(const v8::FunctionCallbackInfo<v8::Value>& args);
  static v8::Persistent<v8::Function> constructor;

  Tableau::Row* nativeRow_;
};

}

#endif
