#include <node.h>
#include "TableauHyperExtract.h"
#include "TableauTableDefinition.h"
#include "TableauRow.h"

namespace NodeTde {

using v8::Local;
using v8::Object;

void InitAll(Local<Object> exports) {
  Extract::Init(exports);
  TableDefinition::Init(exports);
  Row::Init(exports);
}

NODE_MODULE(tableau, InitAll)

}
