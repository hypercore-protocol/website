---
layout: layouts/guides
---

# RemoteHypercore

<table class="module-table">
  <tr>
    <td class="row-name">API&nbsp;Docs</td>
    <td><a href="https://github.com/hypercore-protocol/hyperspace-client#remote-hypercore" class="external">https://github.com/hypercore-protocol/hyperspace-client#remote-hypercore</a></td>
  </tr>
</table>

The API for Hyperspace daemon hypercores.
Mirrors the [hypercore](../../modules/hypercore/) module.

```js
const { Client: HyperspaceClient } = require('@hyperspace')

const client = new HyperspaceClient() // connect to the Hyperspace server

// use corestore to instantiate a RemoteHypercore
const core = client.corestore().get(key)
client.replicate(core) // also put the core on the network

await core.ready() // wait for some keys to be populated
console.log(core.key) // the core's public key
console.log(core.discoveryKey) // the core's discovery key
console.log(core.writable) // do we possess the private key?
console.log(core.peers) // currently connected peers

console.log(await core.has(0)) // do we have block 0?
console.log(await core.get(0)) // get block 0
await core.download(0, 4) // download the first 5 blocks
await core.append(new Buffer([1,2,3,4])) // append a new block

core.on('peer-add', peer => console.log('new peer', peer))
core.on('peer-remove', peer => console.log('peer disconnected', peer))
core.on('append', () => console.log('new block added'))
core.on('download', (seq, data) => console.log(data.byteLength, 'bytes downloaded'))
core.on('upload', (seq, data) => console.log(data.byteLength, 'bytes uploaded'))
```

<div class="linklists two">
  <div class="linklist">
    <h4>Walkthroughs</h4>
    <a href="../../getting-started/hyperspace/">Getting Started with Hyperspace</a>
    <a href="../../walkthroughs/creating-and-sharing-hypercores/">Creating and Sharing Hypercores</a>
  </div>
</div>