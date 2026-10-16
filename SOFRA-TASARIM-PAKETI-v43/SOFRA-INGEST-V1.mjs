/** Deterministic pantry-note parser; model-assisted parsing can replace this behind the same shape. */

const terms = [
  ['yumurta', '🥚', ['yumurta', 'yumurtalar']], ['patates', '🥔', ['patates', 'patatesler']], ['peynir', '🧀', ['peynir', 'peynirler']], ['süt', '🥛', ['süt', 'sut']],
  ['domates', '🍅', ['domates', 'domatesler']], ['soğan', '🧅', ['soğan', 'sogan', 'soğanlar']], ['yoğurt', '🥣', ['yoğurt', 'yogurt', 'yoğurtlar']], ['elma', '🍎', ['elma', 'elmalar']],
  ['marul', '🥬', ['marul', 'marullar']], ['pirinç', '🍚', ['pirinç', 'pirinc']], ['makarna', '🍝', ['makarna', 'spagetti', 'spaghetti']], ['biber', '🫑', ['biber', 'biberler']],
  ['salça', '🥫', ['salça', 'salca']], ['tavuk', '🍗', ['tavuk', 'tavuk eti']], ['mantar', '🍄', ['mantar', 'mantarlar']], ['roka', '🥬', ['roka', 'rokalar']],
  ['patlıcan', '🍆', ['patlıcan', 'patlican', 'patlıcanlar']],
];

function normalize(value) {
  return String(value || '').toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').replace(/İ/g, 'i').trim();
}

function canonicalTerm(value) {
  const normalized = normalize(value);
  return terms.find(([, , aliases]) => aliases.some((alias) => normalized === normalize(alias) || normalized.includes(`${normalize(alias)} `)))?.[0] || normalized;
}

function statusFor(chunk) {
  return /\b(bitti|tükendi|yok)\b/i.test(chunk) ? 'finished' : /\b(azaldı|azald|az)\b/i.test(chunk) ? 'low' : 'available';
}

function quantityFor(chunk, term) {
  const match = chunk.match(/\b(\d+(?:[,.]\d+)?)\s*(kg|kilo|gram|g|adet|litre|l|paket|kutu|demet)\b/i);
  if (match) {
    const unit = { kilo: 'kg', gram: 'g', litre: 'l' }[match[2].toLocaleLowerCase('tr-TR')] || match[2].toLocaleLowerCase('tr-TR');
    return { text: `${match[1].replace(',', '.')} ${unit}`, value: Number(match[1].replace(',', '.')), unit };
  }
  const number = chunk.match(/\b\d+(?:[,.]\d+)?\b/)?.[0];
  return number ? { text: `${number.replace(',', '.')} adet`, value: Number(number.replace(',', '.')), unit: 'adet' } : { text: null, value: null, unit: null };
}

export function canonicalizeIngredient(value) { return canonicalTerm(value); }
export function parseQuantityText(value) { return quantityFor(String(value || ''), ''); }

export function parsePantryNote(text) {
  const value = String(text || '').trim();
  if (!value) return { items: [], unparsed_text: '' };
  const chunks = value.replace(/[;]/g, ',').split(/(?<!\d),(?!\d)|\s+ve\s+/i).map((chunk) => chunk.trim()).filter(Boolean);
  const items = [];
  const parsedChunks = [];
  for (const chunk of chunks) {
    const normalized = normalize(chunk);
    const match = terms.find(([, , aliases]) => aliases.some((alias) => normalized.includes(normalize(alias))));
    if (!match) continue;
    const [term, emoji] = match;
    const existing = items.find((item) => item.canonical_name === term);
    const quantity = quantityFor(chunk, term);
    const item = { canonical_name: term, display_name: term, emoji, quantity_text: quantity.text, quantity_value: quantity.value, quantity_unit: quantity.unit, stock_state: statusFor(chunk), confidence: 1 };
    if (existing) Object.assign(existing, item);
    else items.push(item);
    parsedChunks.push(chunk);
  }
  return { items, unparsed_text: chunks.filter((chunk) => !parsedChunks.includes(chunk)).join(', ') };
}
