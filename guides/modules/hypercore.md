---
layout: layouts/guides
---

# Hypercore

<table class="module-table">
  <tr>
    <td class="row-name">API Docs</td>
    <td><a href="https://github.com/hypercore-protocol/hypercore" class="external">https://github.com/hypercore-protocol/hypercore</a></td>
  </tr>
  <tr>
    <td class="row-name">Depends On</td>
    <td>
      <a href="https://github.com/random-access-storage" class="external">random-access-storage</a>
    </td>
  </tr>
  <tr>
    <td class="row-name">Used By</td>
    <td>
      <a href="../corestore/">corestore</a>,
      <a href="../hyperbee/">hyperbee</a>,
      <a href="../hyperdrive/">hyperdrive</a>,
      <a href="../../hyperspace/">hyperspace</a>
    </td>
  </tr>
</table>

The centerpiece of our ecosystem is Hypercore, a secure append-only log data structure. One can think of a Hypercore as a “personal blockchain”, a self-owned list of binary blocks with an immutable history, secured by cryptographic proofs. 

```js
var hypercore = require('hypercore')
var feed = hypercore('./my-first-dataset', {valueEncoding: 'utf-8'})

feed.append('hello')
feed.append('world', function (err) {
  if (err) throw err
  feed.get(0, console.log) // prints hello
  feed.get(1, console.log) // prints world
})
```

Having an immutable history means one can always “check out” the state of a Hypercore at any previous point in time (e.g. when it had a length of 15).

Hypercores can be **stored** in a variety of different storage backends, so long as they adhere to the <a href="https://github.com/random-access-storage/random-access-storage" class="external" title="random-access-storage">random-access-storage</a> pattern. There are random-access-* modules for local disk, memory-only, IndexedDB, S3, and more.
</p>

<div class="linklists two">
  <div class="linklist">
    <h4>Walkthroughs</h4>
    <a href="../../getting-started/standalone-modules/">Getting Started with Standalone Modules</a>
    <a href="../../walkthroughs/creating-and-sharing-hypercores/">Creating and Sharing Hypercores</a>
  </div>
</div>