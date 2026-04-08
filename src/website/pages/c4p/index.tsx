import '@site/src/website/scss/pages/c4p.scss';
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
    <div className='page-content c4p-page'>
      <div className='form-container'>
        {currentStep > 1 && currentStep <= 3 && (
          <button
            type='button'
            className='back-button'
            onClick={() => goToStep(currentStep - 1)}
          >
            <ArrowLeft className='icon' aria-hidden />
            <span>Voltar</span>
          </button>
        )}

        {currentStep <= 3 && (
          <progress max={3} value={currentStep}>
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
