import assert from 'node:assert/strict';
import { calculateFitTarget, normalizeFitProfile } from './SOFRA-FIT-V1.mjs';

const ready = normalizeFitProfile({ gender: 'Kadın', age: '30', height: '165', weight: '60', activityFactor: 1.375, goalKey: 'lose' });
assert.deepEqual(ready, {
  schemaVersion: 1,
  gender: 'female',
  age: 30,
  heightCm: 165,
  weightKg: 60,
  activityFactor: 1.375,
  goal: 'lose',
  ready: true,
});

const target = calculateFitTarget(ready);
assert.equal(target.ready, true);
assert.equal(target.formulaVersion, 'mifflin-st-jeor-v1');
assert.equal(target.targetKcal, 1515);
assert.equal(target.proteinTargetG, 90);
assert.equal(target.approximate, true);
assert.match(target.warning, /uzman görüşünün yerine geçmez/);

const incomplete = calculateFitTarget({ gender: 'Erkek', age: 29, height: 168 });
assert.equal(incomplete.ready, false);
assert.equal(incomplete.targetKcal, null);
assert.equal(incomplete.proteinTargetG, null);

const invalid = normalizeFitProfile({ age: 12, height: 300, weight: -1, goal: 'medical', activityFactor: 99 });
assert.equal(invalid.ready, false);
assert.equal(invalid.goal, 'balanced');
assert.equal(invalid.activityFactor, 1.375);

console.log('SOFRA_FIT_CONTRACT_TEST_OK');
console.log(`target=${target.targetKcal}kcal protein=${target.proteinTargetG}g incompleteGuard=${incomplete.ready === false}`);
