---
'gha-docgen': patch
---

Migrate development tool management (Node.js, pnpm) to [mise](https://mise.jdx.dev/). `mise.toml` is now the single source of truth for tool versions, replacing the previous `.node-version` file and the `packageManager` field in `package.json`. The CI composite action now provisions tools via `jdx/mise-action`.
