import path from 'path'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'

const __src = path.resolve('src')
const __dist = path.resolve('dist')

const input = path.resolve(__src, 'index.ts')
const extensions = ['.mjs', '.js', '.ts']
const external = id => !id.startsWith('.') && !id.startsWith(path.sep) && !~id.indexOf(__src)
const basePlugins = [
	resolve({
		extensions
	}),
	commonjs()
]

export default [{
	input,
	external,
	output: {
		format: 'esm',
		file: path.resolve(__dist, 'index.mjs')
	},
	plugins: [
		...basePlugins,
		babel({
			extensions,
			presets: [
				'@babel/preset-typescript'
			]
		})
	]
}, {
	input,
	external,
	output: {
		format: 'cjs',
		file: path.resolve(__dist, 'index.js')
	},
	plugins: [
		...basePlugins,
		babel({
			extensions,
			presets: [
				'babel-preset-espruino',
				'@babel/preset-typescript'
			]
		})
	]
}]
