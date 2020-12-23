---
layout: layouts/guides
title: Hyperswarm | Hypercore Protocol
description: API overview for the Hyperswarm module.
---

# Hyperswarm

<table class="module-table">
  <tr>
    <td class="row-name">API Docs</td>
    <td><a href="https://github.com/hyperswarm/hyperswarm" class="external">https://github.com/hyperswarm/hyperswarm</a></td>
  </tr>
  <tr>
    <td class="row-name">Depends On</td>
    <td>
      nothing
    </td>
  </tr>
  <tr>
    <td class="row-name">Used By</td>
    <td>
      <a href="../../hyperspace/" title="Hyperspace">hyperspace</a>,
      <a href="https://github.com/mafintosh/hyperbeam" title="Hyperbeam" class="external">hyperbeam</a>
    </td>
  </tr>
</table>

While Hypercores can be replicated over *any* Node stream, most people want to share them over a peer-to-peer network.
Hyperswarm is the DHT (<a href="https://en.wikipedia.org/wiki/Distributed_hash_table" class="external" title="Distributed Hash Table">Distributed Hash Table</a>) we developed for discovering and connecting to other peers, primarily for P2P Hypercore replication.

It supports a distributed UDP hole-punching algorithm that makes it especially suitable for home networks.

```js
const hyperswarm = require('hyperswarm')

const swarm = hyperswarm()
swarm.join(blake2s('my-hyperswarm-dkey'), {
  lookup: true, // find & connect to peers
  announce: true // optional- announce self as a connection target
})

swarm.on('connection', (socket, details) => {
  console.log('new connection!', details)

  // you can now use the socket as a stream, eg:
  // process.stdin.pipe(socket).pipe(process.stdout)
})
```

Hyperswarm is often used to discover and share peers for Hypercore replication, but it can also be used for more general P2P applications. As an example, <a href="https://github.com/mafintosh/hyperbeam" class="external">hyperbeam</a> uses Hyperswarm to establish E2E-encrypted "pipes" between two peers.

<div class="linklists two">
  <div class="linklist">
    <h4>Walkthroughs</h4>
    <a href="../../getting-started/standalone-modules/">Getting Started with Standalone Modules</a>
  </div>
</div>