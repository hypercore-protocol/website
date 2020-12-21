---
layout: layouts/guides-hyp-cmd
title: hyp beam
usage: beam [passphrase]
description: Send a stream of data over the network.
---

The beam command is a general-purpose tool for sending data over the network
according to a secret passphrase. You choose a phrase (try to make it hard-ish
to guess!) and then share the phrase with your recipient. The phrase is only
good for 30-60 minutes.

On the sending device:

```bash
cat hello.txt | hyp beam "for bob roberts"
```

On the receiving device:

```bash
hyp beam "for bob roberts" > ./hello.txt
```

This can be really useful for sharing hyper keys between devices. For instance:

```bash
> hyp sync ./my-folder
Creating new hyperdrive...
Source: my-folder/
Target: hyper://f7145e1bbc0d17705861e996b47422e0ca50a80db9441249bd721ff426b79f2a/
Begin sync? [y/N] y
Syncing...
Synced
> echo "hyper://f7145e1bbc0d17705861e996b47422e0ca50a80db9441249bd721ff426b79f2a/" \
  | hyp beam "nobody can guess"
```