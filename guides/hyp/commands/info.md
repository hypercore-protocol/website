---
layout: layouts/guides-hyp-cmd
title: hyp info
usage: info [urls...]
description: Show information about one (or more) hypers.
---

If no URLs are specified, will list all hypers currently seeded.

Options:

  - `--live` - Continuously output the current state.
  - `-l/--long` - List the full keys of the hypers.

Examples:

```bash
hyp info
hyp info --live
hyp info hyper://1234…af/
hyp info hyper://1234…af/ hyper://fedc…21/
```