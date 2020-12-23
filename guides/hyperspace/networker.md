---
layout: layouts/guides
title: RemoteNetworker | Hypercore Protocol
description: API overview for the Hyperspace Networker API.
---

# RemoteNetworker

<table class="module-table">
  <tr>
    <td class="row-name">API&nbsp;Docs</td>
    <td><a href="https://github.com/hypercore-protocol/hyperspace-client#remote-networker" class="external">https://github.com/hypercore-protocol/hyperspace-client#remote-networker</a></td>
  </tr>
</table>

The API for the Hyperspace daemon "corestore networker."

```js
const { Client: HyperspaceClient } = require('@hyperspace')

const client = new HyperspaceClient() // connect to the Hyperspace server
await client.ready() // wait for .peers to be populated

// get current peers
console.log(client.networker.peers)

// log peer events
client.networker.on('peer-add', peer => {
  console.log('New peer:', peer)
})
client.networker.on('peer-remove', peer => {
  console.log('Peer disconnected:', peer)
})

// seed `myHypercore`
await client.networker.configure(myHypercore, {announce: true, lookup: true})
// ...which is equiv to:
await client.replicate(myHypercore)
```

<div class="linklists two">
  <div class="linklist">
    <h4>Walkthroughs</h4>
    <a href="../../getting-started/hyperspace/">Getting Started with Hyperspace</a>
  </div>
</div>