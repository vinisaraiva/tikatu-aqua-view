## Objetivo
Garantir que `/forum-economia-do-mar` (e outras rotas públicas futuras) fique sempre acessível sem login, mesmo que sejam envolvidas pelo `AccessGate`.

## Mudanças

### 1. `src/components/AccessGate.tsx`
Adicionar constante `PUBLIC_ROUTES` no topo do arquivo:
```ts
const PUBLIC_ROUTES = ['/forum-economia-do-mar'];
```

No corpo do componente, antes de qualquer checagem de `loading`/`isAuthorized`, verificar se `location.pathname` está no allowlist. Se estiver, renderizar `children` diretamente e ignorar o gate:
```ts
if (PUBLIC_ROUTES.includes(location.pathname)) {
  return <>{children}</>;
}
```

Isso garante que:
- Se algum dia a rota for envolta em `<AccessGate>` por engano, ela continuará pública.
- O `NotFound` (rota `*`) que está dentro do AccessGate não redirecionará para `/acesso` se o path bater com a allowlist (defesa extra em caso de rewrite/redirect estranho do Render).

### 2. Nada mais precisa mudar
- `App.tsx` já expõe `/forum-economia-do-mar` fora do `AccessGate` — mantemos assim.
- Não altera lógica de autenticação nem de sessão.

## Notas técnicas
- A allowlist é um simples array de pathnames exatos. Se no futuro precisarmos de padrões (prefixos), trocamos por `PUBLIC_ROUTES.some(p => location.pathname.startsWith(p))`.
- Isso é uma proteção de UI/roteamento no cliente, independente do fix de rewrite SPA no Render.