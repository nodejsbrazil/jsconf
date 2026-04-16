import { z } from 'zod';

export const aboutSchema = z.object({
  name: z.string().min(1, 'Informe seu nome'),
  email: z.email('Informe um e-mail válido').max(254),
  phone: z.string().min(8, 'Informe um número válido'),
  city: z.string().min(1, 'Informe sua cidade'),
  state: z.string().min(2, 'Selecione um estado'),
  travelPreference: z.string().min(1, 'Selecione uma opção'),
  experienceLevel: z.string().min(1, 'Selecione uma opção'),
  bio: z.string().min(1, 'Informe sua biografia').max(280),
});

export const diversitySchema = z.object({
  gender: z.string().optional(),
  race: z.string().optional(),
  disability: z.string().optional(),
});

export const talkSchema = z.object({
  duration: z.string().min(1, 'Selecione a duração'),
  talkTitle: z.string().min(1, 'Informe o título'),
  talkDescription: z.string().min(1, 'Informe a descrição'),
  audienceLevel: z.string().min(1, 'Selecione o nível'),
  talkReason: z.string().min(1, 'Informe o motivo'),
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
    if (field && !errors[String(field)]) errors[String(field)] = issue.message;
  }

  return errors;
};
