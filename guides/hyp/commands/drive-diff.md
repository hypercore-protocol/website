---
layout: layouts/guides-hyp-cmd
title: hyp drive diff
usage: drive diff {source_path_or_url} {target_path_or_url}
description: Compare two folders in your local filesystem or in hyperdrives. Can optionally "commit" the difference.
---

Options:

  - `-c/--commit` - Write the differences to the target location.
  - `--no-add` - Don't include additions to the target location.
  - `--no-overwrite` - Don't include overwrites to the target location.
  - `--no-delete` - Don't include deletions to the target location.

Examples:

```bash
hyp drive diff hyper://1234…af/ ./local-folder
hyp drive diff ./local-folder hyper://1234…af/remote-folder --no-delete
hyp drive diff hyper://1234…af/ hyper://fedc…21/ --commit
```