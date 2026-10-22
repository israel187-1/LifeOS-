// Copies the Pyodide runtime into public/ so Python runs offline from our own origin.
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'node_modules', 'pyodide');
const dest = join(root, 'public', 'pyodide');
const files = ['pyodide.mjs', 'pyodide.asm.js', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json'];
mkdirSync(dest, { recursive: true });
for (const f of files) {
  if (!existsSync(join(src, f))) throw new Error(`Falta ${f} en node_modules/pyodide. Ejecuta npm install.`);
  cpSync(join(src, f), join(dest, f));
}
console.log(`Pyodide copiado a ${dest}`);
