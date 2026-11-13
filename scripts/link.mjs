// npm run link -- "Razorpay"
// Prints a company link that unlocks the three case studies and greets that team.
// The key is read from .env, so you never type it.
import { loadEnv } from "./env.mjs";

const env = loadEnv();
const company = process.argv.slice(2).join(" ").trim();
if (!company) { console.error('Usage: npm run link -- "Company name"'); process.exit(1); }
if (!env.ACCESS_KEY) { console.error("ACCESS_KEY is missing in .env"); process.exit(1); }

const base = (env.SITE_URL || "https://gauravavinash44-blip.github.io/portfolio/").replace(/\/?$/, "/");
console.log(`${base}?for=${encodeURIComponent(company)}#k=${encodeURIComponent(env.ACCESS_KEY)}`);
