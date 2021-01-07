---
layout: layouts/guides
title: Getting Started With Hyperspace | Hypercore Protocol
description: Hyperspace is a server that bundles together many of Hypercore's modules, handling many low-level details for you.
---

# <img src="../../../images/icons8/program-50.png"> Getting Started With Hyperspace

Hyperspace is a server that bundles together many of our core modules, handling many low-level details for you. It's intended to be a configuration-less, opinionated take on the Hypercore Protocol stack, with a handful of extra features to make things easy to use.

## Installation

There are three ways to get started with Hyperspace:

1. **[Hyp CLI](../../hyp/)**: The `hyp` CLI tool will internally spawn and communicate with a Hyperspace instance.
2. **Standalone**: `npm i hyperspace -g` gives you a `hyperspace` command that can be used to start a server.
2. **Programmatically**: The `hyperspace` module exports a `Server` class.

If you've [installed the hyp cli](../../../install/) you can just run:

```bash
hyp daemon start
```

It will manage the daemon for you, and provides a couple helpful commands ([daemon status](../../hyp/commands/daemon-status), [daemon stop](../../hyp/commands/daemon-stop)).
If you've installed the hyperspace module globally, you can run it directly:

```bash
hyperspace
```

This will run for as long you keep the process active.

### Programmatically Running Hyperspace

While we recommend using the Hyp CLI in most cases, you can create the daemon programmatically.

```js
const { Server: HyperspaceServer } = require('hyperspace')
const server = new HyperspaceServer()
await server.ready()
```

This will spawn the daemon in the current process.

If you need to create separate Hyperspace instances than the default, you can set the **storage** and **host** params.

```js
const server = new HyperspaceServer({
  storage: './my-hyperspace-storage',
  host: 'my-hyperspace'
})
```

Data will be stored wherever **storage** specifies.
The **host** param determines how to identify the daemon server when connecting.

<div class="info-aside" markdown="1">

#### <img src="../../../images/icons8/info-24.png"> Hyperspace "Host" Parameter

By default, Hyperspace serves its RPC interface over a UNIX domain socket on Linux/OSX and a named pipe on Windows. You can configure the name of the domain socket with the `host` option, or with the `HYPERSPACE_SOCKET` environment variable.

</div>

## Connecting to the Daemon

However you've chosen to run Hyperspace, you can connect to it using the [hyp CLI](../../hyp/).
Run this command to make sure the daemon is in good state:

```bash
hyp daemon status
```

If you're running Hyperspace under a custom **host** parameter, specify it in the `HYPERSPACE_SOCKET` env var:

```bash
HYPERSPACE_SOCKET=my-hyperspace hyp daemon status
```

### Programmatically Connecting to the Daemon

Your apps can connect to the daemon using the client API.

```js
const { Client: HyperspaceClient } = require('hyperspace')
const client = new HyperspaceClient()
```

If you have a custom **host** parameter, pass it as an option:

```js
const client = new HyperspaceClient({
  host: 'my-hyperspace'
})
```

### Building Applications

Now that you have a client API connection, you can begin building with its APIs.

```js
const { Client: HyperspaceClient } = require('hyperspace')
const client = new HyperspaceClient()
const store = client.corestore()

// create a new hypercore
const core1 = store.get({ valueEncoding: 'utf-8' })
await core1.append(['hello', 'world']) // append 2 blocks

// seed the hypercore
await client.replicate(core1)
```

The Hyperspace client API includes 3 main interfaces:

 - [RemoteHypercore](../../hyperspace/hypercore/) &mdash; An append-only log.
 - [RemoteCorestore](../../hyperspace/corestore/) &mdash; A disk-storage manager for Hypercores.
 - [RemoteNetworker](../../hyperspace/networker/) &mdash; A networking manager.

You can use [hyperdrive](../../modules/hyperdrive/) and [hyperbee](../../modules/hyperbee/) on top of these APIs.

```js
const hyperdrive = require('hyperdrive')

// load and read the hyperdrive identified by `driveKey`
const drive = new Hyperdrive(client.corestore(), driveKey)
await drive.promises.ready()
await client.replicate(drive.metadata) // fetch from the network
console.log(await drive.promises.readdir('/'))

```
```js
const hyperbee = require('hyperbee')

// load and read the hyperbee identified by `beeKey`
const bee = new Hyperbee(client.corestore().get(beeKey), {
  keyEncoding: 'binary',
  valueEncoding: 'json'
})
await client.replicate(bee.feed) // fetch from the network
await bee.ready()
console.log(await bee.get('some-key'))
```


## Walkthrough

Let's do a quick walkthrough to illustrate using Hyperspace a little more.
If you want to follow along with the code, setup the walkthrough repo:

```bash
git clone https://github.com/hypercore-protocol/walkthroughs.git
cd walkthroughs/hyperspace
npm install
```

This walkthrough has a single dependency, `hyperspace` (not including `chalk`, for making CLI output pretty), which exports both the client and the server. 

### Step 1: Starting Two Hyperspace Servers

Let's create two Hyperspace servers, one simulating our local instance, and one simulating a remote peer:

