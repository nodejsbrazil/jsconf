import type { FormData } from './types';

export const STORAGE_KEY = 'c4p-form-v2';

// labelId is a translation key resolved via <Text id> / text() at render time (see i18n.tsx).
// value is the stored/submitted value and must never change.
export const topics = [
  { labelId: 'c4p.topic.devTooling', preferred: true },
  { labelId: 'c4p.topic.devEx', preferred: true },
  { labelId: 'c4p.topic.aiDev', preferred: true },
  { labelId: 'c4p.topic.architecture', preferred: true },
  { labelId: 'c4p.topic.devops', preferred: true },
  { labelId: 'c4p.topic.observability', preferred: true },
  { labelId: 'c4p.topic.performance', preferred: true },
  { labelId: 'c4p.topic.realCases', preferred: true },
  { labelId: 'c4p.topic.a11yCode', preferred: false },
  { labelId: 'c4p.topic.openSource', preferred: false },
  { labelId: 'c4p.topic.designSystem', preferred: false },
  { labelId: 'c4p.topic.security', preferred: false },
] as const;

export const experienceOptions = [
  { value: '0', labelId: 'c4p.exp.0' },
  { value: '1', labelId: 'c4p.exp.1' },
  { value: '2', labelId: 'c4p.exp.2' },
  { value: '3', labelId: 'c4p.exp.3' },
] as const;

export const durationOptions = [
  { value: '0', labelId: 'c4p.duration.0' },
  { value: '1', labelId: 'c4p.duration.1' },
] as const;

export const travelOptions = [
  { value: '0', labelId: 'c4p.travel.0' },
  { value: '1', labelId: 'c4p.travel.1' },
] as const;

export const genderOptions = [
  { value: '0', labelId: 'c4p.gender.0' },
  { value: '1', labelId: 'c4p.gender.1' },
  { value: '2', labelId: 'c4p.gender.2' },
  { value: '3', labelId: 'c4p.gender.3' },
] as const;

export const raceOptions = [
  { value: '0', labelId: 'c4p.race.0' },
  { value: '1', labelId: 'c4p.race.1' },
  { value: '2', labelId: 'c4p.race.2' },
  { value: '3', labelId: 'c4p.race.3' },
  { value: '4', labelId: 'c4p.race.4' },
  { value: '5', labelId: 'c4p.race.5' },
  { value: '6', labelId: 'c4p.race.6' },
] as const;

export const disabilityOptions = [
  { value: '0', labelId: 'c4p.disability.0' },
  { value: '1', labelId: 'c4p.disability.1' },
  { value: '2', labelId: 'c4p.disability.2' },
  { value: '3', labelId: 'c4p.disability.3' },
  { value: '4', labelId: 'c4p.disability.4' },
  { value: '5', labelId: 'c4p.disability.5' },
] as const;

export const audienceLevels = [
  { value: '0', labelId: 'c4p.audience.0' },
  { value: '1', labelId: 'c4p.audience.1' },
  { value: '2', labelId: 'c4p.audience.2' },
  { value: '3', labelId: 'c4p.audience.3' },
] as const;

export const brazilianStates = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
] as const;

export const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  city: '',
  state: '',
  travelPreference: '',
  linkedin: '',
  instagram: '',
  youtube: '',
  github: '',
  website: '',
  experienceLevel: '',
  bio: '',
  gender: '',
  race: '',
  disability: '',
  duration: '',
  talkTitle: '',
  talkDescription: '',
  audienceLevel: '',
  talkReason: '',
};
