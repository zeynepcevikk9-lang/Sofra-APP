/**
 * Provider adapters for the future mobile layer.
 *
 * These functions deliberately accept plain objects instead of importing
 * HealthKit or Health Connect SDKs. Native code owns permission prompts and
 * sample aggregation; this boundary owns field mapping and normalization.
 */
import { buildHealthPermissionPlan, fitContext, healthConnectionState, normalizeHealthSummary } from './SOFRA-HEALTH-V1.mjs';

const healthKeys = ['activeCalories', 'steps', 'exercise', 'weightKg'];

function numeric(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function defaultPermissions(input) {
  return Object.fromEntries(healthKeys.map((key) => [key, input?.[key] ?? 'not_requested']));
}

function normalizePermissionInput(input) {
  if (Array.isArray(input)) {
    return Object.fromEntries(healthKeys.map((key) => [key, input.includes(key) ? 'granted' : 'not_requested']));
  }
  return defaultPermissions(input);
}

function normalizeAdapterInput({ source, payload = {}, permissions, asOf }) {
  return normalizeHealthSummary({
    source,
    asOf: asOf ?? payload.asOf ?? payload.lastUpdatedAt,
    activeCalories: numeric(payload.activeEnergyBurned ?? payload.activeCaloriesBurned ?? payload.activeCalories),
    steps: numeric(payload.stepCount ?? payload.steps),
    exerciseMinutes: numeric(payload.exerciseDurationMinutes ?? payload.exerciseMinutes),
    weightKg: numeric(payload.bodyMassKg ?? payload.weightKg),
    permissions: permissions ?? payload.permissions ?? defaultPermissions(),
  });
}

export function adaptHealthKitPayload(payload = {}, options = {}) {
  return normalizeAdapterInput({ source: 'apple_healthkit', payload, permissions: options.permissions, asOf: options.asOf });
}

export function adaptHealthConnectPayload(payload = {}, options = {}) {
  return normalizeAdapterInput({ source: 'health_connect', payload, permissions: options.permissions, asOf: options.asOf });
}

export function buildHealthAdapterStatus(provider, options = {}) {
  const plan = buildHealthPermissionPlan(provider);
  const permissions = normalizePermissionInput(options.permissions);
  const liveConnection = options.liveConnection === true;
  const state = healthConnectionState({ provider, permissions, liveConnection });
  const summary = normalizeHealthSummary({
    source: provider,
    asOf: options.asOf,
    activeCalories: liveConnection ? options.activeCalories : undefined,
    steps: liveConnection ? options.steps : undefined,
    exerciseMinutes: liveConnection ? options.exerciseMinutes : undefined,
    weightKg: liveConnection ? options.weightKg : undefined,
    permissions,
  });
  return {
    ...plan,
    connection: { ...plan.connection, state },
    permissions: plan.permissions.map((item) => ({
      ...item,
      status: permissions[item.key],
      requested: permissions[item.key] !== 'not_requested',
    })),
    manual_fallback_available: true,
    health_context: fitContext(summary, { now: options.now }),
  };
}

export function adaptHealthPayload(provider, payload = {}, options = {}) {
  if (provider === 'apple_healthkit') return adaptHealthKitPayload(payload, options);
  if (provider === 'health_connect') return adaptHealthConnectPayload(payload, options);
  throw Object.assign(new Error('geçersiz sağlık sağlayıcısı'), { status: 422 });
}

