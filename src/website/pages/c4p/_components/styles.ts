// Note: project uses font-size: 62.5% on :root, so 1rem = 10px.
// Tailwind default spacing/sizes assume 1rem = 16px.
// All sizes here use explicit rem values via arbitrary syntax to match the SCSS original.

export const section =
  'flex flex-col gap-[1.4rem] border-b border-white/[0.06] pb-[2.8rem] mb-[1rem] last:border-b-0 last:mb-0';

export const formTitle =
  'font-[var(--ifm-font-family-title)] text-[3.3rem] max-md:text-[2.7rem] max-sm:text-[2.3rem] font-black text-white leading-[1.2] tracking-tight';

export const sectionHeading =
  'font-[var(--ifm-font-family-title)] text-[2.1rem] max-sm:text-[1.8rem] font-extrabold text-white leading-[1.3] mt-[0.4rem]';

export const paragraph =
  'text-[1.6rem] font-medium leading-[1.8] text-white/80';

export const strong = 'text-white font-bold';

export const field = 'flex flex-col gap-[0.8rem] mb-[0.8rem]';

export const fieldLabel = 'text-[1.6rem] font-bold text-white leading-[1.4]';

export const required = 'text-required ml-[0.2rem]';

export const subLabel = 'text-[1.4rem] font-medium text-white/50';

export const fieldDescription = 'text-[1.45rem] text-white/60 leading-[1.6]';

export const textInput =
  'w-full rounded-[0.6rem] border border-primary/20 bg-transparent px-[1.4rem] py-[1.1rem] font-[var(--ifm-font-family-base)] text-[1.6rem] text-white outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-white/30 focus:border-primary focus:shadow-[0_0_0_0.25rem_rgba(141,248,34,0.1)]';

export const textarea = `${textInput} min-h-[10rem] resize-y`;

export const selectInput =
  'cursor-pointer appearance-none rounded-[0.6rem] border border-primary/20 bg-transparent px-[1.4rem] py-[1.1rem] font-[var(--ifm-font-family-base)] text-[1.6rem] text-white outline-none transition-[border-color,box-shadow] duration-200 focus:border-primary focus:shadow-[0_0_0_0.25rem_rgba(141,248,34,0.1)]';

export const inputWithIcon = 'relative';

export const inputIcon =
  'absolute top-1/2 left-[1.3rem] -translate-y-1/2 w-[1.5rem] h-[1.5rem] text-primary/30 pointer-events-none transition-colors duration-200';

export const inputWithIconInput = `${textInput} pl-[3.8rem]`;

export const radioGroup = 'flex flex-col gap-[0.5rem]';

export const radioOption = (selected: boolean) =>
  `relative flex cursor-pointer items-center gap-[1rem] rounded-[0.6rem] border bg-transparent px-[1.3rem] py-[1rem] text-[1.5rem] font-medium transition-[border-color,background-color,color] duration-150 ${
    selected
      ? 'border-primary/50 bg-primary/5 text-white'
      : 'border-primary/15 text-white/80 hover:border-primary/30'
  }`;

export const radioHidden = 'absolute opacity-0 pointer-events-none';

export const badge = (selected: boolean) =>
  `flex shrink-0 items-center justify-center w-[2.2rem] h-[2.2rem] rounded-[0.4rem] border text-[1.2rem] font-bold transition-[border-color,color] duration-150 ${
    selected
      ? 'border-primary/60 text-primary'
      : 'border-primary/20 text-primary/40'
  }`;

export const checkboxGroupLabel =
  'text-[1.5rem] font-bold text-white/80 mt-[1rem] mb-[-0.4rem]';

export const submitButton =
  'flex cursor-pointer items-center justify-center gap-[0.8rem] self-end rounded-[0.75rem] border-none bg-gradient-to-r from-primary-dark to-primary-light px-[2.4rem] py-[1.2rem] font-[var(--ifm-font-family-base)] text-[1.6rem] font-bold text-white shadow-[0.1rem_0.1rem_0.2rem_#071f0dca] transition-transform duration-200 hover:-translate-y-[0.2rem] mt-[1rem]';

export const submitButtonCentered = `${submitButton} self-center`;

export const submitIcon = 'w-[1.5rem] h-[1.5rem]';
