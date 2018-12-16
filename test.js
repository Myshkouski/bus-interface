const Bus = require('.')
const {
  Duplex,
  Readable,
  Writable
} = require('stream')

const bus = new Bus()

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
//
const readable = new Readable({
  read(size) {
    console.log('readable#read()', size)
    this.push(Buffer.from([1, 2, 3]))
    this.push(null)
  }
})

const writable = new Writable({
  write(chunk, encoding, cb) {
    console.log('writable#write()', chunk.toString())
    cb()
  }
})
//
// readable.pipe(bus).pipe(writable)
readable.pipe(bus)
// bus.pipe(writable)

bus
  // .on('data', console.log.bind(console, 'data:'))
  // .on('end', console.log.bind(console, 'end with:'))
  // .on('finish', console.log.bind(console, 'finish with:'))
  .on('error', console.error.bind(console, 'error'))
  .on('frame', console.error.bind(console, 'frame'))
// .on('drain', console.log.bind(console, 'drain'))
// .on('readable', console.log.bind(console, 'readable'))
// .on('close', console.log.bind(console, 'close'))

const pattern = [
  1, 2, (byte, index, match) => {
    return index + 1
  }
]

bus.expect(pattern, match => {
  console.log(match)
})
