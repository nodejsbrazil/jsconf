import { useRef, useState } from 'react';
import { Boxes } from 'lucide-react';
import { Text, text } from '@site/src/website/components/shared/i18n';
import { useScroll } from '../../hooks/useScroll';
import { Person } from '../shared/Person';

export const Team = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useScroll(ref, (isVisible) => {
    if (isVisible) setShow(true);
  });

  return (
    <section id='team'>
      <div className={show ? 'content show' : 'content'} ref={ref}>
        <h1 className='title'>
          <Boxes className='icon' /> <Text id='team.title' />
        </h1>
        <small className='subtitle'>
          <Text id='team.subtitle' />
        </small>
        <section className='speakers'>
          <Person
            name='Erick Wendel'
            img='/img/team/erick-wendel.webp'
            bio={text({ id: 'team.erick.bio' })}
            position={text({ id: 'team.erick.position' })}
            company='EW Academy'
            social={{
              instagram: 'erickwendel_',
              youtube: '@ErickWendelAcademy',
              linkedin: 'erickwendel',
              github: 'erickwendel',
              website: 'https://ew.academy/',
            }}
          />
          <Person
            name='Ana Neri'
            img='/img/team/ana-neri.webp'
            bio={text({ id: 'team.ana.bio' })}
            position={text({ id: 'team.ana.position' })}
            company='Clutch'
            social={{
              instagram: 'ananeridev',
              youtube: '@AnaNeriDev',
              linkedin: 'anabeatrizdev',
              github: 'ananeridev',
              website: 'https://ananeri.dev/',
            }}
          />
          <Person
            name='Lojhan'
            img='/img/team/lojhan.webp'
            bio={text({ id: 'team.lojhan.bio' })}
            position={text({ id: 'team.lojhan.position' })}
            company='lojhan.com'
            social={{
              instagram: 'lojhan.dev',
              linkedin: 'lojhan',
              github: 'Lojhan',
              website: 'https://www.lojhan.com',
            }}
          />
          <Person
            name='Lucas Santos'
            img='/img/team/lucas.webp'
            bio={text({ id: 'team.lucas.bio' })}
            position={text({ id: 'team.lucas.position' })}
            company='Hemnet'
            social={{
              github: 'khaosdoctor',
              linkedin: 'lsantosdev',
              instagram: 'lsantosdev',
              youtube: 'lsantosdev',
              website: 'https://blog.lsantos.dev',
            }}
          />
          <Person
            name='Micaele Magalhães'
            img='/img/team/mi.webp'
            bio={text({ id: 'team.micaele.bio' })}
            social={{
              instagram: 'micaele_magalhaes',
            }}
          />
          <Person
            name='Mônica'
            img='/img/team/monica.webp'
            bio={text({ id: 'team.monica.bio' })}
            position={text({ id: 'team.monica.position' })}
            company='CRMBonus'
            social={{
              linkedin: 'mocraveirodev',
              instagram: 'mocraveirodev',
              github: 'mocraveirodev',
              website: 'https://5tr.in/mocraveirodev/',
            }}
          />
          <Person
            name='Cristian Magalhães'
            img='/img/team/cristian.webp'
            bio={text({ id: 'team.cristian.bio' })}
            position={text({ id: 'team.cristian.position' })}
            company='Monest'
            social={{
              linkedin: 'cristian-silva-dev',
              github: 'Cristuker',
              instagram: 'cris.mgls',
              website: 'https://cristianm.dev/',
            }}
          />
        </section>
      </div>
    </section>
  );
};
