#!/usr/bin/env node
/*
  Fails if hardcoded Tailwind palette classes are found in src/app or src/components.
  Allowed: our semantic tokens and custom utilities.
*/
const fs = require("fs");
const path = require("path");

const ROOTS = [path.join("src", "app"), path.join("src", "components")];
const exts = new Set([".ts", ".tsx", ".js", ".jsx"]);

const colorNames = [
  "gray",
  "slate",
  "neutral",
  "blue",
  "red",
  "green",
  "yellow",
  "pink",
  "purple",
  "emerald",
  "amber",
  "indigo",
  "cyan",
  "teal",
  "rose",
];
const shades = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
];
const utilities = ["bg", "text", "border", "ring", "fill", "stroke"];

const pattern = new RegExp(
  `\\b(?:${utilities.join("|")})-(?:${colorNames.join("|")})-(?:${shades.join("|")})\\b`,
  "g",
);

let problems = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (exts.has(path.extname(entry.name))) checkFile(p);
  }
}

function checkFile(file) {
  const content = fs.readFileSync(file, "utf8");
  let match;
  while ((match = pattern.exec(content)) !== null) {
    problems.push({ file, index: match.index, match: match[0] });
  }
}

for (const root of ROOTS) if (fs.existsSync(root)) walk(root);

if (problems.length) {
  console.error("Found disallowed Tailwind palette classes:");
  for (const p of problems) {
    console.error(` - ${p.file}: ${p.match}`);
  }
  process.exit(1);
}

console.log("Token check passed: no disallowed palette classes found.");
