import '@site/src/scss/pages/brand.scss';
import { useRef, useState } from 'react';
import { Check, CircleCheck, CircleX, Copy, Download } from 'lucide-react';
import Logo from '@site/src/assets/img/logo.svg';
import { Page } from '@site/src/components/shared/Page';
import { copyToClipboard } from '@site/src/helpers/copy-to-clipboard';
import { Parallax } from '../components/shared/Parallax';

const colors = [
  { name: 'Verde', hex: '#37c400', className: 'green' },
  { name: 'Amarelo', hex: '#ffd000', className: 'yellow' },
  { name: 'Azul', hex: '#1a5fce', className: 'blue' },
  { name: 'Branco', hex: '#ffffff', className: 'white' },
] as const;

export default () => {
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
      title='Identidade Visual'
      description='Baixe os arquivos oficiais e consulte os guias de estilo para representar corretamente a JSConf Brasil 2026'
    >
      <div className='page-content brand-page'>
        <header>
          <h1>Identidade Visual</h1>
          <p className='intro'>
            Baixe os arquivos oficiais e consulte os guias de estilo para
            representar corretamente a JSConf Brasil 2026.
          </p>
        </header>

        <section className='logo'>
          <h2>Logotipo</h2>
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
              <Download />
              Baixar SVG
            </button>
            <button
              type='button'
              className='download'
              onClick={() => download('png')}
            >
              <Download />
              Baixar PNG
            </button>
          </div>
        </section>

        <section className='colors'>
          <h2>Cores</h2>
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
                    {copiedColor === color.hex ? <Check /> : <Copy />}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className='guidelines'>
          <h2>Guias de Uso</h2>
          <div className='grid'>
            <div className='card do'>
              <h3>
                <CircleCheck />
                Correto
              </h3>
              <ul>
                <li>Mantenha espaço livre ao redor do logo</li>
                <li>Use sobre fundos que garantam contraste</li>
                <li>Mantenha as proporções originais</li>
                <li>Use as cores oficiais da paleta</li>
              </ul>
            </div>
            <div className='card dont'>
              <h3>
                <CircleX />
                Evite
              </h3>
              <ul>
                <li>Alterar as cores do logo</li>
                <li>Distorcer ou rotacionar o logo</li>
                <li>Adicionar efeitos como sombras ou brilhos</li>
                <li>Usar o logo em tamanhos muito pequenos</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </Page>
  );
};
