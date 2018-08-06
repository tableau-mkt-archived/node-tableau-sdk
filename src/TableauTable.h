#ifndef TABLE_H
#define TABLE_H

#include <iostream>
#include <node.h>
#include <node_object_wrap.h>

#if defined(__APPLE__) && defined(__MACH__)
#include <TableauHyperExtract/TableauHyperExtract_cpp.h>
#else
#include "TableauHyperExtract_cpp.h"
#endif

namespace NodeTde {

class Table : public node::ObjectWrap {
 public:
  static void NewInstance(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void NewInstanceFromDefinition(const v8::FunctionCallbackInfo<v8::Value>& args);
  std::shared_ptr<Tableau::Table> GetTable();

 private:
  explicit Table(Tableau::Extract* extract, std::wstring tableName);
  explicit Table(Tableau::Extract* extract, std::wstring tableName, Tableau::TableDefinition& tableDef);

  static void Init(v8::Local<v8::Object> exports);
  static void GetTableDefinition(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void Insert(const v8::FunctionCallbackInfo<v8::Value>& args);
  static v8::Persistent<v8::Function> constructor;

  std::shared_ptr<Tableau::Table> nativeTable_;
};

}

#endif
