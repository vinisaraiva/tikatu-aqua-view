

## Plano: Criar arquivo `ESTRUTURA_LEITURAS_PARAMETROS.md`

### Ação
Criar um arquivo Markdown na raiz do projeto com a documentação completa das tabelas relacionadas a leituras e parâmetros de qualidade da água.

### Conteúdo do arquivo
O documento incluirá:

1. **Diagrama de relacionamentos** — Hierarquia completa: cities → rivers → points → readings → reading_values → parameters
2. **Tabela `cities`** — 4 campos (id, name, state, created_at)
3. **Tabela `rivers`** — 4 campos, relacionada a cities via city_id
4. **Tabela `points`** — 6 campos (inclui latitude/longitude), relacionada a rivers via river_id
5. **Tabela `readings`** — 14 campos incluindo campos de observação de campo (chuva_48h, residuos_visiveis, cheiro_alterado, cor_alterada, volume_reduzido), context jsonb, collection_type, volunteer_id, iqa_score, iet_score
6. **Tabela `reading_values`** — 4 campos, chave composta (reading_id + parameter_id)
7. **Tabela `parameters`** — 7 campos (code, description, unit, conama_min, conama_max)
8. **Tabela `volunteers`** — 11 campos (code, nome, type, probe_model, api_key, etc.)
9. **Tabela `volunteer_points`** — 5 campos, junção voluntário-ponto
10. **Tabela de parâmetros cadastrados** — 13 parâmetros atuais com limites CONAMA
11. **Explicação dos índices IQA e IET**
12. **Resumo das políticas RLS**

### Detalhes técnicos
- Arquivo: `ESTRUTURA_LEITURAS_PARAMETROS.md` na raiz do projeto
- Formato: Tabelas Markdown com campos, tipos, obrigatoriedade, padrão e descrição
- Diagrama ASCII dos relacionamentos
- Dados reais consultados do banco (13 parâmetros confirmados)

