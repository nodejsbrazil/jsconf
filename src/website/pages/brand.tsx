import '@site/src/website/scss/pages/brand.scss';
import { useRef, useState } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { Check, CircleCheck, CircleX, Copy, Download } from 'lucide-react';
import Logo from '@site/src/website/assets/img/logo.svg';
import { Text, text } from '@site/src/website/components/shared/i18n';
import { Page } from '@site/src/website/components/shared/Page';
import { copyToClipboard } from '@site/src/website/helpers/copy-to-clipboard';
import { Parallax } from '../components/shared/Parallax';

export default function BrandPage() {
  const colors = [
    {
      name: <Text id='brand.color.green' />,
      hex: '#37c400',
      className: 'green',
    },
    {
      name: <Text id='brand.color.yellow' />,
      hex: '#ffd000',
      className: 'yellow',
    },
    {
      name: <Text id='brand.color.blue' />,
      hex: '#1a5fce',
      className: 'blue',
    },
    {
      name: <Text id='brand.color.white' />,
      hex: '#ffffff',
      className: 'white',
    },
  ];

  const svgUrl = useBaseUrl('/img/logo.svg');
  const pngUrl = useBaseUrl('/img/logo.png');
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

    link.href = extension === 'svg' ? svgUrl : pngUrl;
    link.download = `jsconf-brasil-logo.${extension}`;
    link.click();
  };

  return (
    <Page
      title={text({ id: 'brand.pageTitle' })}
      description={text({ id: 'brand.pageDescription' })}
    >
      <div className='page-content brand-page'>
        <header className='header'>
          <h1 className='title'>
            <Text id='brand.hero.title' />
          </h1>
          <p className='intro'>
            <Text id='brand.hero.intro' />
          </p>
        </header>

        <section className='logo'>
          <h2 className='section-title'>
            <Text id='brand.logo.title' />
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
              <Text id='brand.download.svg' />
            </button>
            <button
              type='button'
              className='download'
              onClick={() => download('png')}
            >
              <Download className='icon' />
              <Text id='brand.download.png' />
            </button>
          </div>
        </section>

        <section className='colors'>
          <h2 className='section-title'>
            <Text id='brand.colors.title' />
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
            <Text id='brand.guidelines.title' />
          </h2>
          <div className='grid'>
            <div className='card do'>
              <h3 className='title'>
                <CircleCheck className='icon' />
                <Text id='brand.correct.title' />
              </h3>
              <ul>
                <li>
                  <Text id='brand.correct.item1' />
                </li>
                <li>
                  <Text id='brand.correct.item2' />
                </li>
                <li>
                  <Text id='brand.correct.item3' />
                </li>
                <li>
                  <Text id='brand.correct.item4' />
                </li>
              </ul>
            </div>
            <div className='card dont'>
              <h3 className='title'>
                <CircleX className='icon' />
                <Text id='brand.avoid.title' />
              </h3>
              <ul>
                <li>
                  <Text id='brand.avoid.item1' />
                </li>
                <li>
                  <Text id='brand.avoid.item2' />
                </li>
                <li>
                  <Text id='brand.avoid.item3' />
                </li>
                <li>
                  <Text id='brand.avoid.item4' />
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </Page>
  );
}
