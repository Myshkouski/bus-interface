import {
	Duplex
} from 'stream'
import * as Watcher from './watcher'

function Bus() {
	Duplex.call(this)
	this._watchers = []
}

Bus.prototype = Object.create(Duplex.prototype)
Bus.prototype.constructor = Bus

Bus.prototype._read = function _read(size) {
	// for (let chunk = '', sent = 0, push = true; this._sending.length && push && sent <= size; sent += chunk.length) {
	//   chunk = this._sending.shift()
	//   push = this.push(chunk)
	// }
}

Bus.prototype._write = function _write(chunk, encoding, cb) {
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

Bus.prototype.subscribe = function subscribe(pattern: Pattern, cb ? : Function): Watcher {
	const consumablePattern = Watcher.toConsumable(pattern)
	const watcher = Watcher.create(consumablePattern, cb)

	this._watchers.push(watcher)

	return watcher
}

Bus.prototype.unsubscribe = function unsubscribe(watcher: Watcher): boolean {
	const index = this._watchers.indexOf(watcher)

	if (~index) {
		this._watchers.splice(0, this._watchers.length)
		return true
	}

	return false
}

Bus.prototype.expect = function expect(pattern: Pattern, cb ? : Function) {
	return this.subscribe(pattern, (match, watcher) => {
		cb && cb.call(watcher, match, watcher)
		this.unsubscribe(watcher)
	})
}

Bus.prototype.reset = function reset() {
	this._watchers.splice(0, this._watchers.length)
	return this
}

export default Bus