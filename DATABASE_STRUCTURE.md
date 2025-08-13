# Estrutura do Banco de Dados - Sistema de Monitoramento da Qualidade da Água

## Visão Geral

Este banco de dados foi projetado para monitorar a qualidade da água em rios brasileiros, seguindo parâmetros estabelecidos pelo CONAMA (Conselho Nacional do Meio Ambiente). O sistema permite:

- 📍 Gerenciamento hierárquico de localizações (Estados → Cidades → Rios → Pontos de Coleta)
- 🔬 Armazenamento de leituras de qualidade da água com múltiplos parâmetros
- 📊 Cálculo automático de índices IQA (Índice de Qualidade da Água) e IET (Índice de Estado Trófico)
- 🚨 Sistema de alertas personalizados por usuário
- 📰 Gestão de conteúdo e notícias
- 👤 Autenticação e perfis de usuário

## Arquitetura do Banco

### Tecnologias
- **PostgreSQL** (via Supabase)
- **Row Level Security (RLS)** para controle de acesso
- **Triggers automáticos** para timestamp e validações
- **Funções customizadas** para lógica de negócio

---

## 📊 Estrutura das Tabelas

### 1. **cities** - Cidades
Armazena informações das cidades onde há monitoramento.

```sql
TABLE cities (
  id               INTEGER PRIMARY KEY (AUTO INCREMENT),
  name             TEXT NOT NULL,
  state            TEXT,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
)
```

**Políticas RLS:**
- ✅ Leitura pública para todos

**Relacionamentos:**
- `cities` → `rivers` (1:N)

---

### 2. **rivers** - Rios
Rios monitorados em cada cidade.

```sql
TABLE rivers (
  id               INTEGER PRIMARY KEY (AUTO INCREMENT),
  city_id          INTEGER NOT NULL,
  name             TEXT NOT NULL,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
)
```

**Políticas RLS:**
- ✅ Leitura pública para todos

**Relacionamentos:**
- `rivers.city_id` → `cities.id`
- `rivers` → `points` (1:N)

---

### 3. **points** - Pontos de Coleta
Pontos específicos de coleta em cada rio.

```sql
TABLE points (
  id               INTEGER PRIMARY KEY (AUTO INCREMENT),
  river_id         INTEGER NOT NULL,
  name             TEXT NOT NULL,
  latitude         NUMERIC NOT NULL,
  longitude        NUMERIC NOT NULL,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
)
```

**Políticas RLS:**
- ✅ Leitura pública para todos

**Relacionamentos:**
- `points.river_id` → `rivers.id`
- `points` → `readings` (1:N)

---

### 4. **parameters** - Parâmetros de Qualidade
Parâmetros físico-químicos monitorados (pH, Oxigênio Dissolvido, etc.).

```sql
TABLE parameters (
  id               INTEGER PRIMARY KEY (AUTO INCREMENT),
  code             TEXT NOT NULL UNIQUE,
  description      TEXT NOT NULL,
  unit             TEXT NOT NULL,
  conama_min       NUMERIC,          -- Limite mínimo CONAMA
  conama_max       NUMERIC,          -- Limite máximo CONAMA
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
)
```

**Políticas RLS:**
- ✅ Leitura pública para todos

**Parâmetros Principais:**
- `pH` - Potencial Hidrogeniônico
- `OD` - Oxigênio Dissolvido (mg/L)
- `DBO` - Demanda Bioquímica de Oxigênio (mg/L)
- `TURB` - Turbidez (NTU)
- `TEMP` - Temperatura (°C)
- `COLI` - Coliformes Termotolerantes (NMP/100mL)

---

### 5. **readings** - Leituras de Monitoramento
Registro de cada coleta realizada em um ponto.

```sql
TABLE readings (
  id               INTEGER PRIMARY KEY (AUTO INCREMENT),
  point_id         INTEGER NOT NULL,
  measured_at      TIMESTAMP WITH TIME ZONE DEFAULT now(),
  iqa_score        NUMERIC,          -- Índice de Qualidade da Água calculado
  iet_score        NUMERIC,          -- Índice de Estado Trófico calculado
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
)
```

**Políticas RLS:**
- ✅ Leitura pública para todos
- ✅ Inserção permitida para usuários autenticados e anônimos

**Relacionamentos:**
- `readings.point_id` → `points.id`
- `readings` → `reading_values` (1:N)

---

### 6. **reading_values** - Valores dos Parâmetros
Valores específicos de cada parâmetro em uma leitura.

```sql
TABLE reading_values (
  reading_id       INTEGER NOT NULL,
  parameter_id     INTEGER NOT NULL,
  value            NUMERIC NOT NULL,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (reading_id, parameter_id)
)
```

**Políticas RLS:**
- ✅ Leitura pública para todos
- ✅ Inserção permitida para usuários autenticados e anônimos

**Relacionamentos:**
- `reading_values.reading_id` → `readings.id`
- `reading_values.parameter_id` → `parameters.id`

---

