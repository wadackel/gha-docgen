import type { Action, DocgenStyle } from './schema';
import { nl2br, nl2md, nl2space } from './utils';

const regex = {
  description: /(<!--\s*gha-description-start\s*-->)([\s\S]*?)(<!--\s*gha-description-end\s*-->)/g,
  inputs: /(<!--\s*gha-inputs-start\s*-->)([\s\S]*?)(<!--\s*gha-inputs-end\s*-->)/g,
  outputs: /(<!--\s*gha-outputs-start\s*-->)([\s\S]*?)(<!--\s*gha-outputs-end\s*-->)/g,
};

const escapeVerticalBar = (input: string) => {
  return input.replace(/\|/g, '\\|');
};

const getSectionHeading = (style: string) => {
  const [, opts] = style.split(':');
  const level = Number(opts!.substring(1));
  return '#'.repeat(level);
};

const inject = (input: string, matcher: RegExp, body: string) => {
  let output = input;
  let match: RegExpExecArray | null;

  while ((match = matcher.exec(output)) !== null) {
    const index = match.index;
    const start = match[1]!;
    const original = match[2]!;
    const end = match[3]!;
    const before = output.substring(0, index);
    const after = output.substring(index + start.length + original.length + end.length);
    output = [before, start, `\n${body}\n`, end, after].join('');
  }

  return output;
};

export type DocgenOptions = {
  style: DocgenStyle;
};

const generateInputsBody = (action: Action, { style }: DocgenOptions) => {
  if (action.inputs === undefined) {
    return '';
  }

  switch (style) {
    case 'section:h1':
    case 'section:h2':
    case 'section:h3':
    case 'section:h4':
    case 'section:h5':
    case 'section:h6': {
      const heading = getSectionHeading(style);
      const list: string[] = [];
      for (const [id, input] of Object.entries(action.inputs)) {
        const required = input.required ? '`true`' : '`false`';
        const defaults = input.default !== undefined ? `\`${input.default}\`` : 'n/a';
        const deprecated = input.deprecationMessage !== undefined ? nl2space(input.deprecationMessage.trim()) : null;
        const parts = [`${heading} \`${id}\``, ``, `**Required:** ${required}  `];
        if (deprecated !== null) {
          parts.push(`**Default:** ${defaults}  `, `**Deprecated:** :warning: ${deprecated}`);
        } else {
          parts.push(`**Default:** ${defaults}`);
        }
        parts.push('', nl2md(input.description.trim()));
        list.push(parts.join('\n'));
      }
      return list.join('\n\n');
    }

    case 'table': {
      // prettier-ignore
      const rows = [
        '| ID | Required | Default | Description |',
        '| :-- | :-- | :-- | :-- |',
      ];
      for (const [id, input] of Object.entries(action.inputs)) {
        const required = input.required ? ':white_check_mark:' : '';
        const defaults = input.default !== undefined ? `\`${input.default}\`` : 'n/a';
        let body = nl2br(input.description.trim());
        if (input.deprecationMessage !== undefined) {
          body += `<br />:warning: **Deprecated:** ${nl2br(input.deprecationMessage.trim())}`;
        }
        const row = [`\`${id}\``, required, defaults, body].map(escapeVerticalBar);
        rows.push(`| ${row.join(' | ')} |`);
      }
      return rows.join('\n');
    }
  }
};

const generateOutputsBody = (action: Action, { style }: DocgenOptions) => {
  if (action.outputs === undefined) {
    return '';
  }

  switch (style) {
    case 'section:h1':
    case 'section:h2':
    case 'section:h3':
    case 'section:h4':
    case 'section:h5':
    case 'section:h6': {
      const heading = getSectionHeading(style);
      const list: string[] = [];
      for (const [id, output] of Object.entries(action.outputs)) {
        const parts = [`${heading} \`${id}\``, ``, nl2md(output.description.trim())];
        list.push(parts.join('\n'));
      }
      return list.join('\n\n');
    }

    case 'table': {
      // prettier-ignore
      const rows = [
        '| ID | Description |',
        '| :-- | :-- |',
      ];
      for (const [id, output] of Object.entries(action.outputs)) {
        const body = nl2br(output.description.trim());
        const row = [`\`${id}\``, body].map(escapeVerticalBar);
        rows.push(`| ${row.join(' | ')} |`);
      }
      return rows.join('\n');
    }
  }
};

export const docgen = (file: string, action: Action, options: DocgenOptions): string => {
  const description = nl2md(action.description.trim());
  const inputs = generateInputsBody(action, options);
  const outputs = generateOutputsBody(action, options);

  let output = file;
  output = inject(output, regex.description, description);
  output = inject(output, regex.inputs, inputs);
  output = inject(output, regex.outputs, outputs);

  return output;
};
