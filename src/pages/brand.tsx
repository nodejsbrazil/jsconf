import '@site/src/scss/pages/brand.scss';
import { useRef, useState } from 'react';
import { translate } from '@docusaurus/Translate';
import { Check, CircleCheck, CircleX, Copy, Download } from 'lucide-react';
import Logo from '@site/src/assets/img/logo.svg';
import { Page } from '@site/src/components/shared/Page';
import { copyToClipboard } from '@site/src/helpers/copy-to-clipboard';
import { Parallax } from '../components/shared/Parallax';

export default () => {
  const colors = [
    {
      name: translate({ id: 'brand.color.green', message: 'Verde' }),
      hex: '#37c400',
      className: 'green',
    },
    {
      name: translate({ id: 'brand.color.yellow', message: 'Amarelo' }),
      hex: '#ffd000',
      className: 'yellow',
    },
    {
      name: translate({ id: 'brand.color.blue', message: 'Azul' }),
      hex: '#1a5fce',
      className: 'blue',
    },
    {
      name: translate({ id: 'brand.color.white', message: 'Branco' }),
      hex: '#ffffff',
      className: 'white',
    },
  ] as const;

  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = async (hex: string) => {
    const success = await copyToClipboard(hex);

    if (success) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setCopiedColor(hex);
      timeoutRef.current = setTimeout(() => setCopiedColor(null), 2000);
    }
  };

  const download = (extension: 'svg' | 'png') => {
    const link = document.createElement('a');

    link.href = `/img/logo.${extension}`;
    link.download = `jsconf-brasil-logo.${extension}`;
    link.click();
  };

  return (
    <Page
      title={translate({ id: 'brand.pageTitle', message: 'Identidade Visual' })}
      description={translate({
        id: 'brand.pageDescription',
        message:
          'Baixe os arquivos oficiais e consulte os guias de estilo para representar corretamente a JSConf Brasil 2026',
      })}
    >
      <div className='page-content brand-page'>
        <header className='header'>
          <h1 className='title'>
            {translate({
              id: 'brand.hero.title',
              message: 'Identidade Visual',
            })}
          </h1>
          <p className='intro'>
            {translate({
              id: 'brand.hero.intro',
              message:
                'Baixe os arquivos oficiais e consulte os guias de estilo para representar corretamente a JSConf Brasil 2026.',
            })}
          </p>
        </header>

        <section className='logo'>
          <h2 className='section-title'>
            {translate({ id: 'brand.logo.title', message: 'Logotipo' })}
          </h2>
          <div className='grid'>
            <div className='container dark'>
              <Parallax tiltMaxAngleX={5} tiltMaxAngleY={5}>
                <Logo />
              </Parallax>
            </div>
            <div className='container light'>
              <Parallax tiltMaxAngleX={5} tiltMaxAngleY={5}>
                <Logo />
              </Parallax>
            </div>
          </div>
          <div className='actions'>
            <button
              type='button'
              className='download'
              onClick={() => download('svg')}
            >
              <Download className='icon' />
              {translate({ id: 'brand.download.svg', message: 'Baixar SVG' })}
            </button>
            <button
              type='button'
              className='download'
              onClick={() => download('png')}
            >
              <Download className='icon' />
              {translate({ id: 'brand.download.png', message: 'Baixar PNG' })}
            </button>
          </div>
        </section>

        <section className='colors'>
          <h2 className='section-title'>
            {translate({ id: 'brand.colors.title', message: 'Cores' })}
          </h2>
          <div className='grid'>
            {colors.map((color) => (
              <button
                key={color.hex}
                type='button'
                className={`card ${color.className} ${copiedColor === color.hex ? 'copied' : ''}`}
                onClick={() => copy(color.hex)}
              >
                <div className='preview' />
                <div className='info'>
                  <div className='name'>{color.name}</div>
                  <div className='hex'>
                    {color.hex}
                    {copiedColor === color.hex ? (
                      <Check className='icon' />
                    ) : (
                      <Copy className='icon' />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className='guidelines'>
          <h2 className='section-title'>
            {translate({
              id: 'brand.guidelines.title',
              message: 'Guias de Uso',
            })}
          </h2>
          <div className='grid'>
            <div className='card do'>
              <h3 className='title'>
                <CircleCheck className='icon' />
                {translate({ id: 'brand.correct.title', message: 'Correto' })}
              </h3>
              <ul>
                <li>
                  {translate({
                    id: 'brand.correct.item1',
                    message: 'Mantenha espaço livre ao redor do logo',
                  })}
                </li>
                <li>
                  {translate({
                    id: 'brand.correct.item2',
                    message: 'Use sobre fundos que garantam contraste',
                  })}
                </li>
                <li>
                  {translate({
                    id: 'brand.correct.item3',
                    message: 'Mantenha as proporções originais',
                  })}
                </li>
                <li>
                  {translate({
                    id: 'brand.correct.item4',
                    message: 'Use as cores oficiais da paleta',
                  })}
                </li>
              </ul>
            </div>
            <div className='card dont'>
              <h3 className='title'>
                <CircleX className='icon' />
                {translate({ id: 'brand.avoid.title', message: 'Evite' })}
              </h3>
              <ul>
                <li>
                  {translate({
                    id: 'brand.avoid.item1',
                    message: 'Alterar as cores do logo',
                  })}
                </li>
                <li>
                  {translate({
                    id: 'brand.avoid.item2',
                    message: 'Distorcer ou rotacionar o logo',
                  })}
                </li>
                <li>
                  {translate({
                    id: 'brand.avoid.item3',
                    message: 'Adicionar efeitos como sombras ou brilhos',
                  })}
                </li>
                <li>
                  {translate({
                    id: 'brand.avoid.item4',
                    message: 'Usar o logo em tamanhos muito pequenos',
                  })}
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </Page>
  );
};
