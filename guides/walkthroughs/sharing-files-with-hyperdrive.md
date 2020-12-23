---
layout: layouts/guides
title: Sharing Files with Hyperdrive
---

# Sharing Files with Hyperdrive

This walkthrough will guide you through using Hyperdrive either as a standalone module or using Hyperspace.
We recommend that you first read the Getting Started guides for the approach you intend to take.

 - [Getting Started with Hyperspace](../../getting-started/hyperspace/)
 - [Getting Started with Standalone Modules](../../getting-started/standalone-modules/)

 You might also want to read the [Hypercore walkthrough](../creating-and-sharing-hypercores/), as Hyperdrive is built on top of Hypercores.
 In fact, it uses two: one for storing the file metadata and another for storing the file content.

 ## Introduction

 Hyperdrives are file archives which mimic the posix interface.
 The include a number of useful features:

- __Sparse Downloading__: By default, readers only download the portions of files they need, on demand. You can stream media from friends without jumping through hoops! Seeking is snappy and there's no buffering.
- __Fast Lookups__: File metadata is stored in a distributed trie structure, meaning files can be located with minimal network lookups.
- __Version Controlled__: Files are versioned by default, making it easy to see historical changes and prevent data loss.
- __Version Tagging__: You can assign string names to Hyperdrive versions and store these within the drive, making it straightforward to switch between semantically-meaningful versions.

As with Hypercores, a Hyperdrive can only have a __single writer on a single machine__; the creator of the Hyperdrive is the only person who can modify to it, because they're the only one with the private key. That said, the writer can replicate to __many readers__, in a manner similar to BitTorrent.

In this walkthrough, we'll create hyperdrives using standalone modules and Hyperspace (step 1).
We'll then demonstrate the basic APIs (step 2) and then learn about versioning (step 3).

## Walkthrough

If you want to follow along with the code, setup the walkthrough repo:

```bash
git clone https://github.com/hypercore-protocol/walkthroughs.git
cd walkthroughs/hyperdrive
npm install
```

## Step 1a: Using standalone modules

To create or load a hyperdrive as a standalone module, you follow this simple pattern:

```js
const hyperdrive = require('hyperdrive')
const drive = hyperdrive('./storage-path') // get or create drive at given path
```

If a drive exists at the path you provide, it will be loaded.
If no drive exists, one will be created.

You can load a specific drive within your storage by supplying a key.
This will only load the drive, so if no data exists locally yet then it will instantiate as an empty read-only drive waiting to pull data from the network:

```js
const drive = hyperdrive('./storage-path', Buffer.from(key, 'hex')) // load
```

You can also force creation of a new drive by passing `null` for the key:

```js
const drive = hyperdrive('./storage-path', null) // create new
```

You can read details such as the key or writability of a drive after 'ready' has been emitted:

```js
drive.ready(err => {
  if (err) throw err

  console.log(drive.key) // the drive's public key, used to identify it
  console.log(drive.discoveryKey) // the drive's discovery key for the DHT
  console.log(drive.writable) // do we possess the private key of this drive?
  console.log(drive.version) // what is the version-number of this drive?
  console.log(drive.peers) // list of the peers currently replicating this drive
})

// if you prefer promises you can use:
await drive.promises.ready()
```

If you want to load a drive in-memory, you can use the <a class="external" title="random-access-memory" href="https://github.com/random-access-storage/random-access-memory">random-access-memory</a> (RAM) interface.
The walkthrough code uses RAM to avoid writing to your device.

```js
const ram = require('random-access-memory')
const drive1 = hyperdrive(ram, null) // create
const drive2 = hyperdrive(ram, Buffer.from(key, 'hex')) // load
```

Run this step (<a href="https://github.com/hypercore-protocol/walkthroughs/blob/main/hyperdrive/step-1a.js" class="external" title="full code">full code</a>):

```bash
node step-1a.js
```

## Step 1b: Using Hyperspace

Creating and loading hyperdrives using Hyperspace is not much different from using standalone modules.
We'll assume you've created a Hyperspace `client` interface (see [Getting Started with Hyperspace](../../getting-started/hyperspace/)).

Rather than passing a path into `hyperdrive()`, you pass a "corestore" instance.

```js
const drive1 = hyperdrive(client.corestore(), null) // create
const drive2 = hyperdrive(client.corestore(), Buffer.from(key, 'hex')) // load
```

