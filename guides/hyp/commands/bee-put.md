---
layout: layouts/guides-hyp-cmd
title: hyp bee put
usage: bee put {url} [value]
description: Set the value of an entry of the given hyperbee URL.
---

Examples:

```bash
hyp bee put hyper://1234..af/foo "hello"
hyp bee put hyper://1234..af/foo/bar 12345
cat data.json | hyp bee put hyper://1234..af/data
```