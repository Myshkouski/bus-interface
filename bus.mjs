import { Duplex } from 'stream'

function Route() {
	this._filters = []
}

Route.prototype = Object.create(Duplex.prototype)
Object.assign(Route.prototype, {
	constructor: Route,

	async _write(chunk, encoding, cb) {
		try {
			await this.consume(chunk, encoding, cb)
		} catch (error) {
			this.emit('error', error)
		}
	},

	use(handler) {
		this._filters.push(handler)
	},

	consume(chunk, encoding) {
		let index = -1
		const _consume = (chunk, encoding) => {
			if (++index < this._filters.length) {
				return this._filters[index](chunk, encoding, _consume)
			}

			this.emit('data', chunk)
			return 0
		}

		return _consume(chunk, encoding)
	}
})

function Bus() {
	this._routes = []
}

Bus.prototype = Object.create(Duplex.prototype)
Object.assign(Bus.prototype, {
	constructor: Bus,

	_read(size) {
		// for (let chunk = '', sent = 0, push = true; this._sending.length && push && sent <= size; sent += chunk.length) {
		//   chunk = this._sending.shift()
		//   push = this.push(chunk)
		// }
	},

	async _write(chunk, encoding, cb) {
		for (let index = 0; chunk.length && index < this._routes.length;) {
			const [id, route] = this._routes[index]
			let consumed = 0

			try {
				consumed = await route.consume(chunk, encoding)
			} catch (error) {
				this.emit('error', error)
			}

			if (consumed) {
				chunk = chunk.slice(consumed)
				index = 0
			} else {
				index++
			}
		}

		cb()
	},

	route(id, ...filters) {
		const route = new Route()

		for (let filter of filters) {
			route.use(filter)
		}

		this._routes.push([id, route])

		return route
	}
})

export { Route, Bus }