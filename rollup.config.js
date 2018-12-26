import path from 'path'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'

const __src = path.resolve('src')
const __dist = path.resolve('dist')

const extensions = ['.js', '.ts']

export default {
	input: path.resolve(__src, 'index.ts'),
	external: id => !id.startsWith('.') && !id.startsWith(path.sep) && !~id.indexOf(__src),
	output: [{
		format: 'esm',
		file: path.resolve(__dist, 'index.mjs')
	}, {
		format: 'cjs',
		file: path.resolve(__dist, 'index.js')
	}],
	plugins: [
		resolve({
			extensions
		}),
		commonjs(),
		babel({
			extensions,
			presets: [
				'@babel/preset-typescript'
			]
		})
	]
}