import { describe, expect, it } from 'vitest';
import { FIELD_ORDER, GROUNDS, INITIAL_VALUES, RULES, evaluateErrors, toAppeal } from '../../shared/appealRules.js';

describe('appealRules', () => {
  it('email', () => {
    expect(RULES.email('')).toBe('Email là bắt buộc');
    expect(RULES.email('a@b')).toBe('Email chưa đúng định dạng');
    expect(RULES.email(42)).toBe('Email là bắt buộc');
    expect(RULES.email(' a@b.vn ')).toBeNull();
  });

  it('grounds: ít nhất một, chỉ nhận khoá trong GROUNDS', () => {
    expect(RULES.grounds([])).toBe('Chọn ít nhất một căn cứ');
    expect(RULES.grounds('x')).toBe('Chọn ít nhất một căn cứ');
    expect(RULES.grounds(['hack'])).toBe('Căn cứ không hợp lệ');
    expect(RULES.grounds(['friendly-match'])).toBeNull();
  });

  it('statement: 100 đến 2000 ký tự sau trim (R6)', () => {
    expect(RULES.statement(' '.repeat(150))).toBe('Bản giải trình là bắt buộc');
    expect(RULES.statement('a'.repeat(99))).toBe('Bản giải trình cần ít nhất 100 ký tự');
    expect(RULES.statement('a'.repeat(2001))).toBe('Bản giải trình tối đa 2000 ký tự');
    expect(RULES.statement('a'.repeat(100))).toBeNull();
    expect(RULES.statement(null)).toBe('Bản giải trình là bắt buộc');
  });

  it('evidenceUrl: không bắt buộc, có thì phải https', () => {
    expect(RULES.evidenceUrl('')).toBeNull();
    expect(RULES.evidenceUrl(undefined)).toBeNull();
    expect(RULES.evidenceUrl('http://x.vn')).toBe('Link bằng chứng phải là URL https');
    expect(RULES.evidenceUrl('không phải url')).toBe('Link bằng chứng phải là URL https');
    expect(RULES.evidenceUrl(5)).toBe('Link bằng chứng phải là URL https');
    expect(RULES.evidenceUrl('https://youtu.be/abc')).toBeNull();
  });

  it('confirm phải đúng true', () => {
    expect(RULES.confirm(false)).toBe('Cần xác nhận thông tin là đúng sự thật');
    expect(RULES.confirm('true')).toBe('Cần xác nhận thông tin là đúng sự thật');
    expect(RULES.confirm(true)).toBeNull();
  });

  it('evaluateErrors(INITIAL_VALUES) có lỗi ở email, grounds, statement, confirm', () => {
    expect(Object.keys(evaluateErrors(INITIAL_VALUES))).toEqual(['email', 'grounds', 'statement', 'confirm']);
  });

  it('FIELD_ORDER khớp RULES, GROUNDS có 4 căn cứ', () => {
    expect(FIELD_ORDER).toEqual(Object.keys(RULES));
    expect(Object.keys(GROUNDS)).toEqual(['friendly-match', 'no-explicit-rule', 'not-notified', 'disproportionate']);
  });

  it('toAppeal cắt khoảng trắng, chỉ giữ đúng các field', () => {
    const input = toAppeal({
      email: ' a@b.vn ',
      grounds: ['not-notified', 'friendly-match'],
      statement: ` ${'a'.repeat(100)} `,
      evidenceUrl: ' ',
      confirm: true,
      extra: 'x',
    });
    expect(input).toEqual({
      email: 'a@b.vn',
      grounds: ['not-notified', 'friendly-match'],
      statement: 'a'.repeat(100),
      evidenceUrl: '',
      confirm: true,
    });
  });
});
