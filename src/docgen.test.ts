import { test, expect, describe } from 'vitest';
import { docgen } from './docgen';
import { createAction } from './schema.factory';
import type { DocgenStyle } from './schema';

describe('basic', () => {
  const action = createAction({
    description: 'line1\nline2',
    inputs: {
      id1: {
        description: 'desc1',
      },
      id2: {
        description: 'desc2',
      },
    },
    outputs: {
      id1: {
        description: 'desc1',
      },
      id2: {
        description: 'desc2',
      },
    },
  });

  const options = {
    style: 'section:h3' as const,
  };

  test('non marker', () => {
    const file = `
# Title

## Inputs

## Outputs
    `.trim();

    expect(docgen(file, action, options)).toMatchSnapshot();
  });

  test('empty', () => {
    const file = `
## Inputs

<!-- gha-inputs-start -->
<!-- gha-inputs-end -->

## Outputs

<!-- gha-outputs-start -->
<!-- gha-outputs-end -->
    `.trim();

    expect(docgen(file, createAction({}), options)).toMatchSnapshot();
  });

  test('description', () => {
    const file = `
# Title

日本語と絵文字📝

<!-- gha-description-start -->
<!-- gha-description-end -->

## Features
    `.trim();

    expect(docgen(file, action, options)).toMatchSnapshot();
  });

  test('multi marker', () => {
    const file = `
# Title

<!--gha-description-start-->
<!--gha-description-end-->

<!--    gha-description-start        -->
<!--
  gha-description-end
-->

## Inputs

<!--gha-inputs-start-->
<!--gha-inputs-end-->

<!-- gha-inputs-start   -->
<!--   gha-inputs-end -->

## Outputs

<!--gha-outputs-start  -->
<!-- gha-outputs-end  -->

<!--gha-outputs-start -->
<!--gha-outputs-end -->
    `.trim();

    expect(docgen(file, action, options)).toMatchSnapshot();
  });
});

describe('style', () => {
  test.each<DocgenStyle>([
    // prettier-ignore
    'section:h1',
    'section:h2',
    'section:h3',
    'section:h4',
    'section:h5',
    'section:h6',
    'table',
  ])('%s', (style) => {
    const action = createAction({
      description: 'description `code`.\nline2'.trim(),
      inputs: {
        id1: {
          description: 'desc1|desc1',
        },
        id2: {
          description: 'desc2\nrequired',
          required: true,
        },
        id3: {
          description: 'desc3',
          deprecationMessage: 'line1\nline2',
        },
        id4: {
          description: 'desc3',
          default: 'https://gha-docgen.example',
        },
      },
      outputs: {
        id1: {
          description: 'desc1|desc1',
        },
        id2: {
          description: 'desc2\nline2',
        },
      },
    });

    const file = `
## Inputs

<!-- gha-inputs-start -->
<!-- gha-inputs-end -->

## Outputs

<!-- gha-outputs-start -->
<!-- gha-outputs-end -->
    `.trim();

    expect(docgen(file, action, { style })).toMatchSnapshot();
  });
});
