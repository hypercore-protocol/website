---
layout: layouts/guides-hyp-cmd
title: hyp sync
usage: sync {source} [target]
description: Sync changes between two folders in your local filesystem or in hyperdrives.
---

  - **source** The path of the folder to share.
  - **target** Optional- the hyperdrive to sync the folder to.

If no target is supplied, hyp will create a new hyperdrive for you.

```
hyp sync ./input-folder
```

The sync command will output the URL of your new hyperdrive, and it will now contain your folder's files.

To update the hyperdrive again, run:

```
hyp sync ./input-folder hyper://1234…af
```

Where hyper://1234…af is your hyperdrive's URL.

<div class="info-aside">
  If you include --watch the sync command will continuously sync the source to the target.
</div>