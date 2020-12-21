---
layout: layouts/guides
---

# Hypercore

<table class="module-table">
  <tr>
    <td class="row-name">Repo</td>
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

Having an immutable history means one can always “check out” the state of a Hypercore at any previous point in time (e.g. when it had a length of 15).

Hypercores can be **stored** in a variety of different storage backends, so long as they adhere to the <a href="https://github.com/random-access-storage/random-access-storage" class="external" title="random-access-storage">random-access-storage</a> pattern. There are random-access-* modules for local disk, memory-only, IndexedDB, S3, and more.
</p>

Hypercores can be **shared** using their `replicate` method, which returns a Duplex stream that can be piped over arbitrary networking protocols. We typically combine Hypercore replication streams with Hyperswarm connections, described below. 