### 7. **profiles** - Perfis de Usuário
Informações adicionais dos usuários autenticados.

```sql
TABLE profiles (
  id               UUID PRIMARY KEY,      -- Referência para auth.users
  full_name        TEXT NOT NULL,
  role             TEXT DEFAULT 'user',
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
)
```

**Políticas RLS:**
- 🔒 Usuários podem ver/editar apenas seu próprio perfil
- ✅ Inserção automática via trigger

**Relacionamentos:**
- `profiles.id` → `auth.users.id` (Supabase Auth)

---

### 8. **alerts** - Alertas Personalizados
Sistema de alertas configurados pelos usuários.

```sql
TABLE alerts (
  id               INTEGER PRIMARY KEY (AUTO INCREMENT),
  user_id          UUID NOT NULL,
  point_id         INTEGER NOT NULL,
  parameter_id     INTEGER,
  alert_type       TEXT NOT NULL,        -- 'threshold', 'anomaly', etc.
  condition_type   TEXT NOT NULL,        -- 'above', 'below', 'equal'
  threshold_value  NUMERIC,
  is_active        BOOLEAN DEFAULT true,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
)
```

**Políticas RLS:**
- 🔒 Usuários podem gerenciar apenas seus próprios alertas

**Relacionamentos:**
- `alerts.user_id` → `auth.users.id`
- `alerts.point_id` → `points.id`
- `alerts.parameter_id` → `parameters.id`

---

### 9. **news** - Notícias e Conteúdo
Sistema de gestão de conteúdo para notícias e artigos.

```sql
TABLE news (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  summary          TEXT NOT NULL,
  content          TEXT NOT NULL,
  category         TEXT NOT NULL,
  author           TEXT NOT NULL,
  image_url        TEXT,
  read_time        TEXT DEFAULT '3 min',
  is_published     BOOLEAN DEFAULT true,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
)
```

**Políticas RLS:**
- ✅ Leitura pública para notícias publicadas
- 🔒 Usuários autenticados podem ver todas as notícias

---

## 🔄 Relacionamentos e Hierarquia

```
Estados (via cities.state)
    ↓
Cidades (cities)
    ↓
Rios (rivers)
    ↓
Pontos de Coleta (points)
    ↓
Leituras (readings)
    ↓
Valores dos Parâmetros (reading_values)
```

## 🔧 Funções do Banco de Dados

### 1. **handle_new_user()**
Trigger automático que cria um perfil na tabela `profiles` quando um novo usuário se registra.

```sql
CREATE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    'user'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. **update_updated_at_column()**
Trigger para atualizar automaticamente o campo `updated_at`.

```sql
CREATE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 📈 Consultas SQL Comuns

### Buscar todos os pontos de uma cidade
```sql
SELECT 
  p.id,
  p.name as point_name,
  p.latitude,
  p.longitude,
  r.name as river_name,
  c.name as city_name,
  c.state
FROM points p
JOIN rivers r ON p.river_id = r.id
JOIN cities c ON r.city_id = c.id
WHERE c.name = 'São Paulo';
```

### Últimas leituras de um ponto específico
```sql
SELECT 
  r.id,
  r.measured_at,
  r.iqa_score,
  r.iet_score,
  rv.value,
  p.code,
  p.description,
  p.unit
FROM readings r
LEFT JOIN reading_values rv ON r.id = rv.reading_id
LEFT JOIN parameters p ON rv.parameter_id = p.id
WHERE r.point_id = 1
ORDER BY r.measured_at DESC
LIMIT 10;
```

### Estatísticas por estado
```sql
SELECT 
  c.state,
  COUNT(DISTINCT c.id) as total_cities,
  COUNT(DISTINCT r.id) as total_rivers,
  COUNT(DISTINCT p.id) as total_points,
  COUNT(DISTINCT rd.id) as total_readings
FROM cities c
LEFT JOIN rivers r ON c.id = r.city_id
LEFT JOIN points p ON r.id = p.river_id
LEFT JOIN readings rd ON p.id = rd.point_id
WHERE c.state IS NOT NULL
GROUP BY c.state
ORDER BY total_readings DESC;
```

### Verificar conformidade CONAMA
```sql
SELECT 
  r.measured_at,
  p.name as point_name,
  param.code,
  rv.value,
  param.conama_min,
  param.conama_max,
  CASE 
    WHEN param.conama_min IS NOT NULL AND rv.value < param.conama_min THEN 'ABAIXO_LIMITE'
    WHEN param.conama_max IS NOT NULL AND rv.value > param.conama_max THEN 'ACIMA_LIMITE'
    ELSE 'CONFORME'
  END as conama_status
FROM reading_values rv
JOIN readings r ON rv.reading_id = r.id
JOIN points p ON r.point_id = p.id
JOIN parameters param ON rv.parameter_id = param.id
WHERE param.conama_min IS NOT NULL OR param.conama_max IS NOT NULL
ORDER BY r.measured_at DESC;
```

---

## 🔌 Integração com Outros Aplicativos

