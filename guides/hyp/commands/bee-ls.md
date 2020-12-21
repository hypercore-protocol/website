---
layout: layouts/guides-hyp-cmd
title: hyp bee ls
usage: bee ls {url}
description: List the entries of the given hyperbee URL.
---

Options:

 - `--gt {key}` - Filter to items with a key greater than the given value.
 - `--gte {key}` - Filter to items with a key greater than or equal to the given value.
 - `--lt {key}` - Filter to items with a key less than the given value.
 - `--lte {key}` - Filter to items with a key less than or equal to the given value.

Examples:

```bash
hyp bee ls hyper://1234..af/
hyp bee ls hyper://1234..af/foo/bar
hyp bee ls hyper://1234..af/ --gte a --lt m
```