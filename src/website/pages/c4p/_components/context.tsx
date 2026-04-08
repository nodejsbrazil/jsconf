import type { FC, ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

export const topics = [
  { name: 'Arquitetura de software', preferred: true },
  { name: 'Design patterns', preferred: false },
  { name: 'Qualidade de código', preferred: true },
  { name: 'Programação funcional', preferred: false },
  { name: 'Cases de resolução de problemas usando código', preferred: true },
  { name: 'Teste de software', preferred: false },
  { name: 'Código para acessibilidade', preferred: false },
  { name: 'Cloud/escalabilidade', preferred: true },
  { name: 'Open source', preferred: false },
  { name: 'Experiência dos usuários', preferred: false },
  { name: 'Testes AB', preferred: false },
  { name: 'Metodologias ágeis', preferred: false },
  { name: 'Roadmap de carreira', preferred: false },
  { name: 'Design system', preferred: false },
  { name: 'Comunidades', preferred: false },
  { name: 'Inclusão no mercado tech', preferred: false },
  { name: 'Soft skills', preferred: false },
  { name: 'Recrutamento e seleção', preferred: false },
  { name: 'Segurança', preferred: true },
];

export const experienceOptions = [
  '0 - 1 ano',
  '2 - 4 anos',
  '5 - 9 anos',
  'Acima de 10 anos',
];

export const durationOptions = ['20 minutos', '40 minutos'];

export const travelOptions = [
  'Gostaria que a organização pagasse minha viagem e hospedagem',
  'Posso arcar com os custos',
];

export const genderOptions = [
  'Homem',
  'Mulher',
  'Não-binário',
  'Prefiro não dizer',
];

export const raceOptions = [
  'Branca',
  'Parda',
  'Preta',
  'Indígena',
  'Não sei',
  'Prefiro não dizer',
  'Outro',
];

export const disabilityOptions = [
  'Sou cego(a) / tenho baixa visão',
  'Sou surdo(a) / tenho deficiência auditiva',
  'Eu não consigo / tenho dificuldade de andar ou ficar em pé sem assistência',
  'Eu não consigo / tenho dificuldade de digitar',
  'Não se aplica',
];

export const audienceLevels = ['Todos os níveis', 'Júnior', 'Pleno', 'Sênior'];

export const toBadge = (index: number) => String.fromCharCode(65 + index);

export type FormData = {
  name: string;
  email: string;
  phone: string;
  cityState: string;
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

export const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  cityState: '',
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

const STORAGE_KEY = 'c4p-form';

const loadFromStorage = (): { step: number; data: FormData } => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { step: 1, data: initialFormData };
};

const saveToStorage = (step: number, data: FormData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, data }));
  } catch {}
};

type C4PContextValue = {
  currentStep: number;
  formData: FormData;
  updateField: <Key extends keyof FormData>(
    field: Key,
    value: FormData[Key]
  ) => void;
  goToStep: (step: number) => void;
};

const C4PContext = createContext<C4PContextValue | null>(null);

export const useC4P = () => {
  const context = useContext(C4PContext);
  if (!context) throw new Error('useC4P must be used within C4PProvider');
  return context;
};

export const C4PProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const saved = loadFromStorage();
  const [currentStep, setCurrentStep] = useState(saved.step);
  const [formData, setFormData] = useState<FormData>(saved.data);

  const updateField = <Key extends keyof FormData>(
    field: Key,
    value: FormData[Key]
  ) =>
    setFormData((previous) => {
      const next = { ...previous, [field]: value };
      saveToStorage(currentStep, next);
      return next;
    });

  const goToStep = (step: number) => {
    setCurrentStep(step);
    saveToStorage(step, formData);
    document.getElementById('__docusaurus')?.scrollTo(0, 0);
  };

  return (
    <C4PContext.Provider
      value={{ currentStep, formData, updateField, goToStep }}
    >
      {children}
    </C4PContext.Provider>
  );
};
