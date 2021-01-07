---
layout: layouts/guides
title: Getting Started With Standalone Modules | Hypercore Protocol
description: A guide to using Hypercore Protocol's modules without the Hyperspace daemon.
---

# <img src="../../../images/icons8/module-50.png"> Getting Started With Standalone Modules

Standalone modules give you the ability to tweak and customize, gradually honing in on the right set of components and configurations for your use-case.
Using them directly is slightly more advanced, but it may fit your needs more closely depending on what you're building.

If you're new to Hypercore, we recommend [Getting Started with Hyperspace](../hyperspace/) instead.

## Reasons you might use standalone modules

Here are a few reasons why you might want to use individual modules instead of the Hyperspace daemon:

 - You're building a self-contained tool that doesn't need to share data or coordinate networking with other Hypercore Protocol tools on the device.
 - You need advanced control over the storage or networking.

## Introduction

There are three main modules that Hyperspace typically handles, and these are the modules we're going to introduce you to.
They are:

 - [Corestore](../../modules/corestore/), a disk-storage manager for Hypercores,
 - [Hyperswarm](../../modules/hyperswarm/), a DHT for arranging connections, and
 - [Hypercore](../../modules/hypercore/), an append-only log and the foundation of Hypercore Protocol's data structures.

No matter how you're using Hypercore Protocol, you'll probably also want to use the [Hyperdrive](../../modules/hyperdrive/) and [Hyperbee](../../modules/hyperbee/) modules as well &mdash; a files archive and k/v database, respectively.

We'll start with Hypercore and the other data structures.

---

## Using Hypercore, Hyperdrive, and Hyperbee

Hypercore and Hyperdrive use a standard pattern for instantiating the objects:

```js
const core = new Hypercore(storage[, key])
const drive = new Hyperdrive(storage[, key])
```

There are three distinct usages for these constructors.
Let's go through each.

### Usage 1: Create/load default

The first usage is passing a storage location with no key:

```js
const core = new Hypercore('./my-hypercore')
const drive = new Hyperdrive('./my-hyperdrive')
```

This approach will load a "default" core or drive from the storage location.
If no default core or drive exists yet, one will be created.

### Usage 2: Create new

The second usage is passing a storage location with a `null` key:

```js
const core = new Hypercore('./my-hypercore', null)
const drive = new Hyperdrive('./my-hyperdrive', null)
```

This approach will always create a new core or drive.

### Usage 3: Load existing

The third usage is passing a storage location with a key specified:

```js
const core = new Hypercore('./my-hypercore', keyBuf)
const drive = new Hyperdrive('./my-hyperdrive', keyBuf)
```

This approach will always load an existing core or drive.
If no data exists locally, the structure will be loaded in an "empty state" which can be populated by pulling data from the network.

### Loading Hyperbees

Hyperbees are constructed differently than Hypercores and Hyperdrives.
Rather than specifying some storage and/or key, you provide a Hypercore:

```js
const core = new Hypercore('./my-hyperbee')
const bee = new Hyperbee(core)
```

This is because, unlike Hyperdrive, Hyperbees only use one Hypercore to record their data.
As a result, there's no reason for the Hyperbee object to know about the storage mechanism &mdash; all it needs is its Hypercore!

### Related walkthroughs

If you want to learn more about each of these modules, see their walkthroughs:

 - [**Hypercore**: Creating and Sharing Hypercores](../../walkthroughs/creating-and-sharing-hypercores/)
 - [**Hyperdrive**: Sharing Files with Hyperdrive](../../walkthroughs/sharing-files-with-hyperdrive/)
 - [**Hyperbee**: P2P Indexing with Hyperbee](../../walkthroughs/p2p-indexing-with-hyperbee/)

---

## Using Corestore

If you're working with a single hypercore, managing storage and networking is as simple as specifying a directory and piping a replication stream.
However, more advanced data structures like Hyperdrive need to manage collections of Hypercores. 

