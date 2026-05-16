---
'gha-docgen': patch
---

Migrate code formatting from [prettier](https://prettier.io/) to [oxfmt](https://oxc.rs/docs/guide/usage/formatter), unifying the dev toolchain on the [oxc](https://oxc.rs/) project. `prettier` and `prettier-plugin-packagejson` are replaced by `oxfmt` with an `.oxfmtrc.json` that mirrors the previous prettier settings (`printWidth: 120`, `singleQuote`, `trailingComma: "all"`, etc.). `oxlint` is bumped from 1.25 to 1.63 and `oxlint-tsgolint` from 0.4 to 0.22 to track upstream. The `lefthook` pre-commit hook now invokes `oxfmt`, and the `format:prettier` script has been renamed to `format:write` for tool-agnostic naming.
