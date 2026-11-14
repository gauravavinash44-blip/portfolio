// npm run lock
// Re-encrypts every locked case study page with StatiCrypt (AES).
// Readable sources live in _private/ (gitignored). Only encrypted output is written to the repo.
// The password comes from .env (ACCESS_KEY). Nothing secret is hardcoded in a tracked file.
import { readFileSync, writeFileSync, existsSync, mkdirSync, mkdtempSync, copyFileSync, rmSync } from "node:fs";
import { dirname, join, basename, posix } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { loadEnv, ROOT } from "./env.mjs";

const env = loadEnv();
const KEY = env.ACCESS_KEY;
if (!KEY) { console.error("ACCESS_KEY is missing in .env"); process.exit(1); }
const ENDPOINT = env.ACCESS_ENDPOINT || "PASTE_APPS_SCRIPT_URL";
const WHATSAPP = env.WHATSAPP_NUMBER || "91XXXXXXXXXX";

const ART = "assets/craft/case/art/";
const CASES = {
  cc: { title: "Contextual Chat Assistant", cover: ART + "cc-cover-1440.webp" },
  dr: { title: "Deal Room", cover: ART + "dr-cover-1440.webp" },
  wl: { title: "White Label Setup", cover: ART + "wl-cover-1440.webp" },
};
// Every page of the three locked case studies. Add new ones here.
export const PAGES = [
  ["cc", "craft-contextual-chat-detailed.html"],
  ["cc", "craft-contextual-chat.html"],
  ["cc", "craft-contextual-chat-minimal.html"],
  ["cc", "contextual-chat-short.html"],
  ["cc", "contextual-chat.html"],
  ["cc", "case-study-systematic-agent.html"],
  ["cc", "prototype-v6/contextual-chat.html"],
  ["cc", "systematic-agent-case-study/dist/index.html"],
  ["dr", "craft-deal-room.html"],
  ["dr", "deal-room-short.html"],
  ["dr", "deal-room.html"],
  ["dr", "deal-room-case-study.html"],
  ["dr", "deal-room-presentation.html"],
  ["wl", "craft-white-label.html"],
  ["wl", "white-label-short.html"],
];

const NDA_BUTTON = '<button type="button" class="lk-nda" id="lk-nda" aria-haspopup="dialog">' +
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>Unlock the full case study</button>';
const MARK = "Lock screen for an encrypted case study";
const PRIVATE = join(ROOT, "_private");
const template = readFileSync(join(ROOT, "scripts/lock-template.html"), "utf8");
const bin = join(ROOT, "node_modules/.bin/staticrypt");
if (!existsSync(bin)) { console.error("StatiCrypt isn't installed. Run: npm install"); process.exit(1); }

// Public settings go into access.js (the popup and the lock card read them from there).
// "o" is the key, reversed and base64'd, so visitors who don't come from Wall of Portfolios open the
// cases without typing it. It's a soft gate: anyone who reads access.js can recover it.
const accessJs = join(ROOT, "assets/craft/access.js");
// Wall of Portfolios mode (WALL_MODE=1 in .env): open by default, lock only for Wall visitors. Off for now,
// so everyone without the password sees the teaser and the unlock button.
const WALL_MODE = env.WALL_MODE === "1";
const cfg = JSON.stringify(WALL_MODE
  ? { endpoint: ENDPOINT, whatsapp: WHATSAPP, wall: 1, o: Buffer.from(KEY.split("").reverse().join("")).toString("base64") }
  : { endpoint: ENDPOINT, whatsapp: WHATSAPP });
