import { describe, it, expect } from 'vitest';
import { RULES, INITIAL_VALUES, evaluateErrors, toPerson } from './rules.js';

const valid = { name: 'Ada Lovelace', email: 'ada@example.com', age: '36', iq: '170' };
const errorsOf = (patch) => evaluateErrors({ ...valid, ...patch }, RULES);

describe('INITIAL_VALUES', () => {
  it('có bốn field rỗng khớp với RULES và đóng băng', () => {
    expect(Object.keys(INITIAL_VALUES)).toEqual(Object.keys(RULES));
    expect(Object.values(INITIAL_VALUES).every((v) => v === '')).toBe(true);
    expect(Object.isFrozen(INITIAL_VALUES)).toBe(true);
  });
});

describe('evaluateErrors', () => {
  it('dữ liệu hợp lệ cho object rỗng', () => {
    expect(evaluateErrors(valid, RULES)).toEqual({});
  });

  it('form trống báo lỗi bắt buộc cho cả bốn field', () => {
    expect(evaluateErrors(INITIAL_VALUES, RULES)).toEqual({
      name: 'Họ tên là bắt buộc',
      email: 'Email là bắt buộc',
      age: 'Tuổi là bắt buộc',
      iq: 'IQ là bắt buộc',
    });
  });

  it('chỉ chứa field có lỗi', () => {
    expect(Object.keys(errorsOf({ email: 'x' }))).toEqual(['email']);
  });

  it('không đổi object đầu vào', () => {
    const values = Object.freeze({ ...valid, email: 'x' });
    expect(() => evaluateErrors(values, RULES)).not.toThrow();
  });

  it('luật nhận được toàn bộ values (nền cho validation chéo trường)', () => {
    const rules = { a: (value, all) => (value === all.b ? null : 'a phải bằng b'), b: () => null };
    expect(evaluateErrors({ a: '1', b: '2' }, rules)).toEqual({ a: 'a phải bằng b' });
    expect(evaluateErrors({ a: '2', b: '2' }, rules)).toEqual({});
  });

  it('field thiếu trong values được coi là chuỗi rỗng', () => {
    expect(evaluateErrors({}, RULES).name).toBe('Họ tên là bắt buộc');
  });
});

describe('name', () => {
  it('rỗng và chỉ khoảng trắng đều là bắt buộc', () => {
    expect(errorsOf({ name: '' }).name).toBe('Họ tên là bắt buộc');
    expect(errorsOf({ name: '   ' }).name).toBe('Họ tên là bắt buộc');
  });
  it('biên 2 và 60 ký tự sau trim', () => {
    expect(errorsOf({ name: 'A' }).name).toBe('Họ tên cần ít nhất 2 ký tự');
    expect(errorsOf({ name: ' A ' }).name).toBe('Họ tên cần ít nhất 2 ký tự');
    expect(errorsOf({ name: 'Ab' }).name).toBeUndefined();
    expect(errorsOf({ name: 'a'.repeat(60) }).name).toBeUndefined();
    expect(errorsOf({ name: 'a'.repeat(61) }).name).toBe('Họ tên tối đa 60 ký tự');
  });
});

describe('email', () => {
  it('rỗng là bắt buộc', () => {
    expect(errorsOf({ email: '' }).email).toBe('Email là bắt buộc');
  });
  it('sai dạng', () => {
    for (const bad of ['abc', 'a@b', '@b.c', 'a@.c', 'a b@c.d', 'a@b c.d']) {
      expect(errorsOf({ email: bad }).email, bad).toBe('Email chưa đúng định dạng');
    }
  });
  it('đúng dạng, có khoảng trắng hai đầu vẫn qua', () => {
    expect(errorsOf({ email: ' a@b.co ' }).email).toBeUndefined();
  });
});

describe('age', () => {
  it('rỗng là bắt buộc', () => {
    expect(errorsOf({ age: '' }).age).toBe('Tuổi là bắt buộc');
  });
  it('không phải số nguyên', () => {
    for (const bad of ['abc', '12.5', '-3', '1e2', '1 2']) {
      expect(errorsOf({ age: bad }).age, bad).toBe('Tuổi phải là số nguyên');
    }
  });
  it('biên 1 và 150', () => {
    expect(errorsOf({ age: '0' }).age).toBe('Tuổi từ 1 đến 150');
    expect(errorsOf({ age: '1' }).age).toBeUndefined();
    expect(errorsOf({ age: '150' }).age).toBeUndefined();
    expect(errorsOf({ age: '151' }).age).toBe('Tuổi từ 1 đến 150');
  });
});

describe('iq', () => {
  it('rỗng là bắt buộc', () => {
    expect(errorsOf({ iq: '' }).iq).toBe('IQ là bắt buộc');
  });
  it('không phải số', () => {
    for (const bad of ['abc', '-1', '1e2', '1.', '.5']) {
      expect(errorsOf({ iq: bad }).iq, bad).toBe('IQ phải là số');
    }
  });
  it('biên 50 và 300, chấp nhận số thập phân', () => {
    expect(errorsOf({ iq: '49' }).iq).toBe('IQ từ 50 đến 300');
    expect(errorsOf({ iq: '50' }).iq).toBeUndefined();
    expect(errorsOf({ iq: '170.5' }).iq).toBeUndefined();
    expect(errorsOf({ iq: '300' }).iq).toBeUndefined();
    expect(errorsOf({ iq: '300.1' }).iq).toBe('IQ từ 50 đến 300');
  });
});

describe('toPerson', () => {
  it('cắt khoảng trắng chuỗi và đổi age, iq sang số', () => {
    expect(toPerson({ name: '  Ada ', email: ' ada@example.com ', age: ' 36 ', iq: '170.5' })).toEqual({
      name: 'Ada',
      email: 'ada@example.com',
      age: 36,
      iq: 170.5,
    });
  });

  it('trả object mới đóng băng, không đổi đầu vào', () => {
    const values = Object.freeze({ ...valid });
    const person = toPerson(values);
    expect(person).not.toBe(values);
    expect(Object.isFrozen(person)).toBe(true);
  });
});
