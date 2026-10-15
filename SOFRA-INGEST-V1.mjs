/** Deterministic pantry-note parser; model-assisted parsing can replace this behind the same shape. */

const terms = [
  ['yumurta', '🥚'], ['patates', '🥔'], ['peynir', '🧀'], ['süt', '🥛'],
  ['domates', '🍅'], ['soğan', '🧅'], ['yoğurt', '🥣'], ['elma', '🍎'],
  ['marul', '🥬'], ['pirinç', '🍚'], ['makarna', '🍝'], ['biber', '🫑'],
  ['salça', '🥫'], ['tavuk', '🍗'], ['mantar', '🍄'], ['roka', '🥬'],
];

function normalize(value) {
  return String(value || '').toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').replace(/İ/g, 'i').trim();
}

function statusFor(chunk) {
  return /\b(bitti|tükendi|yok)\b/i.test(chunk) ? 'finished' : /\b(azaldı|azald|az)\b/i.test(chunk) ? 'low' : 'available';
}

function quantityFor(chunk, term) {
  const measured = chunk.match(/\b\d+(?:[,.]\d+)?\s*(?:kg|kilo|gram|g|adet|litre|l|paket|kutu|demet)\b/i)?.[0];
  const number = chunk.match(/\b\d+(?:[,.]\d+)?\b/)?.[0];
  return measured || (number ? `${number} ${term}` : null);
}

export function parsePantryNote(text) {
  const value = String(text || '').trim();
  if (!value) return { items: [], unparsed_text: '' };
  const chunks = value.replace(/[;]/g, ',').split(/,|\s+ve\s+/i).map((chunk) => chunk.trim()).filter(Boolean);
  const items = [];
  const parsedChunks = [];
  for (const chunk of chunks) {
    const normalized = normalize(chunk);
    const match = terms.find(([term]) => normalized.includes(normalize(term)));
    if (!match) continue;
    const [term, emoji] = match;
    const existing = items.find((item) => item.canonical_name === term);
    const item = { canonical_name: term, display_name: term, emoji, quantity_text: quantityFor(chunk, term), stock_state: statusFor(chunk), confidence: 1 };
    if (existing) Object.assign(existing, item);
    else items.push(item);
    parsedChunks.push(chunk);
  }
  return { items, unparsed_text: chunks.filter((chunk) => !parsedChunks.includes(chunk)).join(', ') };
}
