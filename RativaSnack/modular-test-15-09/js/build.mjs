// Monta o bundle clássico preservando a única IIFE e o escopo léxico original.
// Execute com: node build.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const order = [
  "bootstrap.js",
  "config.js", "save.js", "data.js", "state.js", "audio.js",
  "world.js", "events.js", "multiplayer-local.js", "online.js",
  "game.js", "ui.js", "render.js", "entry.js"
];
const bundle = order.map(name => readFileSync(join(here, "modules", name), "utf8")
  .replace(/^\/\* Fragmento preservado do JavaScript original\. Não carregar isoladamente; usar build\.mjs\. \*\/\n/, ""))
  .join("");
writeFileSync(join(here, "main.js"), bundle, "utf8");
console.log("RativaSnack: main.js reconstruído a partir de " + order.length + " partes.");
