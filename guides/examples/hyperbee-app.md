---
layout: layouts/guides
title: Hyperbee App | Hypercore Protocol
description: Example code for getting started with Hypercore Protocol.
---

# Hyperbee App - Example Code

Create a new NodeJS application and install the following modules:

- [hyperspace](https://npm.im/hyperspace)
- [hyperbee](https://npm.im/hyperbee)

```bash
npm install hyperspace hyperbee
```

```js
import {
  Client as HyperspaceClient,
  Server as HyperspaceServer
} from 'hyperspace'
import Hyperbee from 'hyperbee'

async function main () {
  // Setup the Hyperspace Daemon connection
  // =
  const {client, cleanup} = await setupHyperspace()
  console.log('Hyperspace daemon connected, status:')
  console.log(await client.status())

  // Create a Hyperbee
  // =
  let bee = new Hyperbee(client.corestore().get(null), {
    keyEncoding: 'utf8',
    valueEncoding: 'json'
  })
  await bee.ready()
  console.log('New bee created, key:')
  console.log('  ', bee.feed.key.toString('hex'))

  // Entry writes
  // =
  await bee.put('first', 'Foo bar')
  await bee.put('second', {hello: 'world'})

  // Entry reads
  // =
  console.log('get(first)')
  console.log('  ', await bee.get('first'))
  console.log('get(second)')
  console.log('  ', await bee.get('second'))

  // Entry list
  // =
  console.log('createReadStream()')
  await new Promise(r => {
    bee.createReadStream()
      .on('data', entry => console.log('  ', entry))
      .on('end', r)
  })

  // Swarm on the network
  // =
  await client.replicate(bee.feed)
  await new Promise(r => setTimeout(r, 3e3)) // just a few seconds
  await client.network.configure(bee.feed, {announce: false, lookup: false})

  await cleanup()
}

async function setupHyperspace () {
  let client
  let server
  
  try {
    client = new HyperspaceClient()
    await client.ready()
  } catch (e) {
    // no daemon, start it in-process
    server = new HyperspaceServer()
    await server.ready()
    client = new HyperspaceClient()
    await client.ready()
  }
  
  return {
    client,
    async cleanup () {
      await client.close()
      if (server) {
        console.log('Shutting down Hyperspace, this may take a few seconds...')
        await server.stop()
      }
    }
  }
}

main()
```

<div class="linklists two">
  <div class="linklist">
    <h4>Walkthroughs</h4>
    <a href="../../getting-started/hyperspace/">Getting Started with Hyperspace</a>
    <a href="../../walkthroughs/hyperbee/">P2P Indexing with Hyperbee</a>
  </div>
  <div class="linklist">
    <h4>Individual APIs</h4>
    <a href="../../modules/hyperbee/">Hyperbee</a>
    <a href="../../hyperspace/">Hyperspace</a>
    <a href="../../hyperspace/corestore/">RemoteCorestore</a>
  </div>
</div>