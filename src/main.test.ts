import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test, vi } from 'vitest';
import { read, write } from './utils';
import { main } from './main';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FIXTURES_DIR = path.resolve(__dirname, '../fixtures');

test.each<[string, string, string[], string | undefined]>(
  // prettier-ignore
  [
    [
      'action.yml',
      path.join(FIXTURES_DIR, 'action-yml'),
      ['README.md'],
      undefined,
    ],
    [
      'action.yaml',
      path.join(FIXTURES_DIR, 'action-yaml'),
      ['README.md'],
      undefined,
    ],
    [
      'different paths',
      path.join(FIXTURES_DIR, 'action-yml-path'),
      ['README.md'],
      'dir/action.yml',
    ],
    [
      'different paths',
      path.join(FIXTURES_DIR, 'action-yml-path'),
      ['README.md'],
      'dir/action.yml',
    ],
    [
      'multi files',
      path.join(FIXTURES_DIR, 'multi-files'),
      ['md1.md', 'md2.md'],
      undefined,
    ],
  ],
)('%s', async (_, cwd, files, action) => {
  await Promise.all(
    files.map(async (file) => {
      const data = `
# Title

<!-- gha-description-start -->
<!-- gha-description-end -->

# Inputs

<!-- gha-inputs-start -->
<!-- gha-inputs-end -->

# Outputs

<!-- gha-outputs-start -->
<!-- gha-outputs-end -->
    `.trim();
      const error = await write(path.join(cwd, file), data);
      if (error !== null) {
        throw error;
      }
    }),
  );

  await main({
    debug: vi.fn() as never,
    cwd,
    files,
    action,
    style: 'section:h3',
  });

  const results = await Promise.all(
    files.map(async (file) => {
      const [error, data] = await read(path.join(cwd, file));
      if (error !== null) {
        throw error;
      }
      return data;
    }),
  );

  expect(results.join('\n')).toMatchSnapshot();
});

test('default action.yml not exists', async () => {
  await expect(
    main({
      debug: vi.fn() as never,
      cwd: FIXTURES_DIR,
      files: ['README.md'],
      action: undefined,
      style: 'section:h3',
    }),
  ).rejects.toThrowError(/Error reading action file:/);
});

test('specified action.yml not exists', async () => {
  await expect(
    main({
      debug: vi.fn() as never,
      cwd: FIXTURES_DIR,
      files: ['README.md'],
      action: 'not-found-file.yml',
      style: 'section:h3',
    }),
  ).rejects.toThrowError(/Error reading action file:/);
});

test('invalid action.yml schema', async () => {
  await expect(
    main({
      debug: vi.fn() as never,
      cwd: path.join(FIXTURES_DIR, 'invalid-action-yml'),
      files: ['README.md'],
      action: undefined,
      style: 'section:h3',
    }),
  ).rejects.toThrowError(
    'Error parsing action file: Invalid input: expected string, received undefined at "description" | Invalid input: expected object, received string at "inputs.github_token"',
  );
});

test('files not exists', async () => {
  await expect(
    main({
      debug: vi.fn() as never,
      cwd: path.join(FIXTURES_DIR, 'invalid-files'),
      files: ['README.md'],
      action: undefined,
      style: 'section:h3',
    }),
  ).rejects.toThrowError(/Error reading markdown file:/);
});
