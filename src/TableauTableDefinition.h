#ifndef TABLEDEFINITION_H
#define TABLEDEFINITION_H

#include <iostream>
#include <node.h>
#include <node_object_wrap.h>

#if defined(__APPLE__) && defined(__MACH__)
#include <TableauHyperExtract/TableauHyperExtract_cpp.h>
#else
#include "TableauHyperExtract_cpp.h"
#endif

namespace NodeTde {

class TableDefinition : public node::ObjectWrap {
 public:
  static void Init(v8::Local<v8::Object> exports);
  static void InitObj(v8::Local<v8::Object> exports);
  static void NewInstance(const v8::FunctionCallbackInfo<v8::Value>& args);
  std::shared_ptr<Tableau::TableDefinition> GetTableDefinition();
  Tableau::Extract* GetExtract();

 private:
  explicit TableDefinition();
  explicit TableDefinition(std::shared_ptr<Tableau::TableDefinition> nativeTableDefinition);
  ~TableDefinition();

  static void New(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void Close(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void GetDefaultCollation(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void SetDefaultCollation(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void AddColumn(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void AddColumnWithCollation(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void GetColumnCount(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void GetColumnName(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void GetColumnType(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void GetColumnCollation(const v8::FunctionCallbackInfo<v8::Value>& args);
  static v8::Persistent<v8::Function> constructor;

  std::shared_ptr<Tableau::TableDefinition> nativeTableDefinition_;
};

}

#endif
