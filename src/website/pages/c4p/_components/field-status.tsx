import { Check, X } from 'lucide-react';
import { useC4P } from './context';
import * as styles from './styles';

export const FieldStatus = ({ field }: { field: string }) => {
  const { formData, errors, touched } = useC4P();
  const value = formData[field as keyof typeof formData];
  const hasValue = typeof value === 'string' && value.length > 0;
  const hasInteracted = touched.has(field) || hasValue;

  if (!hasInteracted) {
    return <span className={styles.required}>*</span>;
  }

  if (errors[field]) {
    return <X className={styles.fieldStatusInvalid} aria-label='Inválido' />;
  }

  return <Check className={styles.fieldStatusValid} aria-label='Válido' />;
};
