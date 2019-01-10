function line(delimiter, options) {
  if (typeof delimiter === 'object') {
    delimiter = String.fromCharCode.apply(null, delimiter)
  }

  let limit = Infinity

  if(options) {
    if (options.limit < limit) {
      limit = options.limit
    }
  }

  let cache = ''

  return function consume(chunk, options = {}, cb) {
    let from = cache.length - delimiter.length * 2
    if (from < 2) {
      from = 0
    }
    let consumedChunkLength = 0
    let index

    if (typeof delimiter === 'object') {
      chunk = String.fromCharCode.apply(null, chunk)
    }

    cache += chunk
    
    while (cache) {
      index = cache.indexOf(delimiter, from)

      if (!~index) {
        break
      }

      const line = cache.slice(from, index)

      consumedChunkLength += cache.length - index
      from = index + delimiter.length

      cb && process.nextTick(cb.bind(this, line))

      if (options.once) {
        cache = ''
      }
    }

    if (cache && from) {
      cache = cache.slice(from)
    }

    return consumedChunkLength
  }
}

export default line