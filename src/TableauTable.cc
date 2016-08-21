#include "TableauTable.h"
#include "TableauExtract.h"
#include "TableauTableDefinition.h"
#include "TableauRow.h"
#include "TableauException.h"

#if defined(__APPLE__) && defined(__MACH__)
#include <TableauExtract/TableauExtract_cpp.h>
#else
#include "TableauExtract_cpp.h"
#endif

namespace NodeTde {

using v8::Function;
using v8::FunctionCallbackInfo;
using v8::FunctionTemplate;
using v8::Isolate;
using v8::Local;
using v8::External;
using v8::Number;
using v8::Boolean;
using v8::Object;
using v8::ObjectTemplate;
using v8::Persistent;
using v8::String;
using v8::Value;
using std::wstring;
using std::string;
using nativeExtract = Tableau::Extract;
using nativeTable = Tableau::Table;
using nativeTableDefinition = Tableau::TableDefinition;
using nativeRow = Tableau::Row;

Persistent<Function> Table::constructor;

Table::Table(nativeExtract* extract, wstring tableName) {
  nativeTable_ = extract->OpenTable(tableName);
}

Table::Table(nativeExtract* extract, wstring tableName, nativeTableDefinition& tableDef) {
  nativeTable_ = extract->AddTable(tableName, tableDef);
}

void Table::Init(Local<Object> exports) {
  // Add our methods to the object.
  NODE_SET_METHOD(exports, "getTableDefinition", GetTableDefinition);
  NODE_SET_METHOD(exports, "insert", Insert);
}

void Table::GetTableDefinition(const FunctionCallbackInfo<Value>& args) {
  NodeTde::TableDefinition::NewInstance(args);
}

void Table::Insert(const FunctionCallbackInfo<Value>& args) {
  Row* nodeRow = ObjectWrap::Unwrap<Row>(args[0]->ToObject());
  nativeRow* row = nodeRow->GetRow();

  Table* obj = ObjectWrap::Unwrap<Table>(args.Holder());
  obj->nativeTable_->Insert(*row);
}

void Table::NewInstance(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  Local<ObjectTemplate> tpl = ObjectTemplate::New(isolate);
  tpl->SetInternalFieldCount(1);
  Local<Object> instance = tpl->NewInstance();
  Table::Init(instance);

  // Instantiate a new Table object and wrap it in our instance.
  String::Utf8Value v8table(args[0]->ToString());
  string table = string(*v8table);
  wstring wtable(table.length(), L' ');
  std::copy(table.begin(), table.end(), wtable.begin());

  Extract* obj = ObjectWrap::Unwrap<Extract>(args.Holder());
  Table* tableObj = new Table(obj->GetExtract(), wtable);
  tableObj->Wrap(instance);

  // Return our object instance.
  args.GetReturnValue().Set(instance);
}

void Table::NewInstanceFromDefinition(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  // Check for a table name argument.
  if (!args[0]->IsString()) {
    isolate->ThrowException(String::NewFromUtf8(isolate, "You must provide a table name of 'Extract' when adding a table."));
    return;
  }

  Local<ObjectTemplate> tpl = ObjectTemplate::New(isolate);
  tpl->SetInternalFieldCount(1);
  Local<Object> instance = tpl->NewInstance();
  Table::Init(instance);

  // Instantiate a new Table object and wrap it in our instance.
  String::Utf8Value v8table(args[0]->ToString());
  string table = string(*v8table);
  wstring wtable(table.length(), L' ');
  std::copy(table.begin(), table.end(), wtable.begin());

  TableDefinition* nodeTableDef = ObjectWrap::Unwrap<TableDefinition>(args[1]->ToObject());
  nativeTableDefinition* tableDef = nodeTableDef->GetTableDefinition().get();

  Extract* obj = ObjectWrap::Unwrap<Extract>(args.Holder());
  Table* tableObj = new Table(obj->GetExtract(), wtable, *tableDef);
  tableObj->Wrap(instance);

  // Return our object instance.
  args.GetReturnValue().Set(instance);
}

std::shared_ptr<Tableau::Table> Table::GetTable() {
  return nativeTable_;
}

}
