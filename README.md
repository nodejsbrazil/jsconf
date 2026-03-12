# JSConf Brasil 2026 🐢✨

## Desenvolvimento

```sh
npm ci
npm start # Inicia o website e o servidor localmente
```

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

### Formatação / Linting

```sh
npm run lint:fix
```

## Compilação

```sh
npm run build # Compila o website
```

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
