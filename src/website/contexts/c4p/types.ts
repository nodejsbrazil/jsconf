import type { StepErrors } from './schema';

export type FormData = {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  travelPreference: string;
  linkedin: string;
  instagram: string;
  youtube: string;
  github: string;
  website: string;
  experienceLevel: string;
  bio: string;
  gender: string;
  race: string;
  disability: string;
  duration: string;
  talkTitle: string;
  talkDescription: string;
  audienceLevel: string;
  talkReason: string;
};

export type C4PContextValue = {
  currentStep: number;
  formData: FormData;
  errors: StepErrors;
  touched: Set<string>;
  updateField: <Key extends keyof FormData>(
    field: Key,
    value: FormData[Key]
  ) => void;
  goToStep: (step: number) => void;
  validate: () => boolean;
  validateField: (field: string) => void;
};
