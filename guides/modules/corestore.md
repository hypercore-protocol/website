---
layout: layouts/guides
title: Corestore | Hypercore Protocol
description: API overview for the Corestore module.
---

# Corestore

<table class="module-table">
  <tr>
    <td class="row-name">API Docs</td>
    <td><a href="https://github.com/hypercore-protocol/corestore" class="external">https://github.com/hypercore-protocol/corestore</a></td>
  </tr>
  <tr>
    <td class="row-name">Depends On</td>
    <td>
      <a href="../hypercore/" title="hypercore">hypercore</a>
    </td>
  </tr>
  <tr>
    <td class="row-name">Used By</td>
    <td>
      <a href="../../hyperspace/" title="hyperspace">hyperspace</a>,
      <a href="../hyperdrive/" title="hyperdrive">hyperdrive</a>
    </td>
  </tr>
</table>

A Hypercore factory and a set of associated functions for managing generated Hypercores.

```js
const Corestore = require('corestore')
const ram = require('random-access-memory')
const store = new Corestore(ram)
await store.ready()

// create a hypercore
const core1 = store.get()

// load an existing hypercore
const core2 = store.get({ key: Buffer(...) })
```

A corestore is designed to efficiently store and replicate multiple sets of interlinked Hypercores, such as those used by [Hyperdrive](../hyperdrive) and <a href="https://github.com/andrewosh/hypertrie" class="external">mountable-hypertrie</a>, removing the responsibility of managing custom storage/replication code from these higher-level modules.

<div class="linklists two">
  <div class="linklist">
    <h4>Walkthroughs</h4>
    <a href="../../getting-started/standalone-modules/">Getting Started with Standalone Modules</a>
  </div>
</div>