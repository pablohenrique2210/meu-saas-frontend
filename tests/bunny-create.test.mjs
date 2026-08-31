import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import vm from "node:vm";
import ts from "typescript";

// Execute the actual route, replacing only framework/external boundaries.
// No real environment variables or credentials are loaded by these tests.
const require = createRequire(import.meta.url);
const source = readFileSync(new URL("../app/api/bunny/create/route.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const origin = "https://courses.example.test";
const videoId = "9db38922-a762-42df-8e3e-a41390fd53fe";
const valid = { title: "Aula 1", fileName: "aula.mp4", fileType: "video/mp4", fileSize: 1024 };

function fixture(options = {}) {
  const calls = [];
  const logs = [];
  const env = {
    BUNNY_LIBRARY_ID: "123456", BUNNY_API_KEY: "fixture-private-key",
    BUNNY_UPLOAD_ALLOWED_ORIGINS: origin, ...options.env,
  };
  const user = {
    id: "user_admin", primaryEmailAddressId: "email_1",
    emailAddresses: [{ id: "email_1", emailAddress: options.email ?? "pablohenrique2210@gmail.com",
      verification: { status: options.verified === false ? "unverified" : "verified" } }],
  };
  const routeModule = { exports: {} };
  vm.runInNewContext(compiled, {
    exports: routeModule.exports, module: routeModule, process: { env }, Buffer, Response, AbortSignal, URL,
    console: { error: (...args) => logs.push(args) },
    require: (name) => {
      if (name === "server-only") return {};
      if (name === "@clerk/nextjs/server") return {
        auth: async () => ({ userId: options.anonymous ? null : "user_admin" }),
        currentUser: async () => user,
      };
      return require(name);
    },
    fetch: async (...args) => {
      calls.push(args);
      if (options.throwUpstream) throw new Error("fixture-private-key must not be logged");
      return Response.json(options.upstreamBody ?? { guid: videoId }, { status: options.upstreamStatus ?? 200 });
    },
  }, { filename: "bunny-create-route.js" });
  return { post: routeModule.exports.POST, calls, logs, env };
}
function request(body = valid, headers = {}) {
  return new Request(`${origin}/api/bunny/create`, {
    method: "POST", headers: { Origin: origin, "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

for (const email of ["pablohenrique2210@gmail.com", "consultoria@lilianarruda.com.br"]) {
  test(`authorizes verified administrator ${email} without disclosing the key`, async () => {
    const f = fixture({ email });
    const response = await f.post(request());
    const body = await response.json();
    assert.equal(response.status, 201);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(body.videoId, videoId);
    assert.equal(body.signature, createHash("sha256")
      .update(`${f.env.BUNNY_LIBRARY_ID}${f.env.BUNNY_API_KEY}${body.expirationTime}${videoId}`).digest("hex"));
    assert.ok(body.expirationTime > Date.now() / 1000 + 7100);
    assert.ok(body.expirationTime <= Date.now() / 1000 + 7200);
    assert.equal(JSON.stringify(body).includes(f.env.BUNNY_API_KEY), false);
    assert.equal(f.calls[0][0], "https://video.bunnycdn.com/library/123456/videos");
    assert.equal(f.calls[0][1].headers.AccessKey, f.env.BUNNY_API_KEY);
    assert.equal(f.calls[0][1].body, JSON.stringify({ title: valid.title }));
  });
}

for (const [name, options, headers, status] of [
  ["missing configuration", { env: { BUNNY_API_KEY: "" } }, {}, 503],
  ["wildcard origin configuration", { env: { BUNNY_UPLOAD_ALLOWED_ORIGINS: "https://*.vercel.app" } }, {}, 503],
  ["foreign origin", {}, { Origin: "https://evil.example" }, 403],
  ["missing origin", {}, { Origin: "" }, 403],
  ["anonymous", { anonymous: true }, {}, 401],
  ["non-administrator", { email: "student@example.test" }, {}, 403],
  ["unverified administrator", { verified: false }, {}, 403],
  ["non-JSON", {}, { "Content-Type": "video/mp4" }, 415],
]) {
  test(`rejects ${name} before calling Bunny`, async () => {
    const f = fixture(options);
    assert.equal((await f.post(request(valid, headers))).status, status);
    assert.equal(f.calls.length, 0);
  });
}

test("invalid JSON, missing fields, invalid types/extension and oversized metadata are descriptive", async () => {
  const f = fixture();
  assert.equal((await f.post(request("{"))).status, 400);
  const missing = await f.post(request({ title: "Aula" }));
  assert.equal(missing.status, 422);
  assert.ok((await missing.json()).details.some((item) => item.field === "fileSize"));
  for (const body of [
    { ...valid, fileSize: "1024" }, { ...valid, fileSize: 0 },
    { ...valid, fileSize: 5 * 1024 ** 3 + 1 }, { ...valid, fileName: "aula.exe" },
    { ...valid, fileType: "video/webm" }, { ...valid, unexpected: true },
  ]) assert.equal((await f.post(request(body))).status, 422);
  assert.equal((await f.post(request("x".repeat(8193)))).status, 413);
  assert.equal(f.calls.length, 0);
});

test("upstream errors do not disclose response bodies or keys", async () => {
  for (const options of [
    { upstreamStatus: 401, upstreamBody: { error: "fixture-private-key" } },
    { upstreamBody: { guid: "invalid" } }, { throwUpstream: true },
  ]) {
    const f = fixture(options);
    const response = await f.post(request());
    assert.ok([500, 502].includes(response.status));
    assert.equal((await response.text()).includes("fixture-private-key"), false);
    assert.equal(JSON.stringify(f.logs).includes("fixture-private-key"), false);
  }
});

test("configuration diagnostics identify every missing field without exposing values", async () => {
  const f = fixture({ env: { BUNNY_LIBRARY_ID: "", BUNNY_API_KEY: " ", BUNNY_UPLOAD_ALLOWED_ORIGINS: "" } });
  const response = await f.post(request());
  const body = await response.json();
  assert.equal(response.status, 503);
  assert.equal(body.code, "BUNNY_CONFIG_INVALID");
  assert.deepEqual(body.details.map((item) => item.field), ["BUNNY_LIBRARY_ID", "BUNNY_API_KEY", "BUNNY_UPLOAD_ALLOWED_ORIGINS"]);
  assert.equal(f.calls.length, 0);
});

test("malformed configuration reports field names, never the submitted secrets", async () => {
  for (const env of [
    { BUNNY_LIBRARY_ID: "private-value-not-a-number" },
    { BUNNY_UPLOAD_ALLOWED_ORIGINS: "https://private-value.example/admin/cursos" },
    { BUNNY_UPLOAD_ALLOWED_ORIGINS: "https://private-value.example/" },
    { BUNNY_UPLOAD_ALLOWED_ORIGINS: "private-value.example" },
    { BUNNY_UPLOAD_ALLOWED_ORIGINS: '"https://private-value.example"' },
  ]) {
    const f = fixture({ env });
    const response = await f.post(request());
    assert.equal(response.status, 503);
    const body = await response.json();
    assert.ok(body.details.some((item) => item.field === Object.keys(env)[0]));
    assert.equal(JSON.stringify(body).includes("private-value"), false);
    assert.equal(JSON.stringify(body).includes("fixture-private-key"), false);
    assert.equal(JSON.stringify(f.logs).includes("private-value"), false);
    assert.equal(f.calls.length, 0);
  }
});
