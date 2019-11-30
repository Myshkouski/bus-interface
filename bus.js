'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var stream = _interopDefault(require('stream'));

class Route extends stream.Duplex {
	constructor() {
		super();
		this._filters = [];
	}

	_read() {}

	async _write(chunk, encoding, cb) {
		try {
			await this.consume(chunk, encoding, cb);
		} catch(error) {
			this.emit('error', error);
		}
	}

	use(handler) {
		this._filters.push(handler);
	}

	consume(chunk, encoding) {
		let index = -1;
		const _consume = (chunk, encoding) => {
			if(++index < this._filters.length) {
				return this._filters[index](chunk, encoding, _consume)
			}

			this.emit('data', chunk);
			return 0
		};

		return _consume(chunk, encoding)
	}
}

class Bus extends stream.Duplex {
	constructor() {
		super();

		this._routes = [];
	}

	_resolve(frame) {
		this.emit('frame', frame);
	}

	_read(size) {
		// for (let chunk = '', sent = 0, push = true; this._sending.length && push && sent <= size; sent += chunk.length) {
		//   chunk = this._sending.shift()
		//   push = this.push(chunk)
		// }
	}

	async _write(chunk, encoding, cb) {
		for (let index = 0; chunk.length && index < this._routes.length;) {
			const [id, route] = this._routes[index];
			let consumed = 0;

			try {
				consumed = await route.consume(chunk, encoding);
			} catch(error) {
				this.emit('error', error);
			}
			
			if(consumed) {
				chunk = chunk.slice(consumed);
				index = 0;
			} else {
				index++;
			}
		}

		cb();
	}

	route(id, ...filters) {
		const route = new Route();
		
		for(let filter of filters) {
			route.use(filter);
		}

		this._routes.push([id, route]);

		return route
	}
}

exports.Bus = Bus;
exports.Route = Route;
