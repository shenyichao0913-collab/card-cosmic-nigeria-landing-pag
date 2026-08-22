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
  assert.match(html, /Real user transaction/i);
  assert.match(html, /LIMITED TIME OFFER • NIGERIA ONLY/);
  assert.match(html, /Offer Period \(Nigeria Time\)/);
  assert.match(html, /connect\.facebook\.net\/en_US\/fbevents\.js/);
  assert.match(html, /fbq\('init','1070099105418933'\)/);
  assert.match(html, /fbq\('track','PageView'\)/);
  assert.match(
    html,
    /facebook\.com\/tr\?id=1070099105418933(?:&|&amp;)ev=PageView(?:&|&amp;)noscript=1/,
  );
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/i);
});

test("removes the disposable starter preview surface", async () => {
  const [page, layout, styles, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /Register in 3 Steps\. Get <span>₦3,000\.<\/span>/);
  assert.match(page, /Date\.UTC\(2026, 7, 22, 23, 0, 0\)/);
  assert.match(page, /Date\.UTC\(2026, 7, 25, 23, 0, 0\)/);
  assert.match(page, /Campaign starts on August 23, 2026\./);
  assert.match(page, /This ₦3,000 new-user campaign has ended\./);
  assert.match(page, /beautystar-entertainment\.png/);
  assert.match(page, /CopyInviteCode/);
  assert.match(page, /itms-apps:\/\/itunes\.apple\.com\/app\/id6756063147/);
  assert.match(page, /app-home\.png\?v=12/);
  assert.match(page, /track\("AppDownloadClick", "app_download_click"/);
  assert.match(page, /store: "apple_app_store"/);
  assert.match(page, /store: "google_play"/);
  assert.match(styles, /\.benefits-section \.heading-split\s*{\s*grid-template-columns: minmax\(0, 1fr\)/);
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
