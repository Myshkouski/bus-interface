export function reset(watcher: WatcherBase): Watcher {
    watcher.match = watcher.pattern.slice(0)
    watcher.matchIndex = 0
    return <Watcher > watcher
}

export function consume(watcher: Watcher, chunk: Data): boolean {
    for (let chunkIndex = 0; chunkIndex < chunk.length; chunkIndex++) {
        let expected = watcher.match[watcher.matchIndex]

        if (expected instanceof Function) {
            expected = expected.call(undefined, chunk[chunkIndex], watcher.matchIndex, watcher.match.slice(0, watcher.matchIndex))

            if (Array.isArray(expected)) {
                watcher.match.splice.apply(watcher.match, [watcher.matchIndex, 1].concat(expected))
                expected = expected[0]
            }
        }

        if (watcher.matchIndex < watcher.match.length) {
            if (!expected || expected === chunk[chunkIndex]) {
                watcher.match[watcher.matchIndex] = chunk[chunkIndex]
                watcher.matchIndex++

                if (watcher.matchIndex === watcher.match.length) {
                    watcher.callback && setImmediate(watcher.callback.bind(watcher, watcher.match, watcher))
                    return true
                }
            } else {
                throw chunkIndex
            }
        }
    }
}

export function toConsumable(pattern: Pattern): ConsumablePattern {
    let consumablePattern: ConsumablePattern = []

    for (let index = 0; index < pattern.length; index++) {
        const sample = pattern[index]

        if (Array.isArray(sample)) {
            consumablePattern = consumablePattern.concat(sample)
        } else {
            consumablePattern.push(sample)
        }
    }

    for (let index in consumablePattern) {
        const sample = consumablePattern[index]
        if (!(!isNaN(sample) || sample instanceof Function || sample === undefined)) {
            throw new TypeError('Cannot create pattern with "' + typeof sample + '" sample type')
        }
    }

    return consumablePattern
}

export function create(pattern: Pattern, callback ? : Function): Watcher {
    const watcher: WatcherBase = {
        pattern: toConsumable(pattern),
        callback
    }

    return reset(watcher)
}