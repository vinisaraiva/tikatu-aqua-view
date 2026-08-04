# Lembretes de coleta: cron sob demanda por agenda

## Ideia
Em vez de acordar a função a cada 15 minutos, o banco cria **um agendamento por horário realmente usado** nas agendas dos voluntários. Se só existe coleta às 08:00 em seg/qua/sex, a função roda exatamente 3 vezes por semana. Nada de execuções vazias.

Lembrete continua sendo **1 push por coleta prevista** (o registro em `volunteer_reminder_log` já evita repetição).

## Como funciona

1. Uma função no banco (`sync_volunteer_reminder_jobs`) lê `volunteer_schedules` ativas, agrupa por horário + dias da semana e:
   - remove os agendamentos antigos criados por ela;
   - cria um agendamento para cada combinação encontrada, chamando `volunteer-collection-reminders`.
2. Um gatilho em `volunteer_schedules` (insert/update/delete) chama essa função — então salvar a agenda no admin já ajusta o cron automaticamente.
3. O aviso é disparado ~10 minutos antes do horário previsto (ex.: agenda 08:00 → execução 07:50), para o voluntário receber o push antes da hora.

Fuso: as agendas são em horário de Brasília e o cron do banco roda em UTC, então a conversão (+3h) é feita na hora de montar o agendamento.

## Ajuste na função de lembrete
A janela de checagem passa a ser "10 min antes até o fim da tolerância (1h)", compatível com a execução única. Como a função é chamada exatamente no horário certo, ela encontra a agenda devida na primeira tentativa.

Opcional (recomendo incluir): um segundo agendamento por horário, **no fim da tolerância**, que envia um "cobrança" apenas se ainda não houve coleta no dia. Assim o voluntário recebe no máximo 2 avisos: o lembrete e a cobrança.

## Detalhes técnicos
- Extensões `pg_cron` e `pg_net` habilitadas.
- `sync_volunteer_reminder_jobs()` (security definer) monta expressões cron `MM HH * * D1,D2,...` com nomes prefixados `vol-reminder-` e usa `cron.unschedule`/`cron.schedule` com `net.http_post` para a URL da função.
- O agendamento contém URL do projeto + anon key, portanto é aplicado via ferramenta de dados (não migração versionada), enquanto a função e o gatilho vão em migração.
- Ajuste em `supabase/functions/volunteer-collection-reminders/index.ts`: janela `target - 10 … target + tolerance`, e suporte a `kind: 'overdue'` para a segunda passagem.
- Card "Coletas pendentes" no admin continua com o botão de envio manual, sem alteração.
