import sha256 from 'sha256'
import { sha256 as weappSha256 } from '../dist/weapp-sha256.js'

console.log('----- sha256 -----')
console.log(sha256('hello'))
console.log(weappSha256('hello'))

console.log('---- asBytes -----')
console.log(sha256('hello', { asBytes: true }))
console.log(weappSha256('hello', { asBytes: true }))

console.log('------- x2 -------')
console.log(sha256.x2('hello'))
console.log(weappSha256.x2('hello'))
