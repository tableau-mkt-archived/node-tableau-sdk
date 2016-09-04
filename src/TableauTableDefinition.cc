#include "TableauTableDefinition.h"
#include "TableauTable.h"
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
using v8::ObjectTemplate;
using v8::Isolate;
using v8::Local;
using v8::External;
using v8::Number;
using v8::Boolean;
using v8::Object;
using v8::Persistent;
using v8::String;
using v8::Value;
using std::wstring;
using std::string;
using nativeTableDefinition = Tableau::TableDefinition;

Persistent<Function> TableDefinition::constructor;

TableDefinition::TableDefinition() {
  nativeTableDefinition_ = std::make_shared<nativeTableDefinition>();
}

TableDefinition::TableDefinition(std::shared_ptr<nativeTableDefinition> nativeTableDefinition) {
  nativeTableDefinition_ = nativeTableDefinition;
}

TableDefinition::~TableDefinition() {
  nativeTableDefinition_->Close();
}

void TableDefinition::Init(Local<Object> exports) {
  Isolate* isolate = exports->GetIsolate();

  // Prepare constructor template
  Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, New);
  tpl->SetClassName(String::NewFromUtf8(isolate, "TableDefinition"));
  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  // Prototype
  NODE_SET_PROTOTYPE_METHOD(tpl, "close", Close);
  NODE_SET_PROTOTYPE_METHOD(tpl, "getDefaultCollation", GetDefaultCollation);
  NODE_SET_PROTOTYPE_METHOD(tpl, "setDefaultCollation", SetDefaultCollation);
  NODE_SET_PROTOTYPE_METHOD(tpl, "addColumn", AddColumn);
  NODE_SET_PROTOTYPE_METHOD(tpl, "addColumnWithCollation", AddColumnWithCollation);
  NODE_SET_PROTOTYPE_METHOD(tpl, "getColumnCount", GetColumnCount);
  NODE_SET_PROTOTYPE_METHOD(tpl, "getColumnName", GetColumnName);
  NODE_SET_PROTOTYPE_METHOD(tpl, "getColumnType", GetColumnType);
  NODE_SET_PROTOTYPE_METHOD(tpl, "getColumnCollation", GetColumnCollation);

  constructor.Reset(isolate, tpl->GetFunction());
  exports->Set(String::NewFromUtf8(isolate, "TableDefinition"), tpl->GetFunction());
}

void TableDefinition::InitObj(Local<Object> exports) {
  NODE_SET_METHOD(exports, "close", Close);
  NODE_SET_METHOD(exports, "getDefaultCollation", GetDefaultCollation);
  NODE_SET_METHOD(exports, "setDefaultCollation", SetDefaultCollation);
  NODE_SET_METHOD(exports, "addColumn", AddColumn);
  NODE_SET_METHOD(exports, "addColumnWithCollation", AddColumnWithCollation);
  NODE_SET_METHOD(exports, "getColumnCount", GetColumnCount);
  NODE_SET_METHOD(exports, "getColumnName", GetColumnName);
  NODE_SET_METHOD(exports, "getColumnType", GetColumnType);
  NODE_SET_METHOD(exports, "getColumnCollation", GetColumnCollation);
}

void TableDefinition::New(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  // Invoked as constructor: `new Extract(...)`
  if (args.IsConstructCall()) {
    TableDefinition* obj = new TableDefinition();
    obj->Wrap(args.This());
    args.GetReturnValue().Set(args.This());
  }
  // Invoked as plain function `Extract(...)`, turn into construct call.
  else {
    const int argc = 1;
    Local<Value> argv[argc] = { args[0] };
    Local<Function> cons = Local<Function>::New(isolate, constructor);
    args.GetReturnValue().Set(cons->NewInstance(argc, argv));
  }
}

void TableDefinition::NewInstance(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  Local<ObjectTemplate> tpl = ObjectTemplate::New(isolate);
  tpl->SetInternalFieldCount(1);
  Local<Object> instance = tpl->NewInstance();
  TableDefinition::InitObj(instance);

  // Instantiate a new TableDefinition object and wrap it in our instance.
  Table* obj = ObjectWrap::Unwrap<Table>(args.Holder());
  std::shared_ptr<nativeTableDefinition> tableDef = obj->GetTable()->GetTableDefinition();
  TableDefinition* defObj = new TableDefinition(tableDef);
  defObj->Wrap(instance);

  // Return our object instance.
  args.GetReturnValue().Set(instance);
}

