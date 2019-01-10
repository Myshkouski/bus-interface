import stream from 'stream'

class Bus extends stream.Duplex {
	constructor() {
		super()

		this._handlers = []
	}

	_resolve(frame) {
		this.emit('frame', frame)
	}

	_read(size) {
		// for (let chunk = '', sent = 0, push = true; this._sending.length && push && sent <= size; sent += chunk.length) {
		//   chunk = this._sending.shift()
		//   push = this.push(chunk)
		// }
	}

	_write(chunk, encoding, cb) {
		for (let index = 0; index < this._handlers.length;) {
			const handler = this._handlers[index]
			const consumed = handler.consume(chunk, handler.options, handler.callback)
			let splice = true

			if (!consumed) {
				splice = false
			}

			if (splice && handler.options.once) {
				this._handlers.splice(index, 1)
			} else {
				index++
			}
		}

		process.nextTick(cb)
	}

	subscribe(consume, options, callback) {
		const w = {
			consume: consume.bind(this),
			options,
			callback: callback.bind(this)
		}

		this._handlers.push(w)

		return w
	}

	unsubscribe(watcher) {
		const index = this._handlers.indexOf(watcher)

		if (~index) {
			this._handlers.splice(index, 1)
			return true
		}

		return false
	}

	reset() {
		this._handlers.splice(0, this._handlers.length)
		return this
	}
}

export default Bus