```js
// Create one server to simulate your local Hyperspace instance.
const localServer = new HyperspaceServer({
  storage: './storage/hyperspace-storage-1',
  host: 'hyperspace-demo-1'
})
// Create a second server to simulate a remote peer.
const remoteServer = new HyperspaceServer({
  storage: './storage/hyperspace-storage-2',
  host: 'hyperspace-demo-2'
})
await localServer.ready()
await remoteServer.ready()
```

A Hyperspace server emits a handful of events. These are useful for debugging, so let log a few of these to see when clients to the daemon connect and disconnect:

```js
localServer.on('client-open', () => {
  // Our program has connected to the daemon
  console.log(chalk.green('(local) A HyperspaceClient has connected'))
})
localServer.on('client-close', () => {
  // Our program has disconnected from the daemon
  console.log(chalk.green('(local) A HyperspaceClient has disconnected'))
})
```

Run this step (<a href="https://github.com/hypercore-protocol/walkthroughs/blob/main/hyperspace/1-start-servers.js" class="external" title="full code">full code</a>):

```bash
node 1-start-servers.js
```

Now that both daemons are running, let's simulate a Hypercore replication in Step 2.

### Step 2: Replicate RemoteHypercores

We'll create two Hyperspace clients, one for each server we started in Step 1:

```js
// Create a client that's connected to the "local" peer.
const localClient = new HyperspaceClient({
  host: 'hyperspace-demo-1'
})

// Create a client that's connected to the "remote" peer.
const remoteClient = new HyperspaceClient({
  host: 'hyperspace-demo-2'
})
```

Now on the "local" peer, let's create a new [RemoteHypercore](../../hyperspace/hypercore/) and append a few blocks. Since RemoteHypercore mirrors the Hypercore API, they can be used interchangably.

```js
// Create a new RemoteCorestore.
const localStore = localClient.corestore()

// Create a fresh Remotehypercore.
const localCore = localStore.get({
  valueEncoding: 'utf-8'
})

// Append two blocks to the RemoteHypercore.
await localCore.append(['hello', 'world'])
```

To create a RemoteHypercore, we first need to create a [RemoteCorestore](../../hyperspace/corestore/) instance. A Corestore can be viewed as a Hypercore factory &mdash; it provides a `get` method for creating or instantiating Hypercores.

Now we want to make this new Hypercore available to the Hyperswarm network. We'll use the `replicate` function:

```js
// Start seeding the Hypercore on the Hyperswarm network.
localClient.replicate(localCore)
```

We'll also log whenever the Hypercore connects to new peers:

```js
// Log when the core has any new peers.
localCore.on('peer-add', () => {
  console.log(chalk.blue('(local) Replicating with a new peer.'))
})
```

<div class="info-aside" markdown="1">

#### <img src="../../../images/icons8/info-24.png"> Hyperspace Networking

Hyperswarm provides two configuration options for interacting with its DHT, __`announce`__ and __`lookup`__.

When you announce a discovery key, you advertise to the DHT that you're in possession of the corresponding Hypercore. 
A lookup, on the other hand, will not insert new entries into the DHT; it will only query the DHT to discover other peers announcing that discovery key.

The Hyperspace client's `replicate` function is effectively sugaring around

```js
client.network.configure(core.discoveryKey, { announce: true, lookup: true })
```
</div>

Our RemoteHypercore now contains two blocks and is being announced on the Hyperswarm DHT. It's time to create a RemoteHypercore on the second Hyperspace instance, which is simulating a remote peer.

To do this, we'll duplicate the exact same steps as above, with one difference: we'll instantiate the second RemoteHypercore with the first core's key:

```js
// Create a fresh Remotehypercore.
// Here we'll get a core using the shared key from above.
const clone = remoteStore.get({
  key: localCore.key,
  valueEncoding: 'utf-8'
})
```

After an identical `replicate` step on the `remoteClient`, the two Hypercores will be connected:
```js
// Start seeding the clone (this will connect to the first Hyperspace instance)
remoteClient.replicate(clone)
```

And finally the remote peer can read out the first two blocks:
```js
console.log(chalk.green('First two blocks of the clone:', [
  await clone.get(0),
  await clone.get(1)
]))
```

Run this step (<a href="https://github.com/hypercore-protocol/walkthroughs/blob/main/hyperspace/2-replicate-hypercores.js" class="external" title="full code">full code</a>):

```bash
node 2-replicate-hypercores.js
```

## Next steps

You're ready to build applications using Hyperspace.
The API pages can help you learn about the individual components, while the walkthroughs will help guide you through common tasks.

<div class="linklists two">
  <div class="linklist">
    <h4>APIs</h4>
    <a href="../../hyperspace/">Hyperspace Client API</a>
    <a href="../../hyperspace/corestore/">RemoteCorestore</a>
    <a href="../../hyperspace/networker/">RemoteNetworker</a>
    <a href="../../hyperspace/hypercore/">RemoteHypercore</a>
    <a href="../../modules/hyperdrive/">Hyperdrive</a>
    <a href="../../modules/hyperbee/">Hyperbee</a>
  </div>
  <div class="linklist">
    <h4>Walkthroughs</h4>
    <a href="../../walkthroughs/sharing-files-with-hyperdrive/">Sharing Files with Hyperdrive</a>
    <a href="../../walkthroughs/p2p-indexing-with-hyperbee/">P2P Indexing with Hyperbee</a>
  </div>
</div>

<style>
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