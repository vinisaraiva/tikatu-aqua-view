# Prompt para Aplicativo Mobile dos Voluntários - Coleta de Dados de Qualidade da Água

## Visão Geral
Desenvolver um aplicativo React Native + Expo para voluntários coletarem dados de qualidade da água. O app deve processar arquivos XLSX da sonda de coleta, permitir inserção manual de dados, e sincronizar com Supabase.

## Stack Tecnológica
- **React Native** + **Expo** (SDK 51+)
- **TypeScript** (tipagem obrigatória)
- **Supabase** (auth, database, storage)
- **React Navigation** v6 (navegação)
- **React Hook Form** + **Zod** (formulários e validação)
- **AsyncStorage** (cache local)
- **Expo Location** (GPS)
- **Expo DocumentPicker** (seleção de arquivos)
- **Expo FileSystem** (manipulação de arquivos)
- **SheetJS/xlsx** (leitura e escrita de arquivos Excel)
- **Expo Camera** (fotos opcionais)

## Configuração Supabase
```typescript
const supabaseUrl = 'https://okduzgpkahddkdpzibua.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZHV6Z3BrYWhkZGtkcHppYnVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NDc3MDksImV4cCI6MjA2NTAyMzcwOX0.-CIuPMipeet_jpTjj6kAdn3YRqBWrvrSCxDtV82kIRw'
```

## Schema do Banco (Supabase)

### Tabela `volunteers`
```sql
- id: bigint (PK)
- point_id: integer (FK para points)
- code: text (código único do voluntário)
- password_hash: text (senha criptografada)
- is_active: boolean
- nome: text (nome do voluntário)
- created_at: timestamp
```

### Tabela `readings`
```sql
- id: integer (PK)
- point_id: integer (FK)
- measured_at: timestamp
- iqa_score: numeric (calculado)
- iet_score: numeric (calculado)
- cor_alterada: boolean
- cheiro_alterado: boolean
- chuva_48h: boolean
- residuos_visiveis: boolean
- volume_reduzido: boolean
- context: jsonb (metadados extras)
```

### Tabela `reading_values`
```sql
- reading_id: integer (FK)
- parameter_id: integer (FK)
- value: numeric
- created_at: timestamp
```

## Estrutura XLSX da Sonda

### Formato do Arquivo (sempre fixo):
```
ID | Model Name | Date | EC | EC(Unit) | TDS | TDS(Unit) | SALT(%) | SALT(TDS) | SALT(TDS)(Unit) | SALT(S.G.) | pH | Humidity(%) | ORP(mV) | H2(ppb) | H2(ppm) | DO(mg/L) | DO(%) | CF | CL(mg/L) | Temperature(°C) | Temperature(°F) | Location | Notes
```

### Exemplo de Linha de Dados:
```
1 | BLE-C600 | 2024-02-02 17:01:44 | 122 | uS/cm | 61 | ppm | 0.00 | 61 | ppm | 0.997 | 6.34 | - | 25 | - | - | - | - | - | - | 30.0 | 86.0 | Bahia Porto Seguro | 3
```

### Mapeamento XLSX → Parâmetros DB:
```typescript
const xlsxMapping = {
  'EC': { parameterCode: 'EC', column: 'EC', unit: 'EC(Unit)' },
  'TDS': { parameterCode: 'TDS', column: 'TDS', unit: 'TDS(Unit)' },
  'pH': { parameterCode: 'PH', column: 'pH' },
  'ORP(mV)': { parameterCode: 'ORP', column: 'ORP(mV)' },
  'DO(mg/L)': { parameterCode: 'OD', column: 'DO(mg/L)' },
  'Temperature(°C)': { parameterCode: 'TEMP', column: 'Temperature(°C)' },
  'CL(mg/L)': { parameterCode: 'CL', column: 'CL(mg/L)' }
}
```

### Tratamento de Dados:
- Valores "-" = dados não disponíveis (não inserir no banco)
- Data no formato: "YYYY-MM-DD HH:mm:ss"
- Valores numéricos podem conter unidades (separar)
- Validar tipos antes de inserir

## Parâmetros de Qualidade da Água
```typescript
const parameters = [
  { code: 'TEMP', description: 'Temperatura', unit: '°C', conama_min: null, conama_max: 40 },
  { code: 'PH', description: 'pH', unit: '', conama_min: 6, conama_max: 9 },
  { code: 'OD', description: 'Oxigênio Dissolvido', unit: 'mg/L', conama_min: 5, conama_max: null },
  { code: 'DBO', description: 'Demanda Bioquímica de Oxigênio', unit: 'mg/L', conama_min: null, conama_max: 3 },
  { code: 'COL_TERMO', description: 'Coliformes Termotolerantes', unit: 'NMP/100mL', conama_min: null, conama_max: 200 },
  { code: 'TURB', description: 'Turbidez', unit: 'UNT', conama_min: null, conama_max: 40 },
  { code: 'FOSFORO', description: 'Fósforo Total', unit: 'mg/L', conama_min: null, conama_max: 0.1 },
  { code: 'NITRATO', description: 'Nitrato', unit: 'mg/L', conama_min: null, conama_max: 10 },
  { code: 'EC', description: 'Condutividade Elétrica', unit: 'μS/cm', conama_min: null, conama_max: null },
  { code: 'TDS', description: 'Sólidos Dissolvidos Totais', unit: 'mg/L', conama_min: null, conama_max: 500 },
  { code: 'ORP', description: 'Potencial de Oxirredução', unit: 'mV', conama_min: null, conama_max: null },
  { code: 'CL', description: 'Cloro Livre', unit: 'mg/L', conama_min: null, conama_max: 0.01 }
]
```

