/**
 * Refueler — Notification Service Tests
 * Session 17 · lib/notifications.test.ts
 *
 * Run with: npx vitest lib/notifications.test.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildAmbientNotificationContent,
  parseNotificationResponse,
  isAmbientNotificationData,
  CATEGORY_AMBIENT_CONFIRM,
  ACTION_CONFIRM,
  ACTION_NOT_NOW,
  type AmbientNotificationData,
} from './notifications';
import type { AmbientTriggerPayload } from './ambientAwareness';

// ---------------------------------------------------------------------------
// Mock react-native (not available in test environment)
// ---------------------------------------------------------------------------
vi.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

vi.mock('expo-notifications', () => ({
  DEFAULT_ACTION_IDENTIFIER: 'expo.modules.notifications.actions.DEFAULT',
  scheduleNotificationAsync: vi.fn().mockResolvedValue('mock-notif-id'),
  cancelScheduledNotificationAsync: vi.fn().mockResolvedValue(undefined),
  setNotificationCategoryAsync: vi.fn().mockResolvedValue(undefined),
  setNotificationChannelAsync: vi.fn().mockResolvedValue(undefined),
  setNotificationHandler: vi.fn(),
  addNotificationResponseReceivedListener: vi.fn().mockReturnValue({ remove: vi.fn() }),
  getPermissionsAsync: vi.fn().mockResolvedValue({ status: 'undetermined' }),
  requestPermissionsAsync: vi.fn().mockResolvedValue({ status: 'granted' }),
  AndroidImportance: { HIGH: 4 },
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeTriggerPayload(overrides: Partial<AmbientTriggerPayload> = {}): AmbientTriggerPayload {
  return {
    orderId:        'ord_001',
    itemLabel:      'flat white medium',
    venueId:        'venue_ms_fenchurch',
    etaSeconds:     240,
    etaSource:      'darwin',
    triggeredAt:    new Date('2026-05-31T08:12:00Z'),
    trainServiceId: 'SRV_001',
    ...overrides,
  };
}

function makeNotificationResponse(
  actionIdentifier: string,
  data: AmbientNotificationData | Record<string, unknown>
): any {
  return {
    actionIdentifier,
    notification: {
      request: {
        content: { data },
      },
    },
  };
}

// ---------------------------------------------------------------------------
// buildAmbientNotificationContent
// ---------------------------------------------------------------------------

describe('buildAmbientNotificationContent', () => {
  it('produces correct body copy for standard ETA', () => {
    const payload = makeTriggerPayload({ etaSeconds: 240 });
    const { content } = buildAmbientNotificationContent(payload);
    expect(content.body).toBe('Your flat white medium will be ready in 4 mins, confirm?');
  });

  it('uses "1 min" for ETAs under 90 seconds', () => {
    const payload = makeTriggerPayload({ etaSeconds: 60 });
    const { content } = buildAmbientNotificationContent(payload);
    expect(content.body).toBe('Your flat white medium will be ready in 1 min, confirm?');
  });

  it('floors to 1 min, never shows 0 mins', () => {
    const payload = makeTriggerPayload({ etaSeconds: 20 });
    const { content } = buildAmbientNotificationContent(payload);
    expect(content.body).toContain('1 min');
    expect(content.body).not.toContain('0 min');
  });

  it('rounds correctly — 150s → 3 mins', () => {
    const payload = makeTriggerPayload({ etaSeconds: 150 });
    const { content } = buildAmbientNotificationContent(payload);
    expect(content.body).toContain('3 mins');
  });

  it('sets title to Refueler', () => {
    const { content } = buildAmbientNotificationContent(makeTriggerPayload());
    expect(content.title).toBe('Refueler');
  });

  it('sets correct category identifier', () => {
    const { content } = buildAmbientNotificationContent(makeTriggerPayload());
    expect(content.categoryIdentifier).toBe(CATEGORY_AMBIENT_CONFIRM);
  });

  it('includes all required data fields', () => {
    const payload = makeTriggerPayload();
    const { content } = buildAmbientNotificationContent(payload);
    const data = content.data as AmbientNotificationData;
    expect(data.type).toBe('ambient_confirm');
    expect(data.orderId).toBe('ord_001');
    expect(data.venueId).toBe('venue_ms_fenchurch');
    expect(data.itemLabel).toBe('flat white medium');
    expect(data.etaSeconds).toBe(240);
    expect(data.etaSource).toBe('darwin');
    expect(typeof data.triggeredAt).toBe('string'); // ISO string
  });

  it('does not set badge', () => {
    const { content } = buildAmbientNotificationContent(makeTriggerPayload());
    expect(content.badge).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// isAmbientNotificationData
// ---------------------------------------------------------------------------

describe('isAmbientNotificationData', () => {
  it('returns true for valid ambient data', () => {
    const data: AmbientNotificationData = {
      type: 'ambient_confirm', orderId: 'x', venueId: 'y',
      itemLabel: 'latte', etaSeconds: 180,
      etaSource: 'darwin', triggeredAt: new Date().toISOString(),
    };
    expect(isAmbientNotificationData(data)).toBe(true);
  });

  it('returns false for null', () => {
    expect(isAmbientNotificationData(null)).toBe(false);
  });

  it('returns false for wrong type field', () => {
    expect(isAmbientNotificationData({ type: 'marketing_push', orderId: 'x' })).toBe(false);
  });

  it('returns false for missing orderId', () => {
    expect(isAmbientNotificationData({ type: 'ambient_confirm' })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// parseNotificationResponse
// ---------------------------------------------------------------------------

describe('parseNotificationResponse', () => {
  const ambientData: AmbientNotificationData = {
    type: 'ambient_confirm', orderId: 'ord_001', venueId: 'venue_ms',
    itemLabel: 'flat white medium', etaSeconds: 240,
    etaSource: 'darwin', triggeredAt: new Date().toISOString(),
  };

  it('parses CONFIRM action correctly', () => {
    const response = makeNotificationResponse(ACTION_CONFIRM, ambientData);
    const result = parseNotificationResponse(response);
    expect(result.action).toBe('confirm');
    if (result.action === 'confirm') {
      expect(result.orderId).toBe('ord_001');
      expect(result.venueId).toBe('venue_ms');
      expect(result.etaSeconds).toBe(240);
    }
  });

  it('parses NOT_NOW action correctly', () => {
    const response = makeNotificationResponse(ACTION_NOT_NOW, ambientData);
    const result = parseNotificationResponse(response);
    expect(result.action).toBe('not_now');
    if (result.action === 'not_now') {
      expect(result.orderId).toBe('ord_001');
    }
  });

  it('parses bare tap (DEFAULT_ACTION_IDENTIFIER) as tap', () => {
    const response = makeNotificationResponse(
      'expo.modules.notifications.actions.DEFAULT',
      ambientData
    );
    const result = parseNotificationResponse(response);
    expect(result.action).toBe('tap');
  });

  it('returns unknown for non-ambient notification data', () => {
    const response = makeNotificationResponse(ACTION_CONFIRM, {
      type: 'marketing_push',
      message: 'Try our new M&S menu',
    });
    const result = parseNotificationResponse(response);
    expect(result.action).toBe('unknown');
  });

  it('returns unknown for unrecognised action identifier on ambient data', () => {
    const response = makeNotificationResponse('SOME_OTHER_ACTION', ambientData);
    const result = parseNotificationResponse(response);
    expect(result.action).toBe('unknown');
  });
});
