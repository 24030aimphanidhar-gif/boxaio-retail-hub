import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "dist/domain");
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(root, "dist/package.json"), '{"type":"commonjs"}');
for (const name of fs
  .readdirSync(path.join(root, "src/domain"))
  .filter((n) => n.endsWith(".ts"))) {
  const source = fs.readFileSync(path.join(root, "src/domain", name), "utf8");
  const result = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      resolveJsonModule: true,
    },
  });
  fs.writeFileSync(
    path.join(out, name.replace(/\.ts$/, ".js")),
    result.outputText,
  );
}
console.log("Backend commerce domain compiled.");
