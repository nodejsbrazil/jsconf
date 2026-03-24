import '@site/src/website/scss/pages/c4p.scss';
import { useState } from 'react';
import { useLocation } from '@docusaurus/router';
import { ArrowLeft, ArrowRight, CircleCheck } from 'lucide-react';
import {
  FaEnvelope,
  FaGithub,
  FaHeading,
  FaInstagram,
  FaLink,
  FaLinkedinIn,
  FaLocationDot,
  FaPhone,
  FaUser,
  FaYoutube,
} from 'react-icons/fa6';
import { Page } from '@site/src/website/components/shared/Page';

const topics = [
  { name: 'Arquitetura de software', preferred: true },
  { name: 'Design patterns', preferred: false },
  { name: 'Qualidade de código', preferred: true },
  { name: 'Programação funcional', preferred: false },
  { name: 'Cases de resolução de problemas usando código', preferred: true },
  { name: 'Teste de software', preferred: false },
  { name: 'Código para acessibilidade', preferred: false },
  { name: 'Cloud/escalabilidade', preferred: true },
  { name: 'Open source', preferred: false },
  { name: 'Experiência dos usuários', preferred: false },
  { name: 'Testes AB', preferred: false },
  { name: 'Metodologias ágeis', preferred: false },
  { name: 'Roadmap de carreira', preferred: false },
  { name: 'Design system', preferred: false },
  { name: 'Comunidades', preferred: false },
  { name: 'Inclusão no mercado tech', preferred: false },
  { name: 'Soft skills', preferred: false },
  { name: 'Recrutamento e seleção', preferred: false },
  { name: 'Segurança', preferred: true },
];

const experienceOptions = [
  '0 - 1 ano',
  '2 - 4 anos',
  '5 - 9 anos',
  'Acima de 10 anos',
];

const durationOptions = ['20 minutos', '40 minutos'];

const travelOptions = [
  'Gostaria que a organização pagasse minha viagem e hospedagem',
  'Posso arcar com os custos',
];

const genderOptions = ['Homem', 'Mulher', 'Não-binário', 'Prefiro não dizer'];

const raceOptions = [
  'Branca',
  'Parda',
  'Preta',
  'Indígena',
  'Não sei',
  'Prefiro não dizer',
  'Outro',
];

const disabilityOptions = [
  'Sou cego(a) / tenho baixa visão',
  'Sou surdo(a) / tenho deficiência auditiva',
  'Eu não consigo / tenho dificuldade de andar ou ficar em pé sem assistência',
  'Eu não consigo / tenho dificuldade de digitar',
  'Não se aplica',
];

const toBadge = (index: number) => String.fromCharCode(65 + index);

type FormData = {
  name: string;
  email: string;
  phone: string;
  cityState: string;
  travelPreference: string;
  linkedin: string;
  instagram: string;
  youtube: string;
  github: string;
  website: string;
  experienceLevel: string;
  bio: string;
  gender: string;
  race: string;
  disability: string;
  duration: string;
  talkTitle: string;
  talkDescription: string;
  audienceLevel: string;
  talkReason: string;
};

const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  cityState: '',
  travelPreference: '',
  linkedin: '',
  instagram: '',
  youtube: '',
  github: '',
  website: '',
  experienceLevel: '',
  bio: '',
  gender: '',
  race: '',
  disability: '',
  duration: '',
  talkTitle: '',
  talkDescription: '',
  audienceLevel: '',
  talkReason: '',
};

const STORAGE_KEY = 'c4p-form';

const loadFromStorage = (): { step: number; data: FormData } => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { step: 1, data: initialFormData };
};

const saveToStorage = (step: number, data: FormData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, data }));
  } catch {}
};

