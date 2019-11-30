import path from 'path'

const __src = path.resolve('.')
const __dist = path.resolve('.')

const external = id => !id.startsWith('.') && !id.startsWith(path.sep) && !~id.indexOf(__src)

export default {
	input: {
		'bus': path.resolve(__src, 'bus.mjs'),
		'frame-parser': path.resolve(__src, 'frame-parser.mjs'),
		'line-parser': path.resolve(__src, 'line-parser.mjs')
	},
	external,
	output: {
		dir: __dist,
		format: 'cjs'
	},
	plugins: [
		// babel({
		// 	extensions,
		// 	presets: [
		// 		'babel-preset-espruino'
		// 	]
		// })
	]
}
