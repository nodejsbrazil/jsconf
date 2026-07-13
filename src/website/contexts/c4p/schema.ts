import type { TranslationId } from '@site/src/website/components/shared/i18n';
import { z } from 'zod';
import { text } from '@site/src/website/components/shared/i18n';

// zod messages are translation KEYS, not final strings — validateStep resolves them with text()
// at validation time (client-side, current locale). Defining them as literal translations here
// would lock the message to the module-load locale.
export const aboutSchema = z.object({
  name: z.string().min(1, 'c4p.error.name'),
  email: z.email('c4p.error.email').max(254, 'c4p.error.emailTooLong'),
  phone: z.string().min(8, 'c4p.error.phone'),
  city: z.string().min(1, 'c4p.error.city'),
  state: z.string().min(2, 'c4p.error.state'),
  travelPreference: z.string().min(1, 'c4p.error.selectOption'),
  experienceLevel: z.string().min(1, 'c4p.error.selectOption'),
  bio: z.string().min(1, 'c4p.error.bio').max(280, 'c4p.error.bioTooLong'),
});

export const diversitySchema = z.object({
  gender: z.string().optional(),
  race: z.string().optional(),
  disability: z.string().optional(),
});

export const talkSchema = z.object({
  duration: z.string().min(1, 'c4p.error.duration'),
  talkTitle: z.string().min(1, 'c4p.error.talkTitle'),
  talkDescription: z.string().min(1, 'c4p.error.talkDescription'),
  audienceLevel: z.string().min(1, 'c4p.error.audienceLevel'),
  talkReason: z.string().min(1, 'c4p.error.talkReason'),
});

const stepSchemas = {
  2: aboutSchema,
  3: diversitySchema,
  4: talkSchema,
} as const;

export type StepErrors = { [field: string]: string | undefined };

export const validateStep = (
  step: number,
  data: Record<string, unknown>
): StepErrors => {
  const schema = stepSchemas[step as keyof typeof stepSchemas];
  if (!schema) return {};

  const result = schema.safeParse(data);
  if (result.success) return {};

  const errors: StepErrors = {};

  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (!field || errors[String(field)]) continue;
    // Our custom messages are i18n keys (c4p.error.*). Zod's built-in messages — which can appear
    // if loadFromStorage() feeds a malformed/legacy shape — are not, so fall back to a generic key
    // instead of rendering a raw, untranslated string (and tripping Docusaurus translate warnings).
    const id = issue.message.startsWith('c4p.error.')
      ? (issue.message as TranslationId)
      : ('c4p.error.invalid' as TranslationId);
    errors[String(field)] = text({ id });
  }

  return errors;
};
