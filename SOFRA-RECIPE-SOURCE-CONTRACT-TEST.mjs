import assert from 'node:assert/strict';
import { recipeContentProvenance, validateRecipeSourceRecord } from './SOFRA-RECIPE-SOURCE-V1.mjs';

const valid = validateRecipeSourceRecord({
  source_id: 'partner-demo-001',
  source_type: 'licensed_partner',
  source_url: 'https://partner.example/recipes/001',
  attribution: 'Demo partner editorial team',
  license: 'licensed_partner',
  license_url: 'https://partner.example/license',
  recipe_revision_id: 'recipe-001-r3',
  last_verified_at: '2026-10-19T10:00:00Z',
  ingredients: [{ canonical_name: 'domates', display_name: 'Domates', quantity_value: 2, unit: 'adet' }],
  media: [{ asset_id: 'step-1', type: 'image', source_url: 'https://partner.example/media/step-1.jpg', license: 'licensed_partner', attribution: 'Demo partner' }],
});
assert.equal(valid.status, 'verified');
assert.equal(valid.content_provenance.ingredients_status, 'source_bound');
assert.equal(valid.content_provenance.media_status, 'source_bound');
assert.equal(valid.content_provenance.media[0].license, 'licensed_partner');

const missingLicense = validateRecipeSourceRecord({
  source_id: 'bad-001', source_type: 'licensed_partner', source_url: 'https://example.com/r', attribution: 'Unknown',
  recipe_revision_id: 'r1', last_verified_at: '2026-10-19T10:00:00Z', ingredients: [{ canonical_name: 'domates', quantity_value: 1, unit: 'adet' }],
});
assert.equal(missingLicense.status, 'rejected');
assert.ok(missingLicense.errors.includes('license_invalid'));
assert.equal(missingLicense.content_provenance, null);

const missingConversionSource = validateRecipeSourceRecord({
  source_id: 'bad-002', source_type: 'public_domain', source_url: 'https://example.com/r', attribution: 'Public source', license: 'public_domain',
  recipe_revision_id: 'r1', last_verified_at: '2026-10-19T10:00:00Z', ingredients: [{ canonical_name: 'domates', quantity_value: 1, unit: 'adet' }],
});
assert.equal(missingConversionSource.status, 'verified', 'kaynak provenance olcum kaydindan ayridir');
assert.equal(recipeContentProvenance({ content_source: { source_id: 'not-enough' } }), null);

console.log('SOFRA_RECIPE_SOURCE_CONTRACT_OK');
console.log('provenance=verified license=required media=source_bound demoCatalog=unverified');
