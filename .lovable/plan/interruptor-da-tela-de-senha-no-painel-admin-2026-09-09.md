# Interruptor da tela de senha no painel admin

Hoje o bloqueio da tela de senha inicial está desligado por um valor fixo no código. A ideia é passar esse controle para o painel administrativo, com um botão liga/desliga que você mesmo aciona quando quiser.

## Como vai funcionar

- Em **Configurações do Sistema** aparece um novo cartão: "Tela de senha do site".
- Um interruptor com dois estados:
  - **Ligado**: visitantes precisam informar a senha de acesso antes de entrar.
  - **Desligado**: o site abre direto, sem pedir senha.
- Ao mudar o interruptor, uma confirmação aparece antes de aplicar (para evitar desligar ou trancar o site sem querer), e depois um aviso de sucesso.
- O estado atual fica salvo no sistema, então vale para todos os visitantes, em qualquer navegador ou celular — não só no seu.
- Continua tudo como está hoje: página de senha, códigos individuais por pessoa, solicitações de acesso e o login do admin. O interruptor só decide se a senha é exigida ou não.
- A página pública do fórum segue aberta sem senha em qualquer situação.

## Detalhes técnicos

1. Migração: inserir em `app_settings` a chave `site_access_enabled` (valor inicial `false`, para manter o comportamento atual) com descrição. Confirmar `GRANT SELECT ON public.app_settings TO anon` (a política de leitura pública já existe; o grant precisa estar presente para visitantes não autenticados).
2. `src/components/AccessGate.tsx`: remover a constante `SITE_ACCESS_ENABLED` e ler a chave via `useAppSetting('site_access_enabled')`. Enquanto a leitura estiver carregando, mostrar o spinner já existente (evita piscar conteúdo). Se a leitura falhar, liberar o acesso (fail-open) para não trancar o site por erro de rede. Manter o allowlist `PUBLIC_ROUTES`.
3. Novo componente `src/components/admin/settings/SiteAccessToggleCard.tsx`: usa `useAppSetting` + `useUpdateAppSetting`, `Switch`, `AlertDialog` de confirmação e `toast`. Renderizado em `src/pages/admin/settings/SettingsPage.tsx` acima de `SiteAccessCodesCard`.
4. Sem alterações nas edge functions `verify-site-access` / `verify-site-token`.