### Configuração da Conexão Supabase

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://okduzgpkahddkdpzibua.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZHV6Z3BrYWhkZGtkcHppYnVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NDc3MDksImV4cCI6MjA2NTAyMzcwOX0.-CIuPMipeet_jpTjj6kAdn3YRqBWrvrSCxDtV82kIRw'

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### Exemplos de Uso da API

#### Buscar pontos de coleta
```javascript
const { data: points, error } = await supabase
  .from('points')
  .select(`
    *,
    rivers (
      name,
      cities (
        name,
        state
      )
    )
  `)
```

#### Inserir nova leitura
```javascript
// 1. Inserir a leitura principal
const { data: reading, error } = await supabase
  .from('readings')
  .insert({
    point_id: 1,
    measured_at: new Date().toISOString(),
    iqa_score: 75.5,
    iet_score: 45.2
  })
  .select()
  .single()

// 2. Inserir os valores dos parâmetros
const { error: valuesError } = await supabase
  .from('reading_values')
  .insert([
    { reading_id: reading.id, parameter_id: 1, value: 7.2 }, // pH
    { reading_id: reading.id, parameter_id: 2, value: 8.5 }, // OD
    // ... outros parâmetros
  ])
```

#### Configurar alertas do usuário
```javascript
const { data, error } = await supabase
  .from('alerts')
  .insert({
    user_id: user.id,
    point_id: 1,
    parameter_id: 2, // Oxigênio Dissolvido
    alert_type: 'threshold',
    condition_type: 'below',
    threshold_value: 5.0,
    is_active: true
  })
```

---

## 🔐 Autenticação e Autorização

### Políticas de Acesso (RLS)

1. **Dados Públicos** (Leitura livre):
   - `cities`, `rivers`, `points`, `parameters`
   - `readings`, `reading_values`
   - `news` (apenas publicadas para não autenticados)

2. **Dados Privados** (Requer autenticação):
   - `profiles` - Usuários só veem seu próprio perfil
   - `alerts` - Usuários só gerenciam seus próprios alertas
   - `news` - Usuários autenticados veem todas as notícias

3. **Inserção de Dados**:
   - Leituras podem ser inseridas por usuários autenticados ou anônimos
   - Alertas só podem ser criados por usuários autenticados

### Níveis de Usuário

- **user** (padrão) - Pode visualizar dados e configurar alertas
- **admin** - Acesso total ao sistema
- **moderator** - Pode gerenciar conteúdo

---

## 📊 Estatísticas Atuais do Sistema

| Tabela | Registros | Descrição |
|--------|-----------|-----------|
| `cities` | 2 | Cidades cadastradas (BA, PA) |
| `rivers` | 4 | Rios monitorados |
| `points` | 11 | Pontos de coleta ativos |
| `parameters` | 11 | Parâmetros de qualidade configurados |
| `readings` | 11 | Leituras de monitoramento realizadas |
| `reading_values` | 44 | Valores individuais de parâmetros |
| `news` | 4 | Notícias publicadas |
| `alerts` | 0 | Alertas configurados por usuários |
| `profiles` | 0 | Perfis de usuário registrados |

### Estados Monitorados
- **Bahia (BA)** - 1 cidade
- **Pará (PA)** - 1 cidade

### Parâmetros de Qualidade Configurados
| Código | Descrição | Unidade | Limite CONAMA Min | Limite CONAMA Max |
|--------|-----------|---------|-------------------|-------------------|
| `COLI` | Coliformes Termotolerantes | NMP/100mL | - | 2.500 |
| `COND` | Condutividade Elétrica | µS/cm | - | - |
| `COR` | Cor Verdadeira | mg Pt/L | - | 75 |
| `DBO` | Demanda Bioquímica de Oxigênio | mg/L | - | 5 |
| `NT` | Nitrogênio Total | mg/L | - | 2,18 |
| `OD` | Oxigênio Dissolvido | mg/L | 5,0 | - |
| `PH` | Potencial Hidrogeniônico | - | 6,0 | 9,0 |
| `PT` | Fósforo Total | mg/L | - | 0,1 |
| `TDS` | Sólidos Dissolvidos Totais | mg/L | - | 500 |
| `TEMP` | Temperatura | °C | - | 40 |
| `TURB` | Turbidez | NTU | - | 100 |

---

## 🚀 Próximos Passos para Integração

1. **Configure sua conexão** com as credenciais fornecidas
2. **Teste as consultas básicas** com os exemplos acima
3. **Implemente autenticação** se precisar de funcionalidades privadas
4. **Configure webhooks** se precisar de notificações em tempo real
5. **Consulte a documentação** do Supabase para recursos avançados

---

## 📞 Suporte

- **Documentação Supabase**: https://supabase.com/docs
- **Dashboard do Projeto**: https://supabase.com/dashboard/project/okduzgpkahddkdpzibua
- **SQL Editor**: https://supabase.com/dashboard/project/okduzgpkahddkdpzibua/sql/new

---

*Última atualização: Janeiro 2025*