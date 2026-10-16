import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const htmlPath = existsSync(join(root, 'sofra-motoru-home-v43.html'))
  ? join(root, 'sofra-motoru-home-v43.html')
  : join(root, 'outputs', 'sofra-motoru-home-v43.html');
const html = readFileSync(htmlPath, 'utf8');

assert.match(html, /name="viewport"[^>]+width=device-width/i, 'mobil viewport eksik');
assert.match(html, /html,body\{max-width:100%;overflow-x:hidden\}/, 'sayfa yatay tasma guard eksik');
assert.match(html, /\.app,\.app-inner\{width:100%;max-width:100%;overflow-x:hidden\}/, 'uygulama yatay tasma guard eksik');
assert.match(html, /\.app\{width:min\(100%,430px\);max-width:430px;margin-inline:auto\}/, 'uygulama genislik siniri eksik');
assert.match(html, /@media \(max-width:500px\)/, 'kompakt mobil media query eksik');
assert.match(html, /\.app-inner\{height:calc\(100svh - 63px\);min-height:500px\}/, 'mobil dikey yerlesim guard eksik');
assert.match(html, /\.app-inner,\.screen,\.screen-head,[^\n]*min-width:0/, 'mobil icerik min-width guard eksik');
assert.match(html, /overflow:auto[\s\S]{0,80}scrollbar-width:none/, 'mobil ic kaydirma alani eksik');

console.log('SOFRA_MOBILE_CONTRACT_OK viewport=ok overflow=guarded compactWidth=500px');
