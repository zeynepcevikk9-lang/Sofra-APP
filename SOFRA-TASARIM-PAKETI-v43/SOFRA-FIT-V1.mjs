/**
 * Sofra Fit profilinin provider-neutral sözleşmesi.
 *
 * Bu hesap tıbbi değerlendirme değildir. Yalnızca uygulama içi yaklaşık hedef
 * üretir; gerçek sağlık verisi veya HealthKit/Health Connect bağlantısı burada
 * okunmaz.
 */

export const FIT_GOALS = Object.freeze(['balanced', 'lose', 'gain']);
export const FIT_GENDERS = Object.freeze(['female', 'male', 'unspecified']);
export const ACTIVITY_FACTORS = Object.freeze([1.2, 1.375, 1.55, 1.725]);

const ranges = Object.freeze({
  age: [13, 100],
  heightCm: [120, 230],
  weightKg: [35, 250],
});

const genderAliases = new Map([
  ['kadın', 'female'],
  ['kadin', 'female'],
  ['female', 'female'],
  ['erkek', 'male'],
  ['male', 'male'],
  ['belirtmek istemiyorum', 'unspecified'],
  ['unspecified', 'unspecified'],
]);

const goalAliases = new Map([
  ['balanced', 'balanced'],
  ['dengede kal', 'balanced'],
  ['dengeli beslenme', 'balanced'],
  ['lose', 'lose'],
  ['kilo vermek', 'lose'],
  ['kilo verme', 'lose'],
  ['gain', 'gain'],
  ['kilo almak', 'gain'],
  ['kilo alma', 'gain'],
]);

const finiteNumber = (value) => {
  const number = typeof value === 'string' && value.trim() ? Number(value) : value;
  return Number.isFinite(number) ? number : null;
};

function boundedInteger(value, [min, max]) {
  const number = finiteNumber(value);
  return Number.isInteger(number) && number >= min && number <= max ? number : null;
}

function boundedNumber(value, [min, max]) {
  const number = finiteNumber(value);
  return number != null && number >= min && number <= max ? number : null;
}

export function normalizeFitProfile(input = {}) {
  const genderInput = String(input.gender ?? '').trim().toLocaleLowerCase('tr-TR');
  const gender = genderAliases.get(genderInput) ?? 'unspecified';
  const goalInput = String(input.goalKey ?? input.goal ?? '').trim().toLocaleLowerCase('tr-TR');
  const goal = goalAliases.get(goalInput) ?? 'balanced';
  const activityValue = Number(input.activityFactor ?? input.activity);
  const activityFactor = ACTIVITY_FACTORS.includes(activityValue) ? activityValue : 1.375;
  const age = boundedInteger(input.age, ranges.age);
  const heightCm = boundedNumber(input.heightCm ?? input.height, ranges.heightCm);
  const weightKg = boundedNumber(input.weightKg ?? input.weight, ranges.weightKg);
  return {
    schemaVersion: 1,
    gender,
    age,
    heightCm,
    weightKg,
    activityFactor,
    goal,
    ready: age != null && heightCm != null && weightKg != null,
  };
}

export function calculateFitTarget(input = {}) {
  const profile = normalizeFitProfile(input);
  if (!profile.ready) {
    return {
      ready: false,
      approximate: true,
      formulaVersion: 'mifflin-st-jeor-v1',
      profile,
      targetKcal: null,
      proteinTargetG: null,
      warning: 'Yaş, boy ve kilo tamamlanmadan yaklaşık hedef hesaplanamaz.',
    };
  }

  const genderAdjustment = profile.gender === 'male' ? 5 : profile.gender === 'female' ? -161 : -78;
  const bmr = (10 * profile.weightKg) + (6.25 * profile.heightCm) - (5 * profile.age) + genderAdjustment;
  const maintenance = bmr * profile.activityFactor;
  const goalDelta = profile.goal === 'lose' ? -300 : profile.goal === 'gain' ? 250 : 0;
  const targetKcal = Math.max(1200, Math.round(maintenance + goalDelta));
  const proteinMultiplier = profile.goal === 'lose' ? 1.5 : profile.goal === 'gain' ? 1.4 : 1.2;

  return {
    ready: true,
    approximate: true,
    formulaVersion: 'mifflin-st-jeor-v1',
    profile,
    bmrKcal: Math.round(bmr),
    maintenanceKcal: Math.round(maintenance),
    targetKcal,
    proteinTargetG: Math.round(profile.weightKg * proteinMultiplier),
    warning: 'Yaklaşık hedeftir; kişisel sağlık durumun için uzman görüşünün yerine geçmez.',
  };
}
