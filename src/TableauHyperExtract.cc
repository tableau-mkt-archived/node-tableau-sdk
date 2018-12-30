#include "TableauHyperExtract.h"
#include "TableauTable.h"
#include "TableauException.h"

#if defined(__APPLE__) && defined(__MACH__)
#include <TableauHyperExtract/TableauHyperExtract_cpp.h>
#else
#include "TableauHyperExtract_cpp.h"
#endif

namespace NodeTde {

using v8::Context;
using v8::Function;
using v8::FunctionCallbackInfo;
using v8::FunctionTemplate;
using v8::Isolate;
using v8::Local;
using v8::MaybeLocal;
using v8::External;
using v8::Number;
using v8::Boolean;
using v8::Object;
using v8::Persistent;
using v8::String;
using v8::Value;
using std::wstring;
using std::string;
using nativeExtract = Tableau::Extract;
using nativeTable = Tableau::Table;

Persistent<Function> Extract::constructor;

Extract::Extract(wstring path) {
  nativeExtract_ = new nativeExtract(path);
}

Extract::~Extract() {
  nativeExtract_->Close();
}

void Extract::Init(Local<Object> exports) {
  Isolate* isolate = exports->GetIsolate();

  // Prepare constructor template
  Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, New);
  tpl->SetClassName(String::NewFromUtf8(isolate, "Extract"));
  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  // Prototype
  NODE_SET_PROTOTYPE_METHOD(tpl, "close", Close);
  NODE_SET_PROTOTYPE_METHOD(tpl, "addTable", AddTable);
  NODE_SET_PROTOTYPE_METHOD(tpl, "openTable", OpenTable);
  NODE_SET_PROTOTYPE_METHOD(tpl, "hasTable", HasTable);

  constructor.Reset(isolate, tpl->GetFunction());
  exports->Set(String::NewFromUtf8(isolate, "Extract"), tpl->GetFunction());
}

void Extract::New(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  Local<Context> context = isolate->GetCurrentContext();

  // Invoked as constructor: `new Extract(...)`
  if (args.IsConstructCall()) {
    // Get the path and convert to string.
    String::Utf8Value v8path(args[0]->ToString());
    string path = string(*v8path);

    wstring wpath(path.length(), L' ');

    // Copy string to wstring.
    std::copy(path.begin(), path.end(), wpath.begin());
    //nativeExtract extract(wpath);

    try {
      Extract* obj = new Extract(wpath);
      obj->Wrap(args.This());
      args.GetReturnValue().Set(args.This());
    }
     catch (const Tableau::TableauException& e) {
      THROW_TABLEAU_EXCEPTION(e);
    }
  }
  // Invoked as plain function `Extract(...)`, turn into construct call.
  else {
    const int argc = 1;
    Local<Value> argv[argc] = { args[0] };
    Local<Function> cons = Local<Function>::New(isolate, constructor);
    MaybeLocal<Object> maybeResult = cons->NewInstance(context, argc, argv);
    Local<Object> result;

    if (maybeResult.ToLocal(&result)) {
      args.GetReturnValue().Set(result);
    }
  }
}

void Extract::Close(const FunctionCallbackInfo<Value>& args) {
  Extract* obj = ObjectWrap::Unwrap<Extract>(args.Holder());
  obj->nativeExtract_->Close();
}

void Extract::HasTable(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  String::Utf8Value v8table(args[0]->ToString());
  string table = string(*v8table);
  wstring wtable(table.length(), L' ');

  // Copy string to wstring.
  std::copy(table.begin(), table.end(), wtable.begin());

  Extract* obj = ObjectWrap::Unwrap<Extract>(args.Holder());
  bool hasTable = obj->nativeExtract_->HasTable(wtable);

  args.GetReturnValue().Set(Boolean::New(isolate, hasTable));
}

void Extract::AddTable(const FunctionCallbackInfo<Value>& args) {
  try {
    NodeTde::Table::NewInstanceFromDefinition(args);
  }
  catch (const Tableau::TableauException& e) {
    THROW_TABLEAU_EXCEPTION(e);
  }
}

void Extract::OpenTable(const FunctionCallbackInfo<Value>& args) {
  try {
    NodeTde::Table::NewInstance(args);
  }
  catch (const Tableau::TableauException& e) {
    THROW_TABLEAU_EXCEPTION(e);
  }
}

Tableau::Extract* Extract::GetExtract() {
  return nativeExtract_;
}

}
