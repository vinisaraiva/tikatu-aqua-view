# Corrigir "Coletas pendentes" mostrando coletas já feitas

## Causa confirmada

O card compara a agenda com a tabela `readings` filtrando `volunteer_id IS NOT NULL`.
Consultei o banco: **não existe nenhuma linha em `readings` com `volunteer_id` preenchido** (todas as 15 leituras mais recentes têm `volunteer_id` nulo). Ou seja, o filtro nunca encontra nada e toda ocorrência da agenda cai como "Pendente".

As coletas dos voluntários ficam registradas como planilhas no bucket `coleta-voluntarios`, no padrão `VOL368731/2026-08/20260803_144142_coleta.xlsx` (confirmado: upload em 03/08 às 14:41 UTC = 11:41 em Brasília). Ex.: 03/08 aparece como pendente no dashboard mesmo tendo upload feito naquele dia.

## O que fazer

1. **Passar a considerar os uploads do bucket como comprovação de coleta** no hook `useCollectionCompliance`:
   - listar os arquivos do bucket por prefixo do código do voluntário (meses dentro da janela de dias escolhida);
   - extrair data e hora do nome do arquivo (`YYYYMMDD_HHMMSS`) e também aceitar o formato antigo (`...-2025-12-13T15-21-06...`), convertendo de UTC para o horário de Brasília;
   - marcar a ocorrência da agenda como "Em dia" quando o horário do envio estiver dentro da tolerância, e "Fora do horário" quando houver envio no dia, mas fora da janela.

2. **Manter a checagem em `readings` como fonte adicional**, aceitando tanto `volunteer_id` igual ao da agenda quanto leituras do mesmo ponto no mesmo dia (para coletas antigas gravadas sem `volunteer_id`), para que registros feitos pelo painel também contem como coleta realizada.

3. **Mostrar o horário efetivo da coleta** na coluna de status (ex.: "enviado 11:41"), facilitando conferir por que algo ficou "Fora do horário".

Com isso, 03/08 (upload feito) deixa de aparecer como pendente; 31/07 e 05/08, que não têm envio, continuam corretamente como pendentes.

## Detalhes técnicos

- Arquivo principal: `src/hooks/admin/useCollectionCompliance.ts` (leitura via `supabase.storage.from('coleta-voluntarios').list(...)`, permitido para admin pelas policies atuais).
- Ajuste de exibição em `src/components/admin/volunteers/PendingCollectionsCard.tsx`.
- Sem mudança de banco de dados.
