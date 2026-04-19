import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const roots = ["app", "src", "prisma"];
const extensions = new Set([".ts", ".tsx"]);
const mojibakeMarkers = ["Ă", "Ĺ", "â"];

function collectFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = path.join(directory, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      return collectFiles(fullPath);
    }

    return extensions.has(path.extname(fullPath)) ? [fullPath] : [];
  });
}

test("user-facing source copy does not contain common mojibake markers", () => {
  const offenders = roots
    .flatMap((root) => collectFiles(root))
    .filter((filePath) => {
      const content = readFileSync(filePath, "utf8");
      return mojibakeMarkers.some((marker) => content.includes(marker));
    });

  assert.deepEqual(offenders, []);
});
