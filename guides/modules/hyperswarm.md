---
layout: layouts/guides
---

# Hyperswarm

<table class="module-table">
  <tr>
    <td class="row-name">Repo</td>
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

While Hypercores can be replicated over any Node stream, most people want to use it in peer-to-peer systems. Hyperswarm is the DHT (distributed hash table) we developed for discovering and connecting to other peers, primarily for P2P Hypercore replication.

It supports a distributed UDP hole-punching algorithm that makes it especially suitable for home networks.

Hyperswarm is often used to discover and share peers for Hypercore replication, but it can also be used for more general P2P applications. As an example, <a href="https://github.com/mafintosh/hyperbeam" class="external">hyperbeam</a> uses Hyperswarm to establish E2E-encrypted "pipes" between two peers.