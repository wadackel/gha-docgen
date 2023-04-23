# gha-docgen

[![Build][badge-build]][build]
[![npm][badge-npm]][npm]
[![MIT LICENSE][badge-license]][license]
[![code style: prettier][badge-prettier]][prettier]
[![semantic-release: angular][badge-semantic-release]][semantic-release]

`gha-docgen` generates documentation based on the [metadata](https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions) of a GitHub Action, such as `action.yml`. To limit partial output, you can freely customize the document style at any time. Maintain flexibility while providing documentation driven by Metadata, and always offer consistent documentation to users.

You can see an example of an Action actually in use at [wadackel/files-sync-action](https://github.com/wadackel/files-sync-action).

## Features

- Usage is simple, just execute `$ gha-docgen`
- The output focuses on content only, providing high flexibility for documentation
- Supports the output of `description`, as well as `inputs` and `outputs`
- Output styles supported include sections and tables

## Installation

```bash
$ npm install --save-dev gha-docgen
```

## Usage

I will explain how to use `gha-docgen`.

The following file is assumed for the `action.yml`, which is the metadata of the Action.

`action.yml`

```yaml
name: 'DEMO Action'
description: 'Here is an example of Action Metadata description. This is a description used in gha-docgen Usage.'
author: 'wadackel'

inputs:
  github_token:
    description: 'The GitHub token.'
    required: true
  github_api_url:
    description: 'API URL of the GitHub server.'
    default: 'https://api.github.com'
  advanced_id:
    description: |
      Description including newlines is also supported.
      Line break codes in YAML correspond to Markdown formatting and are correctly reflected.

outputs:
  pull_request_urls:
    description: 'URL array of PRs created.'

runs:
  using: 'node16'
  main: 'dist/index.js'
```

`gha-docgen` uses `README.md` by default. To specify the Metadata output location, use the format `gha-(description|inputs|outputs)-(start|end)` in the comments. All Metadata outputs are optional, and you can manually write content that doesn't require output.

`README.md`

```markdown
# DEMO Action

badge...

<!-- gha-description-start -->
<!-- gha-description-end -->

## Inputs

Overview of Inputs.

<!-- gha-inputs-start -->
<!-- gha-inputs-end -->

## Outputs

Overview of Outputs.

<!-- gha-outputs-start -->
<!-- gha-outputs-end -->

## LICENSE

license...
```

Finally, run `gha-docgen`. By default, no flags are required.

```bash
$ npx gha-docgen
```

The generated documentation will look like the following:

<!-- prettier-ignore-start -->
```markdown
# DEMO Action

badge...

<!-- gha-description-start -->
Here is an example of Action Metadata description. This is a description used in gha-docgen Usage.
<!-- gha-description-end -->

## Inputs

Overview of Inputs.

<!-- gha-inputs-start -->
### `github_token`

**Required:** `true`  
**Default:** n/a

The GitHub token.

### `github_api_url`

**Required:** `false`  
**Default:** `https://api.github.com`

API URL of the GitHub server.

### `advanced_id`

**Required:** `false`  
**Default:** n/a

Description including newlines is also supported.  
Line break codes in YAML correspond to Markdown formatting and are correctly reflected.
<!-- gha-inputs-end -->

## Outputs

Overview of Outputs.

<!-- gha-outputs-start -->
### `pull_request_urls`

URL array of PRs created.
<!-- gha-outputs-end -->

## LICENSE

license...
```
<!-- prettier-ignore-end -->

If you want to customize the output style, please see [Output Styles](#output-styles).  
For examples of workflows that integrate with CI and continuously verify that the documentation is up-to-date, please see [CI Configuration Recipes](#ci-configuration-recipes).

### CLI

The usage of the CLI is as follows:

```bash
$ npx gha-docgen --help

USAGE
  $ gha-docgen [...files]

ARGUMENTS
  files         List of paths to markdown files. Default is "README.md".

FLAGS
  --action, -a  File path to the Metadata for the Action. Default is "action.yml" or "action.yaml".
  --style, -s   Output style. Available styles are "section:h1" through "section:h6" at different heading levels, and "table". Default is "section:h3".
  --debug, -d   Enables debug output. Default is disabled.

EXAMPLES
  $ gha-docgen
  $ gha-docgen docs.md
  $ gha-docgen --action "./subdir/action.yml"
  $ gha-docgen --style "section:h1"
  $ gha-docgen --style "section:h2"
  $ gha-docgen --style "section:h3"
  $ gha-docgen --style "section:h4"
  $ gha-docgen --style "section:h5"
  $ gha-docgen --style "section:h6"
  $ gha-docgen --style "table"
  $ gha-docgen --debug
```

## Output Styles

There are two main output styles supported.

### `section:h{n}`

Outputs in a section format consisting of headings and descriptions. `{n}` can be specified with a heading level of `1-6`.

If the description contains a newline character, the newline character is converted to `  \n`, and the line is correctly broken on Markdown.

**Output:**

<!-- prettier-ignore-start -->
```markdown
### `github_token`

**Required:** `true`  
**Default:** n/a

The GitHub token.
```
<!-- prettier-ignore-end -->

### `table`

Outputs in a table format.

If the description contains a newline character, the newline character is converted to `<br />`, and the line is correctly broken within the table.  
If the content contains a `|`, it is escaped to `\|`.

**Output:**

<!-- prettier-ignore-start -->
```markdown
| ID | Required | Default | Description |
| :-- | :-- | :-- | :-- |
| `github_token` | :white_check_mark: | n/a | The GitHub token. |
```
<!-- prettier-ignore-end -->

## CI Configuration Recipes

I will introduce a GitHub Actions Workflow to ensure that the documentation is always up-to-date.

In this example, the status will fail if the contents of `action.yml` are updated, but the remote repository is updated without running `gha-docgen`.

First, register the `docgen` script in `package.json`. In this example, [prettier][prettier] is used, but the use of prettier is optional. However, using formatters like prettier is recommended.

`package.json`

```json
{
  "scripts": {
    "docgen": "gha-docgen && prettier --write README.md"
  }
}
```

Write a step that generates documentation and returns an exit code of `0` if a diff is detected on Git:

`.github/workflows/<your_workflow_name>.yml`

```yaml
name: 'ci'
on:
  pull_request:
    types:
      - synchronize
      - opened
      - reopened
  push:
    branches:
      - main
      - 'releases/*'
jobs:
  docgen:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: 16

      - name: Install dependencies
        run: npm ci

      - name: Generate documentation
        run: npm run docgen

      - name: Compare the expected and actual README.md
        run: |
          if [ "$(git diff --ignore-space-at-eol README.md | wc -l)" -gt "0" ]; then
            echo "Detected uncommitted changes after generate. See status below:"
            git diff
            exit 1
          fi
```

By referring to these steps, you can verify that the documentation is up-to-date.

## LICENSE

[MIT © wadackel][license]

[badge-build]: https://img.shields.io/github/actions/workflow/status/wadackel/gha-docgen/ci.yml?style=flat-square
[badge-npm]: https://img.shields.io/npm/v/gha-docgen?style=flat-square
[badge-license]: https://img.shields.io/github/license/wadackel/gha-docgen?style=flat-square
[badge-prettier]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square
[badge-semantic-release]: https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release&style=flat-square
[build]: https://github.com/wadackel/gha-docgen/actions/workflows/ci.yml
[npm]: https://www.npmjs.com/package/gha-docgen
[license]: ./LICENSE
[prettier]: https://github.com/prettier/prettier
[semantic-release]: https://github.com/semantic-release/semantic-release
