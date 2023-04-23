import { expect, test } from 'vitest';
import { z } from 'zod';
import { generateZodErrorMessage, nl2br, nl2md, nl2space } from './utils';

/**
 * Error handling
 */
test('generateZodErrorMessage', () => {
  const schema = z.object({
    foo: z.string(),
    bar: z.object({
      baz: z.number(),
    }),
  });

  const res = schema.safeParse({
    foo: 0,
    bar: {
      baz: 'str',
    },
  });

  if (res.success) {
    throw new Error();
  }

  expect(generateZodErrorMessage(res.error.issues)).toMatchSnapshot();
});

/**
 * Strings
 */
test.each([
  // prettier-ignore
  ['line1', 'line1'],
  ['line2<br>line2', 'line2<br>line2'],
  ['line1\nline2', 'line1 line2'],
])('nl2space - %s', (input, expected) => {
  expect(nl2space(input)).toBe(expected);
});

test.each([
  // prettier-ignore
  ['line1', 'line1'],
  ['line2<br>line2', 'line2<br>line2'],
  ['line1\nline2', 'line1  \nline2'],
])('nl2md - %s', (input, expected) => {
  expect(nl2md(input)).toBe(expected);
});

test.each([
  // prettier-ignore
  ['line1', 'line1'],
  ['line2<br>line2', 'line2<br>line2'],
  ['line1\nline2', 'line1<br />line2'],
])('nl2br - %s', (input, expected) => {
  expect(nl2br(input)).toBe(expected);
});
