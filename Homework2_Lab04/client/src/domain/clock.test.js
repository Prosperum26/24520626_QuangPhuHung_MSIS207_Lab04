import { describe, expect, it } from 'vitest';
import { estimateOffset, formatRemaining } from './clock.js';

describe('estimateOffset', () => {
  it('lấy giờ server trừ điểm giữa của request', () => {
    expect(estimateOffset({ serverNow: 601_100, sentAt: 1000, receivedAt: 1200 })).toBe(600_000);
  });
  it('máy chạy nhanh hơn server thì offset âm', () => {
    expect(estimateOffset({ serverNow: 1000, sentAt: 5000, receivedAt: 5000 })).toBe(-4000);
  });
});

describe('formatRemaining', () => {
  it('định dạng HH:MM:SS, làm tròn lên giây', () => {
    expect(formatRemaining(0)).toBe('00:00:00');
    expect(formatRemaining(1)).toBe('00:00:01');
    expect(formatRemaining(61_000)).toBe('00:01:01');
    expect(formatRemaining(172_800_000)).toBe('48:00:00');
    expect(formatRemaining(-5)).toBe('00:00:00');
  });
});
