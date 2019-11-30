import bufferConcat from 'buffer-concat'
import bufferFrom from 'buffer-from'

function optimizePattern(pattern) {
    const optimizedPattern = []

    for (let index = 0; index < pattern.length; ++index) {
        const token = pattern[index]

        if (token instanceof Function) {
            optimizedPattern.push(token)
        } else if (typeof token == 'string') {

        }
    }

    return optimizedPattern
}

export default function frame(pattern) {
    let cache = null
    let match

    if (typeof pattern == 'string') {
        pattern = bufferFrom(pattern)
    }
    
    if(Buffer.isBuffer(pattern)) {
        match = Array.from(pattern)
    } else if(Array.isArray(pattern)) {
        match = pattern.slice(0)
    }

    let matchIndex = 0

    return function consume(chunk, encoding, cb) {
        if (cache) {
            chunk = bufferConcat(cache, bufferFrom(chunk))
            cache = null
        }

        let chunkIndex = 0
        let consumedChunkLength = 0

        for (; chunkIndex < chunk.length; chunkIndex++) {
            let expected = match[matchIndex]

            if (expected instanceof Function) {
                expected = expected(chunk[chunkIndex], match.slice(0, matchIndex))
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
                        cb && cb(bufferFrom(match))
                        consumedChunkLength = matchIndex
                        break
                    }
                } else {
                    // if(!options.once) {
                    //   cache = bufferFrom(chunk, chunkIndex + 1)
                    // }
                    if(matchIndex) {
                        match = pattern.slice(0)
                        matchIndex = 0
                    }

                    break
                }
            }
        }

        return consumedChunkLength
    }
}
