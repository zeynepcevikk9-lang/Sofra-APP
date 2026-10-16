import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const sourceRoot = existsSync(join(root, 'outputs')) ? join(root, 'outputs') : root;
const canonical = readFileSync(join(sourceRoot, 'sofra-motoru-home-v43.html'), 'utf8');
const reference = readFileSync(join(sourceRoot, 'sofra-motoru-reference-v2.html'), 'utf8');

for (const [name, html] of [['canonical', canonical], ['reference', reference]]) {
  assert.match(html, /fit-sofra-palette-v63-lock/, `${name} Fit palet kilidi eksik`);
  assert.match(html, /fit-sofra-palette-v65-module/, `${name} Fit modül paleti eksik`);
  const lock = html.match(/<style id="fit-sofra-palette-v64-no-blue">([\s\S]*?)<\/style>/)?.[1];
  assert.ok(lock, `${name} Fit v64 palet kilidi eksik`);
  const blueTokens = [...lock.matchAll(/#([0-9a-f]{6})/gi)].filter(([, value]) => {
    const red = Number.parseInt(value.slice(0, 2), 16);
    const green = Number.parseInt(value.slice(2, 4), 16);
    const blue = Number.parseInt(value.slice(4, 6), 16);
    return blue > red + 15 && blue > green + 15;
  });
  assert.equal(blueTokens.length, 0, `${name} Fit paletinde mavi token bulundu`);
  const fitScoped = html.split(/\r?\n/).filter((line) => /(?:#fit|\.fit-|reference-v2-fit)/i.test(line)).join('\n');
  const scopedBlueTokens = [...fitScoped.matchAll(/#([0-9a-f]{6})/gi)].filter(([, value]) => {
    const red = Number.parseInt(value.slice(0, 2), 16);
    const green = Number.parseInt(value.slice(2, 4), 16);
    const blue = Number.parseInt(value.slice(4, 6), 16);
    return blue > red + 15 && blue > green + 15;
  });
  assert.equal(scopedBlueTokens.length, 0, `${name} Fit kapsaminda eski mavi token bulundu`);
  assert.match(html, /#607b65!important/, `${name} adaçayi aksiyon rengi eksik`);
  assert.match(html, /#d48c75!important/, `${name} clay vurgu rengi eksik`);
  assert.match(html, /#fff6f0|#fff8f3/, `${name} sicak yuzey rengi eksik`);
  assert.match(html, /fit-calorie-v2[^}]*!important/, `${name} kalori karti kilidi eksik`);
  assert.match(html, /fit-reference-goal-v2\.active[^}]*!important/, `${name} hedef secimi kilidi eksik`);
  assert.match(html, /body\[data-theme="gece"\][^}]*\.fit-insight\{background:#2b372f!important/, `${name} koyu Fit ozet zemini eksik`);
}

assert.match(canonical, /#fit \.fit-health-card/);
assert.match(reference, /\.reference-v2-fit \.fit-health-reference-v2/);

console.log('SOFRA_FIT_PALETTE_CONTRACT_OK canonical=locked reference=locked dark=covered');
