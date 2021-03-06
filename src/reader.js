/** Data reader component */

'use strict';

/* Requires ------------------------------------------------------------------*/

const Decoder = require('./decoder');

/* Methods -------------------------------------------------------------------*/

function Reader(scope) {

  function read(bytes) {
    readHeader(bytes);
    return readContent(bytes, scope.contentBegins);
  }

  function readHeader(bytes) {
    scope.header = [];
    let caret = 1;
    const keys = bytes[0];
    for (let i = 0; i < keys; i++) {
      caret = readKey(bytes, caret, i);
    }
    scope.contentBegins = caret;

    return this;
  }

  function readKey(bytes, caret, index) {
    const key = getSchemaDef(bytes[caret]);

    scope.header[index] = {
      key,
      size: key.size || Decoder.unsigned(bytes.subarray(caret + 1, caret + key.count + 1))
    };
    return caret + key.count + 1;
  }

  function getSchemaDef(index) {
    for (let i = 0; i < scope.items.length; i++) {
      if (scope.indices[scope.items[i]].index === index) return scope.indices[scope.items[i]];
    }
  }

  function readContent(bytes, caret) {
    caret = caret || 0;
    const ret = {};
    if (scope.options.keyOrder === true) {
      for (let i = 0; i < scope.items.length; i++) {
        ret[scope.items[i]] = undefined;
      }
    }
    for (let i = 0; i < scope.header.length; i++) {
      ret[scope.header[i].key.name] = scope.header[i].key.transformOut(bytes.subarray(caret, caret + scope.header[i].size));
      caret += scope.header[i].size;
    }
    return ret;
  }

  return { read, readHeader, readContent };
}

/* Exports -------------------------------------------------------------------*/

module.exports = Reader;
