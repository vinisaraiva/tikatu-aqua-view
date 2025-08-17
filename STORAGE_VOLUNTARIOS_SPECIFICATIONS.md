# Storage para Aplicativo de Voluntários - Especificações Técnicas

## Bucket de Storage: `coleta-voluntarios`

### Configuração Geral
- **Nome do Bucket**: `coleta-voluntarios`
- **Tipo**: Privado (public: false)
- **Finalidade**: Armazenar arquivos XLSX processados com fatores ambientais adicionados pelos voluntários

### Estrutura de Pastas e Nomenclatura

#### Organização de Pastas
```
coleta-voluntarios/
├── {volunteer_code}/
│   ├── 2024-01/
│   │   ├── 20240115_143022_coleta.xlsx
│   │   ├── 20240118_091245_coleta.xlsx
│   │   └── ...
│   ├── 2024-02/
│   │   └── ...
│   └── ...
└── ...
```

#### Convenção de Nomenclatura dos Arquivos
**Formato**: `{YYYYMMDD}_{HHMMSS}_coleta.xlsx`

**Exemplo**: `20240115_143022_coleta.xlsx`
- `20240115`: Data da coleta (15 de janeiro de 2024)
- `143022`: Horário da coleta (14:30:22)
- `coleta`: Identificador fixo do tipo de arquivo
- `.xlsx`: Extensão do arquivo

### Políticas RLS (Row Level Security)

#### 1. Política de Visualização (SELECT)
```sql
CREATE POLICY "Volunteers can view their own files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'coleta-voluntarios' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### 2. Política de Upload (INSERT)
```sql
CREATE POLICY "Volunteers can upload their own files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'coleta-voluntarios' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND (storage.filename(name)) ~ '^[0-9]{8}_[0-9]{6}_coleta\.xlsx$'
);
```

#### 3. Política de Atualização (UPDATE)
```sql
CREATE POLICY "Volunteers can update their own files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'coleta-voluntarios' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### 4. Política de Exclusão (DELETE)
```sql
CREATE POLICY "Volunteers can delete their own files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'coleta-voluntarios' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Fluxo de Upload de Arquivo XLSX

#### Processo Completo
1. **Receber XLSX original** da sonda/equipamento
2. **Processar dados** e extrair leituras
3. **Coletar fatores ambientais** do usuário na tela específica
4. **Adicionar colunas de fatores ambientais** ao XLSX original
5. **Salvar XLSX modificado** no Storage
6. **Inserir dados** nas tabelas `readings` e `reading_values`

#### Estrutura das Novas Colunas Adicionadas ao XLSX

Após o processamento, o arquivo XLSX original receberá as seguintes colunas adicionais:

| Coluna | Nome em Português | Tipo | Descrição |
|--------|------------------|------|-----------|
| `cor_alterada` | Cor Alterada | BOOLEAN | TRUE se a cor da água estava alterada |
| `cheiro_alterado` | Cheiro Alterado | BOOLEAN | TRUE se havia cheiro alterado na água |
| `chuva_48h` | Chuva nas Últimas 48h | BOOLEAN | TRUE se choveu nas últimas 48 horas |
| `residuos_visiveis` | Resíduos Visíveis | BOOLEAN | TRUE se havia resíduos sólidos visíveis |
| `volume_reduzido` | Volume Reduzido | BOOLEAN | TRUE se o volume do rio estava reduzido |
| `observacoes` | Observações | TEXT | Campo livre para observações adicionais |
| `foto_local` | Nome da Foto | TEXT | Nome do arquivo de foto tirada no local (opcional) |

#### Exemplo de Estrutura Final do XLSX
```
Data/Hora | Temp(°C) | pH | OD(mg/L) | ... | Cor Alterada | Cheiro Alterado | Chuva 48h | Resíduos | Volume Reduzido | Observações | Foto
----------|----------|----|-----------|----|--------------|-----------------|-----------|----------|-----------------|-------------|------
15/01/24  |   25.3   |7.2 |    8.5    | ...|     SIM      |      NÃO        |    SIM    |   NÃO    |      NÃO        | Água clara  | IMG001.jpg
```

### Implementação no React Native

#### 1. Upload de Arquivo
```typescript
const uploadModifiedXLSX = async (
  volunteerCode: string,
  modifiedWorkbook: XLSX.WorkBook,
  originalFileName: string
) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, -5);
  const fileName = `${timestamp}_coleta.xlsx`;
  const folderPath = `${volunteerCode}/${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const filePath = `${folderPath}/${fileName}`;
  
  // Converter workbook para buffer
  const buffer = XLSX.write(modifiedWorkbook, { type: 'buffer', bookType: 'xlsx' });
  
  // Upload para Supabase
  const { data, error } = await supabase.storage
    .from('coleta-voluntarios')
    .upload(filePath, buffer, {
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      upsert: false
    });
    
  if (error) throw error;
  return data;
};
```

