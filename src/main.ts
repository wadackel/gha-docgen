import * as path from 'node:path';
import type { IDebugger } from 'debug';
import YAML from 'yaml';
import type { DocgenStyle } from './schema';
import { actionSchema } from './schema';
import { generateZodErrorMessage, read, write } from './utils';
import { docgen } from './docgen';

export type MainOptions = {
  debug: IDebugger;
  cwd: string;
  files: string[];
  action: string | undefined;
  style: DocgenStyle;
};

export const main = async ({ debug, cwd, ...opts }: MainOptions): Promise<void> => {
  // Read action file
  let actionStr: string;

  if (opts.action !== undefined) {
    const filepath = path.join(cwd, opts.action);
    debug('read specified action file: "%s"', filepath);
    const [err, data] = await read(filepath);
    if (err !== null) {
      throw new Error(`Error reading action file: ${err.message}`);
    }
    actionStr = data;
  } else {
    // 1. read 'action.yml'
    let filepath = path.join(cwd, 'action.yml');
    debug('read default action file: "%s"', filepath);
    const [err1, data1] = await read(filepath);
    if (data1 !== null) {
      actionStr = data1;
    } else {
      // 2. read 'action.yaml'
      debug(err1);
      filepath = path.join(cwd, 'action.yaml');
      debug('read default action file: "%s"', filepath);
      const [err2, data2] = await read(filepath);
      if (err2 !== null) {
        throw new Error(`Error reading action file: ${err2.message}`);
      }
      actionStr = data2;
    }
  }

  debug('found action file: %s', actionStr);

  // Parse action file
  let actionObj: unknown;
  try {
    actionObj = YAML.parse(actionStr);
  } catch (e) {
    debug(e);
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Error parsing action file: ${msg}`);
  }

  const action = actionSchema.safeParse(actionObj);
  if (!action.success) {
    debug('action schema error: %s', action.error);
    throw new Error(`Error parsing action file: ${generateZodErrorMessage(action.error)}`);
  }

  // Read markdown files
  for (const filename of opts.files) {
    const filepath = path.join(cwd, filename);
    debug('read markdown file: "%s"', filepath);
    const [readErr, before] = await read(filepath);
    if (readErr !== null) {
      debug(readErr);
      throw new Error(`Error reading markdown file: ${readErr.message}`);
    }

    debug('generate docs for "%s"', filepath);
    debug('before: "%s"', before);
    const after = docgen(before, action.data, {
      style: opts.style,
    });
    debug('after: "%s"', after);

    const writeErr = await write(filepath, after);
    if (writeErr !== null) {
      debug(writeErr);
      throw new Error(`Error writing markdown file: ${writeErr.message}`);
    }
  }
};
