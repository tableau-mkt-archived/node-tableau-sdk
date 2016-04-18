#ifndef SERVERCONNECTION_H
#define SERVERCONNECTION_H

#include <iostream>
#include <node.h>
#include <node_object_wrap.h>

#if defined(__APPLE__) && defined(__MACH__)
#include <TableauServer/TableauServer_cpp.h>
#else
#include "TableauServer_cpp.h"
#endif

namespace NodeTde {

class ServerConnection : public node::ObjectWrap {
 public:
  static void Init(v8::Local<v8::Object> exports);

 private:
  explicit ServerConnection();
  ~ServerConnection();

  static void New(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void Close(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void Connect(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void Disconnect(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void PublishExtract(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void SetProxyCredentials(const v8::FunctionCallbackInfo<v8::Value>& args);
  static v8::Persistent<v8::Function> constructor;

  Tableau::ServerConnection* nativeServerConnection_;
};

}

#endif
