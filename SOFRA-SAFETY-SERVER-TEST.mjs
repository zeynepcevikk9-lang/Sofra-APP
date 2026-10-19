import assert from 'node:assert/strict';
import { createSofraServer } from './SOFRA-API-SERVER.mjs';

const { server } = createSofraServer();
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = 'http://127.0.0.1:' + server.address().port;
const request = async (body) => {
  const response = await fetch(base + '/v1/safety-sources/validate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { response, body: await response.json() };
};

try {
  let result = await request({
    source_id: 'safety-001',
    source_type: 'public_database',
    source_url: 'https://data.example/safety/001',
    attribution: 'Public safety database',
    license: 'public_domain',
    revision_id: 'r1',
    last_verified_at: '2026-10-19T10:00:00Z',
    verified: true,
    cross_contamination: 'controlled',
    ingredients: [{ canonical_name: 'domates', allergens: [], evidence_status: 'verified', label_check_required: true, cross_contamination: 'controlled' }],
  });
  assert.equal(result.response.status, 200);
  assert.equal(result.body.status, 'verified');
  assert.equal(result.body.safety_provenance.ingredients[0].evidence_status, 'verified');

  result = await request({
    source_id: 'safety-002',
    source_type: 'public_database',
    source_url: 'https://data.example/safety/002',
    attribution: 'Public safety database',
    license: 'public_domain',
    revision_id: 'r1',
    last_verified_at: '2026-10-19T10:00:00Z',
    verified: true,
    cross_contamination: 'controlled',
    ingredients: [{ canonical_name: 'makarna', allergens: ['gluten'], evidence_status: 'candidate', label_check_required: true, cross_contamination: 'unknown' }],
  });
  assert.equal(result.body.status, 'rejected');
  assert.equal(result.body.safety_provenance, null);
} finally {
  await new Promise((resolve) => server.close(resolve));
}

console.log('SOFRA_SAFETY_SERVER_TEST_OK');
