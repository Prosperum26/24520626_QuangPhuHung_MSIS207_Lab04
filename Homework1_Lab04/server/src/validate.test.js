import { describe, expect, it } from 'vitest';
import { validateSwipe } from './validate.js';

const PROFILE_ID = '6745f0c2a1b2c3d4e5f60718';

describe('validateSwipe', () => {
  it.each([
    ['null', null],
    ['mảng', [PROFILE_ID, 'right']],
    ['chuỗi', 'right'],
  ])('body là %s thì báo phải là object', (_, body) => {
    expect(validateSwipe(body)).toEqual({ error: 'Body must be a JSON object' });
  });

  it.each([undefined, 'down', 'RIGHT', '', 1])('direction %s không hợp lệ', (direction) => {
    expect(validateSwipe({ profileId: PROFILE_ID, direction })).toEqual({
      error: 'direction must be left, right or up',
    });
  });

  it.each([undefined, '', 'abc', 'abcdefghijkl', 123, { $gt: '' }])('profileId %s không hợp lệ', (profileId) => {
    expect(validateSwipe({ profileId, direction: 'right' })).toEqual({ error: 'profileId is invalid' });
  });

  it('kiểm direction trước profileId', () => {
    expect(validateSwipe({ profileId: 'abc', direction: 'down' })).toEqual({
      error: 'direction must be left, right or up',
    });
  });

  it.each(['left', 'right', 'up'])('nhận direction %s và bỏ khoá thừa', (direction) => {
    expect(validateSwipe({ profileId: PROFILE_ID, direction, id: 'x', createdAt: 'y', gameId: 'z' })).toEqual({
      value: { profileId: PROFILE_ID, direction },
    });
  });
});
