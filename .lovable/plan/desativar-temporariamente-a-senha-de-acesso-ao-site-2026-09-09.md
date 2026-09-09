# Desativar temporariamente a senha de acesso ao site

Objetivo: liberar o site (página inicial, dashboard, índices, notícias etc.) sem pedir senha, mantendo tudo pronto para reativar depois com uma única mudança.

## Como vai funcionar

- Um "interruptor" único controla se a tela de senha aparece ou não.
- Com o interruptor desligado: qualquer visitante entra direto na plataforma, sem a tela `/acesso`.
- A tela de senha continua existindo e funcionando (a página `/acesso` segue acessível), apenas deixa de ser obrigatória.
- O painel administrativo continua com login próprio, sem alteração.
- Para reativar depois, basta voltar o interruptor para ligado — nada é apagado: os códigos de acesso já criados e as solicitações de acesso permanecem intactos.

## Detalhes técnicos

- Adicionar uma constante `SITE_ACCESS_ENABLED = false` em `src/components/AccessGate.tsx` (ou um pequeno módulo de config importado por ele).
- Em `AccessGate`, se `SITE_ACCESS_ENABLED` for falso, retornar `children` imediatamente, antes do estado de carregamento e do redirect para `/acesso`.
- Nenhuma mudança em `useSiteAccess`, nas edge functions (`verify-site-access`, `verify-site-token`) ou no banco.
- Rotas em `src/App.tsx` permanecem como estão.
