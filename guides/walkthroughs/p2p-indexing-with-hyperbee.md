---
layout: layouts/guides
title: P2P Indexing with Hyperbee
---

# P2P Indexing with Hyperbee

Hyperbee is an append-only B-Tree that can be used to build P2P databases. This walkthrough will dive into Hyperbee, showing you how to use it either as a standalone module or with Hyperspace.

If you aren't already familiar with the basics of Hypercore and Hyperspace, we recommend you first look at our Getting Started guides:

* [Getting Started with Hyperspace](../../getting-started/hyperspace)
* [Getting Started with Standalone Modules](../../getting-started/standalone-modules)

## Introduction

Hyperbee provides a key/value-store API, with methods for getting and inserting key/value pairs, atomically batching insertions, and creating sorted iterators. It uses a single Hypercore for storage, using a technique called embedded indexing.

If you're curious about the details of Hyperbee's design, our workshop called <a class="external" title="P2P Indexing and Search" href="https://github.com/hypercore-protocol/p2p-indexing-and-search">P2P Indexing and Search</a> covers all the guts.

Much of Hyperbee's API mirrors the <a class="external" title="LevelUP" href="https://github.com/Level/levelup">LevelUP</a> interface, so if you're already comfortable with the Level ecosystem parts of this walkthrough will feel familiar.

Hyperbee inherits and takes advantage of many Hypercore features:
* __Sparse Downloading__: When a reader performs a query, only the Hypercore blocks containing the relevant parts of the index are downloaded.
* __Sorted Iteration__: Using the embedded index, Hyperbee can satisfy range queries without needing to do a full scan.
* __Version Controlled__: The complete database history is preserved, and you can "check out" snapshots of previous versions.
* __Efficient Diffing__: Given two database snapshots, Hyperbee can efficiently detect where they differ.
* __Cache-Warmup Extension__: Hyperbee lookups are `O(log(n))`, but using the built-in warmup extension, remote peers can "stream" query results to readers with no loss of trust, dramatically reducing read latency.

As with Hypercores, a Hyperbee can only have a __single writer on a single machine__; the creator of the Hyperdrive is the only person who can modify to it, because they're the only one with the private key. That said, the writer can replicate to __many readers__, in a manner similar to BitTorrent.

This walkthrough covers the following topics:
1. Basic Operations (`get`, `put`, and `batch`)
2. Iteration (`createReadStream`)
3. Diffing (`createDiffStream`)
4. Sub-Databases (`sub`)
5. Using Hyperbee with LevelDB 

## Walkthrough

If you want to follow along with the code, setup the walkthrough repo:

```bash
git clone https://github.com/hypercore-protocol/walkthroughs.git
cd walkthroughs/hyperbee
npm install
```

## Step 1: Basic Operations

### Constructing a Hyperbee

