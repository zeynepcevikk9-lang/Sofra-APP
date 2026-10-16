/** Shared, provider-neutral health summary normalization for Sofra Fit. */

export const allowedPermissionStates = ['granted', 'denied', 'not_requested', 'unavailable'];
export const healthProviders = ['apple_healthkit', 'health_connect'];
export const healthConnectionStates = ['not_connected', 'not_requested', 'connected', 'partial', 'denied', 'unavailable'];

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
    connection: { state: 'not_connected', revoke_supported: true, provider_settings_fallback: true },
    consent: { explain_before_system_prompt: true, permission_level: 'per_data_type' },
    permissions: permissionDefinitions.map((item) => ({
      key: item.key,
      label: item.label,
      platform_type: provider === 'apple_healthkit' ? item.ios : item.android,
      rationale: item.rationale,
      requested: false,
    })),
  };
}

export function healthConnectionState({ provider, permissions = {}, liveConnection = false } = {}) {
  if (!healthProviders.includes(provider)) throw Object.assign(new Error('geçersiz sağlık sağlayıcısı'), { status: 422 });
  if (!liveConnection) return 'not_connected';
  const states = permissionDefinitions.map((item) => allowedPermissionStates.includes(permissions[item.key]) ? permissions[item.key] : 'not_requested');
  if (states.every((state) => state === 'unavailable')) return 'unavailable';
  if (states.every((state) => state === 'denied')) return 'denied';
  if (states.every((state) => state === 'not_requested')) return 'not_requested';
  if (states.every((state) => state === 'granted')) return 'connected';
  return 'partial';
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
  const asOfTime = normalized.asOf ? new Date(normalized.asOf).getTime() : NaN;
  const options = arguments[1] || {};
  const nowTime = options.now ? new Date(options.now).getTime() : Date.now();
  const ageHours = Number.isFinite(asOfTime) && Number.isFinite(nowTime) ? (nowTime - asOfTime) / 3600000 : null;
  const freshnessState = ageHours == null ? 'unknown' : ageHours >= 0 && ageHours <= 36 ? 'fresh' : 'stale';
  const availableFields = ['activeCalories', 'steps', 'exerciseMinutes', 'weightKg'].filter((key) => normalized[key] != null);
  return {
    source: normalized.source,
    asOf: normalized.asOf,
    activeCalories: normalized.activeCalories,
    steps: normalized.steps,
    exerciseMinutes: normalized.exerciseMinutes,
    weightKg: normalized.weightKg,
    availableFields,
    freshnessState,
    usagePolicy: {
      mode: 'fit_only',
      ranking: 'not_applied_without_verified_nutrition',
      marketForwarding: false,
    },
  };
}

export function marketPayload({ candidateIds = [] } = {}) {
  return { candidateIds: [...candidateIds] };
}
