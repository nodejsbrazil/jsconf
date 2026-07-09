# Desenvolvimento do site

Este repositório contém o **código-fonte** do site oficial da **JSConf Brasil** ([jsconf.com.br](https://jsconf.com.br)): páginas em **Docusaurus**, conteúdo multilíngue e um **Worker** (Cloudflare) para formulários e API. Aqui você encontra como rodar o projeto localmente, traduzir textos e validar o build antes de abrir um PR.

---

## Primeiros passos

```sh
npm ci
npm start # Inicia o website e o servidor localmente (pt-BR)
```

---

### Idiomas

```sh
npm run start:en # Inglês
npm run start:es # Espanhol
```

> [!TIP]
>
> Use o componente `<Image />` ao invés de `<img />` para visualizar as imagens corretamente em todos os idiomas durante o desenvolvimento.
>
> - O componente `<Image />` utiliza `loading="lazy"` e `decoding="async"` por padrão.

---

### Traduções (i18n)

Use `<Text />` para conteúdo JSX e `text()` para atributos HTML (`aria-label`, `alt`, `placeholder`, etc.):

```tsx
<h1>
  <Text id='speakers.title' />
</h1>
```

```tsx
<Image alt={text({ id: 'location.venue.imgAlt' })} />
```

`<Text />` e `text()` são abstrações do [`<Translate />`](https://docusaurus.io/docs/docusaurus-core#translate) do **Docusaurus**:

- IDs tipados com autocomplete a partir de `i18n/pt-BR/code.json`
- Fallback automático do idioma principal (`pt-BR`) — não é necessário passar `children`

Para adicionar um novo texto:

1. Crie a chave em `i18n/pt-BR/code.json`
2. Use `<Text id='...' />` ou `text({ id: '...' })` no componente
3. Os tipos são inferidos automaticamente usando `i18n/pt-BR/code.json` como fonte de verdade

---

### Formatação / Linting

```sh
npm run lint:fix
```

---

## Compilação

```sh
npm run build # Compila o website e o worker
```

---

## Testes

```sh
npm test # Testes unitários
```

```sh
npm run typecheck # Verificação de tipos TypeScript
```

```sh
npm run lint # Verificação de linting
```

---

## Votação de palestras

Quem comprou ingresso vota nas palestras do C4P. A pessoa entra com a conta do **guild.host**, e quantos votos ela tem depende do **tier** do ingresso.

> [!WARNING]
>
> **Em construção (2026-06-26).** O login "Entrar com guild.host" **ainda não existe** no guild: o OAuth da documentação deles é só pra acesso de API privada, não pra login de terceiros. O Taz (dono do guild) vai adicionar esse login, previsão **segunda 2026-06-29**. Até lá o login no site é um **stub** e o resto (votos, tiers, tabelas) roda pelo header `X-Dev-User` em dev. Quem compra vários ingressos pra outras pessoas: cada uma cria a própria conta no guild ao resgatar o ingresso, então cada uma vira um participante separado e vota individualmente. Não usamos Stripe nem sincronizamos nada.

Como funciona:

1. A pessoa abre `/vote` e entra com o guild.host (`GET /api/vote/login`). O **Worker** guarda a identidade num cookie de sessão assinado.
2. Na hora do voto, o Worker descobre o tier da pessoa na lista de participantes do guild.host (usando um token de organizador) e cruza com a tabela `ticket_tiers` pra saber quantos votos ela tem.
3. Os votos vão pra tabela `c4p_votes` (`POST /api/vote`), até o limite do tier e até a data de fechamento (`VOTE_CLOSES_AT` em `src/server/configs/vote.ts`).

Tabelas novas (`resources/schema.sql`): `ticket_tiers` (nome do tier e número de votos), `c4p_votes` (um voto por pessoa e palestra) e `oauth_tokens` (token de organizador, que o Worker renova sozinho).

Secrets do Worker: `GUILD_OAUTH_CLIENT_ID`, `GUILD_OAUTH_CLIENT_SECRET`, `GUILD_OAUTH_REDIRECT_URI`, `GUILD_ORG_REFRESH_TOKEN`, `SESSION_SECRET`. O `ALLOWED_ORIGIN` precisa ser a origem do site (não pode ser `*`, senão o cookie de sessão não vai).

### Variáveis de ambiente (dois arquivos)

São dois arquivos, cada um com um dono diferente — não misture:

- **`.dev.vars`** — secrets de _runtime_ do Worker, carregados automaticamente pelo `wrangler dev`. É onde ficam `GUILD_OAUTH_*`, `SESSION_SECRET`, `ALLOWED_ORIGIN` e `ENVIRONMENT` no dev local. Modelo: `.dev.vars.example`. Em produção esses valores vêm do `wrangler secret put`, **não** de nenhum `.env`.
- **`.env`** — vars de _build/deploy_ lidas pelos scripts (`tools/prepare-worker.mts`) e pelo CD: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `WORKER_D1`, `WORKER_DOMAIN`. Modelo: `.env.example`.

Os secrets de OAuth/sessão só entram no `.dev.vars` — não os coloque no `.env`, nada os lê de lá. Os dois arquivos são gitignored.

Rodando local: `npm run db:init` cria as tabelas. Fora de produção dá pra simular um usuário pelo header `X-Dev-User` (em produção isso é ignorado, só vale a sessão do OAuth):

```sh
curl -H 'X-Dev-User: user-1' localhost:8787/api/vote
```

> [!TIP]
>
> O passo a passo pra subir em produção (registrar o app OAuth, popular `ticket_tiers`, pegar o refresh token de organizador) está no `TODO.md`.
