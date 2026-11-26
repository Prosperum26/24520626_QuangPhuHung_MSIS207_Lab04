import { describe, expect, it } from 'vitest';
import { Profile } from './models.js';
import { SEED_PROFILES, seedProfiles } from './seed.js';
import { useTestDb } from './test/db.js';

useTestDb();

describe('SEED_PROFILES', () => {
  it('có 12 hồ sơ: 6 nam, 6 nữ', () => {
    expect(SEED_PROFILES).toHaveLength(12);
    expect(SEED_PROFILES.filter((p) => p.gender === 'male')).toHaveLength(6);
    expect(SEED_PROFILES.filter((p) => p.gender === 'female')).toHaveLength(6);
  });

  it('tên không trùng nhau', () => {
    expect(new Set(SEED_PROFILES.map((p) => p.name)).size).toBe(12);
  });
});

describe('seedProfiles', () => {
  it('nạp 12 hồ sơ hợp lệ theo schema', async () => {
    await expect(seedProfiles()).resolves.toBe(12);
    expect(await Profile.countDocuments()).toBe(12);
  });

  it('chạy lại không nhân đôi dữ liệu', async () => {
    await seedProfiles();
    await seedProfiles();
    expect(await Profile.countDocuments()).toBe(12);
  });
});
