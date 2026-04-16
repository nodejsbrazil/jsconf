/**
 * Project uses font-size: 62.5% on :root, so 1rem = 10px.
 * Font sizes and weights match the Home page (_base.scss, _benefits.scss).
 */

export const section =
  'flex flex-col gap-[1.4rem] border-b border-white/[0.06] pb-[2.8rem] mb-[1rem] last:border-b-0 last:mb-0';

export const stepTitleWrapper = 'flex items-center gap-[1.5rem]';

export const stepTitle =
  '!font-[var(--ifm-font-family-title)] !text-[4.2rem] max-md:!text-[3.2rem] max-sm:!text-[2.6rem] !font-bold !tracking-[-0.25rem] !text-[var(--title-color)] [text-shadow:0.25rem_0.25rem_0.5rem_var(--title-shadow-color)]';

export const stepIcon =
  'w-[3.2rem] h-[3.2rem] max-md:w-[2.6rem] max-md:h-[2.6rem] max-sm:w-[2.2rem] max-sm:h-[2.2rem] text-primary shrink-0';

export const sectionHeading =
  '!font-[var(--ifm-font-family-title)] !text-[2rem] max-sm:!text-[1.7rem] !font-extrabold !text-white !leading-[1.3] mt-[0.4rem] !tracking-normal';

export const paragraph =
  '!text-[1.5rem] !font-medium !leading-[1.5] text-white opacity-75';

export const strong = '!text-white !font-bold';

export const field = 'flex flex-col gap-[0.8rem] mb-[0.8rem]';

export const fieldLabel =
  '!font-[var(--ifm-font-family-title)] !text-[1.6rem] !font-extrabold !text-white !leading-[1.4]';

export const required = 'text-required ml-[0.2rem]';

export const fieldStatusIcon =
  'ml-[0.4rem] inline-block w-[1.4rem] h-[1.4rem] align-middle';
export const fieldStatusValid = `${fieldStatusIcon} text-primary`;
export const fieldStatusInvalid = `${fieldStatusIcon} text-[#dc143c]`;

export const subLabel = '!text-[1.4rem] !font-medium text-white/50';

export const fieldDescription =
  '!text-[1.5rem] !font-medium !leading-[1.5] text-white opacity-75';

const textInputBase =
  'w-full rounded-[0.6rem] border px-[1.4rem] py-[1.1rem] font-[var(--ifm-font-family-base)] !text-[1.5rem] text-white outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-white/30 focus:border-primary focus:shadow-[0_0_0_0.25rem_rgba(141,248,34,0.1)]';

export const textInput = (filled = false) =>
  `${textInputBase} ${
    filled
      ? 'border-primary/50 bg-[#7491571a]'
      : 'border-primary/20 bg-transparent'
  }`;

export const textarea = (filled = false) =>
  `${textInput(filled)} min-h-[10rem] resize-y`;

const selectInputBase =
  'cursor-pointer appearance-none rounded-[0.6rem] border px-[1.4rem] py-[1.1rem] font-[var(--ifm-font-family-base)] !text-[1.5rem] text-white outline-none transition-[border-color,box-shadow,background-color] duration-200 focus:border-primary focus:shadow-[0_0_0_0.25rem_rgba(141,248,34,0.1)]';

export const selectInput = (filled = false) =>
  `${selectInputBase} ${
    filled
      ? 'border-primary/50 bg-[#7491571a]'
      : 'border-primary/20 bg-transparent'
  }`;

export const inputWithIcon = 'relative';

export const inputIcon = (hasError = false) =>
  `absolute top-1/2 left-[1.3rem] -translate-y-1/2 w-[1.5rem] h-[1.5rem] pointer-events-none transition-colors duration-200 group-focus-within:text-primary ${
    hasError ? 'text-required' : 'text-primary/30'
  }`;

export const inputWithIconInput = (filled = false) =>
  `${textInput(filled)} pl-[3.8rem]`;

export const radioGroup = 'flex flex-col gap-[0.5rem]';

export const radioOption = (selected: boolean) =>
  `relative flex cursor-pointer items-center gap-[1rem] rounded-[0.6rem] border px-[1.3rem] py-[1rem] !text-[1.5rem] !font-medium transition-[border-color,background-color,color] duration-150 ${
    selected
      ? 'border-primary/50 bg-[#7491571a] text-white'
      : 'border-primary/15 bg-transparent text-white/80 hover:border-primary/30'
  }`;

export const radioHidden = 'absolute opacity-0 pointer-events-none';

export const badge = (selected: boolean) =>
  `flex shrink-0 items-center justify-center w-[2.2rem] h-[2.2rem] rounded-[0.4rem] border !text-[1.2rem] !font-bold transition-[border-color,color] duration-150 ${
    selected
      ? 'border-primary/60 text-primary'
      : 'border-primary/20 text-primary/40'
  }`;

export const checkboxGroupLabel =
  '!text-[1.5rem] !font-bold text-white/80 mb-[-0.4rem]';

export const submitButton =
  'flex cursor-pointer items-center justify-center gap-[0.8rem] self-end rounded-[0.75rem] border-none bg-gradient-to-r from-primary-dark to-primary-light px-[2.4rem] py-[1.2rem] font-[var(--ifm-font-family-base)] !text-[1.6rem] !font-bold text-white shadow-[0.1rem_0.1rem_0.2rem_#071f0dca] transition-transform duration-200 hover:-translate-y-[0.2rem] mt-[1rem]';

export const submitButtonCentered = `${submitButton} self-center`;

export const backButton =
  'flex cursor-pointer items-center justify-center gap-[0.8rem] rounded-[0.75rem] border border-white/30 bg-transparent px-[2.4rem] py-[1.2rem] font-[var(--ifm-font-family-base)] !text-[1.6rem] !font-bold text-white/50 transition-[border-color,color,transform] duration-200 hover:border-white/50 hover:text-white/80 hover:-translate-y-[0.2rem]';

export const submitIcon = 'w-[1.5rem] h-[1.5rem]';

export const inputError = '!border-required';