A Hyperbee is constructed with either a single Hypercore, or a single RemoteHypercore (if you're using Hyperspace).

To create a Hyperbee using a standalone Hypercore:
```js
// A Hyperbee is stored as an embedded index within a single Hypercore.
const core = hypercore(ram)
const Hyperbee = require('hyperbee')

// It accepts LevelDB-style key/value encoding options.
const db = new Hyperbee(core, {
  keyEncoding: 'utf-8',
  valueEncoding: 'utf-8'
})
await db.ready()
```

As with Level, Hyperbee accepts `keyEncoding` and `valueEncoding` in its constructors. Both default to `binary`.

Creating a Hyperbee with Hyperspace is pretty much the same. In this example, we'll use the Hyperspace "simulator" to avoid saving any state to your computer's disk:

```js
const Hyperbee = require('hyperbee')
const createHyperspaceSimulator = require('hyperspace/simulator')

// A Hyperbee can also be constructed with a RemoteHypercore instance.
const { client, cleanup } = await createHyperspaceSimulator()
const store = client.corestore('hyperbee-exercise')
const core = store.get({ name: 'hyperbee-1' })

const db = new Hyperbee(core, {
  keyEncoding: 'utf-8',
  valueEncoding: 'utf-8'
})
await db.ready()
```

### Getting, Inserting, and Deleting KV-Pairs

Keys and values can be inserted with the `put` method:
```js
await db.put('a', 'b')
await db.put('c', 'd')
```

If you're doing a bulk insertion of many KV-pairs, you can use the `batch` method to atomically commit many entries:
```js
const b = db.batch()

await b.put('e', 'f')
await b.put('g', 'h')

// When a batch is flushed, it's atomically committed to the Hyperbee.
await b.flush()
```

To read out a single kv-pair, you can use the `get` method:
```js
const node = await db.get('a')) // An object of the form { key, value }
```
`get` will either return an object of the form `{ key, value }`, or `null`.

To delete a kv-pair, use the `del` method:
```js
await db.del('c')
```

Run this step using standalone modules (<a href="https://github.com/hypercore-protocol/walkthroughs/blob/main/hyperbee/1a-basics.js" class="external" title="full code">full code</a>):

```bash
node 1a-basics.js
```

Run this step using Hyperspace (<a href="https://github.com/hypercore-protocol/walkthroughs/blob/main/hyperbee/1b-hyperspace.js" class="external" title="full code">full code</a>):

```bash
node 1b-hyperspace.js
```

## Step 2: Iterating Over Sorted Streams

Hyperbee provides several methods that return sorted streams over ranges of kv-pairs. This step will cover standard range iteration, which uses the `createReadStream` method.

<div class="info-aside" markdown="1">

Note: Hyperbee's `createReadStream` is identical to Level's `createReadStream` method.

</div>

Here's how to create a simple sorted stream that yields all kv-pairs in the database:
```js
for await (const { key, value } of db.createReadStream()) {
  console.log(`${key} -> ${value}`)
}
```

For more specific ranges, you can use one or more of the following options:
* `gt`: Yield all pairs with key greater than this value
* `gte`: Yield all pairs with key greater than or equal to this value
* `lt`: Yield all pairs with key less than this value
* `lte`: Yield all pairs with key less than or equal to this value
* `reverse`: Yield results in reverse order
* `limit`: Only yield this many results

Let's create a database with many kv-pairs of the form 'a' -> 'a', 'b' -> 'b', etc:
```js
const keys = 'abcdefghijklmnopqrstuvwxyz'
const b = db.batch()
for (const char of keys) {
  await b.put(char, char)
}
await b.flush()
```

Now we can see how different `createReadStream` options affect the pairs that are returned:
|                  Result                  |                Options                  | 
| ---------------------------------------- | --------------------------------------- |
| First 10 pairs                           | `{limit: 10}`                           |
| Last 10 pairs, reversed                  | `{limit: 10, reverse: true}`            |
| Between 'a' and 'd', non-inclusive       | `{gt: 'a', lt: 'd'}`                    |
| Between 'a' and 'd', inclusive           | `{gte: 'a', lte: 'd'}`                  |  
| Between 'e' and 'f', inclusive, reversed | `{gte: 'e', 'lte: 'f', reversed: true}` |

### Sparse Downloading

Importantly, the number of blocks that a reader needs to download to complete a range query is entirely dependent on how specific that query is. 

A `createReadStream` with no options will do a full range scan, and thus download every block.

A more narrowly-specified range query will only need to download a few blocks from the network.

Run this step (<a href="https://github.com/hypercore-protocol/walkthroughs/blob/main/hyperbee/2-iterators.js" class="external" title="full code">full code</a>):

```bash
node 2-iterators.js
```

## Step 3: Snapshots and Diffing

By virtue of being built on a Hypercore, an append-only data structure, Hyperbees maintain their complete version history. You can "check out" a read-only snapshot of any historical version using the `checkout` method.

A snapshot is just a read-only Hyperbee, and provides the same methods, like `createReadStream`:
```js
const db = new Hyperbee(hypercore(ram), { keyEncoding: 'utf-8' })

await db.put('a', 'b')
await db.put('c', 'd')
const oldVersion = db.version // Let's mark the version before the last insertion
await db.put('e', 'f')
await db.del('c')

for await (const { key, value } of db.checkout(oldVersion).createReadStream()) {
  // Entries 'a' and 'c' will be returned
}
```

Hyperbee can also efficiently determine which kv-pairs have been added, removed, or modified (a diff) between two versions. Since large numbers of entries might have changed, the diffing functionality is exposed as a stream, just like `createReadStream`.

A diff stream yields entries of the form `{ left, right }`, where `right` is the earlier value and `left` is the later value for a given key.

`createDiffStream` supports the same options as `createReadStream`, minus `reverse`. Using the database constructed above:
```js
for await (const { left, right } of db.createDiffStream(oldVersion)) {
  // { left: { key: 'e', value: 'f' }, right: null }  // 'e' -> 'f' was added
  // { left: null, right: { key: 'c', value: 'd' }    // 'c' -> 'd' was deleted
}
```

Run this step (<a href="https://github.com/hypercore-protocol/walkthroughs/blob/main/hyperbee/3-diffs.js" class="external" title="full code">full code</a>):

```bash
node 3-diffs.js
```

## Step 4: Sub-Databases

Oftentimes when working with a Hyperbee, it's useful to create independent "sub-databases" within a parent database.

As an example, you might be storing two indexes inside of one database, one that indexes records by name, and the other by age. You can manually append prefixes to each index record you insert (e.g. `by-name!alice`, `by-age!73`), but this quickly grows tedious.

The `sub` method simplifies this:
```js
const db = new Hyperbee(hypercore(ram), {
  keyEncoding: 'utf-8',
  valueEncoding: 'utf-8'
})

// A sub-database will append a prefix to every key it inserts.
// This prefix ensure that the sub acts as a separate "namespace" inside the parent db.
const sub1 = db.sub('sub1')
const sub2 = db.sub('sub2')

await sub1.put('a', 'b')
await sub2.put('c', 'd')

for await (const { key, value } of sub1.createReadStream()) {
  // 'a' -> 'b'
}

for await (const { key, value } of sub2.createReadStream()) {
  // 'c' -> 'd'
}

// You can see the sub prefixes by iterating over the parent database.
for await (const { key, value } of db.createReadStream()) {
  // 'sub1\0a' -> 'b'
  // 'sub2\0c' -> 'd'
}
```

Hyperbee defaults to using the null character (`\0`) to separate keys.
We recommend sticking with the default for consistency.
(The null may not render in the console, so the code above may have keys that look like `"sub1a"` and `"sub2c"`.)

<div class="info-aside" markdown="1">

#### <img src="../../../images/icons8/info-24.png"> Key Encodings

If you plan on using numeric keys, you'll want to first encode those keys such that they sort lexicographically. To do this, you can use the <a class="external" title="lexicographic-integer" href="https://www.npmjs.com/package/lexicographic-integer"><code>lexicographic-integer</code></a> module.

Exercise 13 of the <a class="external" title="P2P Indexing and Search" href="https://github.com/hypercore-protocol/p2p-indexing-and-search/blob/main/problems/13.md">P2P Indexing and Search</a> workshop covers this in more detail.

</div>

Run this step (<a href="https://github.com/hypercore-protocol/walkthroughs/blob/main/hyperbee/4-sub.js" class="external" title="full code">full code</a>):

```bash
node 4-sub.js
```

## Step 5: Hyperbee Implements Leveldown

*Note: Using Hyperbee as a leveldown is still pretty experimental! If you go down this road, be prepared to file a bug report or two.*

Hyperbee has all the features necessary to be a <a class="external" title="leveldown backend" href="https://www.npmjs.com/package/abstract-leveldown">leveldown backend</a>, meaning it can be used as the data store for <a class="external" title="tons of modules" href="https://github.com/Level/awesome">tons of modules</a> in the Level ecosystem.

A small wrapper module, <a class="external" title="hyperbeedown" href="https://www.npmjs.com/package/hyperbeedown"><code>hyperbeedown</code></a>, implements the leveldown plumbing.

It's pretty straightforward to use Hyperbee inside modules that work with Level. Here's a code snippet that uses Hyperbee as the backing store for a <a class="external" title="PouchDB" href="https://pouchdb.com/">PouchDB</a> instance:
```js
const tree = new Hyperbee(hypercore(ram), {
  keyEncoding: 'utf-8'
})
const db = new PouchDB('my-database', {
  db: () => new HyperbeeDown(tree)
})

await db.put({ _id: '1', hello: 'world' })
const doc = await db.get('1')
```

Run this step (<a href="https://github.com/hypercore-protocol/walkthroughs/blob/main/hyperbee/5-leveldown.js" class="external" title="full code">full code</a>):

```bash
node 5-leveldown.js
```

<style>
  h4 img {
    position: relative;
    top: 5px;
    margin-right: 5px;
  }
</style>