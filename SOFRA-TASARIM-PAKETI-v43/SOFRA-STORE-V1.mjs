/** Small provider-neutral persistence adapter for the reference API. */

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export const STORE_SCHEMA_VERSION = 1;

export function emptyStoreState() {
  return { schema_version: STORE_SCHEMA_VERSION, pantry: [], plans: [], feedback: [], nextId: 1 };
}

function validArray(value) { return Array.isArray(value); }

export function normalizeStoreState(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('geçersiz store gövdesi');
  if (input.schema_version != null && input.schema_version !== STORE_SCHEMA_VERSION) throw new Error('desteklenmeyen store sürümü');
  if (!validArray(input.pantry) || !validArray(input.plans) || !validArray(input.feedback)) throw new Error('store dizileri eksik');
  const nextId = Number(input.nextId ?? 1);
  if (!Number.isInteger(nextId) || nextId < 1) throw new Error('geçersiz store nextId');
  return {
    schema_version: STORE_SCHEMA_VERSION,
    pantry: input.pantry,
    plans: input.plans,
    feedback: input.feedback,
    nextId,
  };
}

export async function loadStore(filePath, { fallback = emptyStoreState() } = {}) {
  if (typeof filePath !== 'string' || !filePath.trim()) throw new Error('store dosya yolu zorunlu');
  try {
    const raw = await readFile(filePath, 'utf8');
    return normalizeStoreState(JSON.parse(raw));
  } catch (error) {
    if (error?.code === 'ENOENT') return normalizeStoreState(fallback);
    if (error instanceof SyntaxError) throw new Error('store JSON bozuk');
    throw error;
  }
}

export async function saveStore(filePath, state) {
  if (typeof filePath !== 'string' || !filePath.trim()) throw new Error('store dosya yolu zorunlu');
  const normalized = normalizeStoreState(state);
  await mkdir(dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
  await rename(temporaryPath, filePath);
  return normalized;
}
