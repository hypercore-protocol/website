---
layout: layouts/guides-hyp-cmd
title: hyp drive put
usage: drive put {url} [content]
description: Write a file at the given hyperdrive URL.
---

Examples:

```bash
hyp drive put hyper://1234…af/hello.txt "Hello world!"
cat package.json | hyp drive put hyper://1234…af/package.json
cat photo.png | hyp drive put hyper://1234…af/photo.png
```