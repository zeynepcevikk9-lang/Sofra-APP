/** Shared, provider-neutral health summary normalization for Sofra Fit. */

export const allowedPermissionStates = ['granted', 'denied', 'not_requested', 'unavailable'];

const validDateTime = (value) => typeof value === 'string' && !Number.isNaN(new Date(value).getTime());
const nonNegative = (value) => Number.isFinite(value) && value >= 0;
const positive = (value) => Number.isFinite(value) && value > 0;

export function normalizeHealthSummary(input = {}) {
  const permissions = Object.fromEntries(
    Object.entries(input.permissions ?? {}).map(([key, value]) => [key, allowedPermissionStates.includes(value) ? value : 'unavailable']),
  );
  const source = input.source === 'apple_healthkit' || input.source === 'health_connect' ? input.source : 'unknown';
  return {
    source,
    asOf: validDateTime(input.asOf) ? input.asOf : null,
    activeCalories: permissions.activeCalories === 'granted' && nonNegative(input.activeCalories) ? input.activeCalories : null,
    steps: permissions.steps === 'granted' && nonNegative(input.steps) ? input.steps : null,
    exerciseMinutes: permissions.exercise === 'granted' && nonNegative(input.exerciseMinutes) ? input.exerciseMinutes : null,
    weightKg: permissions.weightKg === 'granted' && positive(input.weightKg) ? input.weightKg : null,
    permissions,
  };
}

export function fitContext(summary) {
  const normalized = normalizeHealthSummary(summary);
  return {
    source: normalized.source,
    asOf: normalized.asOf,
    activeCalories: normalized.activeCalories,
    steps: normalized.steps,
    exerciseMinutes: normalized.exerciseMinutes,
    weightKg: normalized.weightKg,
  };
}

export function marketPayload({ candidateIds = [] } = {}) {
  return { candidateIds: [...candidateIds] };
}