void TableDefinition::Close(const FunctionCallbackInfo<Value>& args) {
  TableDefinition* obj = ObjectWrap::Unwrap<TableDefinition>(args.Holder());
  obj->nativeTableDefinition_->Close();
}

void TableDefinition::GetDefaultCollation(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  TableDefinition* obj = ObjectWrap::Unwrap<TableDefinition>(args.Holder());

  args.GetReturnValue().Set(Number::New(isolate, obj->nativeTableDefinition_->GetDefaultCollation()));
}

void TableDefinition::SetDefaultCollation(const FunctionCallbackInfo<Value>& args) {
  int collation(args[0]->IntegerValue());
  Tableau::Collation tabCol = static_cast<Tableau::Collation>(collation);

  TableDefinition* obj = ObjectWrap::Unwrap<TableDefinition>(args.Holder());
  obj->nativeTableDefinition_->SetDefaultCollation(tabCol);
}

void TableDefinition::AddColumn(const FunctionCallbackInfo<Value>& args) {
  String::Utf8Value v8ColName(args[0]->ToString());
  string colName = string(*v8ColName);
  wstring column(colName.length(), L' ');
  std::copy(colName.begin(), colName.end(), column.begin());

  int typeInt(args[1]->IntegerValue());
  Tableau::Type type = static_cast<Tableau::Type>(typeInt);

  try {
    TableDefinition* obj = ObjectWrap::Unwrap<TableDefinition>(args.Holder());
    obj->nativeTableDefinition_->AddColumn(column, type);
  }
  catch (const Tableau::TableauException& e) {
    THROW_TABLEAU_EXCEPTION(e);
  }
}

void TableDefinition::AddColumnWithCollation(const FunctionCallbackInfo<Value>& args) {
  String::Utf8Value v8ColName(args[0]->ToString());
  string colName = string(*v8ColName);
  wstring column(colName.length(), L' ');
  std::copy(colName.begin(), colName.end(), column.begin());

  int typeInt(args[1]->IntegerValue());
  Tableau::Type type = static_cast<Tableau::Type>(typeInt);

  int collationInt(args[2]->IntegerValue());
  Tableau::Collation collation = static_cast<Tableau::Collation>(collationInt);

  try {
    TableDefinition* obj = ObjectWrap::Unwrap<TableDefinition>(args.Holder());
    obj->nativeTableDefinition_->AddColumnWithCollation(column, type, collation);
  }
  catch (const Tableau::TableauException& e) {
    THROW_TABLEAU_EXCEPTION(e);
  }
}

void TableDefinition::GetColumnCount(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  TableDefinition* obj = ObjectWrap::Unwrap<TableDefinition>(args.Holder());
  int columnCount = obj->nativeTableDefinition_->GetColumnCount();

  args.GetReturnValue().Set(Number::New(isolate, columnCount));
}

void TableDefinition::GetColumnName(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  int columnNumber(args[0]->IntegerValue());
  wstring wColumnName;

  TableDefinition* obj = ObjectWrap::Unwrap<TableDefinition>(args.Holder());
  wColumnName = obj->nativeTableDefinition_->GetColumnName(columnNumber);
  std::string columnName(wColumnName.begin(), wColumnName.end());

  args.GetReturnValue().Set(String::NewFromUtf8(isolate, columnName.c_str()));
}

void TableDefinition::GetColumnType(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  int columnNumber(args[0]->IntegerValue());
  TableDefinition* obj = ObjectWrap::Unwrap<TableDefinition>(args.Holder());

  args.GetReturnValue().Set(Number::New(isolate, obj->nativeTableDefinition_->GetColumnType(columnNumber)));
}

void TableDefinition::GetColumnCollation(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  int columnNumber(args[0]->IntegerValue());
  TableDefinition* obj = ObjectWrap::Unwrap<TableDefinition>(args.Holder());

  args.GetReturnValue().Set(Number::New(isolate, obj->nativeTableDefinition_->GetColumnCollation(columnNumber)));
}

std::shared_ptr<Tableau::TableDefinition> TableDefinition::GetTableDefinition() {
  return nativeTableDefinition_;
}

}
