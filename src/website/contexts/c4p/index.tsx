import type { FC, ReactNode } from 'react';
import type { StepErrors } from './schema';
import type { C4PContextValue, FormData } from './types';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toast } from 'sonner';
import { loadFromStorage, saveToStorage } from './helpers';
import { validateStep } from './schema';

export {
  topics,
  experienceOptions,
  durationOptions,
  travelOptions,
  genderOptions,
  raceOptions,
  disabilityOptions,
  audienceLevels,
  brazilianStates,
  initialFormData,
} from './definitions';

export type { FormData } from './types';

export { toBadge } from './helpers';

const C4PContext = createContext<C4PContextValue | null>(null);

export const C4PProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const saved = loadFromStorage();
  const [currentStep, setCurrentStep] = useState(saved.step);
  const [formData, setFormData] = useState<FormData>(saved.data);

  const stepRef = useRef(currentStep);
  const dataRef = useRef(formData);
  const [errors, setErrors] = useState<StepErrors>(() =>
    validateStep(saved.step, saved.data)
  );
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const updateField = useCallback(
    <Key extends keyof FormData>(field: Key, value: FormData[Key]) => {
      const next = { ...dataRef.current, [field]: value };
      dataRef.current = next;
      saveToStorage(stepRef.current, next);
      setFormData(next);
    },
    []
  ) as <Key extends keyof FormData>(field: Key, value: FormData[Key]) => void;

  const goToStep = useCallback((step: number) => {
    setErrors({});
    setTouched(new Set());
    stepRef.current = step;
    setCurrentStep(step);
    saveToStorage(step, dataRef.current);
    document.getElementById('__docusaurus')?.scrollTo(0, 0);
  }, []);

  const validate = useCallback(() => {
    const result = validateStep(stepRef.current, dataRef.current);
    setErrors(result);
    const keys = Object.keys(result);
    if (keys.length > 0) {
      toast.error('Preencha os campos obrigatórios');
      return false;
    }
    return true;
  }, []);

  const validateField = useCallback((field: string) => {
    setTouched((previous) => new Set(previous).add(field));
    const result = validateStep(stepRef.current, dataRef.current);
    const error = result[field];
    if (error) toast.error(error);
    setErrors((previous) => {
      const next = { ...previous };
      if (error) next[field] = error;
      else delete next[field];
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      currentStep,
      formData,
      errors,
      touched,
      updateField,
      goToStep,
      validate,
      validateField,
    }),
    [
      currentStep,
      formData,
      errors,
      touched,
      updateField,
      goToStep,
      validate,
      validateField,
    ]
  );

  return <C4PContext.Provider value={value}>{children}</C4PContext.Provider>;
};

export const useC4P = () => {
  const context = useContext(C4PContext);
  if (!context) throw new Error('useC4P must be used within C4PProvider');
  return context;
};
