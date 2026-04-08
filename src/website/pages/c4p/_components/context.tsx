import type { FC, ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

export const topics = [
  { name: 'Dev Tooling', preferred: true },
  { name: 'Developer Experience', preferred: true },
  { name: 'IA no Desenvolvimento', preferred: true },
  { name: 'Arquitetura', preferred: true },
  { name: 'DevOps', preferred: true },
  { name: 'Liderança', preferred: true },
  { name: 'Observabilidade', preferred: true },
  { name: 'Design Patterns', preferred: false },
  { name: 'Qualidade de código', preferred: false },
  { name: 'Programação Funcional', preferred: false },
  { name: 'Cases de Resolução de Problemas usando código', preferred: false },
  { name: 'Teste de Software', preferred: false },
  { name: 'Código para Acessibilidade', preferred: false },
  { name: 'Cloud e Escalabilidade', preferred: false },
  { name: 'Open source', preferred: false },
  { name: 'Metodologias Ágeis', preferred: false },
  { name: 'Roadmap de Carreira', preferred: false },
  { name: 'Design System', preferred: false },
  { name: 'Inclusão no Mercado de Tecnologia', preferred: false },
  { name: 'Soft Skills', preferred: false },
  { name: 'Recrutamento e Seleção', preferred: false },
  { name: 'Segurança no Desenvolvimento', preferred: false },
];

export const experienceOptions = [
  '0 - 1 ano',
  '2 - 4 anos',
  '5 - 9 anos',
  'Acima de 10 anos',
];

export const durationOptions = ['7 minutos', '20 minutos'];

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
