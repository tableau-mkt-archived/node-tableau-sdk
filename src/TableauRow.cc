#include "TableauRow.h"
#include "TableauTableDefinition.h"

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
using v8::Persistent;
using v8::String;
using v8::Value;
using std::wstring;
using std::string;
using nativeRow = Tableau::Row;
using nativeTableDefinition = Tableau::TableDefinition;

Persistent<Function> Row::constructor;

Row::Row(nativeTableDefinition* tableDef) {
  nativeRow_ = new nativeRow(*tableDef);
}

Row::~Row() {
  nativeRow_->Close();
}

void Row::Init(Local<Object> exports) {
  Isolate* isolate = exports->GetIsolate();

  // Prepare constructor template
  Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, New);
  tpl->SetClassName(String::NewFromUtf8(isolate, "Row"));
  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  // Prototype
  NODE_SET_PROTOTYPE_METHOD(tpl, "close", Close);
  NODE_SET_PROTOTYPE_METHOD(tpl, "setNull", SetNull);
  NODE_SET_PROTOTYPE_METHOD(tpl, "setInteger", SetInteger);
  NODE_SET_PROTOTYPE_METHOD(tpl, "setLongInteger", SetLongInteger);
  NODE_SET_PROTOTYPE_METHOD(tpl, "setDouble", SetDouble);
  NODE_SET_PROTOTYPE_METHOD(tpl, "setBoolean", SetBoolean);
  NODE_SET_PROTOTYPE_METHOD(tpl, "setString", SetString);
  NODE_SET_PROTOTYPE_METHOD(tpl, "setCharString", SetCharString);
  NODE_SET_PROTOTYPE_METHOD(tpl, "setDate", SetDate);
  NODE_SET_PROTOTYPE_METHOD(tpl, "setDateTime", SetDateTime);
  NODE_SET_PROTOTYPE_METHOD(tpl, "setDuration", SetDuration);

  constructor.Reset(isolate, tpl->GetFunction());
  exports->Set(String::NewFromUtf8(isolate, "Row"), tpl->GetFunction());
}

nativeRow* Row::GetRow() {
  return nativeRow_;
}

void Row::New(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  // Invoked as constructor: `new Row(...)`
  if (args.IsConstructCall()) {
    TableDefinition* nodeTableDef = ObjectWrap::Unwrap<TableDefinition>(args[0]->ToObject());
    nativeTableDefinition* tableDef = nodeTableDef->GetTableDefinition().get();

    Row* obj = new Row(tableDef);
    obj->Wrap(args.This());

    args.GetReturnValue().Set(args.This());
  }
  // Invoked as plain function `Row(...)`, turn into construct call.
  else {
    const int argc = 1;
    Local<Value> argv[argc] = { args[0] };
    Local<Function> cons = Local<Function>::New(isolate, constructor);
    args.GetReturnValue().Set(cons->NewInstance(argc, argv));
  }
}

void Row::Close(const FunctionCallbackInfo<Value>& args) {
  Row* obj = ObjectWrap::Unwrap<Row>(args.Holder());
  obj->nativeRow_->Close();
}

void Row::SetNull(const FunctionCallbackInfo<Value>& args) {
  int columnNumber(args[0]->IntegerValue());

  Row* obj = ObjectWrap::Unwrap<Row>(args.Holder());
  obj->nativeRow_->SetNull(columnNumber);
}

void Row::SetInteger(const FunctionCallbackInfo<Value>& args) {
  int columnNumber(args[0]->IntegerValue());
  int32_t integerValue(args[1]->Int32Value());

  Row* obj = ObjectWrap::Unwrap<Row>(args.Holder());
  obj->nativeRow_->SetInteger(columnNumber, integerValue);
}

void Row::SetLongInteger(const FunctionCallbackInfo<Value>& args) {
  int columnNumber(args[0]->IntegerValue());
  int64_t integerValue(args[1]->IntegerValue());

  Row* obj = ObjectWrap::Unwrap<Row>(args.Holder());
  obj->nativeRow_->SetLongInteger(columnNumber, integerValue);
}

void Row::SetDouble(const FunctionCallbackInfo<Value>& args) {
  int columnNumber(args[0]->IntegerValue());
  double doubleValue(args[1]->NumberValue());

  Row* obj = ObjectWrap::Unwrap<Row>(args.Holder());
  obj->nativeRow_->SetDouble(columnNumber, doubleValue);
}

void Row::SetBoolean(const FunctionCallbackInfo<Value>& args) {
  int columnNumber(args[0]->IntegerValue());
  bool boolValue(args[1]->BooleanValue());

  Row* obj = ObjectWrap::Unwrap<Row>(args.Holder());
  obj->nativeRow_->SetBoolean(columnNumber, boolValue);
}

void Row::SetString(const FunctionCallbackInfo<Value>& args) {
  int columnNumber(args[0]->IntegerValue());
  String::Utf8Value v8String(args[1]->ToString());
  string stringValue = string(*v8String);
  wstring wStringValue(stringValue.length(), L' ');
  std::copy(stringValue.begin(), stringValue.end(), wStringValue.begin());

  Row* obj = ObjectWrap::Unwrap<Row>(args.Holder());
  obj->nativeRow_->SetString(columnNumber, wStringValue);
}

void Row::SetCharString(const FunctionCallbackInfo<Value>& args) {
  int columnNumber(args[0]->IntegerValue());
  String::Utf8Value v8String(args[1]->ToString());
  string stringValue = string(*v8String);

  Row* obj = ObjectWrap::Unwrap<Row>(args.Holder());
  obj->nativeRow_->SetCharString(columnNumber, stringValue);
}

void Row::SetDate(const FunctionCallbackInfo<Value>& args) {
  int columnNumber(args[0]->IntegerValue());
  int year(args[1]->IntegerValue());
  int month(args[2]->IntegerValue());
  int day(args[3]->IntegerValue());

  Row* obj = ObjectWrap::Unwrap<Row>(args.Holder());
  obj->nativeRow_->SetDate(columnNumber, year, month, day);
}

void Row::SetDateTime(const FunctionCallbackInfo<Value>& args) {
  int columnNumber(args[0]->IntegerValue());
  int year(args[1]->IntegerValue());
  int month(args[2]->IntegerValue());
  int day(args[3]->IntegerValue());
  int hour(args[4]->IntegerValue());
  int min(args[5]->IntegerValue());
  int sec(args[6]->IntegerValue());
  int frac(args[7]->IntegerValue());

  Row* obj = ObjectWrap::Unwrap<Row>(args.Holder());
  obj->nativeRow_->SetDateTime(columnNumber, year, month, day, hour, min, sec, frac);
}

void Row::SetDuration(const FunctionCallbackInfo<Value>& args) {
  int columnNumber(args[0]->IntegerValue());
  int day(args[1]->IntegerValue());
  int hour(args[2]->IntegerValue());
  int min(args[3]->IntegerValue());
  int sec(args[4]->IntegerValue());
  int frac(args[5]->IntegerValue());

  Row* obj = ObjectWrap::Unwrap<Row>(args.Holder());
  obj->nativeRow_->SetDuration(columnNumber, day, hour, min, sec, frac);
}

}
