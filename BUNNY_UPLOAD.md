# Bunny Stream — Fase 2

Esta integração é independente do editor atual. Materiais e vídeos já existentes
continuam utilizando seus fluxos anteriores. Nenhuma migração Prisma foi aplicada.

## Configuração

1. Crie uma biblioteca Stream no Bunny. Copie o Library ID e a API Key dessa
   biblioteca (não a chave global da conta).
2. No projeto frontend da Vercel, configure `BUNNY_LIBRARY_ID`, `BUNNY_API_KEY` e
   `BUNNY_UPLOAD_ALLOWED_ORIGINS`. A última variável contém as origens exatas que
   podem iniciar uploads, separadas por vírgula, sem barra final. Inclua apenas
   previews confiáveis; não libere todos os domínios Vercel.
3. Nenhuma dessas variáveis precisa de prefixo `NEXT_PUBLIC_`. Nunca coloque a
   chave em um componente React, no Git ou em logs. O `.env` existente não foi alterado.
4. Após publicar o commit e fazer o deploy com as variáveis, acesse
   `/admin/aulas/upload`. Localmente, use `npm install` e `npm run dev`.

A API exige sessão Clerk e e-mail **principal verificado**, limitado a
`pablohenrique2210@gmail.com` e `consultoria@lilianarruda.com.br`. Se o e-mail
autorizado for secundário na conta, torne-o principal no Clerk antes de testar.
A proteção de origem complementa a autenticação; não a substitui.

## Fluxo

Navegador → POST `/api/bunny/create` com JSON pequeno → Clerk/validação →
criação de vídeo no Bunny → assinatura SHA-256 limitada ao vídeo e a duas horas →
envio TUS direto do navegador para `https://video.bunnycdn.com/tusupload`.

O corpo contém `title`, `fileName`, `fileType`, `fileSize`. A resposta contém
`videoId`, `libraryId`, `expirationTime`, `signature`, `requestId`, nunca a API Key.
O componente oferece progresso, chunks de 8 MB e tentativas automáticas para
falhas transitórias. Não faz fallback para upload de vídeo via Railway/Vercel.
Não retoma uploads após recarregar a página: para isso é necessário persistir
a sessão e reemitir autorização para o mesmo vídeo. Um novo envio cria outro ID.

## Limites e próximas fases

- Upload completo não significa transcodificação pronta. O resultado fornece
  `bunnyVideoId` e `bunnyLibraryId` por `onUploaded`; a tela avisa que ainda não
  existe vínculo com uma aula. Não salva URL temporária no banco.
- Integrar esses IDs a uma aula exige autorização no backend, verificação do
  vídeo junto ao Bunny, persistência Prisma e acompanhamento do processamento
  por webhook validado ou consulta autenticada. Só então publicar o player HLS.
- Proteger reprodução de cursos privados exige autorização por matrícula e
  tokens de reprodução. Upload autenticado, sozinho, não protege o iframe.
- O Zod valida metadados declarados (MP4/WebM/MOV, até 5 GB); a assinatura TUS
  do Bunny não vincula tamanho/MIME. Isso não substitui verificar o objeto final.
- Antes de liberar em escala, adicionar rate limiting distribuído, auditoria,
  quotas por administrador e limpeza de vídeos criados com uploads abandonados.
- O endpoint não é idempotente: não repetir automaticamente a criação de sessão
  em timeout, pois o Bunny pode já ter criado o vídeo. Verifique órfãos no painel.

## Verificação

```sh
node --test tests/bunny-create.test.mjs
npx tsc --noEmit --incremental false
npx eslint app/api/bunny/create/route.ts components/courses/BunnyVideoUpload.tsx app/admin/aulas/upload/page.tsx tests/bunny-create.test.mjs
npm run build
```

Os testes de API usam Clerk e Bunny simulados e não criam vídeos reais.
Para teste integrado, use um pequeno vídeo de teste com conta autorizada;
confira o processamento no Bunny e, no navegador, que apenas assinatura e IDs
aparecem no tráfego — jamais `AccessKey`. Exclua o vídeo de teste pelo painel
quando não for mais necessário.

Referências: https://bunny.net/docs/stream/tus-resumable-uploads e
https://bunny.net/docs/api-reference/stream/manage-videos/create-video.
