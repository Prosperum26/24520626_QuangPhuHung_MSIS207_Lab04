import { describe, expect, it } from 'vitest';
import { deriveDeck, scoreOf, tally } from './deck.js';
import {
  DIRECTION_LABEL,
  DIRECTIONS,
  KEY_TO_DIRECTION,
  SCORE,
  SWIPE_THRESHOLD_PX,
  UNDO_KEY,
} from './swipeConfig.js';

const P = Object.freeze([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
const s = (profileId, direction) => ({ id: `${profileId}-${direction}`, profileId, direction });

describe('swipeConfig', () => {
  it('điểm bất đối xứng: thích +10, bỏ qua -5, siêu thích +20', () => {
    expect(SCORE).toEqual({ right: 10, left: -5, up: 20 });
  });

  it('hướng, nhãn, phím và ngưỡng đúng spec', () => {
    expect(DIRECTIONS).toEqual(['left', 'right', 'up']);
    expect(DIRECTION_LABEL).toEqual({ left: 'Bỏ qua', right: 'Thích', up: 'Siêu thích' });
    expect(KEY_TO_DIRECTION).toEqual({ ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up' });
    expect(UNDO_KEY).toBe('Backspace');
    expect(SWIPE_THRESHOLD_PX).toBe(80);
  });

  it('mọi hằng số bị đóng băng', () => {
    for (const value of [SCORE, DIRECTIONS, DIRECTION_LABEL, KEY_TO_DIRECTION]) {
      expect(Object.isFrozen(value)).toBe(true);
    }
  });
});

describe('deriveDeck', () => {
  it('chưa quẹt thì còn đủ thẻ theo thứ tự gốc', () => {
    expect(deriveDeck(P, []).map((p) => p.id)).toEqual(['a', 'b', 'c']);
  });

  it('bỏ hồ sơ đã quẹt, giữ thứ tự gốc của phần còn lại', () => {
    expect(deriveDeck(P, [s('b', 'left')]).map((p) => p.id)).toEqual(['a', 'c']);
  });

  it('quẹt hết thì bộ bài rỗng', () => {
    expect(deriveDeck(P, [s('a', 'up'), s('b', 'left'), s('c', 'right')])).toEqual([]);
  });

  it('hoàn tác (bỏ phần tử cuối của history) trả thẻ đó về đúng vị trí', () => {
    const history = [s('a', 'right'), s('b', 'left')];
    expect(deriveDeck(P, history.slice(0, -1)).map((p) => p.id)).toEqual(['b', 'c']);
  });
});

describe('scoreOf', () => {
  it('ván rỗng được 0 điểm', () => {
    expect(scoreOf([])).toBe(0);
  });

  it('cộng theo SCORE: +10 -5 +20 = 25', () => {
    expect(scoreOf([s('a', 'right'), s('b', 'left'), s('c', 'up')])).toBe(25);
  });

  it('điểm âm được khi chỉ bỏ qua', () => {
    expect(scoreOf([s('a', 'left'), s('b', 'left')])).toBe(-10);
  });
});

describe('tally', () => {
  it('đếm số lượt theo từng hướng', () => {
    expect(tally([s('a', 'right'), s('b', 'up'), s('c', 'right')])).toEqual({ left: 0, right: 2, up: 1 });
    expect(tally([])).toEqual({ left: 0, right: 0, up: 0 });
  });
});

describe('không mutate đầu vào', () => {
  it('chạy được với history và profiles đã Object.freeze', () => {
    const history = Object.freeze([Object.freeze(s('a', 'right'))]);
    expect(() => {
      deriveDeck(P, history);
      scoreOf(history);
      tally(history);
    }).not.toThrow();
    expect(history).toHaveLength(1);
  });
});
