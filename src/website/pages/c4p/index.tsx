import '@site/src/website/css/c4p.css';
import {
  CircleCheckBig,
  Handshake,
  MicVocal,
  Send,
  UserPen,
} from 'lucide-react';
import { Page } from '@site/src/website/components/shared/Page';
import { C4PProvider, useC4P } from '../../contexts/c4p';
import { About } from './_components/about';
import { Diversity } from './_components/diversity';
import { Introduction } from './_components/introduction';
import { Success } from './_components/success';
import { Talk } from './_components/talk';
import * as styles from './_styles';

const stepTitles: Record<number, React.ReactNode> = {
  1: (
    <>
      <Send className={styles.stepIcon} />
      <span className={styles.stepTitle}>
        Call<span className='text-primary'>4</span>Papers
      </span>
    </>
  ),
  2: (
    <>
      <UserPen className={styles.stepIcon} />
      <span className={styles.stepTitle}>Sobre você</span>
    </>
  ),
  3: (
    <>
      <Handshake className={styles.stepIcon} />
      <span className={styles.stepTitle}>
        Diversidade e inclusão (opcional)
      </span>
    </>
  ),
  4: (
    <>
      <MicVocal className={styles.stepIcon} />
      <span className={styles.stepTitle}>Sobre a Palestra</span>
    </>
  ),
  5: (
    <>
      <CircleCheckBig className={styles.stepIcon} />
      <span className={styles.stepTitle}>Proposta enviada!</span>
    </>
  ),
};

const Form = () => {
  const { currentStep } = useC4P();

  return (
    <div className='c4p-page page-content flex w-full max-w-[128rem] flex-col items-center'>
      <div className='flex w-full flex-col gap-[0.8rem] px-[2rem] pb-[4rem] pt-[2rem] max-md:px-[1.6rem] max-md:pb-[3rem]'>
        <h1 className={styles.stepTitleWrapper}>{stepTitles[currentStep]}</h1>

        {currentStep <= 4 && (
          <progress
            max={4}
            value={currentStep - 1}
            className='mb-[2rem] h-[0.3rem] w-full appearance-none rounded-[0.2rem] border-none bg-primary/10 [&::-moz-progress-bar]:rounded-[0.2rem] [&::-moz-progress-bar]:bg-primary [&::-webkit-progress-bar]:rounded-[0.2rem] [&::-webkit-progress-bar]:bg-primary/10 [&::-webkit-progress-value]:rounded-[0.2rem] [&::-webkit-progress-value]:bg-primary [&::-webkit-progress-value]:transition-[width] [&::-webkit-progress-value]:duration-400'
          >
            Página {currentStep} de 4
          </progress>
        )}

        {currentStep === 1 && <Introduction />}
        {currentStep === 2 && <About />}
        {currentStep === 3 && <Diversity />}
        {currentStep === 4 && <Talk />}
        {currentStep === 5 && <Success />}
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
