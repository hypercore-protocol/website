---
layout: layouts/guides
---

# RemoteCorestore

<table class="module-table">
  <tr>
    <td class="row-name">API&nbsp;Docs</td>
    <td><a href="https://github.com/hypercore-protocol/hyperspace-client#remote-corestore" class="external">https://github.com/hypercore-protocol/hyperspace-client#remote-corestore</a></td>
  </tr>
</table>

The API for the Hyperspace daemon "corestore."
Mirrors the [corestore](../../modules/corestore/) module.

```js
const { Client: HyperspaceClient } = require('@hyperspace')

const client = new HyperspaceClient() // connect to the Hyperspace server
const corestore = client.corestore() // make a corestore

const newCore = corestore.get() // create a new hypercore
const existingCore = corestore.get(key) // get an existing hypercore
```

<div class="linklists two">
  <div class="linklist">
    <h4>Walkthroughs</h4>
    <a href="../../getting-started/hyperspace/">Getting Started with Hyperspace</a>
  </div>
</div>