## Funcionalidades Obrigatórias

### 1. Tela de Login
- Input: código do voluntário + senha
- Validação: verificar tabela `volunteers` (code + password_hash)
- Armazenar dados do voluntário logado (AsyncStorage)
- Buscar e exibir: cidade, rio, ponto de coleta associado

### 2. Dashboard Principal
- **Cabeçalho**: Nome do voluntário, cidade, rio, ponto
- **Botões principais**:
  - "Importar Dados da Sonda" (XLSX)
  - "Nova Coleta Manual"
  - "Histórico de Coletas"
  - "Sair"
- **Estatísticas**: Total de coletas do mês, última coleta

### 3. Tela de Importação XLSX
- **Seletor de arquivo**: DocumentPicker para arquivos .xlsx
- **Validação do arquivo**:
  - Verificar cabeçalho obrigatório
  - Validar formato das colunas
  - Verificar se há dados para processar
- **Preview dos dados**:
  - Mostrar lista das coletas encontradas no arquivo
  - Data/hora de cada coleta
  - Parâmetros disponíveis
  - Indicar duplicatas (se existirem)
- **Verificação de duplicatas**:
  - Comparar point_id + measured_at com banco
  - Alertar usuário sobre coletas já existentes
  - Opção: sobrescrever, pular, ou cancelar
- **Processamento**:
  - Para cada linha válida, abrir tela de fatores ambientais
  - Inserir dados no banco após confirmação
  - Adicionar colunas de fatores ambientais no XLSX
  - Upload do arquivo modificado para Storage

### 4. Tela de Fatores Ambientais
**Utilizada tanto para importação XLSX quanto coleta manual**
- **Contexto**: Mostrar data/hora da coleta sendo processada
- **Perguntas obrigatórias**:
  - "A cor da água está alterada?" (Sim/Não)
  - "O cheiro da água está alterado?" (Sim/Não)
  - "Choveu nas últimas 48 horas?" (Sim/Não)
  - "Há resíduos sólidos visíveis?" (Sim/Não)
  - "O volume da água está reduzido?" (Sim/Não)
- **Campos opcionais**:
  - Observações gerais (texto)
  - Foto do local (câmera)
- **Ações**: Confirmar e processar, ou voltar

### 5. Tela de Coleta Manual
- **Informações básicas**: Data/hora (atual), localização GPS
- **Entrada de parâmetros**:
  - Lista todos os parâmetros disponíveis
  - Input numérico para cada valor
  - Mostrar unidade e limites CONAMA
  - Indicador visual: conforme/não conforme
- **Validação**: Valores obrigatórios e rangos aceitáveis
- **Fluxo**: Após preencher → Tela de Fatores Ambientais

### 6. Tela de Histórico
- **Lista de coletas**: Ordenadas por data (mais recente primeiro)
- **Filtros**: Por data, status CONAMA
- **Detalhes por coleta**:
  - Data/hora
  - Parâmetros medidos
  - Status CONAMA (conforme/não conforme)
  - Fatores ambientais
  - Observações
- **Ações**: Ver detalhes, excluir (se permitido)

## Funcionalidades Técnicas

### 1. Autenticação Customizada
```typescript
// Não usar auth.users do Supabase, usar tabela volunteers
const authenticateVolunteer = async (code: string, password: string) => {
  const { data } = await supabase
    .from('volunteers')
    .select(`
      *,
      point:points(
        *,
        river:rivers(
          *,
          city:cities(*)
        )
      )
    `)
    .eq('code', code)
    .eq('is_active', true)
    .single()
  
  // Verificar senha com bcrypt ou similar
  return data
}
```

### 2. Processamento XLSX
```typescript
const processXLSXFile = async (fileUri: string) => {
  // Ler arquivo
  const fileContent = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64
  })
  
  // Parse XLSX
  const workbook = XLSX.read(fileContent, { type: 'base64' })
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json(worksheet)
  
  // Validar cabeçalho
  const expectedHeaders = ['ID', 'Model Name', 'Date', 'EC', 'pH', ...]
  
  // Processar cada linha
  for (const row of data) {
    const reading = await processReadingRow(row)
    // Verificar duplicatas, solicitar fatores ambientais, inserir
  }
  
  // Adicionar colunas de fatores ambientais
  // Salvar arquivo modificado
  // Upload para Storage
}
```

