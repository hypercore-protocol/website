---
layout: layouts/guides-hyp-cmd
title: hyp drive rm
usage: drive rm {url}
description: Remove a file or (if --recursive) a folder at the given hyperdrive URL.
---

Options:

  - `-r/--recursive` - If the target is a folder, delete it and all of its contents.

Examples:

```bash
hyp drive rm hyper://1234…af/file.txt
hyp drive rm -r hyper://1234…af/folder/
```