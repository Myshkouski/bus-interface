'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var bufferConcat = _interopDefault(require('buffer-concat'));
var bufferFrom = _interopDefault(require('buffer-from'));

function frame(pattern) {
    let cache = null;
    let match;

    if (typeof pattern == 'string') {
        pattern = bufferFrom(pattern);
    }
    
    if(Buffer.isBuffer(pattern)) {
        match = Array.from(pattern);
    } else if(Array.isArray(pattern)) {
        match = pattern.slice(0);
    }

    let matchIndex = 0;

    return function consume(chunk, encoding, cb) {
        if (cache) {
            chunk = bufferConcat(cache, bufferFrom(chunk));
            cache = null;
        }

        let chunkIndex = 0;
        let consumedChunkLength = 0;

        for (; chunkIndex < chunk.length; chunkIndex++) {
            let expected = match[matchIndex];

            if (expected instanceof Function) {
                expected = expected(chunk[chunkIndex], match.slice(0, matchIndex));
            }

            if (Array.isArray(expected)) {
                match.splice.apply(match, [matchIndex, 1].concat(expected));
                expected = expected[0];
            }

            if (matchIndex < match.length) {
                if (!expected || expected === chunk[chunkIndex]) {
                    match[matchIndex] = chunk[chunkIndex];
                    matchIndex++;

                    if (matchIndex === match.length) {
                        cb && cb(bufferFrom(match));
                        consumedChunkLength = matchIndex;
                        break
                    }
                } else {
                    // if(!options.once) {
                    //   cache = bufferFrom(chunk, chunkIndex + 1)
                    // }
                    if(matchIndex) {
                        match = pattern.slice(0);
                        matchIndex = 0;
                    }

                    break
                }
            }
        }

        return consumedChunkLength
    }
}

module.exports = frame;
