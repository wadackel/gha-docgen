import { z } from 'zod';

/**
 * Action Metadata
 * @see https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions
 */
export type ActionInputEntry = z.infer<typeof actionInputEntrySchema>;
export const actionInputEntrySchema = z.object({
  description: z.string(),
  required: z.boolean().optional(),
  default: z.string().optional(),
  deprecationMessage: z.string().optional(),
});

export type ActionInputs = z.infer<typeof actionInputsSchema>;
export const actionInputsSchema = z.record(z.string(), actionInputEntrySchema);

export type ActionOutputEntry = z.infer<typeof actionOutputEntrySchema>;
export const actionOutputEntrySchema = z.object({
  description: z.string(),
});

export type ActionOutputs = z.infer<typeof actionOutputsSchema>;
export const actionOutputsSchema = z.record(z.string(), actionOutputEntrySchema);

export type ActionBranding = z.infer<typeof actionBrandingSchema>;
export const actionBrandingSchema = z
  .object({
    color: z.string(),
    icon: z.string(),
  })
  .partial();

export type Action = z.infer<typeof actionSchema>;
export const actionSchema = z.object({
  name: z.string(),
  author: z.string().optional(),
  description: z.string(),
  inputs: actionInputsSchema.optional(),
  outputs: actionOutputsSchema.optional(),
  branding: actionBrandingSchema.optional(),
});

/**
 * Docgen
 */
export type DocgenStyle = z.infer<typeof docgenStyleSchema>;
export const docgenStyleSchema = z.union([
  z.literal('section:h1'),
  z.literal('section:h2'),
  z.literal('section:h3'),
  z.literal('section:h4'),
  z.literal('section:h5'),
  z.literal('section:h6'),
  z.literal('table'),
]);
