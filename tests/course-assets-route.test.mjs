import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const blob = require("@vercel/blob");
const compiled = ts.transpileModule(readFileSync(new URL("../app/api/blob/course-assets/route.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const event = { type: "blob.generate-presigned-url", payload: { pathname: "courses/assets/test.pdf", multipart: false, clientPayload: null } };
function fixture(options = {}) {
  const routeModule = { exports: {} };
  const tokens = [], logs = [], checks = [];
  vm.runInNewContext(compiled, {
    module: routeModule, exports: routeModule.exports, Response, URL, AbortSignal, Error,
    process: { env: { BLOB_WEBHOOK_PUBLIC_KEY: "fixture-public-key", ...options.env } },
    console: { error: (...args) => logs.push(args) },
    fetch: async (...args) => {
      checks.push(args);
      if (options.networkError) throw new Error("secret-network-details");
      return Response.json({ allowed: options.allowed ?? true }, { status: options.backendStatus ?? 200 });
    },
    require: (name) => {
      if (name === "server-only") return {};
      if (name === "next/server") return { NextResponse: Response };
      if (name === "@/lib/api-config") return { apiUrl: (path) => `https://backend.example.test${path}` };
      if (name === "@clerk/nextjs/server") return { auth: async () => ({ userId: options.anonymous ? null : "user_1", getToken: async () => "fixture-session" }) };
      if (name === "@vercel/blob") return { ...blob, issueSignedToken: async (config) => {
        tokens.push(config);
        if (options.sdkError) throw options.sdkError;
        return "fixture-scoped-token";
      } };
      if (name === "@vercel/blob/client") return { handleUploadPresigned: async ({ body, getSignedToken }) => {
        if (body.type === "blob.upload-completed") throw new Error("Missing callback signature");
        await getSignedToken(body.payload.pathname);
        return { type: body.type, presignedUrlPayload: { fixture: true } };
      } };
      return require(name);
    },
  });
  return { post: routeModule.exports.POST, tokens, logs, checks };
}
function request(body = event, contentType = "application/json") {
  return new Request("https://frontend.example.test/api/blob/course-assets", {
    method: "POST", headers: { "Content-Type": contentType }, body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

test("authorizes only course materials with existing scope and size constraints", async () => {
  const f = fixture();
  const response = await f.post(request());
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.ok((await response.json()).presignedUrlPayload);
  assert.equal(f.tokens[0].pathname, event.payload.pathname);
  assert.equal(f.tokens[0].maximumSizeInBytes, 500 * 1024 * 1024);
  assert.equal(f.tokens[0].operations.join(), "put");
  assert.equal(f.checks.length, 1);
});

for (const [options, status, code] of [
  [{ anonymous: true }, 401, "SESSION_REQUIRED"],
  [{ backendStatus: 401 }, 401, "BACKEND_SESSION_REJECTED"],
  [{ backendStatus: 403 }, 403, "BACKEND_ACCESS_DENIED"],
  [{ allowed: false }, 403, "COURSE_MANAGER_REQUIRED"],
  [{ backendStatus: 500 }, 503, "PERMISSION_SERVICE_UNAVAILABLE"],
  [{ networkError: true }, 503, "PERMISSION_SERVICE_UNAVAILABLE"],
  [{ env: { BLOB_WEBHOOK_PUBLIC_KEY: "" } }, 503, "BLOB_WEBHOOK_KEY_MISSING"],
]) {
  test(`returns actionable ${code}, not a generic 400`, async () => {
    const f = fixture(options);
    const response = await f.post(request());
    assert.equal(response.status, status);
    assert.equal((await response.json()).code, code);
    assert.equal(f.tokens.length, 0);
  });
}

test("rejects invalid JSON, metadata and video uploads", async () => {
  const f = fixture();
  assert.equal((await f.post(request("{"))).status, 400);
  assert.equal((await f.post(request(event, "video/mp4"))).status, 415);
  for (const body of [null, {}, { ...event, payload: { pathname: "courses/videos/video.mp4" } },
    { ...event, payload: { pathname: "courses/assets/a.pdf", multipart: "true" } }]) {
    assert.equal((await f.post(request(body))).status, 422);
  }
  assert.equal(f.tokens.length, 0);
  assert.equal(f.checks.length, 0);
});

test("maps Blob failures without leaking SDK messages or credentials", async () => {
  for (const [sdkError, code] of [
    [new blob.BlobAccessError(), "BLOB_ACCESS_CONFIGURATION"],
    [new Error("OIDC is enabled for this project, but not for this token's environment."), "BLOB_ACCESS_CONFIGURATION"],
    [new blob.BlobStoreNotFoundError(), "BLOB_ACCESS_CONFIGURATION"],
    [new blob.BlobStoreSuspendedError(), "BLOB_STORE_SUSPENDED"],
    [new Error("No blob credentials found. secret-value"), "BLOB_CREDENTIALS_MISSING"],
    [new Error("Storage quota exceeded secret-value"), "BLOB_QUOTA_EXCEEDED"],
    [new Error("secret-value"), "BLOB_UPLOAD_UNAVAILABLE"],
  ]) {
    const f = fixture({ sdkError });
    const response = await f.post(request());
    assert.ok([502, 503].includes(response.status));
    const body = await response.json();
    assert.equal(body.code, code);
    assert.ok(body.requestId);
    assert.equal(JSON.stringify([body, f.logs]).includes("secret-value"), false);
  }
});

test("upload callbacks still require signature verification", async () => {
  const f = fixture({ anonymous: true });
  const response = await f.post(request({ type: "blob.upload-completed", payload: {} }));
  assert.equal(response.status, 403);
  assert.equal(f.tokens.length, 0);
});
