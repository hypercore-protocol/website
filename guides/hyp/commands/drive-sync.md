---
layout: layouts/guides-hyp-cmd
title: hyp sync
usage: sync {source} [target]
description: Sync changes between two folders in your local filesystem or in hyperdrives.
---

Options:

  - `--no-add` - Don't include additions to the target location.
  - `--no-overwrite` - Don't include overwrites to the target location.
  - `--no-delete` - Don't include deletions to the target location.
  - `-w/--watch/--live` - Continuously sync changes.

If no target is supplied, hyp will create a new hyperdrive for you.

```bash
hyp sync ./input-folder
```

The sync command will output the URL of your new hyperdrive, and it will now contain your folder's files.

You can then sync the hyperdrive to another device using the same command:

```bash
hyp sync hyper://1234…af ./output-folder
```

Where `hyper://1234…af` is your hyperdrive's URL.

If you want to update your hyperdrive, resync it with the input folder by running the command again, this time with the URL as the target:

```bash
hyp sync ./input-folder hyper://1234…af
```

If you include --watch the sync command will continuously sync the source to the target:

```bash
hyp sync ./input-folder hyper://1234…af --watch
```

Examples:

```bash
hyp drive sync hyper://1234…af/ ./local-folder
hyp drive sync ./local-folder hyper://1234…af/remote-folder --no-delete
hyp drive sync hyper://1234…af/ hyper://fedc…21/
hyp drive sync hyper://1234…af/
hyp drive sync ./local-folder
```