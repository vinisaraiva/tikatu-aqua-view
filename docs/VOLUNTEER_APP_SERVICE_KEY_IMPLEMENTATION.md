# Implementação Service Key para App dos Voluntários

## 1. Obter Service Key

1. Acesse o dashboard do Supabase: https://supabase.com/dashboard/project/okduzgpkahddkdpzibua/settings/api
2. Vá em "Settings" > "API"
3. Copie a `service_role` key (não a `anon` key)
4. **IMPORTANTE**: Esta chave dá acesso total ao banco, mantenha-a segura

## 2. Configuração no App React Native/Cursor

### Criar cliente Supabase com Service Key

```typescript
// supabaseService.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://okduzgpkahddkdpzibua.supabase.co";
// Substitua pela sua service_role key real
const SUPABASE_SERVICE_KEY = "sua_service_role_key_aqui";

export const supabaseService = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
```

### Função de Upload de Arquivo

```typescript
// fileUpload.ts
import { supabaseService } from './supabaseService';
import XLSX from 'xlsx';

export interface UploadResult {
  success: boolean;
  message: string;
  filePath?: string;
}

export const uploadVolunteerFile = async (
  volunteerCode: string,
  fileUri: string,
  fileName?: string
): Promise<UploadResult> => {
  try {
    // Validar volunteer_code existe e está ativo
    const { data: volunteer, error: volunteerError } = await supabaseService
      .from('volunteers')
      .select('code, is_active')
      .eq('code', volunteerCode)
      .eq('is_active', true)
      .single();

    if (volunteerError || !volunteer) {
      return {
        success: false,
        message: 'Código de voluntário inválido ou inativo'
      };
    }

    // Gerar nome do arquivo se não fornecido
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const finalFileName = fileName || `${dateStr}_${timeStr}_coleta.xlsx`;

    // Validar formato do nome do arquivo
    if (!/^\d{8}_\d{6}_coleta\.xlsx$/.test(finalFileName)) {
      return {
        success: false,
        message: 'Nome do arquivo deve seguir o formato: YYYYMMDD_HHMMSS_coleta.xlsx'
      };
    }

    // Criar path: volunteer_code/YYYY-MM/filename
    const yearMonth = now.toISOString().slice(0, 7); // YYYY-MM
    const filePath = `${volunteerCode}/${yearMonth}/${finalFileName}`;

    // Verificar se arquivo já existe
    const { data: existingFile } = await supabaseService.storage
      .from('coleta-voluntarios')
      .list(volunteerCode + '/' + yearMonth, {
        search: finalFileName
      });

    if (existingFile && existingFile.length > 0) {
      return {
        success: false,
        message: 'Arquivo já existe para esta data/hora'
      };
    }

    // Ler arquivo como blob
    const response = await fetch(fileUri);
    const blob = await response.blob();

    // Validar tamanho (máximo 10MB)
    if (blob.size > 10 * 1024 * 1024) {
      return {
        success: false,
        message: 'Arquivo muito grande (máximo 10MB)'
      };
    }

    // Fazer upload
    const { data, error } = await supabaseService.storage
      .from('coleta-voluntarios')
      .upload(filePath, blob, {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        duplex: 'half'
      });

    if (error) {
      return {
        success: false,
        message: `Erro no upload: ${error.message}`
      };
    }

    return {
      success: true,
      message: 'Arquivo enviado com sucesso!',
      filePath: data.path
    };

  } catch (error) {
    return {
      success: false,
      message: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
};
```

### Exemplo de Uso no Componente

```typescript
// UploadComponent.tsx
import React, { useState } from 'react';
import { uploadVolunteerFile } from './fileUpload';

const UploadComponent = () => {
  const [volunteerCode, setVolunteerCode] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (fileUri: string) => {
    if (!volunteerCode.trim()) {
      alert('Código do voluntário é obrigatório');
      return;
    }

    setUploading(true);
    
    const result = await uploadVolunteerFile(volunteerCode, fileUri);
    
    if (result.success) {
      alert(`Sucesso: ${result.message}`);
    } else {
      alert(`Erro: ${result.message}`);
    }
    
    setUploading(false);
  };

  return (
    // Sua UI aqui
    <div>
      <input 
        value={volunteerCode}
        onChange={(e) => setVolunteerCode(e.target.value)}
        placeholder="Código do Voluntário"
      />
      <button 
        onClick={() => handleFileUpload('/path/to/file')}
        disabled={uploading}
      >
        {uploading ? 'Enviando...' : 'Enviar Arquivo'}
      </button>
    </div>
  );
};
```

## 3. Vantagens desta Abordagem

- ✅ **Simples**: Sem complexidade de autenticação
- ✅ **Rápido**: Funciona imediatamente
- ✅ **Controle total**: Service key bypassa RLS
- ✅ **Validação no código**: Controle completo das regras

## 4. Considerações de Segurança

- ⚠️ **Service key visível**: Pode ser extraída do app
- ⚠️ **Sem auditoria**: Não há log de qual usuário fez upload
- ⚠️ **Acesso total**: Service key pode fazer qualquer operação

## 5. Próximos Passos

1. Obter a service_role key do dashboard Supabase
2. Integrar o código acima no app dos voluntários
3. Testar upload com volunteer_code válido
4. Implementar tratamento de erros adequado
5. Adicionar logs para debugging se necessário