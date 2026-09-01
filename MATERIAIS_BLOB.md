# Capas e materiais das aulas — Bunny Storage

O nome deste arquivo foi mantido para preservar links internos antigos. O fluxo
atual não envia novos materiais ou capas ao Vercel Blob.

- Vídeos usam Bunny Stream.
- Capas, PDFs, Word, planilhas, apresentações, imagens e compactados usam uma
  Bunny Storage Zone com compatibilidade S3.
- O Railway autentica o administrador e gera URLs S3 temporárias. O navegador
  envia cada parte diretamente ao Bunny; os bytes não passam pela Vercel nem
  pelo Railway.
- Capas são servidas publicamente pela rota de mídia do backend.
- Materiais ficam protegidos. O backend valida o acesso à aula e redireciona o
  download para uma URL S3 de curta duração.
- URLs antigas do Vercel Blob continuam baixáveis enquanto os respectivos blobs
  existirem. Nada antigo é excluído ou migrado automaticamente.

## Recuperar um material antigo que retorna 404

Um registro `/api/media/NOME.pdf` sem o arquivo original não permite recuperar
os bytes. No editor do curso, abra **Módulos e Aulas**, selecione novamente o
arquivo original em Documento Principal ou Materiais Complementares e salve o
curso. A nova referência passará a usar o download protegido do Bunny Storage.

## Configuração

As credenciais da Storage Zone ficam somente no backend Railway:

```dotenv
BUNNY_STORAGE_ZONE_NAME=<nome-da-zone>
BUNNY_STORAGE_PASSWORD=<storage-zone-password>
BUNNY_STORAGE_REGION=ny
BUNNY_STORAGE_S3_ENDPOINT=https://ny-s3.storage.bunnycdn.com
BUNNY_STORAGE_PREFIX=course-assets
S3_URL_STYLE=path
```

Não copie a senha da Storage Zone para a Vercel, para uma variável
`NEXT_PUBLIC_*` ou para o navegador. A chave da biblioteca Bunny Stream também
não substitui a senha da Storage Zone.

## Teste após publicar

1. Envie uma capa e confirme sua exibição no catálogo.
2. Envie um PDF como Documento Principal e outro como material complementar.
3. Salve o curso e abra a aula com uma conta de aluno autorizada.
4. Baixe os dois documentos e confirme que uma conta sem acesso recebe 403/404.
5. Abra o vídeo e confirme que continua usando o player Bunny Stream.

Testes locais: `node --test tests/lesson-material-download.test.mjs`,
`npx tsc --noEmit` e `npm run build`.
