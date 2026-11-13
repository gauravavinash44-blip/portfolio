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

const MARK = "Lock screen for an encrypted case study";
const PRIVATE = join(ROOT, "_private");
const template = readFileSync(join(ROOT, "scripts/lock-template.html"), "utf8");
const bin = join(ROOT, "node_modules/.bin/staticrypt");
if (!existsSync(bin)) { console.error("StatiCrypt isn't installed. Run: npm install"); process.exit(1); }

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
    const tag = `<script src="${prefix}assets/craft/access.js?v=1" defer></script>\n`;
    const i = src.toLowerCase().lastIndexOf("</body>");
    src = i >= 0 ? src.slice(0, i) + tag + src.slice(i) : src + tag;
  }
  const work = join(tmp, caseId + "-" + done);
  mkdirSync(work, { recursive: true });
  const input = join(work, basename(rel));
  writeFileSync(input, src);

  const tpl = template
    .split("{{CASE_TITLE_HTML}}").join(esc(c.title))
    .split("{{CASE_TITLE_JSON}}").join(JSON.stringify(c.title))
    .split("{{PREFIX}}").join(prefix)
    .split("{{COVER}}").join(prefix + c.cover)
    .split("{{ENDPOINT_JSON}}").join(JSON.stringify(ENDPOINT))
    .split("{{WHATSAPP_JSON}}").join(JSON.stringify(WHATSAPP));
  const tplPath = join(work, "template.html");
  writeFileSync(tplPath, tpl);

  // StatiCrypt wants paths relative to where it runs. One salt for every page (kept in .staticrypt.json),
  // so a key remembered on one case study opens the others too.
  const cfg = join(ROOT, ".staticrypt.json");
  if (existsSync(cfg)) copyFileSync(cfg, join(work, ".staticrypt.json"));
  execFileSync(bin, [basename(rel), "-d", "out", "-t", "template.html", "--short", "--remember", "30", "-c", ".staticrypt.json"],
    { cwd: work, env: { ...process.env, STATICRYPT_PASSWORD: KEY }, stdio: ["ignore", "ignore", "inherit"] });
  if (!existsSync(cfg)) copyFileSync(join(work, ".staticrypt.json"), cfg);
  copyFileSync(join(work, "out", basename(rel)), pub);
  done++;
  console.log("locked", rel);
}
rmSync(tmp, { recursive: true, force: true });
console.log(`\n${done} pages locked.`);
