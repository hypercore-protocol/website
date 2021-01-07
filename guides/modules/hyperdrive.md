---
layout: layouts/guides
title: Hyperdrive | Hypercore Protocol
description: API overview for the Hyperdrive module.
---

# Hyperdrive

<table class="module-table">
  <tr>
    <td class="row-name">API Docs</td>
    <td><a href="https://github.com/hypercore-protocol/hyperdrive" class="external">https://github.com/hypercore-protocol/hyperdrive</a></td>
  </tr>
  <tr>
    <td class="row-name">Depends On</td>
    <td>
      <a href="../hypercore/" title="hypercore">hypercore</a>
    </td>
  </tr>
</table>

Hyperdrive is a secure, real-time distributed file system designed for easy P2P file sharing.

```js
var Hyperdrive = require('hyperdrive')
var drive = new Hyperdrive('./my-first-hyperdrive') // content will be stored in this folder

await drive.promises.writeFile('/hello.txt', 'world')

const list = await drive.promises.readdir('/')
console.log(list) // prints ['hello.txt']

const data = await drive.promises.readFile('/hello.txt', 'utf-8')
console.log(data) // prints 'world'
```

<div class="linklists two">
  <div class="linklist">
    <h4>Walkthroughs</h4>
    <a href="../../getting-started/standalone-modules/">Getting Started with Standalone Modules</a>
    <a href="../../walkthroughs/sharing-files-with-hyperdrive/">Sharing Files with Hyperdrive</a>
  </div>
</div>