import type { FormData } from './types';
import { initialFormData, STORAGE_KEY } from './definitions';

export const toBadge = (index: number) => String.fromCharCode(65 + index);

export const loadFromStorage = (): { step: number; data: FormData } => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { step: 1, data: initialFormData };
};

export const saveToStorage = (step: number, data: FormData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, data }));
  } catch {}
};
