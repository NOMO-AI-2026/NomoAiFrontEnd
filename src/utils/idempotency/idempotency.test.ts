import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getOrCreateIdempotencyKey, clearIdempotencyKey } from './idempotency';

describe('idempotency utility module', () => {
  beforeEach(() => {
    // إخلاء الـ sessionStorage قبل كل اختبار لضمان العزل التام
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  describe('getOrCreateIdempotencyKey', () => {
    it('should generate a new idempotency key and store it in sessionStorage if none exists', () => {
      const planId = 1;
      const expectedStorageKey = `nomoai_idempotency_plan_${planId}`;

      expect(sessionStorage.getItem(expectedStorageKey)).toBeNull();

      const generatedKey = getOrCreateIdempotencyKey(planId);

      expect(generatedKey).toBeDefined();
      expect(typeof generatedKey).toBe('string');
      expect(generatedKey.length).toBeGreaterThan(0);
      expect(sessionStorage.getItem(expectedStorageKey)).toBe(generatedKey);
    });

    it('should return the existing idempotency key from sessionStorage if it already exists', () => {
      const planId = 5;
      const expectedStorageKey = `nomoai_idempotency_plan_${planId}`;
      const preExistingKey = 'custom-existing-idempotency-key-12345';

      sessionStorage.setItem(expectedStorageKey, preExistingKey);

      const returnedKey = getOrCreateIdempotencyKey(planId);

      expect(returnedKey).toBe(preExistingKey);
    });

    it('should maintain independent keys for different planIds', () => {
      const planId1 = 10;
      const planId2 = 20;

      const key1 = getOrCreateIdempotencyKey(planId1);
      const key2 = getOrCreateIdempotencyKey(planId2);

      expect(key1).not.toBe(key2);
      expect(sessionStorage.getItem(`nomoai_idempotency_plan_${planId1}`)).toBe(key1);
      expect(sessionStorage.getItem(`nomoai_idempotency_plan_${planId2}`)).toBe(key2);
    });

    it('should fallback to timestamp generator when crypto.randomUUID is not available', () => {
      const planId = 99;
      const originalCrypto = globalThis.crypto;

      // محاكاة عدم وجود crypto.randomUUID بأسلوب آمن وكتابة صريحة بدون any
      const mockCrypto: Partial<Crypto> = { ...originalCrypto };
      delete mockCrypto.randomUUID;
      vi.stubGlobal('crypto', mockCrypto);

      const fallbackKey = getOrCreateIdempotencyKey(planId);

      expect(fallbackKey).toMatch(/^idemp_\d+_[a-z0-9]+$/);
      expect(sessionStorage.getItem(`nomoai_idempotency_plan_${planId}`)).toBe(fallbackKey);
    });
  });

  describe('clearIdempotencyKey', () => {
    it('should remove the idempotency key from sessionStorage for the specified planId', () => {
      const planId = 3;
      const key = getOrCreateIdempotencyKey(planId);

      expect(sessionStorage.getItem(`nomoai_idempotency_plan_${planId}`)).toBe(key);

      clearIdempotencyKey(planId);

      expect(sessionStorage.getItem(`nomoai_idempotency_plan_${planId}`)).toBeNull();
    });

    it('should not throw error or affect other plan keys when clearing key', () => {
      const planId1 = 100;
      const planId2 = 200;

      getOrCreateIdempotencyKey(planId1);
      const key2 = getOrCreateIdempotencyKey(planId2);

      clearIdempotencyKey(planId1);

      expect(sessionStorage.getItem(`nomoai_idempotency_plan_${planId1}`)).toBeNull();
      expect(sessionStorage.getItem(`nomoai_idempotency_plan_${planId2}`)).toBe(key2);
    });
  });
});
