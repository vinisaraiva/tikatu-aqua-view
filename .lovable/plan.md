
## Plano: Gate de acesso temporário ao site com senha única

Solução temporária para proteger o site público enquanto o artigo científico é finalizado. Apenas uma senha única compartilhada, sem cadastro, sem recuperação. A área `/admin` continua usando o login Supabase já existente (não muda).

### Arquitetura de segurança (boas práticas)

A senha **NUNCA** fica no código frontend nem no banco em texto puro. Ela é validada server-side via Edge Function do Supabase.

```text
[Tela /acesso]  --senha-->  [Edge Function: verify-site-access]
                                      |
                                      | compara com hash bcrypt em SITE_ACCESS_HASH (secret)
                                      v
                            retorna { token, expiresAt }
                                      |
        token HMAC assinado guardado em sessionStorage com expiração
                                      |
        AccessGate (wrapper de rotas) valida o token a cada navegação
```

Decisões-chave:
- **Senha como secret** (`SITE_ACCESS_HASH`) — armazenada como hash bcrypt, nunca em texto puro, nunca no frontend, nunca no Git.
- **Token de sessão assinado (HMAC SHA-256)** gerado pela edge function com `SITE_ACCESS_TOKEN_SECRET`, contendo apenas `{ exp }`. Dura 12 horas e é guardado em `sessionStorage` (limpa ao fechar o navegador).
- **Rate limiting** simples na edge function (5 tentativas / 15 min por IP, em memória) para mitigar brute-force.
- **Validação server-side do token** numa segunda edge function leve (`verify-site-token`) chamada na inicialização do app — evita que alguém forje token no client.
- **Não interfere no Supabase Auth** do `/admin` (são camadas independentes).

### O que será criado/alterado

**1. Edge Functions** (Supabase, deploy automático)
- `supabase/functions/verify-site-access/index.ts` — recebe `{ password }`, compara com hash bcrypt, retorna token HMAC assinado + `expiresAt`. Rate limit por IP.
- `supabase/functions/verify-site-token/index.ts` — recebe `{ token }`, valida assinatura HMAC e expiração, retorna `{ valid: true/false }`.
- Configuradas em `supabase/config.toml` como públicas (`verify_jwt = false`).

**2. Secrets (via add_secret tool)**
- `SITE_ACCESS_HASH` — hash bcrypt da senha escolhida pelo usuário.
- `SITE_ACCESS_TOKEN_SECRET` — string aleatória ≥ 32 chars para assinar tokens HMAC.

Eu vou pedir esses dois secrets durante a implementação. Para o hash, eu gero a partir da senha em texto puro que você fornecer (e descarto a senha em texto puro depois).

**3. Frontend**
- `src/pages/SiteAccess.tsx` — tela de login centralizada, fundo com a imagem do hero (`/lovable-uploads/6c1c5451-...png`) com overlay escuro, card com logo Tikatu, campo senha, botão "Entrar". Sem link de cadastro nem recuperação.
- `src/hooks/useSiteAccess.ts` — gerencia token em `sessionStorage`, valida via edge function na carga, expõe `isAuthorized`, `loading`, `login`, `logout`.
- `src/components/AccessGate.tsx` — wrapper que envolve as rotas públicas. Se não autorizado → redireciona para `/acesso`. Mostra spinner durante validação inicial.
- `src/App.tsx` — rota `/acesso` pública; todas as outras rotas (exceto `/admin/*` que já tem auth próprio) ficam dentro do `<AccessGate>`.

**4. Fluxo de logout opcional**
- Pequeno botão discreto no `Footer` "Sair do acesso" que limpa o token e volta para `/acesso`. (Opcional — me avise se prefere sem.)

### Validação de input
- Zod no formulário: senha obrigatória, mínimo 1 char, máximo 200.
- Mensagem de erro genérica ("Senha incorreta") — não revela se o campo estava vazio ou errado.
- Sem logs de senha no console.

### O que NÃO vai mudar
- Estrutura do banco (nenhuma migração necessária).
- Login do `/admin` (continua igual, com Supabase Auth).
- Header, Footer, páginas existentes.

### Limitações aceitas (por ser temporário)
- Senha única compartilhada não rastreia quem entrou.
- Rate limit em memória da edge function reseta quando a função "esfria".
- `sessionStorage` é por aba (usuário precisa logar de novo em nova aba) — isso é uma feature de segurança, não um bug.

### Perguntas antes de começar
1. Qual a **senha** que você quer usar? (Me passe em mensagem privada que eu gero o hash bcrypt e configuro como secret — a senha em texto puro nunca entra no código nem no banco.)
2. Quer o botão discreto de "Sair do acesso" no Footer ou não?
3. Duração da sessão: 12h ok, ou prefere outro valor (ex: 24h, 7 dias)?
