import '@site/src/website/css/c4p.css';
import { ArrowLeft } from 'lucide-react';
import { Page } from '@site/src/website/components/shared/Page';
import { About } from './_components/about';
import { C4PProvider, useC4P } from './_components/context';
import { Introduction } from './_components/introduction';
import { Success } from './_components/success';
import { Talk } from './_components/talk';

const Form = () => {
  const { currentStep, goToStep } = useC4P();

  return (
    <div className='page-content flex w-full max-w-[128rem] flex-col items-center'>
      <div className='flex w-full flex-col gap-[0.8rem] px-[2rem] pb-[4rem] pt-[2rem] max-md:px-[1.6rem] max-md:pb-[3rem]'>
        {currentStep > 1 && currentStep <= 3 && (
          <button
            type='button'
            className='flex cursor-pointer items-center gap-[0.5rem] self-start border-none bg-transparent py-[0.6rem] mb-[0.4rem] font-[var(--ifm-font-family-base)] text-[1.4rem] font-medium text-white/50 transition-colors duration-200 hover:text-white/80'
            onClick={() => goToStep(currentStep - 1)}
          >
            <ArrowLeft className='w-[1.6rem] h-[1.6rem]' aria-hidden />
            <span>Voltar</span>
          </button>
        )}

        {currentStep <= 3 && (
          <progress
            max={3}
            value={currentStep}
            className='mb-[2rem] h-[0.3rem] w-full appearance-none rounded-[0.2rem] border-none bg-primary/10 [&::-moz-progress-bar]:rounded-[0.2rem] [&::-moz-progress-bar]:bg-primary [&::-webkit-progress-bar]:rounded-[0.2rem] [&::-webkit-progress-bar]:bg-primary/10 [&::-webkit-progress-value]:rounded-[0.2rem] [&::-webkit-progress-value]:bg-primary [&::-webkit-progress-value]:transition-[width] [&::-webkit-progress-value]:duration-400'
          >
            Página {currentStep} de 3
          </progress>
        )}

        {currentStep === 1 && <Introduction />}
        {currentStep === 2 && <About />}
        {currentStep === 3 && <Talk />}
        {currentStep === 4 && <Success />}
      </div>
    </div>
  );
};

export default () => (
  <Page title='Call4papers - JSConf Brasil 2026'>
    <C4PProvider>
      <Form />
    </C4PProvider>
  </Page>
);
