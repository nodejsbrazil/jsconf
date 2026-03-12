import type { InterpolateValues } from '@docusaurus/Interpolate';
import type { TranslationId } from '@site/src/website/i18n';
import type { ReactNode } from 'react';
import OriginalTranslate, {
  translate as originalTranslate,
} from '@docusaurus/Translate';

type TextProps<Message extends string> = {
  id: TranslationId;
  values?: InterpolateValues<Message, ReactNode>;
};

type TextFnParam<Message extends string> = {
  id: TranslationId;
  message?: Message;
  description?: string;
};

export const text = <Message extends string>(
  param: TextFnParam<Message>,
  values?: InterpolateValues<Message, string | number>
): string => originalTranslate(param, values);

export const Text = <Message extends string>({
  id,
  values,
}: TextProps<Message>) => <OriginalTranslate id={id} values={values} />;
