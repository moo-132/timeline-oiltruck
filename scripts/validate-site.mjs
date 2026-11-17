import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const root = 'site';
if (!existsSync(join(root, 'index.html'))) {
  console.error('Missing site/index.html: import the actual ChatGPT Site source first.');
  process.exit(1);
}
let files = [];
function scan(path) {
  for (const item of readdirSync(path)) {
    const filename = join(path, item);
    if (statSync(filename).isDirectory()) scan(filename);
    else files.push(filename);
  }
}
scan(root);
const html = readFileSync(join(root, 'index.html'), 'utf8');
if (!/<html\b/i.test(html) || !/<\/html>/i.test(html)) {
  console.error('site/index.html is not a complete HTML document.');
  process.exit(1);
}
console.log('Source files:', files.length);
console.log('HTML entrypoint: OK');
console.log('NOTE: This is validation/packaging only; it does not publish to chatgpt.site.');
