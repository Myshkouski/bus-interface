import { Duplex } from 'stream';

function reset(watcher) {
  watcher.match = watcher.pattern.slice(0);
  watcher.matchIndex = 0;
  return watcher;
}
function consume(watcher, chunk) {
  for (let chunkIndex = 0; chunkIndex < chunk.length; chunkIndex++) {
    let expected = watcher.match[watcher.matchIndex];

    if (expected instanceof Function) {
      expected = expected.call(undefined, chunk[chunkIndex], watcher.matchIndex, watcher.match.slice(0, watcher.matchIndex));

      if (Array.isArray(expected)) {
        watcher.match.splice.apply(watcher.match, [watcher.matchIndex, 1].concat(expected));
        expected = expected[0];
      }
    }

    if (watcher.matchIndex < watcher.match.length) {
      if (!expected || expected === chunk[chunkIndex]) {
        watcher.match[watcher.matchIndex] = chunk[chunkIndex];
        watcher.matchIndex++;

        if (watcher.matchIndex === watcher.match.length) {
          watcher.callback && setImmediate(watcher.callback.bind(watcher, watcher.match, watcher));
          return true;
        }
      } else {
        throw chunkIndex;
      }
    }
  }
}
function toConsumable(pattern) {
  let consumablePattern = [];

  for (let index = 0; index < pattern.length; index++) {
    const sample = pattern[index];

    if (Array.isArray(sample)) {
      consumablePattern = consumablePattern.concat(sample);
    } else {
      consumablePattern.push(sample);
    }
  }

  for (let index in consumablePattern) {
    const sample = consumablePattern[index];

    if (!(!isNaN(sample) || sample instanceof Function || sample === undefined)) {
      throw new TypeError('Cannot create pattern with "' + typeof sample + '" sample type');
    }
  }

  return consumablePattern;
}
function create(pattern, callback) {
  const watcher = {
    pattern: toConsumable(pattern),
    callback
  };
  return reset(watcher);
}

class Bus extends Duplex {
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
    let consumed = false;

    for (let watcherIndex = 0; watcherIndex < this._watchers.length;) {
      let watcher = this._watchers[watcherIndex];
      let resolved;

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
    const consumablePattern = toConsumable(pattern);
    const watcher = create(consumablePattern, cb);

    this._watchers.push(watcher);

    return watcher;
  }

  unsubscribe(watcher) {
    const index = this._watchers.indexOf(watcher);

    if (~index) {
      this._watchers.splice(0, this._watchers.length);

      return true;
    }

    return false;
  }

  expect(pattern, cb) {
    return this.subscribe(pattern, (match, watcher) => {
      cb && cb.call(watcher, match, watcher);
      this.unsubscribe(watcher);
    });
  }

  reset() {
    this._watchers.splice(0, this._watchers.length);

    return this;
  }

}

export default Bus;
