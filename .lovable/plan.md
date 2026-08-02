# Agenda de coletas por voluntário (com lembrete por push)

## Objetivo
No cadastro do voluntário, além de rio/ponto, definir **para cada ponto** os dias da semana e o horário previsto da coleta. Com isso o admin vê quem está em dia e quem esqueceu, e o voluntário recebe **notificação push** no celular.

Regra combinada: o horário é **informativo**, com tolerância de **1 hora antes até 1 hora depois**. Nada é bloqueado — coletas fora do horário continuam válidas, apenas aparecem marcadas como "fora da janela".

## 1. Banco de dados

Nova tabela `volunteer_schedules` (agenda por ponto do voluntário):
- volunteer_id + point_id
- `weekdays`: dias da semana (0 = domingo … 6 = sábado)
- `scheduled_time`: horário previsto (ex. 08:00)
- `tolerance_minutes`: padrão 60
- `is_active`, timestamps + trigger de `updated_at`

Nova tabela `volunteer_push_subscriptions`: guarda o dispositivo do voluntário (endpoint + chaves do navegador) para envio do push.

Nova tabela `volunteer_reminder_log`: registra qual lembrete já foi enviado em qual dia, para não repetir.

Acesso: admin gerencia tudo; o app do voluntário grava a própria inscrição de push.

## 2. Cadastro no admin (VolunteerFormDialog)

Ao marcar um ponto, aparece abaixo dele um bloco compacto:
- botões dos dias da semana (D S T Q Q S S), múltipla escolha
- campo de horário
- texto fixo: "Tolerância: 1h antes / 1h depois (informativo)"

Validação: ponto marcado precisa ter ao menos 1 dia e um horário.

Na listagem de voluntários, a coluna de pontos mostra o resumo da agenda (ex. "Ponto Central — Seg/Qua/Sex 08:00").

## 3. Painel de pendências no admin

Card/aba "Coletas pendentes" em `/admin/volunteers`, cruzando a agenda com `readings`:
- calcula as coletas previstas do período (padrão: últimos 7 dias)
- classifica cada uma: **Em dia** (dentro da janela de 1h), **Fora do horário**, **Pendente/Esquecida**
- tabela filtrável por voluntário, ponto e status, com contagem de pendências
- botão "Enviar lembrete agora" para disparar o push manualmente

## 4. Lembrete por notificação push

- Chaves VAPID geradas e guardadas como segredos do projeto (a chave pública fica disponível para o app do voluntário).
- Função `volunteer-push-subscribe`: o app do voluntário registra/atualiza o dispositivo.
- Função `volunteer-collection-reminders`, agendada por cron a cada 15 min: encontra agendas cujo horário está chegando (ou já passou da janela) sem leitura no dia e envia o push "Hora da coleta no Ponto X".
- Se o voluntário não tiver dispositivo registrado, ele aparece no painel como "sem push" e o admin continua vendo a pendência.

### Importante sobre o app do voluntário
O push só chega no celular depois que o **app Tikatu Coleta (PWA)** pedir permissão de notificação e registrar o dispositivo. Esse app está em outro projeto/código. Entrego aqui, além do backend pronto, um **trecho de código pronto para colar** nele (pedir permissão + registrar no endpoint + service worker que exibe a notificação). Se o app do voluntário estiver neste mesmo repositório, faço a integração direto — me confirme.

## Detalhes técnicos
- Migração: `volunteer_schedules`, `volunteer_push_subscriptions`, `volunteer_reminder_log` com GRANTs + RLS; recriação de `volunteers_view` agregando a agenda em JSON.
- `useVolunteers`: create/update gravam/substituem as agendas junto com `volunteer_points`; novo hook `useCollectionCompliance` para o painel.
- Novos componentes: `VolunteerScheduleEditor` (dentro do formulário) e `PendingCollectionsCard`.
- Edge functions: `volunteer-push-subscribe` e `volunteer-collection-reminders` (web-push com VAPID, service role), cron via pg_cron/pg_net.
