---
layout: layouts/guides
---

# Hyperbee

<table class="module-table">
  <tr>
    <td class="row-name">API Docs</td>
    <td><a href="https://github.com/hypercore-protocol/hyperbee" class="external">https://github.com/hypercore-protocol/hyperbee</a></td>
  </tr>
  <tr>
    <td class="row-name">Depends On</td>
    <td>
      <a href="../hypercore/" title="hypercore">hypercore</a>
    </td>
  </tr>
</table>

An append-only Btree running on a Hypercore. Allows sorted iteration and more.

```js
const Hyperbee = require('hyperbee')
const db = new Hyperbee(feed, {
  keyEncoding: 'utf-8', // can be set to undefined (binary), utf-8, ascii or and abstract-encoding
  valueEncoding: 'binary' // same options as above
})

// if you own the feed
await db.put('key', 'value')
await db.del('some-key')

// if you want to query the feed
const node = await db.get('key') // null or { key, value }

// if you want to read a range
const rs = db.createReadStream({ gt: 'a', lt: 'd' }) // anything >a and <d
const rs = db.createReadStream({ gte: 'a', lte: 'd' }) // anything >=a and <=d
```

<div class="linklists two">
  <div class="linklist">
    <h4>Walkthroughs</h4>
    <a href="../../getting-started/standalone-modules/">Getting Started with Standalone Modules</a>
    <a href="../../walkthroughs/p2p-indexing-with-hyperbee/">P2P Indexing with Hyperbee</a>
  </div>
</div>