### 3. Inserção de Dados
```typescript
const insertReading = async (readingData: ReadingData) => {
  // 1. Inserir reading
  const { data: reading } = await supabase
    .from('readings')
    .insert({
      point_id: volunteer.point_id,
      measured_at: readingData.date,
      cor_alterada: readingData.factors.cor_alterada,
      cheiro_alterado: readingData.factors.cheiro_alterado,
      chuva_48h: readingData.factors.chuva_48h,
      residuos_visiveis: readingData.factors.residuos_visiveis,
      volume_reduzido: readingData.factors.volume_reduzido
    })
    .select()
    .single()
  
  // 2. Inserir reading_values
  const values = readingData.parameters.map(param => ({
    reading_id: reading.id,
    parameter_id: param.id,
    value: param.value
  }))
  
  await supabase
    .from('reading_values')
    .insert(values)
}
```

### 4. Upload de XLSX Modificado
```typescript
const uploadModifiedXLSX = async (originalFile: string, factors: FactorsData[]) => {
  // Adicionar colunas: Cor_Alterada, Cheiro_Alterado, Chuva_48h, Residuos_Visiveis, Volume_Reduzido
  // Valores: "Sim"/"Não"
  
  const fileName = `coletas/${volunteer.code}/${Date.now()}_coleta.xlsx`
  
  const { data, error } = await supabase.storage
    .from('volunteer-collections')
    .upload(fileName, modifiedFileBuffer)
  
  return data?.path
}
```

### 5. Verificação de Duplicatas
```typescript
const checkDuplicateReading = async (pointId: number, measuredAt: string) => {
  const { data } = await supabase
    .from('readings')
    .select('id')
    .eq('point_id', pointId)
    .eq('measured_at', measuredAt)
    .maybeSingle()
  
  return !!data
}
```

## Diretrizes de Design

### Paleta de Cores
- **Primária**: Azul (#0066CC) para água
- **Secundária**: Verde (#00AA44) para conformidade CONAMA
- **Alerta**: Vermelho (#CC0000) para não conformidade
- **Neutros**: Cinzas para textos e fundos

### Componentes UI
- **Cards**: Para exibir coletas e parâmetros
- **Badges**: Para status CONAMA (conforme/não conforme)
- **Progress Indicators**: Para upload e processamento
- **Forms**: Campos limpos com validação visual
- **Modals**: Para confirmações e alertas

### Layout
- **Bottom Tab Navigation**: Dashboard, Histórico, Perfil
- **Stack Navigation**: Para fluxos de coleta
- **Pull-to-refresh**: Em listas de histórico
- **Floating Action Button**: Para nova coleta rápida

## Comportamentos Específicos

### 1. Modo Offline
- **Cache local**: Salvar coletas não sincronizadas
- **Sincronização**: Enviar dados quando conectar
- **Indicadores**: Mostrar status de sincronização
- **Validação**: Funcionar sem internet para coleta manual

### 2. Validação de Dados
- **Campos obrigatórios**: Data, pelo menos um parâmetro
- **Ranges**: Validar valores dentro de limites razoáveis
- **Formatos**: Data/hora, coordenadas GPS, valores numéricos
- **XLSX**: Validar estrutura e conteúdo do arquivo

### 3. GPS e Localização
- **Permissões**: Solicitar acesso à localização
- **Coordenadas**: Salvar lat/lng de cada coleta
- **Precisão**: Mostrar precisão do GPS
- **Offline**: Funcionar sem GPS (usar última localização)

### 4. Tratamento de Fotos
- **Compressão**: Reduzir tamanho antes do upload
- **Upload**: Para Storage do Supabase
- **Associação**: Vincular foto à coleta
- **Visualização**: Preview antes de salvar

### 5. Feedback ao Usuário
- **Loading states**: Durante processamento XLSX e uploads
- **Toast messages**: Sucessos e erros
- **Progress bars**: Para operações longas
- **Confirmações**: Para ações irreversíveis

### 6. Logout
- **Limpar cache**: AsyncStorage e dados sensíveis
- **Confirmar**: Sincronização pendente
- **Retornar**: Tela de login

## Estrutura de Navegação

```
App
├── AuthStack
│   └── LoginScreen
└── MainStack
    ├── BottomTabs
    │   ├── DashboardTab
    │   │   ├── DashboardScreen
    │   │   ├── XLSXImportScreen
    │   │   ├── ManualCollectionScreen
    │   │   └── EnvironmentalFactorsScreen
    │   ├── HistoryTab
    │   │   ├── HistoryScreen
    │   │   └── ReadingDetailScreen
    │   └── ProfileTab
    │       └── ProfileScreen
    └── Modals
        ├── ConfirmationModal
        ├── DuplicateAlertModal
        └── ErrorModal
```

## Considerações Importantes

1. **Performance**: Otimizar processamento de arquivos XLSX grandes
2. **Segurança**: Validar dados antes de inserir no banco
3. **Usabilidade**: Interface intuitiva para voluntários não técnicos
4. **Confiabilidade**: Tratamento robusto de erros e edge cases
5. **Manutenibilidade**: Código bem documentado e modular

## Bibliotecas Específicas para XLSX

```bash
npm install xlsx
npm install expo-document-picker
npm install expo-file-system
```

**Importante**: O app deve ser robusto no processamento de XLSX, validar todos os dados antes da inserção, e sempre fazer backup dos arquivos originais no Storage.