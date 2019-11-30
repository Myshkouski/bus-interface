'use strict';

// import bufferToString from 'arraybuffer-to-string'
function bufferToString(buffer) {
    return String.fromCharCode.apply(null, buffer)
}

function line(delimiter, options = {}) {
    if (Buffer.isBuffer(delimiter)) {
        // delimiter = String.fromCharCode.apply(null, delimiter)
        delimiter = bufferToString(delimiter);
    }

    let limit = Infinity;

    if (options) {
        if (options.limit < limit) {
            limit = options.limit;
        }
    }

    let cache = '';

    return function consume(chunk, encoding, cb) {
        let from = cache.length - delimiter.length * 2;
        if (from < 2) {
            from = 0;
        }
        let consumedChunkLength = 0;
        let index;

        if (Buffer.isBuffer(chunk)) {
            chunk = bufferToString(chunk);
        }

        cache += chunk;

        while (cache) {
            index = cache.indexOf(delimiter, from);

            if (!~index) {
                break
            }

            const line = cache.slice(from, index);
            consumedChunkLength += index + delimiter.length - from;
            from = index + delimiter.length;

            cb && process.nextTick(cb.bind(this, line));

            if (options.once) {
                cache = '';
            }
        }

        if (cache && from) {
            cache = cache.slice(from);
        }

        return consumedChunkLength
    }
}

module.exports = line;
