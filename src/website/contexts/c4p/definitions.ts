import type { FormData } from './types';

export const STORAGE_KEY = 'c4p-form-v2';

export const topics = [
  { name: 'Dev Tooling', preferred: true },
  { name: 'Developer Experience', preferred: true },
  { name: 'IA no Desenvolvimento', preferred: true },
  { name: 'Arquitetura', preferred: true },
  { name: 'DevOps', preferred: true },
  { name: 'Observabilidade', preferred: true },
  { name: 'Performance', preferred: true },
  {
    name: 'Cases Reais de Resolução de Problemas usando código',
    preferred: true,
  },
  { name: 'Código para Acessibilidade', preferred: false },
  { name: 'Open Source', preferred: false },
  { name: 'Design System', preferred: false },
  { name: 'Segurança no Desenvolvimento', preferred: false },
];

export const experienceOptions = [
  { value: '0', label: '0 - 1 ano' },
  { value: '1', label: '2 - 4 anos' },
  { value: '2', label: '5 - 9 anos' },
  { value: '3', label: 'Acima de 10 anos' },
] as const;

export const durationOptions = [
  { value: '0', label: '15 minutos' },
  { value: '1', label: '25 minutos' },
] as const;

export const travelOptions = [
  {
    value: '0',
    label: 'Gostaria que a organização pagasse minha viagem e hospedagem',
  },
  { value: '1', label: 'Posso arcar com os custos' },
] as const;

export const genderOptions = [
  { value: '0', label: 'Homem' },
  { value: '1', label: 'Mulher' },
  { value: '2', label: 'Não-binário' },
  { value: '3', label: 'Prefiro não dizer' },
] as const;

export const raceOptions = [
  { value: '0', label: 'Branca' },
  { value: '1', label: 'Parda' },
  { value: '2', label: 'Preta' },
  { value: '3', label: 'Indígena' },
  { value: '4', label: 'Não sei' },
  { value: '5', label: 'Outro' },
  { value: '6', label: 'Prefiro não dizer' },
] as const;

export const disabilityOptions = [
  { value: '0', label: 'Sou cego(a) / tenho baixa visão' },
  { value: '1', label: 'Sou surdo(a) / tenho deficiência auditiva' },
  {
    value: '2',
    label:
      'Eu não consigo / tenho dificuldade de andar ou ficar em pé sem assistência',
  },
  {
    value: '3',
    label: 'Eu não consigo / tenho dificuldade de digitar',
  },
  { value: '4', label: 'Não se aplica' },
  { value: '5', label: 'Prefiro não dizer' },
] as const;

export const audienceLevels = [
  { value: '0', label: 'Todos os níveis' },
  { value: '1', label: 'Júnior' },
  { value: '2', label: 'Pleno' },
  { value: '3', label: 'Sênior' },
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
