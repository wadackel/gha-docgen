import type { PartialDeep } from 'type-fest';
import type { Action, ActionBranding, ActionInputEntry, ActionInputs, ActionOutputs } from './schema';

export type Factory<T> = (props: PartialDeep<T>) => T;

export const createActionInputEntry: Factory<ActionInputEntry> = (props = {}) => ({
  description: '',
  ...props,
});

export const createActionOutputEntry: Factory<ActionInputEntry> = (props = {}) => ({
  description: '',
  ...props,
});

export const createActionBranding: Factory<ActionBranding> = (props = {}) => ({
  ...props,
});

export const createAction: Factory<Action> = (props = {}) => ({
  name: '',
  description: '',
  inputs:
    props.inputs === undefined
      ? undefined
      : (Object.entries(props.inputs).reduce<ActionInputs>((acc, [key, obj]) => {
          acc[key] = createActionInputEntry(obj ?? {});
          return acc;
        }, {}) as any),
  outputs:
    props.outputs === undefined
      ? undefined
      : (Object.entries(props.outputs).reduce<ActionOutputs>((acc, [key, obj]) => {
          acc[key] = createActionOutputEntry(obj ?? {});
          return acc;
        }, {}) as any),
  branding: props.branding === undefined ? undefined : createActionBranding(props.branding),
  ...props,
});
