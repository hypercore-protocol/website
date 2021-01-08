---
layout: layouts/guides
title: Hyperdrive App | Hypercore Protocol
description: Example code for getting started with Hypercore Protocol.
---

# Hyperdrive App - Example Code

Create a new NodeJS application and install the following modules:

- [hyperspace](https://npm.im/hyperspace)
- [hyperdrive](https://npm.im/hyperdrive)

```bash
npm install hyperspace hyperdrive
```

```js
import {
  Client as HyperspaceClient,
  Server as HyperspaceServer
} from 'hyperspace'
import Hyperdrive from 'hyperdrive'

async function main () {
  // Setup the Hyperspace Daemon connection
  // =
  const {client, cleanup} = await setupHyperspace()
  console.log('Hyperspace daemon connected, status:')
  console.log(await client.status())

  // Create a Hyperdrive
  // =
  let drive = new Hyperdrive(client.corestore(), null)
  await drive.promises.ready()
  console.log('New drive created, key:')
  console.log('  ', drive.key.toString('hex'))

  // File writes
  // =
  await drive.promises.mkdir('/stuff')
  await drive.promises.mkdir('/stuff/things')
  await drive.promises.writeFile('/file1.txt', 'Hello world!')
  await drive.promises.writeFile('/stuff/file2.bin', Buffer.from([0,1,2,4]))

  // File reads
  // =
  console.log('readdir(/)')
  console.log('  ', await drive.promises.readdir('/'))
  console.log('readFile(/file1.txt, utf8)')
  console.log('  ', await drive.promises.readFile('/file1.txt', 'utf8'))
  console.log('readFile(/stuff/file2.bin, hex)')
  console.log('  ', await drive.promises.readFile('/stuff/file2.bin', 'hex'))

  // Swarm on the network
  // =
  await client.replicate(drive)
  await new Promise(r => setTimeout(r, 3e3)) // just a few seconds
  await client.network.configure(drive, {announce: false, lookup: false})

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
    client = new HyperspaceClient()
    await server.ready()
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
    <a href="../../walkthroughs/hyperdrive/">Sharing Files with Hyperdrive</a>
  </div>
  <div class="linklist">
    <h4>Individual APIs</h4>
    <a href="../../modules/hyperdrive/">Hyperdrive</a>
    <a href="../../hyperspace/">Hyperspace</a>
    <a href="../../hyperspace/corestore/">RemoteCorestore</a>
  </div>
</div>