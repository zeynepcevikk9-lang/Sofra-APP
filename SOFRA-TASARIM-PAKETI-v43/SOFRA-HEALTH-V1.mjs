/** Shared, provider-neutral health summary normalization for Sofra Fit. */

export const allowedPermissionStates = ['granted', 'denied', 'not_requested', 'unavailable'];
export const healthProviders = ['apple_healthkit', 'health_connect'];

const permissionDefinitions = [
  { key: 'activeCalories', label: 'Aktif kalori', ios: 'HKQuantityTypeIdentifierActiveEnergyBurned', android: 'ActiveCaloriesBurned', rationale: 'Günlük hareket bağlamı' },
  { key: 'steps', label: 'Adım', ios: 'HKQuantityTypeIdentifierStepCount', android: 'Steps', rationale: 'Hareket yoğunluğu bağlamı' },
  { key: 'exercise', label: 'Egzersiz', ios: 'HKWorkoutType', android: 'ExerciseSession', rationale: 'Aktivite süresi ve türü' },
  { key: 'weightKg', label: 'Kilo', ios: 'HKQuantityTypeIdentifierBodyMass', android: 'Weight', rationale: 'Manuel Fit profilini desteklemek' },
];

const validDateTime = (value) => typeof value === 'string' && !Number.isNaN(new Date(value).getTime());
const nonNegative = (value) => Number.isFinite(value) && value >= 0;
const positive = (value) => Number.isFinite(value) && value > 0;

export function buildHealthPermissionPlan(provider) {
  if (!healthProviders.includes(provider)) throw Object.assign(new Error('geçersiz sağlık sağlayıcısı'), { status: 422 });
  return {
    schema_version: 1,
    provider,
    live_connection: false,
    read_only: true,
    write_permissions: [],
    manual_fallback: true,
    permissions: permissionDefinitions.map((item) => ({
      key: item.key,
      label: item.label,
      platform_type: provider === 'apple_healthkit' ? item.ios : item.android,
      rationale: item.rationale,
      requested: false,
    })),
  };
}

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
