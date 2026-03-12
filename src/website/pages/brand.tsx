import '@site/src/website/scss/pages/brand.scss';
import { useRef, useState } from 'react';
import Translate, { translate } from '@docusaurus/Translate';
import { Check, CircleCheck, CircleX, Copy, Download } from 'lucide-react';
import Logo from '@site/src/website/assets/img/logo.svg';
import { Page } from '@site/src/website/components/shared/Page';
import { copyToClipboard } from '@site/src/website/helpers/copy-to-clipboard';
import { Parallax } from '../components/shared/Parallax';

export default () => {
  const colors = [
    {
      name: <Translate id='brand.color.green'>Verde</Translate>,
      hex: '#37c400',
      className: 'green',
    },
    {
      name: <Translate id='brand.color.yellow'>Amarelo</Translate>,
      hex: '#ffd000',
      className: 'yellow',
    },
    {
      name: <Translate id='brand.color.blue'>Azul</Translate>,
      hex: '#1a5fce',
      className: 'blue',
    },
    {
      name: <Translate id='brand.color.white'>Branco</Translate>,
      hex: '#ffffff',
      className: 'white',
    },
  ];

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
            <Translate id='brand.hero.title'>Identidade Visual</Translate>
          </h1>
          <p className='intro'>
            <Translate id='brand.hero.intro'>
              Baixe os arquivos oficiais e consulte os guias de estilo para
              representar corretamente a JSConf Brasil 2026.
            </Translate>
          </p>
        </header>

        <section className='logo'>
          <h2 className='section-title'>
            <Translate id='brand.logo.title'>Logotipo</Translate>
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
              <Translate id='brand.download.svg'>Baixar SVG</Translate>
            </button>
            <button
              type='button'
              className='download'
              onClick={() => download('png')}
            >
              <Download className='icon' />
              <Translate id='brand.download.png'>Baixar PNG</Translate>
            </button>
          </div>
        </section>

        <section className='colors'>
          <h2 className='section-title'>
            <Translate id='brand.colors.title'>Cores</Translate>
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
            <Translate id='brand.guidelines.title'>Guias de Uso</Translate>
          </h2>
          <div className='grid'>
            <div className='card do'>
              <h3 className='title'>
                <CircleCheck className='icon' />
                <Translate id='brand.correct.title'>Correto</Translate>
              </h3>
              <ul>
                <li>
                  <Translate id='brand.correct.item1'>
                    Mantenha espaço livre ao redor do logo
                  </Translate>
                </li>
                <li>
                  <Translate id='brand.correct.item2'>
                    Use sobre fundos que garantam contraste
                  </Translate>
                </li>
                <li>
                  <Translate id='brand.correct.item3'>
                    Mantenha as proporções originais
                  </Translate>
                </li>
                <li>
                  <Translate id='brand.correct.item4'>
                    Use as cores oficiais da paleta
                  </Translate>
                </li>
              </ul>
            </div>
            <div className='card dont'>
              <h3 className='title'>
                <CircleX className='icon' />
                <Translate id='brand.avoid.title'>Evite</Translate>
              </h3>
              <ul>
                <li>
                  <Translate id='brand.avoid.item1'>
                    Alterar as cores do logo
                  </Translate>
                </li>
                <li>
                  <Translate id='brand.avoid.item2'>
                    Distorcer ou rotacionar o logo
                  </Translate>
                </li>
                <li>
                  <Translate id='brand.avoid.item3'>
                    Adicionar efeitos como sombras ou brilhos
                  </Translate>
                </li>
                <li>
                  <Translate id='brand.avoid.item4'>
                    Usar o logo em tamanhos muito pequenos
                  </Translate>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </Page>
  );
};
