import Bus from '.'
import stream from 'stream'

import line from './line-parser'
import frame from './frame-parser'


const {
  Duplex,
  Readable,
  Writable
} = stream


function length(limit) {
  let length = 0
  return function (chunk) {
    length += chunk.length

    if (length < limit) {
      return
    }


  }
}

const data = Buffer.from([0x00, 0x01, 3, 97, 98, 99, (97 + 98 + 99) & 0xff, 0x01, 0x00])
const lines = 'abc\r\ndef\r\nghi\r\n'
const error = Buffer.from([0x00, 0xff, 19, 0x01, 0x00])
const dataTemplate = [0x00, 0x01, byte => new Array(byte + 1), (checksum, chunk) => chunk.slice(3).reduce((sum, byte) => (sum + byte) & 0xff, 0), 0x01, 0x00]
const errorTemplate = [0x00, 0xff, undefined, 0x01, 0x00]

// const duplex = new Duplex({
//   read(size) {
//     console.log('duplex#read()', size)
//     this.push('abc')
//     this.push(null)
//   },
//   write(chunk, encoding, cb) {
//     console.log('duplex#write()', chunk)
//     cb()
//   }
// })

const src = new Readable({
  read(size) {
    console.log('src#read()', size)
    this.push(lines)
    // this.push(data)
    this.push(null)
  }
})

const dest = new Writable({
  write(chunk, encoding, cb) {
    console.log('dest#write()', chunk)
    cb()
  }
})

const bus = new Bus()
bus
  .on('data', console.log.bind(console, 'data:'))
  .once('end', console.log.bind(console, 'end with:'))
  .on('finish', console.log.bind(console, 'finish with:'))
  .on('error', console.error.bind(console, 'error'))
  .on('frame', console.error.bind(console, 'frame'))
  .on('drain', console.log.bind(console, 'drain'))
  .on('readable', console.log.bind(console, 'readable'))
  .on('close', console.log.bind(console, 'close'))

src.pipe(bus).pipe(dest)

// bus.subscribe(frame(dataTemplate), {
//   // once: true
// }, function (chunk) {
//   console.log('frame', chunk)
//   this.push('OK\r\n')
// })

// bus.subscribe(frame(errorTemplate), {
//   // once: true
// }, function (chunk) {
//   console.log('error', chunk)
//   this.push('ERROR\r\n')
// })

bus.subscribe(line('\r\n'), {
  // once: true
}, function (chunk) {
  console.log('line', chunk)
  this.push('LINE\r\n')
})