[Corestore](../../modules/corestore/) is an abstraction that makes it easier to handle these collections.
Corestore simplifies storage, key management, and (as we'll see in a bit) networking.

Setting up a corestore is similar to setting up any hyper* structure.
You just pass the storage path:

```js
const store = new Corestore('./my-storage')
await store.ready()
```

From here, you have a similar set of usage patterns for getting and creating hyper* structures.

Creating or loading the default:

```js
const core = store.default()
const drive = new Hyperdrive(store)
```

Creating a new structure:

```js
const core = store.get()
const drive = new Hyperdrive(store, null)
```

Loading an existing structure:

```js
const core = store.get({ key: keyBuf })
const drive = new Hyperdrive(store, keyBuf)
```

Notice that for Hyperdrives, you pass the corestore into the storage parameter.

---

## Using Hyperswarm

[Hyperswarm](../../modules/hyperswarm/) is a DHT (<a href="https://en.wikipedia.org/wiki/Distributed_hash_table" class="external" title="Distributed Hash Table">Distributed Hash Table</a>) for discovering and connecting to other peers, primarily for Hypercore replication.

Here's how you can use it to replicate a single Hypercore:

```js
const pump = require('pump')
const hypercore = require('hypercore')
const hyperswarm = require('hyperswarm')

// Setup the hypercore as usual.
const core = new Hypercore(/* ... */)
await core.ready()

// Create a new swarm instance.
const swarm = hyperswarm()

// Replicate whenever a new connection is created.
swarm.on('connection', (connection, info) => {
  pump(
    connection,
    core.replicate({initiator: info.client}),
    connection
  )
})

// Start swarming the hypercore.
swarm.join(core.discoveryKey, {
  announce: true,
  lookup: true
})
```

If you're replicating a single Hypercore and don't want to bother with this boilerplate, you can use the <a href="https://github.com/hyperswarm/replicator" title="Hyperswarm Replicator Module" class="external">hyperswarm/replicator</a> module to make life easier.

### Corestore Networker

Using Hyperswarm directly involves some nuances and can be particularly complex when dealing with multiple Hypercores (or multi-core structures like Hyperdrive).

Therefore, we recommend using the <a href="https://github.com/hypercore-protocol/corestore-networker" class="external" title="Corestore Networker">Corestore Networker</a> module along with Corestore to make life easier.

```js
const Networker = require('@corestore/networker')
const Corestore = require('corestore')

// Setup the corestore and hypercore as usual.
const store = new Corestore(/* ... */)
await store.ready()
const core = store.get(/* ... */)
await core.ready()

// Create the networker.
const networker = new Networker(store)

// Start announcing or lookup up a discovery key on the DHT.
await networker.configure(core.discoveryKey, { announce: true, lookup: true })

// Stop announcing or looking up a discovery key.
networker.configure(core.discoveryKey, { announce: false, lookup: false })

// Shut down the swarm (and unnanounce all keys)
await networker.close()
```

The networker also includes events and information about the network state:

```js
// Is the networker "swarming" the given core?
networker.joined(core.discoveryKey) // => true/false

// Has the networker attempted to connect to all known peers of the core?
networker.flushed(core.discoveryKey) // => true/false

// Peer events and information.
console.log(networker.peers) // Outputs an array of peer objects.
networker.on('peer-add', peer => /*...*/)
networker.on('peer-add', peer => /*...*/)
```

Not only is the Corestore Networker much easier to use, it will "multiplex" replication of cores whenever possible, making it a more efficient approach than manually using Hyperswarm.

---

## Next steps

You're ready to build applications using standalone modules.
The API pages can help you learn about the individual components, while the walkthroughs will help guide you through common tasks.

<div class="linklists two">
  <div class="linklist">
    <h4>APIs</h4>
    <a href="../../modules/corestore/">Corestore</a>
    <a href="../../modules/hyperswarm/">Hyperswarm</a>
    <a href="../../modules/hypercore/">Hypercore</a>
    <a href="../../modules/hyperdrive/">Hyperdrive</a>
    <a href="../../modules/hyperbee/">Hyperbee</a>
  </div>
  <div class="linklist">
    <h4>Walkthroughs</h4>
    <a href="../../walkthroughs/creating-and-sharing-hypercores/">Creating and Sharing Hypercores</a>
    <a href="../../walkthroughs/sharing-files-with-hyperdrive/">Sharing Files with Hyperdrive</a>
    <a href="../../walkthroughs/p2p-indexing-with-hyperbee/">P2P Indexing with Hyperbee</a>
  </div>
</div>

<style>
  hr {
    border-top: 1px dashed #000;
  }
  h1 img {
    width: 40px;
    position: relative;
    top: 6px;
  }

  h4 img {
    position: relative;
    top: 5px;
    margin-right: 5px;
  }
</style>