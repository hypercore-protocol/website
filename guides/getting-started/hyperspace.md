---
layout: layouts/guides
---

# <img src="../../../images/icons8/program-50.png"> Getting Started With Hyperspace

Hyperspace is a server that bundles together many of our core modules, handling many low-level details for you. It's intended to be a configuration-less, opinionated take on the Hypercore Protocol stack, with a handful of extra features to make things easy to use.

Hyperspace handles P2P connectivity, Hypercore garbage collection, and storage management. It and exposes an RPC interface that's used to power <a href="../../hyperspace/hypercore/" title="RemoteHypercore">RemoteHypercore</a>, <a href="../../hyperspace/corestore/" title="RemoteCorestore">RemoteCorestore</a>, and <a href="../../hyperspace/networker/" title="RemoteNetworker">RemoteNetworker</a> APIs.  

A `RemoteHypercore` can generally be viewed as a drop-in replacement for a regular Hypercore, and a `RemoteNetworker` mirrors the <a href="https://github.com/hypercore-protocol/corestore-networker" class="external" title="Corestore Networker">@corestore/networker</a> API.

## Installation

There are three ways to get started with Hyperspace:
1. [Hyp CLI](../../hyp/): The `hyp` CLI tool will internally spawn and communicate with a Hyperspace instance.
2. Standalone: `npm i hyperspace -g` gives you a `hyperspace` command that can be used to start a server.
2. Programmatically: The `hyperspace` module exports a `Server` class.

While we recommend using the Hyp CLI in most cases, this walkthrough will show you how to programmatically work with Hyperspace servers and clients.

## Walkthrough

If you want to follow along with the code, setup the walkthrough repo:

```bash
git clone https://github.com/andrewosh/hypercore-protocol-walkthroughs.git
cd hypercore-protocol-walkthroughs/hyperspace
npm install
```

This walkthrough has a single dependency, `hyperspace` (not including `chalk`, for making CLI output pretty), which exports both the client and the server. 

## Step 1: Starting Two Hyperspace Servers

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

The `storage` option defines where Hypercores will be stored on disk. By default, they will be saved to `~/.hyperspace/storage`. The `host` option is more nuanced, and is described below.

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

Run this step (<a href="https://github.com/hypercore-protocol/hypercore-protocol-walkthroughs/blob/main/hyperspace/1-start-servers.js" class="external" title="full code">full code</a>):

```bash
node 1-start-servers.js
```

Now that both daemons are running, let's simulate a Hypercore replication in Step 2.

<div class="info-aside" markdown="1">

#### <img src="../../../images/icons8/info-24.png"> Hosts and Ports

By default, Hyperspace serves its RPC interface over a UNIX domain socket on Linux/OSX and a named pipe on Windows. You can configure the name of the domain socket with the `host` option, or with the `HYPERSPACE_SOCKET` environment variable.

If both `host` and `port` options are provided, it will instead bind to a TCP server. Importantly, Hyperspace does not provide any authentication or encryption over these connections, as they're expected to be local. If you want to accept remote connections, you'll need to add a separate auth layer, and nothing is provided out of the box.

</div>

## Step 2: Replicate RemoteHypercores

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

Hyperswarm provides two configuration options for interacting with its DHT, __`announce`__ and __`lookup`__. When you announce a discovery key, you advertise to the DHT that you're in possession of the corresponding Hypercore. 

A lookup, on the other hand, will not insert new entries into the DHT, it will only query the DHT to discover other peers announcing that discovery key.

In many cases, you just want to make a RemoteHypercore available to the network without worrying about the specifics. The Hyperspace client's `replicate` function is effectively sugaring around

```js
client.network.configure(core.discoveryKey, { announce: true, lookup: true })
```
</div>

### Connect the Two Cores

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

Run this step (<a href="https://github.com/hypercore-protocol/hypercore-protocol-walkthroughs/blob/main/hyperspace/2-replicate-hypercores.js" class="external" title="full code">full code</a>):

```bash
node 2-replicate-hypercores.js
```

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