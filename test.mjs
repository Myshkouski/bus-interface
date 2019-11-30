import Serial from 'serialport'
import Bus, { Route } from './bus.mjs'
import line from './line-parser.mjs'
import frame from './frame-parser.mjs'

const bus = new Bus()

bus.on('error', console.error.bind(console, '!'))

// const route = bus.route('success', line('\r\n'))
const route = bus.route('success', frame('abc'))
bus.route('unexpected', (chunk, encoding, cb) => { cb(chunk); return chunk.length }, chunk => { throw 'No handlers for ' + chunk })

route.on('data', chunk => console.log('>', chunk))

bus.write('abcd')
// bus.write('abc\r\ndef\r\nfgh\r\n')
// bus.write('abc\r\ndef\r\nfgh\r\n')
// bus.write('abc\r\ndef\r\nfgh\r\n')
// bus.write('abc\r\ndef\r\nfgh\r\n')