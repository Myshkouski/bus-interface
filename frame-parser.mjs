import bufferConcat from 'buffer-concat'
import bufferFrom from 'buffer-from'

function frame(pattern) {
  let cache = null
  let match = pattern.slice(0)
  let matchIndex = 0

  return function consume(chunk, options, cb) {
    if (cache) {
      chunk = bufferConcat(cache, bufferFrom(chunk))
      cache = null
    }

    let chunkIndex = 0

    for (; chunkIndex < chunk.length; chunkIndex++) {
      let expected = match[matchIndex]

      if (expected instanceof Function) {
        expected = expected.call(undefined, chunk[chunkIndex], match.slice(0, matchIndex))
      }

      if (Array.isArray(expected)) {
        match.splice.apply(match, [matchIndex, 1].concat(expected))
        expected = expected[0]
      }

      if (matchIndex < match.length) {
        if (!expected || expected === chunk[chunkIndex]) {
          match[matchIndex] = chunk[chunkIndex]
          matchIndex++

          if (matchIndex === match.length) {
            cb && setImmediate(cb.bind(this, bufferFrom(match)))
            return chunkIndex
          }
        } else {
          // if(!options.once) {
          //   cache = bufferFrom(chunk, chunkIndex + 1)
          // }
          match = pattern.slice(0)
          matchIndex = 0

          return -1
        }
      }
    }
  }
}

export default frame