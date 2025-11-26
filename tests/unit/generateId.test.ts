/**
 * Unit Test: generateId utility (crypto.randomUUID polyfill)
 *
 * Tests browser compatibility fallback
 *
 * Test ID: UTILS-UNIT-001
 * Priority: P1 (Browser compatibility)
 * Architecture: Error Handling & Resilience
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateId } from '../../src/utils/generateId';

describe('generateId', () => {
  let originalCrypto: Crypto;

  beforeEach(() => {
    originalCrypto = global.crypto;
  });

  afterEach(() => {
    global.crypto = originalCrypto;
  });

  it('should use crypto.randomUUID when available', () => {
    const mockUUID = '123e4567-e89b-12d3-a456-426614174000';
    const mockRandomUUID = vi.fn(() => mockUUID);

    global.crypto = {
      ...global.crypto,
      randomUUID: mockRandomUUID,
    };

    const id = generateId();

    expect(mockRandomUUID).toHaveBeenCalled();
    expect(id).toBe(mockUUID);
  });

  it('should fallback when crypto.randomUUID unavailable', () => {
    // Simulate older browser (Safari <15.4, Firefox <95, Chrome <92)
    global.crypto = {
      ...global.crypto,
      randomUUID: undefined as any,
    };

    const id = generateId();

    // Should generate a string with timestamp-random-random format
    expect(id).toBeTruthy();
    expect(typeof id).toBe('string');
    expect(id.split('-').length).toBe(3);
  });

  it('should fallback when crypto is undefined', () => {
    // Simulate very old browser
    global.crypto = undefined as any;

    const id = generateId();

    expect(id).toBeTruthy();
    expect(typeof id).toBe('string');
  });

  it('should generate unique IDs', () => {
    const ids = new Set<string>();

    for (let i = 0; i < 1000; i++) {
      ids.add(generateId());
    }

    // All IDs should be unique
    expect(ids.size).toBe(1000);
  });

  it('should generate IDs with consistent format (fallback)', () => {
    global.crypto = {
      ...global.crypto,
      randomUUID: undefined as any,
    };

    const id = generateId();
    const parts = id.split('-');

    expect(parts).toHaveLength(3);
    expect(parts[0].length).toBeGreaterThan(5); // Timestamp part
    expect(parts[1].length).toBeGreaterThan(5); // Random part 1
    expect(parts[2].length).toBeGreaterThan(5); // Random part 2
  });
});
