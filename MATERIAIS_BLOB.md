# Materiais das aulas — Vercel Blob

- Materiais anexos e Documento Principal: upload já existente em `/api/blob/course-assets`,
  com arquivos em `courses/assets/`, no Blob público conectado ao frontend Vercel.
- Botões de download da aula usam a URL Blob com `download=1`, que solicita
  `Content-Disposition: attachment`. O navegador gerencia o download; não carrega
  até 500 MB em memória JavaScript nem retransmite o arquivo pelo Railway.
- O nome do arquivo baixado é definido pelo Blob a partir do nome armazenado.
- Vídeos continuam no Bunny. O player, a autorização Bunny, capas e uploads não
  foram modificados por esta correção.
- Recursos externos e materiais antigos em `/uploads` ou `/api/media` mantêm
  seus fluxos anteriores. Para transferir um material antigo ao Blob, reenvie-o
  no editor como material da aula e salve o curso. Nada é migrado ou excluído automaticamente.

## Configuração

Não é necessária uma nova chave para baixar arquivos do Blob **público**. Mantenha
o Blob conectado ao projeto frontend e as variáveis do upload que já funciona.
Não copie chaves do Blob para `NEXT_PUBLIC_*` nem para o navegador.

A tela requer acesso à aula, mas um Blob público pode ser baixado por qualquer
pessoa que tenha sua URL. Esta alteração não torna documentos confidenciais privados.
Blob privado exige outro fluxo, com verificação de acesso e entrega autorizada;
a função não tenta transformar URLs privadas em públicas.

## Teste após publicar o frontend

1. Envie um PDF em Materiais Complementares, salve o curso e abra a aula como aluno.
2. Clique em Baixar arquivo: o navegador deve iniciar o download do PDF pelo domínio
   `public.blob.vercel-storage.com`, com `download=1`, sem chamada de download ao Railway.
3. Confira também Documento Principal e os materiais já enviados ao Blob.
4. Abra o vídeo e confirme que continua usando o player Bunny.

Testes locais: `node --test tests/lesson-material-download.test.mjs` e `npm run build`.
O teste automatizado não transfere arquivos reais nem consome armazenamento.

[Contrato oficial downloadUrl do Vercel Blob](https://vercel.com/docs/vercel-blob/using-blob-sdk).
