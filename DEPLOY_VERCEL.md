# Publicação do frontend na Vercel

## Antes de publicar

O backend NestJS precisa estar disponível em uma URL HTTPS pública. Uma aplicação
publicada na Vercel não consegue chamar `localhost:4000` no computador do
desenvolvedor.

No painel da Vercel, cadastre estas variáveis nos ambientes Production e Preview:

- `NEXT_PUBLIC_API_URL`: URL HTTPS pública do backend, sem barra no final.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: chave pública da instância Clerk correta.
- `CLERK_SECRET_KEY`: chave secreta da mesma instância Clerk.

No ambiente do backend, configure:

- `FRONTEND_URLS`: domínio final da Vercel e `http://localhost:3000`, separados por vírgula.
- `CLERK_AUTHORIZED_PARTIES`: os mesmos endereços autorizados, separados por vírgula.
- `RH_ALLOWED_EMAILS`: exatamente os dois e-mails autorizados, separados por vírgula.

## Configuração do projeto

- Framework Preset: Next.js
- Root Directory: raiz deste repositório frontend
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: padrão do Next.js (não preencher)

Depois de alterar qualquer variável na Vercel, faça um novo deploy para ela entrar
no bundle de produção.
