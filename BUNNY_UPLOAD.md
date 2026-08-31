# Bunny Stream — editor e reprodução integrados

O editor de criação/edição agora envia vídeos diretamente ao Bunny. Materiais e
capas continuam no Blob. Vídeos antigos permanecem acessíveis até a substituição.
Nenhum arquivo foi transferido ou excluído automaticamente. Não exige migração Prisma.

## Configuração

1. Crie uma biblioteca Stream no Bunny. Copie o Library ID e a API Key dessa
   biblioteca (não a chave global da conta).
2. No projeto frontend da Vercel, configure `BUNNY_LIBRARY_ID`, `BUNNY_API_KEY` e
   `BUNNY_UPLOAD_ALLOWED_ORIGINS`. A última variável contém as origens exatas que
   podem iniciar uploads, separadas por vírgula, sem barra final. Inclua apenas
   previews confiáveis; não libere todos os domínios Vercel. O endereço exato do
   próprio deployment é acrescentado automaticamente quando `VERCEL=1` e
   `VERCEL_URL` contém um hostname válido da Vercel. Não é necessário cadastrar
   cada novo endereço de deployment manualmente. Domínios personalizados e
   aliases de branch continuam exigindo cadastro explícito nessa lista.
   Mantenha **Automatically expose System Environment Variables** habilitado
   nas configurações do projeto; não defina `VERCEL_URL` manualmente. Configure
   as variáveis Bunny nos ambientes usados (Production e/ou Preview) e faça um
   novo deploy. Cabeçalhos `Host`/`Origin` não determinam quais domínios são confiáveis.
3. Nenhuma dessas variáveis precisa de prefixo `NEXT_PUBLIC_`. Nunca coloque a
   chave em um componente React, no Git ou em logs. O `.env` existente não foi alterado.
4. No **backend Railway**, configure `BUNNY_LIBRARY_ID` (mesma biblioteca),
   `BUNNY_READ_ONLY_API_KEY` (Read-only API Key da biblioteca) e
   `BUNNY_EMBED_TOKEN_KEY` (chave de Embed View Token Authentication, em Security).
   O backend aceita `BUNNY_API_KEY` como alternativa à chave somente leitura.
5. No Bunny, habilite **Embed View Token Authentication** e autorize os domínios
   da plataforma. A chave de reprodução é diferente da chave usada para upload.
6. Publique **backend primeiro, frontend depois**, com estas alterações e variáveis.
   Redeploy de um commit antigo não inclui a integração. Localmente: `npm install`
   e `npm run dev` no frontend. Nenhum `.env` real foi alterado.

## Substituir um vídeo que ainda aponta para Blob

Abra a aula no editor, escolha **Upload no Bunny**, selecione o arquivo, clique
**Enviar para o Bunny**, aguarde 100% e **salve o curso**. A transcodificação pode
continuar depois do envio. Se a duração ainda não estiver disponível, aguarde
e tente salvar novamente sem reenviar o arquivo.

Já enviou pelo painel Bunny? Escolha **Link (Externo)**, cole apenas o endereço
Embed completo (`https://iframe.mediadelivery.net/embed/LIBRARY_ID/VIDEO_ID`) e
salve. Não cole HTML ou API Key. O backend valida e normaliza a referência.
A tela `/admin/aulas/upload` também fornece uma referência para colar nesse campo.
Não exclua arquivos Blob até confirmar que nenhuma aula/material depende deles.

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

- O editor salva `bunny://LIBRARY_ID/VIDEO_ID` no campo `Lesson.contentUrl`,
  depois de validar existência/biblioteca/estado pela API Bunny. A duração real
  tem preferência sobre o valor informado. Não salva URL temporária no banco.
- `GET /api/courses/lessons/:lessonId/playback` valida matrícula e desbloqueio
  sequencial com os guards existentes. Retorna URL assinada por duas horas,
  posição de retomada e `Cache-Control: private, no-store`. Sem configuração,
  falha com mensagem explícita; não cai silenciosamente em vídeo público.
- Processamento é consultado a cada 15 s, por até 5 minutos, com nova tentativa
  manual depois disso. Player.js envia posição, pausa e fim ao progresso existente.
  Notas, quiz e regras de conclusão permanecem ativos.
- Assinar o iframe não equivale a DRM. Revise também proteção CDN/HLS e acesso
  direto aos arquivos no Bunny antes de liberar cursos privados. URLs públicas
  antigas do Blob permanecem públicas enquanto não forem removidas.
- O Zod valida metadados declarados (MP4/WebM/MOV, até 5 GB); a assinatura TUS
  do Bunny não vincula tamanho/MIME. Isso não substitui verificar o objeto final.
- Antes de liberar em escala, adicionar rate limiting distribuído, auditoria,
  quotas por administrador e limpeza de vídeos criados com uploads abandonados.
- O endpoint não é idempotente: não repetir automaticamente a criação de sessão
  em timeout, pois o Bunny pode já ter criado o vídeo. Verifique órfãos no painel.

## Verificação

```sh
node --test tests/bunny-create.test.mjs tests/bunny-upload.test.mjs
npx tsc --noEmit --incremental false
npx eslint app/api/bunny/create/route.ts components/courses/BunnyVideoUpload.tsx app/admin/aulas/upload/page.tsx tests/bunny-create.test.mjs
npm run build
```

Backend: `npm test -- --runInBand bunny-stream.service.spec content-bunny.spec content.service.spec`
e `npm run build`.

Os testes usam Clerk e Bunny simulados e não criam vídeos reais.
Para teste integrado, use um pequeno vídeo de teste com conta autorizada;
confira o processamento no Bunny e, no navegador, que apenas assinatura e IDs
aparecem no tráfego — jamais `AccessKey`. Exclua o vídeo de teste pelo painel
quando não for mais necessário.

Referências: [TUS](https://bunny.net/docs/stream/tus-resumable-uploads),
[assinatura](https://bunny.net/docs/stream/token-authentication),
[Player.js](https://bunny.net/docs/stream/playback-api) e
[processamento](https://bunny.net/docs/stream/webhooks).
