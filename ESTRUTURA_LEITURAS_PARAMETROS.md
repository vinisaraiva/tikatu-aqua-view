# Estrutura das Tabelas de Leituras e Parâmetros de Qualidade da Água

## 🔗 Diagrama de Relacionamentos

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌────────────────┐    ┌──────────────┐
│  cities  │───▶│  rivers  │───▶│  points  │───▶│ readings │───▶│ reading_values │◀───│  parameters  │
│          │ 1:N│          │ 1:N│          │ 1:N│          │ 1:N│                │ N:1 │              │
└──────────┘    └──────────┘    └──────────┘    └────┬─────┘    └────────────────┘    └──────────────┘
                                                     │
                                                     │ N:1
                                                     ▼
                                              ┌──────────────┐    ┌──────────────────┐
                                              │  volunteers  │◀───│ volunteer_points  │
                                              │              │ 1:N│                  │
                                              └──────────────┘    └──────────────────┘
                                                                          │
                                                                          │ N:1
                                                                          ▼
                                                                    ┌──────────┐
                                                                    │  points  │
                                                                    └──────────┘
```

---

## 📋 Tabelas Detalhadas

### 1. `cities` — Cidades Monitoradas

| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|:-----------:|--------|-----------|
| `id` | INTEGER | ✅ | Auto increment | Identificador único da cidade |
| `name` | TEXT | ✅ | — | Nome da cidade |
| `state` | TEXT | ❌ | NULL | Sigla do estado (ex: BA, PA) |
| `created_at` | TIMESTAMP WITH TIME ZONE | ✅ | `now()` | Data de cadastro |

**RLS:** Leitura pública; gerenciamento restrito a admins.

---

### 2. `rivers` — Rios Monitorados

| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|:-----------:|--------|-----------|
| `id` | INTEGER | ✅ | Auto increment | Identificador único do rio |
| `city_id` | INTEGER | ✅ | — | 🔗 FK → `cities.id` — Cidade onde o rio está localizado |
| `name` | TEXT | ✅ | — | Nome do rio |
| `created_at` | TIMESTAMP WITH TIME ZONE | ✅ | `now()` | Data de cadastro |

**RLS:** Leitura pública; gerenciamento restrito a admins.

---

### 3. `points` — Pontos de Coleta

| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|:-----------:|--------|-----------|
| `id` | INTEGER | ✅ | Auto increment | Identificador único do ponto |
| `river_id` | INTEGER | ✅ | — | 🔗 FK → `rivers.id` — Rio onde o ponto está localizado |
| `name` | TEXT | ✅ | — | Nome/descrição do ponto de coleta |
| `latitude` | NUMERIC | ✅ | — | Latitude geográfica do ponto |
| `longitude` | NUMERIC | ✅ | — | Longitude geográfica do ponto |
| `created_at` | TIMESTAMP WITH TIME ZONE | ✅ | `now()` | Data de cadastro |

**RLS:** Leitura pública; gerenciamento restrito a admins.

---

### 4. `readings` — Leituras de Monitoramento

Tabela principal que registra cada evento de coleta realizado em um ponto.

| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|:-----------:|--------|-----------|
| `id` | INTEGER | ✅ | Auto increment | Identificador único da leitura |
| `point_id` | INTEGER | ✅ | — | 🔗 FK → `points.id` — Ponto onde a coleta foi realizada |
| `volunteer_id` | BIGINT | ❌ | NULL | 🔗 FK → `volunteers.id` — Voluntário/sonda que realizou a coleta |
| `measured_at` | TIMESTAMP WITH TIME ZONE | ✅ | `now()` | Data/hora em que a coleta foi realizada |
| `iqa_score` | NUMERIC | ❌ | NULL | Índice de Qualidade da Água calculado (0-100) |
| `iet_score` | NUMERIC | ❌ | NULL | Índice de Estado Trófico calculado |
| `collection_type` | TEXT | ✅ | `'manual'` | Tipo de coleta: `'manual'` ou `'automatica'` |
| `context` | JSONB | ❌ | `'{}'` | Dados contextuais extras em formato JSON |
| `chuva_48h` | BOOLEAN | ❌ | NULL | Houve chuva nas últimas 48h? (observação de campo) |
| `residuos_visiveis` | BOOLEAN | ❌ | NULL | Há resíduos visíveis no local? (observação de campo) |
| `cheiro_alterado` | BOOLEAN | ❌ | NULL | A água apresenta cheiro alterado? (observação de campo) |
| `cor_alterada` | BOOLEAN | ❌ | NULL | A água apresenta cor alterada? (observação de campo) |
| `volume_reduzido` | BOOLEAN | ❌ | NULL | O volume de água está visivelmente reduzido? (observação de campo) |
| `created_at` | TIMESTAMP WITH TIME ZONE | ✅ | `now()` | Data de inserção do registro no sistema |

**Campos de observação de campo:** `chuva_48h`, `residuos_visiveis`, `cheiro_alterado`, `cor_alterada` e `volume_reduzido` são dados visuais/sensoriais coletados pelo voluntário no momento da coleta, complementando os dados analíticos.

**RLS:** Leitura pública; inserção permitida para autenticados e anônimos; gerenciamento restrito a admins.

---

### 5. `reading_values` — Valores dos Parâmetros por Leitura

Tabela de junção que armazena o valor específico de cada parâmetro medido em uma leitura.

| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|:-----------:|--------|-----------|
| `reading_id` | INTEGER | ✅ | — | 🔗 FK → `readings.id` — Leitura à qual este valor pertence |
| `parameter_id` | INTEGER | ✅ | — | 🔗 FK → `parameters.id` — Parâmetro que foi medido |
| `value` | NUMERIC | ✅ | — | Valor numérico medido para o parâmetro |
| `created_at` | TIMESTAMP WITH TIME ZONE | ✅ | `now()` | Data de inserção do registro |

**Chave primária composta:** `(reading_id, parameter_id)` — cada parâmetro só pode ter um valor por leitura.

**RLS:** Leitura pública; inserção permitida para autenticados e anônimos; gerenciamento restrito a admins.

---

### 6. `parameters` — Parâmetros de Qualidade da Água

Define os parâmetros físico-químicos e biológicos monitorados, com seus limites CONAMA.

| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|:-----------:|--------|-----------|
| `id` | INTEGER | ✅ | Auto increment | Identificador único do parâmetro |
| `code` | TEXT | ✅ | — | Código curto único (ex: PH, OD, DBO) |
| `description` | TEXT | ✅ | — | Nome completo do parâmetro |
| `unit` | TEXT | ✅ | — | Unidade de medida (ex: mg/L, NTU, °C) |
| `conama_min` | NUMERIC | ❌ | NULL | Limite mínimo aceitável pela CONAMA 357/2005 |
| `conama_max` | NUMERIC | ❌ | NULL | Limite máximo aceitável pela CONAMA 357/2005 |
| `created_at` | TIMESTAMP WITH TIME ZONE | ✅ | `now()` | Data de cadastro |

**RLS:** Leitura pública; gerenciamento restrito a admins.

---

### 7. `volunteers` — Voluntários e Sondas

Registra voluntários humanos e sondas automáticas que realizam coletas.

| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|:-----------:|--------|-----------|
| `id` | BIGINT | ✅ | Auto increment | Identificador único do voluntário/sonda |
| `code` | TEXT | ✅ | — | Código único de identificação (ex: VOL-001, SONDA-01) |
| `nome` | TEXT | ❌ | NULL | Nome do voluntário ou descrição da sonda |
| `type` | TEXT | ✅ | `'manual'` | Tipo: `'manual'` (voluntário) ou `'automatica'` (sonda) |
| `is_active` | BOOLEAN | ✅ | `true` | Se o voluntário/sonda está ativo |
| `probe_model` | TEXT | ❌ | NULL | Modelo da sonda (para tipo automática) |
| `probe_serial` | TEXT | ❌ | NULL | Número de série da sonda |
| `api_key` | TEXT | ❌ | NULL | Chave de API para envio automático de dados |
| `password_hash` | TEXT | ❌ | NULL | Hash da senha para autenticação do voluntário |
| `last_communication` | TIMESTAMP WITH TIME ZONE | ❌ | NULL | Última vez que o voluntário/sonda enviou dados |
| `created_at` | TIMESTAMP WITH TIME ZONE | ❌ | `now()` | Data de cadastro |

**RLS:** Leitura pública (para validação de login); gerenciamento restrito a admins.

---

### 8. `volunteer_points` — Associação Voluntário ↔ Ponto de Coleta

Tabela de junção N:N entre voluntários e pontos de coleta.

| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|:-----------:|--------|-----------|
| `id` | UUID | ✅ | `gen_random_uuid()` | Identificador único da associação |
| `volunteer_id` | BIGINT | ✅ | — | 🔗 FK → `volunteers.id` — Voluntário associado |
| `point_id` | INTEGER | ✅ | — | 🔗 FK → `points.id` — Ponto de coleta associado |
| `is_primary` | BOOLEAN | ✅ | `false` | Se este é o ponto principal do voluntário |
| `created_at` | TIMESTAMP WITH TIME ZONE | ✅ | `now()` | Data da associação |

**RLS:** Leitura pública; gerenciamento restrito a admins.

---

## 🔬 Parâmetros Cadastrados no Sistema

| Código | Descrição | Unidade | CONAMA Mín | CONAMA Máx | Finalidade |
|--------|-----------|---------|:----------:|:----------:|------------|
| `PH` | Potencial Hidrogeniônico | — | 6,0 | 9,0 | Indica acidez/alcalinidade da água |
| `OD` | Oxigênio Dissolvido | mg/L | 5,0 | — | Essencial para vida aquática |
| `DBO` | Demanda Bioquímica de Oxigênio | mg/L | — | 5 | Indica carga orgânica biodegradável |
| `TURB` | Turbidez | NTU | — | 100 | Partículas em suspensão na água |
| `TEMP` | Temperatura | °C | — | 40 | Influencia processos biológicos |
| `COLI` | Coliformes Termotolerantes | NMP/100mL | — | 2.500 | Indicador de contaminação fecal |
| `NT` | Nitrogênio Total | mg/L | — | 2,18 | Nutriente; excesso causa eutrofização |
| `PT` | Fósforo Total | mg/L | — | 0,1 | Nutriente; excesso causa eutrofização |
| `TDS` | Sólidos Dissolvidos Totais | mg/L | — | 500 | Indica mineralização da água |
| `COND` | Condutividade Elétrica | µS/cm | — | — | Capacidade de conduzir corrente elétrica |
| `COR` | Cor Verdadeira | mg Pt/L | — | 75 | Indicador visual de qualidade |

> **Referência:** Resolução CONAMA 357/2005 — Classe 2 (águas doces)

---

## 📊 Índices Calculados

### IQA — Índice de Qualidade da Água

- **Escala:** 0 a 100
- **Armazenado em:** `readings.iqa_score`
- **Parâmetros utilizados:** OD, DBO, COLI, PH, TEMP, NT, PT, TURB, TDS
- **Classificação:**

| Faixa | Classificação | Cor |
|-------|--------------|-----|
| 91–100 | Ótima | 🟢 Azul |
| 71–90 | Boa | 🟢 Verde |
| 51–70 | Regular | 🟡 Amarelo |
| 26–50 | Ruim | 🟠 Laranja |
| 0–25 | Péssima | 🔴 Vermelho |

### IET — Índice de Estado Trófico

- **Armazenado em:** `readings.iet_score`
- **Parâmetro principal:** Fósforo Total (PT)
- **Classificação:**

| Faixa | Classificação |
|-------|--------------|
| ≤ 47 | Ultraoligotrófico |
| 47–52 | Oligotrófico |
| 52–59 | Mesotrófico |
| 59–63 | Eutrófico |
| 63–67 | Supereutrófico |
| > 67 | Hipereutrófico |

---

## 🔐 Resumo das Políticas RLS

| Tabela | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| `cities` | 🌐 Público | 🔒 Admin | 🔒 Admin | 🔒 Admin |
| `rivers` | 🌐 Público | 🔒 Admin | 🔒 Admin | 🔒 Admin |
| `points` | 🌐 Público | 🔒 Admin | 🔒 Admin | 🔒 Admin |
| `readings` | 🌐 Público | 🌐 Todos | 🔒 Admin | 🔒 Admin |
| `reading_values` | 🌐 Público | 🌐 Todos | 🔒 Admin | 🔒 Admin |
| `parameters` | 🌐 Público | 🔒 Admin | 🔒 Admin | 🔒 Admin |
| `volunteers` | 🌐 Público | 🔒 Admin | 🔒 Admin | 🔒 Admin |
| `volunteer_points` | 🌐 Público | 🔒 Admin | 🔒 Admin | 🔒 Admin |

---

## 📝 Fluxo de uma Coleta Completa

```
1. Voluntário vai ao ponto de coleta
   └─▶ volunteers.id + volunteer_points.point_id

2. Registra observações de campo
   └─▶ readings (chuva_48h, residuos_visiveis, cheiro_alterado, cor_alterada, volume_reduzido)

3. Mede os parâmetros com instrumentos
   └─▶ reading_values (parameter_id + value) para cada parâmetro medido

4. Sistema calcula índices
   └─▶ readings.iqa_score (baseado em 9 parâmetros)
   └─▶ readings.iet_score (baseado em Fósforo Total)

5. Dados ficam disponíveis no dashboard
   └─▶ Consultas juntam cities → rivers → points → readings → reading_values → parameters
```

---

*Última atualização: Abril 2026*
