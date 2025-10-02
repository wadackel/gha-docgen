#!/usr/bin/env node
import createDebug from 'debug';
import meow from 'meow';
import { docgenStyleSchema } from './schema';
import { generateZodErrorMessage } from './utils';
import { main } from './main';

const cli = meow(
  `
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
  `,
  {
    importMeta: import.meta,
    allowUnknownFlags: false,
    flags: {
      action: {
        type: 'string',
        alias: 'a',
      },
      style: {
        type: 'string',
        default: 'section:h3',
        alias: 's',
      },
      debug: {
        type: 'boolean',
        default: false,
        alias: 'd',
      },
    },
  },
);

const debug = createDebug('gha-docgen');

try {
  debug.enabled = cli.flags.debug;

  debug('parsed cli flags: %o', cli.flags);

  const style = docgenStyleSchema.safeParse(cli.flags.style);
  if (!style.success) {
    throw new Error(`Error invalid "--style" flag value: ${generateZodErrorMessage(style.error.issues)}`);
  }

  await main({
    debug,
    cwd: process.cwd(),
    files: cli.input.length > 0 ? cli.input : ['README.md'],
    action: cli.flags.action,
    style: style.data,
  });

  process.exit(0);
} catch (e) {
  console.error(e);
  process.exit(1);
}
