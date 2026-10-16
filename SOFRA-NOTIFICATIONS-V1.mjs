/** Provider-neutral notification permission boundary; no system prompt is opened here. */

export const NOTIFICATION_SCHEMA_VERSION = 1;
const platformPlans = {
  ios: { permission_api: 'UNUserNotificationCenter', permission_key: 'alert,badge,sound' },
  android: { permission_api: 'POST_NOTIFICATIONS', permission_key: 'notifications' },
  web: { permission_api: 'Notification.requestPermission', permission_key: 'notifications' },
};
const channels = [
  { key: 'meal_reminder', label: 'Öğün hatırlatmaları', default_enabled: false },
  { key: 'expiry_reminder', label: 'Yaklaşan ürün hatırlatmaları', default_enabled: false },
  { key: 'plan_reminder', label: 'Planım hatırlatmaları', default_enabled: false },
];

function validationError(message) { return Object.assign(new Error(message), { status: 422 }); }

export function buildNotificationStatus({ platform = 'web' } = {}) {
  if (!Object.hasOwn(platformPlans, platform)) throw validationError('geçersiz bildirim platformu');
  return {
    schema_version: NOTIFICATION_SCHEMA_VERSION,
    platform,
    live_permission: false,
    permission_status: 'not_requested',
    permission_plan: platformPlans[platform],
    channels: channels.map((channel) => ({ ...channel, enabled: false })),
    requires_user_action: true,
    permission_explainer: {
      required_before_system_prompt: true,
      shown_in_prototype: true,
      system_prompt_status: 'not_requested',
    },
    manual_fallback: { available: true, keeps_plan_and_fit_usable: true },
    privacy: { content_preview: false, health_data_included: false, market_data_included: false },
  };
}
