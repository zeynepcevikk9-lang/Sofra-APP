/** Privacy-first analytics boundary; no provider or remote transmission is connected. */

export const ANALYTICS_SCHEMA_VERSION = 1;

const eventFields = Object.freeze({
  screen_view: ['screen'],
  mode_selected: ['mode'],
  recipe_open: ['recipe_id'],
  recommendation_feedback: ['value'],
  market_sort_selected: ['sort'],
  notification_preference_changed: ['enabled'],
  theme_changed: ['theme'],
  health_connection_cta_viewed: [],
});

const allowedValues = Object.freeze({
  screen: ['home', 'tarifler', 'dolabim', 'planim', 'fit', 'profil', 'aile', 'menu'],
  mode: ['sofra', 'fit', 'tatli'],
  value: ['helpful', 'not_helpful'],
  sort: ['total', 'fast', 'single'],
  theme: ['acik', 'gece'],
});

const sensitiveKey = /(age|height|weight|gender|health|kcal|calorie|protein|carb|fat|allergen|celiac|gluten|medical|email|phone|address|user.?id|token|free.?text|note|text)/i;

function validationError(message) { return Object.assign(new Error(message), { status: 422 }); }

function safeProperty(key, value) {
  if (sensitiveKey.test(key)) throw validationError(`analitik olayında hassas alan yasak: ${key}`);
  if (key === 'enabled') {
    if (typeof value !== 'boolean') throw validationError('enabled boolean olmalı');
    return value;
  }
  if (!Object.hasOwn(allowedValues, key) || !allowedValues[key].includes(value)) {
    throw validationError(`analitik alanı izinli değil: ${key}`);
  }
  return value;
}

export function sanitizeAnalyticsEvent(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw validationError('analitik olayı nesne olmalı');
  const event = input.event;
  if (typeof event !== 'string' || !Object.hasOwn(eventFields, event)) throw validationError('analitik olay adı izinli değil');
  const properties = input.properties ?? {};
  if (!properties || typeof properties !== 'object' || Array.isArray(properties)) throw validationError('analitik properties nesne olmalı');
  const allowed = eventFields[event];
  const clean = {};
  for (const [key, value] of Object.entries(properties)) {
    if (sensitiveKey.test(key)) throw validationError(`analitik olayında hassas alan yasak: ${key}`);
    if (!allowed.includes(key)) continue;
    clean[key] = safeProperty(key, value);
  }
  for (const key of allowed) if (!Object.hasOwn(clean, key)) throw validationError(`analitik alanı eksik: ${key}`);
  return {
    schema_version: ANALYTICS_SCHEMA_VERSION,
    event,
    properties: clean,
    occurred_at: typeof input.occurred_at === 'string' && !Number.isNaN(new Date(input.occurred_at).getTime())
      ? input.occurred_at
      : null,
  };
}

export function createAnalyticsEvent(event, properties = {}, occurredAt = new Date().toISOString()) {
  return sanitizeAnalyticsEvent({ event, properties, occurred_at: occurredAt });
}

export function isAnalyticsEventSafe(input) {
  try { sanitizeAnalyticsEvent(input); return true; } catch { return false; }
}

