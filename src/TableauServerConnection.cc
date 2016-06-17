#include "TableauServerConnection.h"
#include "TableauException.h"

#if defined(__APPLE__) && defined(__MACH__)
#include <TableauServer/TableauServer_cpp.h>
#else
#include "TableauServer_cpp.h"
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
using nativeServerConnection = Tableau::ServerConnection;
using Tableau::ServerAPI;

Persistent<Function> ServerConnection::constructor;

ServerConnection::ServerConnection() {
  ServerAPI::Initialize();
  nativeServerConnection_ = new nativeServerConnection();
}

ServerConnection::~ServerConnection() {
  nativeServerConnection_->Close();
  ServerAPI::Cleanup();
}

void ServerConnection::Init(Local<Object> exports) {
  Isolate* isolate = exports->GetIsolate();

  // Prepare constructor template
  Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, New);
  tpl->SetClassName(String::NewFromUtf8(isolate, "ServerConnection"));
  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  // Prototype
  NODE_SET_PROTOTYPE_METHOD(tpl, "close", Close);
  NODE_SET_PROTOTYPE_METHOD(tpl, "connect", Connect);
  NODE_SET_PROTOTYPE_METHOD(tpl, "disconnect", Disconnect);
  NODE_SET_PROTOTYPE_METHOD(tpl, "publishExtract", PublishExtract);
  NODE_SET_PROTOTYPE_METHOD(tpl, "setProxyCredentials", SetProxyCredentials);

  constructor.Reset(isolate, tpl->GetFunction());
  exports->Set(String::NewFromUtf8(isolate, "ServerConnection"), tpl->GetFunction());
}

void ServerConnection::New(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  // Invoked as constructor: `new Extract(...)`
  if (args.IsConstructCall()) {
    ServerConnection* obj = new ServerConnection();
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

void ServerConnection::Close(const FunctionCallbackInfo<Value>& args) {
  ServerConnection* obj = ObjectWrap::Unwrap<ServerConnection>(args.Holder());
  obj->nativeServerConnection_->Close();
  ServerAPI::Cleanup();
}

void ServerConnection::Connect(const FunctionCallbackInfo<Value>& args) {
  String::Utf8Value v8Host(args[0]->ToString());
  string hostString = string(*v8Host);
  wstring wHost(hostString.length(), L' ');
  std::copy(hostString.begin(), hostString.end(), wHost.begin());

  String::Utf8Value v8User(args[1]->ToString());
  string userString = string(*v8User);
  wstring wUser(userString.length(), L' ');
  std::copy(userString.begin(), userString.end(), wUser.begin());

  String::Utf8Value v8Pass(args[2]->ToString());
  string passString = string(*v8Pass);
  wstring wPass(passString.length(), L' ');
  std::copy(passString.begin(), passString.end(), wPass.begin());

  String::Utf8Value v8Site(args[3]->ToString());
  string siteString = string(*v8Site);
  wstring wSiteId(siteString.length(), L' ');
  std::copy(siteString.begin(), siteString.end(), wSiteId.begin());

  ServerConnection* obj = ObjectWrap::Unwrap<ServerConnection>(args.Holder());

  try {
    obj->nativeServerConnection_->Connect(wHost, wUser, wPass, wSiteId);
  }
  catch (const Tableau::TableauException& e) {
    THROW_TABLEAU_EXCEPTION(e); 
  }
}

void ServerConnection::Disconnect(const FunctionCallbackInfo<Value>& args) {
  ServerConnection* obj = ObjectWrap::Unwrap<ServerConnection>(args.Holder());
  obj->nativeServerConnection_->Disconnect();
}

void ServerConnection::PublishExtract(const FunctionCallbackInfo<Value>& args) {
  String::Utf8Value v8Path(args[0]->ToString());
  string pathString = string(*v8Path);
  wstring wPath(pathString.length(), L' ');
  std::copy(pathString.begin(), pathString.end(), wPath.begin());

  String::Utf8Value v8ProjectName(args[1]->ToString());
  string projectNameString = string(*v8ProjectName);
  wstring wProjectName(projectNameString.length(), L' ');
  std::copy(projectNameString.begin(), projectNameString.end(), wProjectName.begin());

  String::Utf8Value v8Source(args[2]->ToString());
  string dataSourceNameString = string(*v8Source);
  wstring wDataSourceName(dataSourceNameString.length(), L' ');
  std::copy(dataSourceNameString.begin(), dataSourceNameString.end(), wDataSourceName.begin());

  bool overwrite(args[3]->BooleanValue());

  ServerConnection* obj = ObjectWrap::Unwrap<ServerConnection>(args.Holder());

  try {
    obj->nativeServerConnection_->PublishExtract(wPath, wProjectName, wDataSourceName, overwrite);
  }
  catch (const Tableau::TableauException& e) {
    THROW_TABLEAU_EXCEPTION(e); 
  }
}

void ServerConnection::SetProxyCredentials(const FunctionCallbackInfo<Value>& args) {
  String::Utf8Value v8User(args[0]->ToString());
  string userString = string(*v8User);
  wstring wUser(userString.length(), L' ');
  std::copy(userString.begin(), userString.end(), wUser.begin());

  String::Utf8Value v8Pass(args[1]->ToString());
  string passString = string(*v8Pass);
  wstring wPass(passString.length(), L' ');
  std::copy(passString.begin(), passString.end(), wPass.begin());

  ServerConnection* obj = ObjectWrap::Unwrap<ServerConnection>(args.Holder());
  obj->nativeServerConnection_->SetProxyCredentials(wUser, wPass);
}

}