The rest works the same as before.

If you want to load a drive in-memory and use hyperspace, you can use the hyperspace "simulator."
The walkthrough code uses the simulator to avoid writing to your device.

```js
const createHyperspaceSimulator = require('hyperspace/simulator')
const { client, cleanup } = await createHyperspaceSimulator()

const drive1 = hyperdrive(client.corestore(), null) // create
const drive2 = hyperdrive(client.corestore(), Buffer.from(key, 'hex')) // load

await cleanup() // shut down the simulator
```

Run this step (<a href="https://github.com/hypercore-protocol/walkthroughs/blob/main/hyperdrive/step-1b.js" class="external" title="full code">full code</a>):

```bash
node step-1b.js
```

## Step 2: Reading and writing files

Many of the APIs for reading and writing files mimic the NodeJS "fs" API.
This should hopefully make this code look familiar.
Hyperdrive's default interface is callback based, but a promises API exists under `.promises` so we'll use that.

Here are a number of common methods:

```js
await drive.promises.writeFile('/hello.txt', 'World')

const st = await drive.promises.stat('/hello.txt')
console.log(st.isDirectory()) // => false
console.log(st.isFile()) // => true
console.log(st.size) // => 5
console.log(st.blocks) // 1 (the number of blocks in the content hypercore)

await drive.promises.readFile('/hello.txt', 'utf8') // => 'World'
await drive.promises.readdir('/') // => ['hello.txt']
await drive.promises.readdir('/', {recursive: true, includeStats: true})
// => [{name: 'hello.txt', stat: Stat(...)}]

await drive.promises.mkdir('/dir')
await drive.promises.rmdir('/dir')

// copy a file using read/write streams
drive.createReadStream('/hello.txt').pipe(drive.createWriteStream('/copy.txt'))

await drive.promises.unlink('/copy.txt') // delete the copy
```

Run this step (<a href="https://github.com/hypercore-protocol/walkthroughs/blob/main/hyperdrive/step-2.js" class="external" title="full code">full code</a>):

```bash
node step-2.js
```

<div class="info-aside" markdown="1">

#### <img src="../../../images/icons8/info-24.png"> Downloading files

Files will be downloaded and cached automatically when they're read via `readFile` or `createReadStream`.
If you want to pre-download a set of files, you can use the `download` function.

For instance, this will download all of the files in a subdirectory:

```js
await drive.promises.download('/subdir')
```

</div>


## Step 3: Versioning and version tags

All drives have a `.version` number which increments each time a change is made.
You can "checkout" previous versions of a drive to read the state at that time, if it's available.

```js
// see the files after the first write
await drive.checkout(1).promises.readdir('/')
```

You can diff between two versions to quickly see what has been modified:

```js
// create an example drive
const ram = require('random-access-memory')
const drive = hyperdrive(ram, null)

// write a file and capture a checkout at this time
await drive.promises.writeFile('/hello.txt', 'world')
const frozen = drive.checkout(drive.version)

// now delete the file
await drive.promises.unlink('/hello.txt')

// output the difference
for await (let change of drive.createDiffStream(frozen)) {
  console.log(change) // => { type: 'del', name: 'hello.txt', previous: { seq: 1 } }
}
```

The `.version` value is just a "sequence number" and not very helpful to look at, so hyperdrive has "version tags" which allow you to label specific versions under human-readable strings.
Here's how they work:

```js
// tag the current version as "tag1"
await drive.promises.createTag('tag1', drive.version)

// write a new file
await drive.promises.writeFile('/new.txt', 'This is new')

// fetch the tagged version's seq number
const tag1Version = await drive.promises.getTaggedVersion('tag1')
console.log(tag1Version) // => 3

// output the diff
for await (let change of drive.createDiffStream(tag1Version)) {
  console.log(change) /* => {
    type: 'put',
    name: 'new.txt',
    seq: 4,
    value: Stat { ... }
  }*/
}
```

Run this step (<a href="https://github.com/hypercore-protocol/walkthroughs/blob/main/hyperdrive/step-3.js" class="external" title="full code">full code</a>):

```bash
node step-3.js
```

## Next steps

Learn more at the [Hyperdrive module page](../../modules/hyperdrive/).

<style>
  h4 img {
    position: relative;
    top: 5px;
    margin-right: 5px;
  }
</style>