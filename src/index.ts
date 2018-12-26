import {
	Duplex
} from 'D:\\myshkovskii\\Dev\\espruino\\modules\\stream'
import * as Watcher from './watcher'

class Bus extends Duplex {
	private _watchers: Array<Watcher>

	constructor() {
		super()

		this._watchers = []
	}

	_read(size) {
		// for (let chunk = '', sent = 0, push = true; this._sending.length && push && sent <= size; sent += chunk.length) {
		//   chunk = this._sending.shift()
		//   push = this.push(chunk)
		// }
	}

	_write(chunk, encoding, cb) {
		let consumed = false

		for (let watcherIndex = 0; watcherIndex < this._watchers.length;) {
			let watcher = this._watchers[watcherIndex]

			let resolved

			try {
				resolved = Watcher.consume(watcher, chunk)
				consumed = true
				watcherIndex++
			} catch (error) {
				this._watchers.splice(watcherIndex, 1)
			}

			if (resolved) {
				this.emit('frame', watcher.match)
			}
		}

		if (!consumed) {
			this.emit('error', new Error('Not consumed'))
		}

		cb()
	}

	subscribe(pattern: Pattern, cb?: Function): Watcher {
		const consumablePattern = Watcher.toConsumable(pattern)
		const watcher = Watcher.create(consumablePattern, cb)

		this._watchers.push(watcher)

		return watcher
	}

	unsubscribe(watcher: Watcher): boolean {
		const index = this._watchers.indexOf(watcher)

		if(~index) {
			this._watchers.splice(0, this._watchers.length)
			return true
		}

		return false
	}

	expect(pattern: Pattern, cb?: Function) {
		return this.subscribe(pattern, (match, watcher) => {
			this.unsubscribe(watcher)
		})
	}

	reset() {
		this._watchers.splice(0, this._watchers.length)
		return this
	}
}

export default Bus
