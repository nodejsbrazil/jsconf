import '@site/src/website/css/c4p.css';
import { Page } from '@site/src/website/components/shared/Page';
import { About } from './_components/about';
import { C4PProvider, useC4P } from './_components/context';
import { Introduction } from './_components/introduction';
import { Success } from './_components/success';
import { Talk } from './_components/talk';

const Form = () => {
  const { currentStep } = useC4P();

  return (
    <div className='c4p-page page-content flex w-full max-w-[128rem] flex-col items-center'>
      <div className='flex w-full flex-col gap-[0.8rem] px-[2rem] pb-[4rem] pt-[2rem] max-md:px-[1.6rem] max-md:pb-[3rem]'>
        {currentStep <= 3 && (
          <progress
            max={3}
            value={currentStep - 1}
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
  <Page title='Call4Papers - JSConf Brasil 2026'>
    <C4PProvider>
      <Form />
    </C4PProvider>
  </Page>
);
