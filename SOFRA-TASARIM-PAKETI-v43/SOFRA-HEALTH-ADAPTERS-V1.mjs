/**
 * Provider adapters for the future mobile layer.
 *
 * These functions deliberately accept plain objects instead of importing
 * HealthKit or Health Connect SDKs. Native code owns permission prompts and
 * sample aggregation; this boundary owns field mapping and normalization.
 */
import { normalizeHealthSummary } from './SOFRA-HEALTH-V1.mjs';

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

export function adaptHealthPayload(provider, payload = {}, options = {}) {
  if (provider === 'apple_healthkit') return adaptHealthKitPayload(payload, options);
  if (provider === 'health_connect') return adaptHealthConnectPayload(payload, options);
  throw Object.assign(new Error('geçersiz sağlık sağlayıcısı'), { status: 422 });
}

