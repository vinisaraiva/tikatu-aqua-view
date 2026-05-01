## Plano aprovado: Tratamento amigável de erros no gate de acesso

### 1. Edge function `verify-site-access` — contrato padronizado

Substituir todas as respostas de erro esperadas por status **200** com payload `{ success: false, error: CODE, message: "..." }`. Status 4xx/5xx ficam apenas para falhas reais de servidor/protocolo.

| Situação | Antes | Depois |
|---|---|---|
| Senha incorreta | 401 `{error}` | 200 `{success:false, error:'INVALID_PASSWORD', message:'Senha incorreta'}` |
| Rate limit | 429 `{error}` | 200 `{success:false, error:'RATE_LIMITED', message:'Muitas tentativas...'}` |
| JSON inválido / senha vazia | 400 | 200 `{success:false, error:'INVALID_INPUT', message:'Senha inválida'}` |
| Servidor mal configurado | 500 | 500 (mantém — é falha real) |
| Sucesso | 200 `{token, expiresAt}` | 200 `{success:true, token, expiresAt}` |

Também: remover qualquer `console.log` que possa imprimir o body (auditei — só existe `console.error` de configuração ausente, sem dados sensíveis; mantém).

### 2. Hook `useSiteAccess.ts` — interpretar novo contrato

Atualizar `login()`:
- Ler `data.success`. Se `false`, mapear `data.error` → mensagem amigável.
- Mapeamento:
  - `INVALID_PASSWORD` → "Senha incorreta. Tente novamente."
  - `RATE_LIMITED` → "Muitas tentativas. Aguarde alguns minutos e tente novamente."
  - `INVALID_INPUT` → "Senha inválida."
  - default → "Não foi possível validar a senha. Tente novamente."
- Se `error` vier do `supabase.functions.invoke` (falha de rede/500 real), retornar mensagem genérica sem expor o texto técnico.

### 3. Auditoria de exposição (resultado)

Já verifiquei e confirmo:
- ✅ Senha **nunca** é gravada em `localStorage`/`sessionStorage` — só o token HMAC assinado é guardado.
- ✅ Senha **nunca** vai para URL — request é POST com body JSON.
- ✅ Hash `SITE_ACCESS_HASH` fica só como secret no servidor, nunca enviado ao cliente.
- ✅ Token HMAC contém apenas `{ exp }` no payload — sem senha, sem hash, sem dados do usuário.
- ✅ Inputs usam `type="password"` e `autoComplete="current-password"`.
- ✅ Comparação em tempo constante na edge function.
- ✅ Nenhum `console.log` registra senha ou hash.

Nenhuma alteração extra de segurança é necessária — apenas o ajuste de contrato acima.

### Arquivos alterados
- `supabase/functions/verify-site-access/index.ts`
- `src/hooks/useSiteAccess.ts`

`SiteAccess.tsx` já consome `result.error` corretamente, não precisa mudar.
