# JSConf Brasil 2026 🐢✨

## Desenvolvimento

```sh
npm ci
npm start # Inicia o website e o servidor localmente
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
<img alt={text({ id: 'location.venue.imgAlt' })} />
```

`<Text />` e `text()` são abstrações do [`<Translate />`](https://docusaurus.io/docs/docusaurus-core#translate) do **Docusaurus**:

- IDs tipados com autocomplete a partir de `i18n/pt-BR/code.json`
- Fallback automático do idioma principal (`pt-BR`) — não é necessário passar `children`

Para adicionar um novo texto:

1. Crie a chave em `i18n/pt-BR/code.json`
2. Use `<Text id='...' />` ou `text({ id: '...' })` no componente
3. Os tipos são gerados automaticamente durante `start`, `build`, `typecheck` e `test`

> [!NOTE]
>
> Para gerar/forçar os tipos manualmente: `npm run i18n:generate`

---

### Formatação / Linting

```sh
npm run lint:fix
```

---

## Compilação

```sh
npm run build # Compila o website
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
