import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";

// Component contract tests with React hooks/TUS/network boundaries simulated.
const require = createRequire(import.meta.url);
const compiled = ts.transpileModule(readFileSync(new URL("../components/courses/BunnyVideoUpload.tsx", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
const id = "9db38922-a762-42df-8e3e-a41390fd53fe";
function fixture(failure = false) {
  const states = [], calls = [], uploads = [], results = [], busy = [], progress = [], effects = [];
  let cursor = 0;
  const React = {
    useState(initial) {
      const index = cursor++;
      if (!(index in states)) states[index] = initial;
      return [states[index], (next) => { states[index] = typeof next === "function" ? next(states[index]) : next; }];
    },
    useRef(value) { return React.useState({ current: value })[0]; },
    useEffect(callback) { effects.push(callback); },
    useId() { return "progress-test"; },
  };
  const component = { exports: {} };
  vm.runInNewContext(compiled, {
    module: component, exports: component.exports, AbortController, Date, console,
    require(name) {
      if (name === "react") return React;
      if (name === "@/lib/video-file") return { inspectVideoFile: async () => ({ durationSeconds: 121, durationMinutes: 3 }) };
      if (name === "tus-js-client") return { DetailedError: class extends Error {}, Upload: class {
        constructor(file, options) { uploads.push({ file, options }); }
        start() {} abort() { return Promise.resolve(); }
      } };
      return require(name);
    },
    fetch: async (url, options) => {
      calls.push({ url, options });
      return Response.json(failure ? { error: "Bunny não configurado" } : {
        videoId: id, libraryId: "123", expirationTime: Math.floor(Date.now() / 1000) + 7200, signature: "a".repeat(64),
      }, { status: failure ? 503 : 201 });
    },
  });
  function render() {
    cursor = 0;
    return component.exports.default({ defaultTitle: "Aula 1", onUploaded: (value) => results.push(value),
      onUploadingChange: (value) => busy.push(value), onProgressChange: (value) => progress.push(value) });
  }
  return { render, calls, uploads, results, busy, progress, effects };
}
function elements(node) {
  if (!node || typeof node !== "object") return [];
  return [node, ...[node.props?.children].flat(Infinity).flatMap(elements)];
}
async function send(f) {
  const input = elements(f.render()).find((node) => node.type === "input" && node.props.type === "file");
  input.props.onChange({ target: { files: [{ name: "aula.mp4", type: "video/mp4", size: 1024 }] } });
  elements(f.render()).find((node) => node.type === "button").props.onClick();
  await new Promise((resolve) => setImmediate(resolve));
}
test("editor upload authorizes Bunny, sends TUS directly, and returns persistent lesson reference", async () => {
  const f = fixture();
  await send(f);
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0].url, "/api/bunny/create");
  assert.deepEqual(JSON.parse(f.calls[0].options.body), { title: "Aula 1", fileName: "aula.mp4", fileType: "video/mp4", fileSize: 1024 });
  const { options } = f.uploads[0];
  assert.equal(options.endpoint, "https://video.bunnycdn.com/tusupload");
  assert.equal(options.headers.VideoId, id);
  assert.equal(options.headers.AccessKey, undefined);
  options.onProgress(512, 1024);
  assert.equal(f.progress.at(-1), 50);
  options.onSuccess();
  assert.equal(f.results[0].url, `bunny://123/${id}`);
  assert.equal(f.results[0].durationSeconds, 121);
  assert.deepEqual(f.busy, [true, false]);
});
test("authorization failure never falls back to Vercel Blob or Railway upload", async () => {
  const f = fixture(true);
  await send(f);
  assert.equal(f.uploads.length, 0);
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0].url, "/api/bunny/create");
  assert.deepEqual(f.busy, [true, false]);
  assert.ok(elements(f.render()).some((node) => node.props?.role === "alert"));
});
test("terminal TUS failure unlocks save without replacing the existing video", async () => {
  const f = fixture();
  await send(f);
  f.uploads[0].options.onError(new Error("network"));
  assert.equal(f.results.length, 0);
  assert.equal(f.busy.at(-1), false);
  assert.equal(f.calls.length, 1);
});