writeFileSync(accessJs, readFileSync(accessJs, "utf8").replace(/\/\*cfg\*\/.*?\/\*cfg\*\//, "/*cfg*/" + cfg + "/*cfg*/"));
// GA4 Measurement ID (public, not a secret) goes into ga.js
const GA_ID = /^G-[A-Z0-9]+$/.test(env.GA_ID || "") ? env.GA_ID : "G-PASTE_ID";
const gaJs = join(ROOT, "assets/craft/ga.js");
writeFileSync(gaJs, readFileSync(gaJs, "utf8").replace(/\/\*ga\*\/.*?\/\*ga\*\//, "/*ga*/" + JSON.stringify(GA_ID) + "/*ga*/"));
const accessCss = readFileSync(join(ROOT, "assets/craft/access.css"), "utf8");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const tmp = mkdtempSync(join(tmpdir(), "lock-"));
let done = 0;

for (const [caseId, rel] of PAGES) {
  const pub = join(ROOT, rel), priv = join(PRIVATE, rel);
  // First run: move the readable page into _private/
  if (!existsSync(priv)) {
    if (!existsSync(pub)) { console.warn("skip (not found):", rel); continue; }
    if (readFileSync(pub, "utf8").includes(MARK)) { console.error("No readable source for", rel, "in _private/. Restore it there first."); process.exit(1); }
    mkdirSync(dirname(priv), { recursive: true });
    copyFileSync(pub, priv);
    console.log("moved source to _private/" + rel);
  }
  const depth = rel.split("/").length - 1;
  const prefix = depth ? "../".repeat(depth) : "./";
  const c = CASES[caseId];

  // The decrypted page gets the shared helper (greeting pill, GA events)
  let src = readFileSync(priv, "utf8");
  if (!src.includes("assets/craft/access.js")) {
    const tag = `<script src="${prefix}assets/craft/ga.js?v=1"></script>\n<script src="${prefix}assets/craft/access.js?v=12" defer></script>\n`;
    const i = src.toLowerCase().lastIndexOf("</body>");
    src = i >= 0 ? src.slice(0, i) + tag + src.slice(i) : src + tag;
  }
  const work = join(tmp, caseId + "-" + done);
  mkdirSync(work, { recursive: true });
  const input = join(work, basename(rel));
  writeFileSync(input, src);

  // Only the Craft case pages share the layout the preview is cut from
  const pv = /^craft-/.test(rel) ? preview(readFileSync(priv, "utf8"), prefix) : null;
  const tpl = template
    .split("{{PREVIEW_HEAD}}").join(pv ? pv.head : "")
    .split("{{PREVIEW_BODY_ATTRS}}").join(pv ? pv.attrs : "")
    .split("{{PREVIEW}}").join(pv ? pv.body : "")
    .split("{{NDA_BUTTON}}").join(NDA_BUTTON)
    .split("{{HAS_PREVIEW}}").join(pv ? "true" : "false")
    .split("{{WALL_MODE}}").join(WALL_MODE ? "true" : "false")
    .split("{{CASE_TITLE_HTML}}").join(esc(c.title))
    .split("{{CASE_TITLE_JSON}}").join(JSON.stringify(c.title))
    .split("{{PREFIX}}").join(prefix)
    .split("{{COVER}}").join(prefix + c.cover)
    .split("{{ACCESS_CSS}}").join(accessCss);
  const tplPath = join(work, "template.html");
  writeFileSync(tplPath, tpl);

  encrypt(work, basename(rel), pub);
  done++;
  console.log("locked", rel);
}

// The tiny page the popup uses to test a password before leaving the current page
{
  const work = join(tmp, "check");
  mkdirSync(work, { recursive: true });
  writeFileSync(join(work, "access-check.html"), "<!doctype html><title>ok</title><p>ok</p>");
  writeFileSync(join(work, "template.html"), readFileSync(join(ROOT, "scripts/check-template.html"), "utf8"));
  encrypt(work, "access-check.html", join(ROOT, "access-check.html"));
  console.log("built access-check.html");
}
rmSync(tmp, { recursive: true, force: true });
console.log(`\n${done} pages locked.`);

// The public top of a case study: header, hero (stats, facts, "In short") and the start of the next
// section, which fades out under the "Under NDA" button. Everything after that stays encrypted.
// Returns null for pages without that layout; those keep the plain lock card.
function preview(src, prefix) {
  const body = src.match(/<body([^>]*)>([\s\S]*)<\/body>/i);
  if (!body) return null;
  const inner = body[2];
  const mainAt = inner.search(/<main\b/i);
  if (mainAt < 0) return null;
  const starts = [...inner.matchAll(/<section\b/gi)].map((m) => m.index).filter((i) => i > mainAt);
  if (starts.length < 2) return null;
  const cut = starts.length > 2 ? starts[2] : inner.search(/<\/main>/i);
  // The section that fades sits in a gate with the Under NDA button: the button only shows up once
  // the fade scrolls into view, then sticks 20% up from the bottom of the screen.
  let html = inner.slice(0, starts[1]) + '<div class="lk-gate">' + inner.slice(starts[1], cut) +
    '<div class="lk-nda-row">{{NDA_BUTTON}}</div></div></main>';
  html = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<nav class="cm-pill cm-toc"[\s\S]*?<\/nav>/i, "")
    .replace(/<div class="cm-progress"[^>]*><\/div>/i, "")
    .replace(/<a class="cm-skip"[^>]*>[\s\S]*?<\/a>/i, "")
    .replace(/<source\b[^>]*>/gi, "")                 // keep the video's poster, skip the video file
    .replace(/<button class="cm-play"[\s\S]*?<\/button>/gi, "")
    .replace(/\s(id)="([^"]+)"/g, ' data-pv-$1="$2"')   // no duplicate ids once the real page loads
    .replace(/(src|href|poster|srcset)="\.\//g, `$1="${prefix}`);
  const head = [...src.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/gi)].map((m) => m[0].replace(/href="\.\//, `href="${prefix}`)).join("\n");
  const attrs = body[1].replace(/class="/, 'class="lk-pv ');
  return { head, attrs: /class=/.test(attrs) ? attrs : attrs + ' class="lk-pv"', body: html };
}

function encrypt(work, file, dest) {
  // StatiCrypt wants paths relative to where it runs. One salt for every page (kept in .staticrypt.json),
  // so a key remembered on one case study opens the others too.
  const cfg = join(ROOT, ".staticrypt.json");
  if (existsSync(cfg)) copyFileSync(cfg, join(work, ".staticrypt.json"));
  execFileSync(bin, [file, "-d", "out", "-t", "template.html", "--short", "--remember", "30", "-c", ".staticrypt.json"],
    { cwd: work, env: { ...process.env, STATICRYPT_PASSWORD: KEY }, stdio: ["ignore", "ignore", "inherit"] });
  if (!existsSync(cfg)) copyFileSync(join(work, ".staticrypt.json"), cfg);
  copyFileSync(join(work, "out", file), dest);
}
