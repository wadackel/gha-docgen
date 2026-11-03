# Changelog

## 2.0.1

### Patch Changes

- f78b952: Migrate code formatting from [prettier](https://prettier.io/) to [oxfmt](https://oxc.rs/docs/guide/usage/formatter), unifying the dev toolchain on the [oxc](https://oxc.rs/) project. `prettier` and `prettier-plugin-packagejson` are replaced by `oxfmt` with an `.oxfmtrc.json` that mirrors the previous prettier settings (`printWidth: 120`, `singleQuote`, `trailingComma: "all"`, etc.). `oxlint` is bumped from 1.25 to 1.63 and `oxlint-tsgolint` from 0.4 to 0.22 to track upstream. The `lefthook` pre-commit hook now invokes `oxfmt`, and the `format:prettier` script has been renamed to `format:write` for tool-agnostic naming.
- 799f2df: Migrate development tool management (Node.js, pnpm) to [mise](https://mise.jdx.dev/). `mise.toml` is now the single source of truth for tool versions, replacing the previous `.node-version` file and the `packageManager` field in `package.json`. The CI composite action now provisions tools via `jdx/mise-action`.

## 2.0.0

### Major Changes

- 1c1f806: Drop support for Node.js 16 and set minimum version to Node.js 20

### Patch Changes

- bbb0c9e: Update meow dependency from v11 to v14
- 841010c: Migrate from release-it to changesets for better protected branch compatibility and improved release workflow
- b035fde: Update type-fest from v3.13.1 to v5.0.1 and move from devDependencies to dependencies
- ccbc330: Upgrade zod from v3.21.4 to v4.1.11 and replace zod-error with zod-validation-error for better error formatting

All notable changes to this project will be documented in this file.
