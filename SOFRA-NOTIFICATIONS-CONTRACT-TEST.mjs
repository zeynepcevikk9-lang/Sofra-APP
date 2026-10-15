import assert from 'node:assert/strict';
import { buildNotificationStatus, NOTIFICATION_SCHEMA_VERSION } from './SOFRA-NOTIFICATIONS-V1.mjs';

for (const [platform, api] of [['ios', 'UNUserNotificationCenter'], ['android', 'POST_NOTIFICATIONS'], ['web', 'Notification.requestPermission']]) {
  const status = buildNotificationStatus({ platform });
  assert.equal(status.schema_version, NOTIFICATION_SCHEMA_VERSION);
  assert.equal(status.live_permission, false);
  assert.equal(status.permission_status, 'not_requested');
  assert.equal(status.permission_plan.permission_api, api);
  assert.equal(status.channels.length, 3);
  assert.ok(status.channels.every((channel) => channel.enabled === false));
  assert.equal(status.privacy.health_data_included, false);
}
assert.throws(() => buildNotificationStatus({ platform: 'desktop' }), /platformu/);

console.log('SOFRA_NOTIFICATIONS_CONTRACT_TEST_OK');
console.log('ios=ok android=ok web=ok prompt=not_requested privacy=bounded');
