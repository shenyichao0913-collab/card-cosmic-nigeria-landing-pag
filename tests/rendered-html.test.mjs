import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Card Cosmic conversion page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>[^<]*Card Cosmic[^<]*<\/title>/i);
  assert.match(html, /₦3,000/);
  assert.match(html, /555555/);
  assert.match(html, /apps\.apple\.com\/ng\/app\/cardcosmic\/id6756063147/);
  assert.match(html, /target="_self"/);
  assert.match(html, /play\.google\.com\/store\/apps/);
  assert.match(html, /class="store-button"/);
  assert.match(html, /id="download"/);
  assert.match(html, /beautystar_entertainment/);
  assert.match(html, /reliable and stable gift card vendor/i);
  assert.match(html, /Official Card Cosmic app/i);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/i);
});

test("removes the disposable starter preview surface", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /Register in 3 steps\. Get <span>₦3,000\.<\/span>/);
  assert.match(page, /beautystar-entertainment\.png/);
  assert.match(page, /CopyInviteCode/);
  assert.match(page, /itms-apps:\/\/itunes\.apple\.com\/app\/id6756063147/);
  assert.match(layout, /en-NG/);
  assert.match(layout, /Invite Code 555555/);
  assert.match(layout, /apple-itunes-app/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.deepEqual(
    await readdir(new URL("app/_sites-preview/", projectRoot)),
    [],
  );
});

test("packages a Cloudflare-compatible SSR runtime", async () => {
  const ssr = await readFile(
    new URL("../dist/server/ssr/index.js", import.meta.url),
    "utf8",
  );

  assert.match(ssr, /Server runtime exposes a non-removable/);
  assert.doesNotMatch(ssr, /from["']react(?:-dom)?(?:\/[^"']*)?["']/);
});