#### 2. Validação de Arquivo
```typescript
const validateXLSXUpload = (fileName: string): boolean => {
  const regex = /^[0-9]{8}_[0-9]{6}_coleta\.xlsx$/;
  return regex.test(fileName);
};
```

#### 3. Listagem de Arquivos do Voluntário
```typescript
const listVolunteerFiles = async (volunteerCode: string) => {
  const { data, error } = await supabase.storage
    .from('coleta-voluntarios')
    .list(volunteerCode, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' }
    });
    
  if (error) throw error;
  return data;
};
```

### Tratamento de Erros Específicos

#### 1. Erro de Política RLS
```typescript
if (error?.message?.includes('RLS policy')) {
  throw new Error('Você não tem permissão para fazer upload nesta pasta');
}
```

#### 2. Erro de Nomenclatura
```typescript
if (error?.message?.includes('policy violation')) {
  throw new Error('Nome do arquivo inválido. Use o formato: YYYYMMDD_HHMMSS_coleta.xlsx');
}
```

#### 3. Erro de Tamanho
```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
if (fileSize > MAX_FILE_SIZE) {
  throw new Error('Arquivo muito grande. Tamanho máximo: 10MB');
}
```

### Sincronização e Backup

#### 1. Verificação de Duplicatas
```typescript
const checkDuplicateFile = async (filePath: string): Promise<boolean> => {
  const { data } = await supabase.storage
    .from('coleta-voluntarios')
    .list(path.dirname(filePath));
    
  return data?.some(file => file.name === path.basename(filePath)) || false;
};
```

#### 2. Retry em Caso de Falha
```typescript
const uploadWithRetry = async (filePath: string, file: Buffer, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await supabase.storage.from('coleta-voluntarios').upload(filePath, file);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

### Monitoramento e Logs

#### 1. Log de Upload
```typescript
const logUpload = async (volunteerCode: string, fileName: string, status: string) => {
  console.log(`[UPLOAD] Volunteer: ${volunteerCode}, File: ${fileName}, Status: ${status}`);
  // Opcional: Salvar em tabela de logs
};
```

#### 2. Métricas de Storage
- Número de arquivos por voluntário
- Tamanho total de storage usado
- Taxa de sucesso de uploads
- Tempo médio de upload

### Considerações de Performance

1. **Compressão**: Arquivos XLSX já são comprimidos nativamente
2. **Upload Progressivo**: Implementar progress bar para uploads grandes
3. **Cache Local**: Manter lista de arquivos em cache para acesso offline
4. **Limpeza Automática**: Considerar política de retenção (ex: 1 ano)

### Segurança

1. **Validação de Conteúdo**: Verificar se é realmente um arquivo XLSX válido
2. **Sanitização**: Limpar nomes de arquivo de caracteres especiais
3. **Auditoria**: Log de todas as operações de upload/download
4. **Criptografia**: Arquivos são criptografados automaticamente pelo Supabase

### Integração com Outras Funcionalidades

#### 1. Histórico de Coletas
- Listar arquivos XLSX por período
- Mostrar preview dos dados de cada arquivo
- Permitir re-download de arquivos anteriores

#### 2. Sincronização de Dados
- Verificar se dados do arquivo já foram inseridos no banco
- Permitir re-processamento em caso de erro
- Manter referência entre `readings` e arquivo XLSX original

#### 3. Relatórios
- Gerar relatórios baseados nos arquivos armazenados
- Exportar dados consolidados
- Análise temporal dos dados coletados