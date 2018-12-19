'use strict';

var myshkouski_espruino_modules_stream = require('@bit/myshkouski.espruino.modules.stream');

function reset(watcher) {
  watcher.match = watcher.pattern.slice(0);
  watcher.matchIndex = 0;
  return watcher;
}
function consume(watcher, chunk) {
  var resolved = false;

  for (var chunkIndex = 0; chunkIndex < chunk.length; chunkIndex++) {
    var expected = watcher.match[watcher.matchIndex];

    if (expected instanceof Function) {
      expected = expected.call(undefined, chunk[chunkIndex], watcher.matchIndex, watcher.match.slice(0, watcher.matchIndex));

      if (Array.isArray(expected)) {
        watcher.match.splice.apply(watcher.match, [watcher.matchIndex, 1].concat(expected));
        expected = expected[0];
      }
    }

    if (watcher.matchIndex < watcher.match.length) {
      if (!expected) {
        watcher.match[watcher.matchIndex] = chunk[chunkIndex];
      }

      if (expected === chunk[chunkIndex]) {
        watcher.matchIndex++;

        if (watcher.matchIndex === watcher.match.length) {
          resolved = true;
          break;
        }
      } else {
        throw chunkIndex;
      }
    }
  }

  if (resolved && watcher.callback) {
    watcher.callback.call(watcher, watcher.match, watcher);
  }

  return resolved;
}
function toConsumable(pattern) {
  var consumablePattern = [];

  for (var index = 0; index < pattern.length; index++) {
    var sample = pattern[index];

    if (Array.isArray(sample)) {
      consumablePattern = consumablePattern.concat(sample);
    } else {
      consumablePattern.push(sample);
    }
  }

  for (var _index in consumablePattern) {
    var _sample = consumablePattern[_index];

    if (!(!isNaN(_sample) || _sample instanceof Function || _sample === undefined)) {
      throw new TypeError('Cannot create pattern with "' + typeof _sample + '" sample type');
    }
  }

  return consumablePattern;
}
function create(pattern, callback) {
  var watcher = {
    pattern: toConsumable(pattern),
    callback: callback
  };
  return reset(watcher);
}

/**
 * @class Watcher
 */

class Bus extends myshkouski_espruino_modules_stream.Duplex {
  constructor() {
    super();
    this._watchers = [];
  }

  _read(size) {// for (let chunk = '', sent = 0, push = true; this._sending.length && push && sent <= size; sent += chunk.length) {
    //   chunk = this._sending.shift()
    //   push = this.push(chunk)
    // }
  }

  _write(chunk, encoding, cb) {
    var consumed = false;

    for (var watcherIndex = 0; watcherIndex < this._watchers.length;) {
      var watcher = this._watchers[watcherIndex];
      var resolved = void 0;

      try {
        resolved = consume(watcher, chunk);
        consumed = true;
        watcherIndex++;
      } catch (error) {
        this._watchers.splice(watcherIndex, 1);
      }

      if (resolved) {
        this.emit('frame', watcher.match);
      }
    }

    if (!consumed) {
      this.emit('error', new Error('Not consumed'));
    }

    cb();
  }

  subscribe(pattern, cb) {
    var consumablePattern = toConsumable(pattern);
    var watcher = create(consumablePattern, cb);

    this._watchers.push(watcher);

    return watcher;
  }

  unsubscribe(watcher) {
    var index = this._watchers.indexOf(watcher);

    if (~index) {
      this._watchers.splice(0, this._watchers.length);

      return true;
    }

    return false;
  }

  expect(pattern, cb) {
    return this.subscribe(pattern, (match, watcher) => {
      this.unsubscribe(watcher);
    });
  }

  reset() {
    this._watchers.splice(0, this._watchers.length);

    return this;
  }

}

module.exports = Bus;