export default () => {
  const { search } = useLocation();
  const isPreview = new URLSearchParams(search).has('preview');
  const saved = loadFromStorage();
  const [currentStep, setCurrentStep] = useState(saved.step);
  const [formData, setFormData] = useState<FormData>(saved.data);

  const updateField = <Key extends keyof FormData>(
    field: Key,
    value: FormData[Key]
  ) =>
    setFormData((previous) => {
      const next = { ...previous, [field]: value };
      saveToStorage(currentStep, next);
      return next;
    });

  const goToStep = (step: number) => {
    setCurrentStep(step);
    saveToStorage(step, formData);
    document.getElementById('__docusaurus')?.scrollTo(0, 0);
  };

  if (!isPreview) {
    return (
      <Page title='Call4papers - JSConf Brasil 2026'>
        <div className='page-content c4p-page'>
          <div className='form-container'>
            <h1 className='form-title'>Em Breve 🚧</h1>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page title='Call4papers - JSConf Brasil 2026'>
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

          {currentStep === 1 && (
            <>
              <section className='section'>
                <h1 className='form-title'>Call4papers - JSConf Brasil 2026</h1>
                <h2 className='section-heading'>
                  Quer palestrar na JSConf Brasil deste ano?
                </h2>
                <p>
                  Essa é a sua chance de dividir o palco com alguns dos
                  profissionais mais incríveis da área de tecnologia! Preencha o
                  nosso Call4papers, nossa equipe fará a análise e seleção das
                  propostas enviadas.
                </p>
                <p>
                  A <strong>JSConf Brasil</strong> existe para compartilhar
                  conhecimento, aproximar a comunidade e fortalecer um evento
                  diverso, inclusivo e colaborativo.
                </p>
              </section>

              <section className='section'>
                <h2 className='section-heading'>
                  JSConf Brasil - 28 de novembro de 2026
                </h2>
                <p>Aceitaremos inscrições até **/**</p>
                <p>
                  O evento acontecerá no dia{' '}
                  <strong>28 de novembro de 2026</strong>, na{' '}
                  <strong>
                    Universidade Municipal de São Caetano do Sul, São Caetano do
                    Sul - SP
                  </strong>
                  . Serão palestras, painéis, atividades interativas, feira de
                  expositores e muito mais.
                </p>
              </section>

              <section className='section'>
                <p>
                  Esses são alguns dos tópicos que sugerimos (o que tem
                  estrelinha são os preferidos):
                </p>
                <ul className='topics'>
                  {topics.map((topic) => (
                    <li
                      key={topic.name}
                      className={topic.preferred ? 'preferred' : undefined}
                    >
                      {topic.name}
                    </li>
                  ))}
                </ul>
              </section>

              <button
                type='button'
                className='submit-button'
                onClick={() => goToStep(2)}
              >
                <span>Continuar</span>
                <ArrowRight className='icon' aria-hidden />
              </button>
            </>
          )}

          {currentStep === 2 && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                goToStep(3);
              }}
            >
              <section className='section'>
                <h2 className='section-heading'>Sobre você</h2>
              </section>

              <section className='section'>
                <div className='field'>
                  <h3 className='field-label'>
                    Seu nome <span className='required'>*</span>
                  </h3>
                  <div className='input-with-icon'>
                    <FaUser className='input-icon' aria-hidden />
                    <input
                      type='text'
                      aria-label='Seu nome'
                      aria-required='true'
                      value={formData.name}
                      onChange={(event) =>
                        updateField('name', event.currentTarget.value)
                      }
                    />
                  </div>
                </div>

                <div className='field'>
                  <h3 className='field-label'>
                    E-mail <span className='required'>*</span>
                  </h3>
                  <div className='input-with-icon'>
                    <FaEnvelope className='input-icon' aria-hidden />
                    <input
                      type='text'
                      aria-label='E-mail'
                      aria-required='true'
                      value={formData.email}
                      onChange={(event) =>
                        updateField('email', event.currentTarget.value)
                      }
                    />
                  </div>
                </div>

                <div className='field'>
                  <h3 className='field-label'>
                    Celular <span className='required'>*</span>
                  </h3>
                  <div className='input-with-icon'>
                    <FaPhone className='input-icon' aria-hidden />
                    <input
                      type='text'
                      aria-label='Celular'
                      aria-required='true'
                      value={formData.phone}
                      onChange={(event) =>
                        updateField('phone', event.currentTarget.value)
                      }
                    />
                  </div>
                </div>

                <div className='field'>
                  <h3 className='field-label'>
                    Cidade/UF <span className='required'>*</span>
                  </h3>
                  <div className='input-with-icon'>
                    <FaLocationDot className='input-icon' aria-hidden />
                    <input
                      type='text'
                      aria-label='Cidade/UF'
                      aria-required='true'
                      value={formData.cityState}
                      onChange={(event) =>
                        updateField('cityState', event.currentTarget.value)
                      }
                    />
                  </div>
                </div>
              </section>

              <section className='section'>
                <div className='field'>
                  <h3 className='field-label'>
                    Sobre a viagem e hospedagem{' '}
                    <span className='required'>*</span>
                  </h3>
                  <p className='field-description'>
                    A cidade onde você mora pode influenciar na seleção, pois o
                    deslocamento pode gerar custos adicionais para o evento.
                    Dependendo do nosso orçamento, talvez não seja possível
                    custear passagem e hospedagem para todos os palestrantes.
                  </p>
                  <div className='radio-group'>
                    {travelOptions.map((option, index) => (
                      <label
                        key={option}
                        className={`radio-option ${formData.travelPreference === option ? 'selected' : ''}`}
                      >
                        <span className='badge'>{toBadge(index)}</span>
                        <input
                          type='radio'
                          name='travelPreference'
                          value={option}
                          checked={formData.travelPreference === option}
                          onChange={() =>
                            updateField('travelPreference', option)
                          }
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </section>

              <section className='section'>
                <h3 className='field-label'>Redes sociais</h3>

                <div className='field'>
                  <label className='sub-label'>LinkedIn</label>
                  <div className='input-with-icon'>
                    <FaLinkedinIn className='input-icon' aria-hidden />
                    <input
                      type='text'
                      aria-label='LinkedIn'
                      value={formData.linkedin}
                      onChange={(event) =>
                        updateField('linkedin', event.currentTarget.value)
                      }
                    />
                  </div>
                </div>

                <div className='field'>
                  <label className='sub-label'>Instagram</label>
                  <div className='input-with-icon'>
                    <FaInstagram className='input-icon' aria-hidden />
                    <input
                      type='text'
                      aria-label='Instagram'
                      value={formData.instagram}
                      onChange={(event) =>
                        updateField('instagram', event.currentTarget.value)
                      }
                    />
                  </div>
                </div>

                <div className='field'>
                  <label className='sub-label'>YouTube</label>
                  <div className='input-with-icon'>
                    <FaYoutube className='input-icon' aria-hidden />
                    <input
                      type='text'
                      aria-label='YouTube'
                      value={formData.youtube}
                      onChange={(event) =>
                        updateField('youtube', event.currentTarget.value)
                      }
                    />
                  </div>
                </div>

                <div className='field'>
                  <label className='sub-label'>GitHub</label>
                  <div className='input-with-icon'>
                    <FaGithub className='input-icon' aria-hidden />
                    <input
                      type='text'
                      aria-label='GitHub'
                      value={formData.github}
                      onChange={(event) =>
                        updateField('github', event.currentTarget.value)
                      }
                    />
                  </div>
                </div>

                <div className='field'>
                  <label className='sub-label'>Site Pessoal</label>
                  <div className='input-with-icon'>
                    <FaLink className='input-icon' aria-hidden />
                    <input
                      type='text'
                      aria-label='Site Pessoal'
                      value={formData.website}
                      onChange={(event) =>
                        updateField('website', event.currentTarget.value)
                      }
                    />
                  </div>
                </div>
              </section>

              <section className='section'>
                <div className='field'>
                  <h3 className='field-label'>
                    Tempo de experiência <span className='required'>*</span>
                  </h3>
                  <div className='radio-group'>
                    {experienceOptions.map((option, index) => (
                      <label
                        key={option}
                        className={`radio-option ${formData.experienceLevel === option ? 'selected' : ''}`}
                      >
                        <span className='badge'>{toBadge(index)}</span>
                        <input
                          type='radio'
                          name='experienceLevel'
                          value={option}
                          checked={formData.experienceLevel === option}
                          onChange={() =>
                            updateField('experienceLevel', option)
                          }
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </section>

              <section className='section'>
                <div className='field'>
                  <h3 className='field-label'>
                    Mini biografia <span className='required'>*</span>
                  </h3>
                  <p className='field-description'>
                    Em um único parágrafo, com até 280 caracteres, inclua
                    informações sobre sua formação, certificações, cargo atual e
                    anteriores, pesquisas desenvolvidas, artigos publicados ou
                    qualquer outro dado profissional que considere relevante.
                  </p>
                  <textarea
                    aria-label='Mini biografia'
                    aria-required='true'
                    maxLength={280}
                    value={formData.bio}
                    onChange={(event) =>
                      updateField('bio', event.currentTarget.value)
                    }
                  />
                </div>
              </section>

              <section className='section'>
                <div className='field'>
                  <h3 className='field-label'>
                    A JSConf Brasil busca sempre pela diversidade, inclusão e
                    acessibilidade. Caso se sinta confortável em responder,
                    gostaríamos de saber: <span className='required'>*</span>
                  </h3>

                  <p className='checkbox-group-label'>Identidade de Gênero</p>
                  <div className='radio-group'>
                    {genderOptions.map((option, index) => (
                      <label
                        key={option}
                        className={`radio-option ${formData.gender === option ? 'selected' : ''}`}
                      >
                        <span className='badge'>{toBadge(index)}</span>
                        <input
                          type='radio'
                          name='gender'
                          value={option}
                          checked={formData.gender === option}
                          onChange={() => updateField('gender', option)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>

                  <p className='checkbox-group-label'>
                    Qual cor/raça você se identifica?
                  </p>
                  <div className='radio-group'>
                    {raceOptions.map((option, index) => (
                      <label
                        key={option}
                        className={`radio-option ${formData.race === option ? 'selected' : ''}`}
                      >
                        <span className='badge'>{toBadge(index)}</span>
                        <input
                          type='radio'
                          name='race'
                          value={option}
                          checked={formData.race === option}
                          onChange={() => updateField('race', option)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>

                  <p className='checkbox-group-label'>
                    Situação de deficiência: qual das opções abaixo descreve
                    você, se tiver alguma?
                  </p>
                  <div className='radio-group'>
                    {disabilityOptions.map((option, index) => (
                      <label
                        key={option}
                        className={`radio-option ${formData.disability === option ? 'selected' : ''}`}
                      >
                        <span className='badge'>{toBadge(index)}</span>
                        <input
                          type='radio'
                          name='disability'
                          value={option}
                          checked={formData.disability === option}
                          onChange={() => updateField('disability', option)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </section>

              <button type='submit' className='submit-button'>
                <span>Continuar</span>
                <ArrowRight className='icon' aria-hidden />
              </button>
            </form>
          )}
          {currentStep === 3 && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                console.log(formData);
                goToStep(4);
              }}
            >
              <section className='section'>
                <h1 className='form-title'>Sobre sua participação</h1>
              </section>

              <section className='section'>
                <div className='field'>
                  <h3 className='field-label'>Tipo de conteúdo</h3>
                  <p className='field-description'>
                    O formato dos conteúdos será em palestras de 20 ou 40
                    minutos. Escolha o tempo de duração que você considera mais
                    adequado para a sua proposta.
                  </p>
                </div>

                <div className='field'>
                  <h3 className='field-label'>
                    Tempo de duração <span className='required'>*</span>
                  </h3>
                  <div className='radio-group'>
                    {durationOptions.map((option, index) => (
                      <label
                        key={option}
                        className={`radio-option ${formData.duration === option ? 'selected' : ''}`}
                      >
                        <span className='badge'>{toBadge(index)}</span>
                        <input
                          type='radio'
                          name='duration'
                          value={option}
                          checked={formData.duration === option}
                          onChange={() => updateField('duration', option)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </section>

              <section className='section'>
                <div className='field'>
                  <h3 className='field-label'>
                    Título <span className='required'>*</span>
                  </h3>
                  <div className='input-with-icon'>
                    <FaHeading className='input-icon' aria-hidden />
                    <input
                      type='text'
                      aria-label='Título'
                      aria-required='true'
                      value={formData.talkTitle}
                      onChange={(event) =>
                        updateField('talkTitle', event.currentTarget.value)
                      }
                    />
                  </div>
                </div>
              </section>

              <section className='section'>
                <div className='field'>
                  <h3 className='field-label'>
                    Descrição <span className='required'>*</span>
                  </h3>
                  <p className='field-description'>
                    Forneça um resumo do seu conteúdo. Essa informação será
                    usada em nosso site para divulgação da sua palestra.
                  </p>
                  <textarea
                    aria-label='Descrição'
                    aria-required='true'
                    value={formData.talkDescription}
                    onChange={(event) =>
                      updateField('talkDescription', event.currentTarget.value)
                    }
                  />
                </div>
              </section>

              <section className='section'>
                <div className='field'>
                  <h3 className='field-label'>
                    Para quem é este conteúdo?{' '}
                    <span className='required'>*</span>
                  </h3>
                  <div className='radio-group'>
                    {['Todos os níveis', 'Júnior', 'Pleno', 'Sênior'].map(
                      (option, index) => (
                        <label
                          key={option}
                          className={`radio-option ${formData.audienceLevel === option ? 'selected' : ''}`}
                        >
                          <span className='badge'>{toBadge(index)}</span>
                          <input
                            type='radio'
                            name='audienceLevel'
                            value={option}
                            checked={formData.audienceLevel === option}
                            onChange={() =>
                              updateField('audienceLevel', option)
                            }
                          />
                          <span>{option}</span>
                        </label>
                      )
                    )}
                  </div>
                </div>
              </section>

              <section className='section'>
                <div className='field'>
                  <h3 className='field-label'>
                    Por que deveríamos considerar este conteúdo na JSConf
                    Brasil? <span className='required'>*</span>
                  </h3>
                  <textarea
                    aria-label='Por que deveríamos considerar este conteúdo na JSConf Brasil?'
                    aria-required='true'
                    value={formData.talkReason}
                    onChange={(event) =>
                      updateField('talkReason', event.currentTarget.value)
                    }
                  />
                </div>
              </section>

              <button type='submit' className='submit-button'>
                <span>Finalizar</span>
                <ArrowRight className='icon' aria-hidden />
              </button>
            </form>
          )}

          {currentStep === 4 && (
            <>
              <section className='section success-header'>
                <CircleCheck className='success-icon' aria-hidden />
                <h1 className='form-title'>Proposta enviada!</h1>
                <p>
                  Obrigado por se inscrever no Call4papers da{' '}
                  <strong>JSConf Brasil 2026</strong>. Sua proposta foi recebida
                  com sucesso.
                </p>
              </section>

              <section className='section'>
                <h2 className='section-heading'>
                  Como os conteúdos serão avaliados?
                </h2>
                <p>A avaliação das propostas acontecerá em duas etapas.</p>
                <p>
                  Primeiro, um grupo de co-curadoria analisará anonimamente o
                  título, a descrição e o nível de conhecimento indicado para
                  cada palestra.
                </p>
                <p>
                  Em seguida, a equipe da JSConf Brasil fará uma análise
                  complementar para verificar o encaixe do conteúdo na
                  programação, considerando orçamento, estratégia e diversidade
                  temática.
                </p>
                <p>
                  Não existe um número fixo de pessoas selecionadas; a escolha
                  dependerá da qualidade e adequação das propostas enviadas.
                </p>
                <p>
                  Após o fim das inscrições, todo o processo de avaliação será
                  concluído em até duas semanas.
                </p>
                <p>
                  As pessoas selecionadas receberão um e-mail para confirmar sua
                  participação e, caso não haja resposta, entraremos em contato
                  com as próximas da lista. Assim que todas as confirmações
                  forem finalizadas, informaremos também as pessoas que não
                  forem aprovadas.
                </p>
              </section>
            </>
          )}
        </div>
      </div>
    </Page>
  );
};
