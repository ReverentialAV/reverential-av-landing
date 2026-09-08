// Reverential site build.
//   node build.mjs
// Compiles src.jsx and writes index.html. Never edit index.html by hand.

import * as esbuild from "esbuild";
import { readFileSync, writeFileSync } from "fs";

const result = await esbuild.build({
  entryPoints: ["entry.jsx"],
  bundle: true,
  minify: true,
  format: "iife",
  target: "es2018",
  jsx: "automatic",
  loader: { ".jsx": "jsx" },
  define: { "process.env.NODE_ENV": '"production"' },
  write: false,
});

const bundle = result.outputFiles[0].text;
const utilities = readFileSync("utilities.css", "utf8");
const shell = readFileSync("shell.html", "utf8");

if (shell.split("__BUNDLE__").length !== 2) throw new Error("__BUNDLE__ token must appear exactly once");
if (shell.split("__UTILITIES__").length !== 2) throw new Error("__UTILITIES__ token must appear exactly once");

const safeBundle = bundle.replace(/<\/script/gi, "<\\/script");

const html = shell
  .replace("__UTILITIES__", () => utilities)
  .replace("__BUNDLE__", () => safeBundle);

// React DOM legitimately contains the literal text "<script><\\/script>" with the
// closing tag already escaped. What would actually break an inline script is an
// UNESCAPED closing tag, so guard on that, then escape defensively regardless.
if (/<\/script/i.test(bundle)) throw new Error("bundle contains an unescaped closing script tag");

writeFileSync("index.html", html);
console.log(`index.html written, ${Math.round(html.length / 1024)} KB`);
