import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const compiled = ts.transpileModule(readFileSync(new URL("../lib/lesson-material-download.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const helperModule = { exports: {} };
vm.runInNewContext(compiled, { module: helperModule, exports: helperModule.exports, URL });
const download = helperModule.exports.lessonMaterialBlobDownloadUrl;
const base = "https://store123.public.blob.vercel-storage.com";

test("downloads supported lesson materials directly from Blob", () => {
  for (const ext of ["pdf", "docx", "xlsx", "pptx", "csv", "zip", "txt", "png"]) {
    assert.equal(download(`${base}/courses/assets/123-aula.${ext}`), `${base}/courses/assets/123-aula.${ext}?download=1`);
  }
});
test("sets download once, preserving query parameters and removing PDF page fragment", () => {
  const url = new URL(download(`${base}/courses/assets/aula.pdf?version=2&download=0#page=3`));
  assert.equal(url.searchParams.get("download"), "1");
  assert.equal(url.searchParams.getAll("download").length, 1);
  assert.equal(url.searchParams.get("version"), "2");
  assert.equal(url.hash, "");
});
test("does not route videos, covers, or executable files through material downloads", () => {
  for (const path of ["courses/videos/aula.mp4", "courses/assets/aula.mp4", "courses/covers/capa.png", "courses/assets/app.exe", "courses/assets/page.html"]) {
    assert.throws(() => download(`${base}/${path}`), /material de aula/);
  }
  assert.equal(download("bunny://123/9db38922-a762-42df-8e3e-a41390fd53fe"), null);
});
test("leaves legacy and external links to their existing handlers", () => {
  for (const url of ["/uploads/aula.pdf", "https://api.example.test/api/media/aula.pdf", "https://example.test/aula.pdf", `${base}.evil.test/courses/assets/aula.pdf`]) {
    assert.equal(download(url), null);
  }
});
test("does not expose credentials or pretend private blobs are public", () => {
  assert.throws(() => download("https://store123.private.blob.vercel-storage.com/courses/assets/aula.pdf"), /privado/);
  assert.throws(() => download("http://store123.public.blob.vercel-storage.com/courses/assets/aula.pdf"), /inválido/);
  assert.throws(() => download("https://user:secret@store123.public.blob.vercel-storage.com/courses/assets/aula.pdf"), /inválido/);
});
