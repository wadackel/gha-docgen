import * as fs from 'node:fs/promises';
import type { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

/**
 * Filesystem
 */
export const read = async (filepath: string): Promise<[Error, null] | [null, string]> => {
  try {
    const data = await fs.readFile(filepath, 'utf8');
    return [null, data];
  } catch (e) {
    return [e instanceof Error ? e : new Error(String(e)), null];
  }
};

export const write = async (filepath: string, data: string): Promise<Error | null> => {
  try {
    await fs.writeFile(filepath, data, 'utf8');
    return null;
  } catch (e) {
    return e instanceof Error ? e : new Error(String(e));
  }
};

/**
 * Error handling
 */
export const generateZodErrorMessage = (error: ZodError): string => {
  return fromZodError(error, {
    prefix: undefined,
    issueSeparator: ' | ',
    unionSeparator: ' OR ',
  }).toString();
};

/**
 * Strings
 */
const NEWLINE_REGEX = /\r\n|\r|\n/g;

export const nl2space = (input: string): string => {
  return input.replace(NEWLINE_REGEX, ' ');
};

export const nl2md = (input: string): string => {
  return input.replace(NEWLINE_REGEX, '  \n');
};

export const nl2br = (input: string): string => {
  return input.replace(NEWLINE_REGEX, '<br />');
};
