import { act, renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FormProvider } from './FormProvider.jsx';
import { useFormContext } from './FormContext.js';
import { INITIAL_VALUES } from './rules.js';

function setup(props = {}) {
  const wrapper = ({ children }) => <FormProvider {...props}>{children}</FormProvider>;
  return renderHook(() => useFormContext(), { wrapper });
}

const fillValid = (result) => {
  act(() => {
    result.current.setValue('name', 'Ada Lovelace');
    result.current.setValue('email', 'ada@example.com');
    result.current.setValue('age', '36');
    result.current.setValue('iq', '170');
  });
};

describe('FormProvider', () => {
  it('bắt đầu với values rỗng, errors đã tính sẵn nhưng chưa hiện (visibleErrors rỗng)', () => {
    const { result } = setup();
    expect(result.current.values).toEqual(INITIAL_VALUES);
    expect(Object.keys(result.current.errors)).toEqual(['name', 'email', 'age', 'iq']);
    expect(result.current.visibleErrors).toEqual({});
    expect(result.current.isValid).toBe(false);
    expect(result.current.submitted).toBe(false);
  });

  it('setValue cập nhật bất biến và errors dẫn xuất trong cùng lượt render', () => {
    const { result } = setup();
    const before = result.current.values;
    act(() => result.current.setValue('name', 'Ada'));
    expect(result.current.values.name).toBe('Ada');
    expect(before.name).toBe('');
    expect(result.current.errors.name).toBeUndefined();
  });

  it('isValid là true khi mọi field hợp lệ', () => {
    const { result } = setup();
    fillValid(result);
    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
  });

  it('touch chỉ làm lộ lỗi của field đó', () => {
    const { result } = setup();
    act(() => result.current.touch('email'));
    expect(Object.keys(result.current.visibleErrors)).toEqual(['email']);
  });

  it('touch field đã touch thì không đổi state (giữ tham chiếu)', () => {
    const { result } = setup();
    act(() => result.current.touch('email'));
    const first = result.current.visibleErrors;
    act(() => result.current.touch('email'));
    expect(result.current.visibleErrors).toEqual(first);
  });

  it('markSubmitted làm lộ lỗi của mọi field', () => {
    const { result } = setup();
    act(() => result.current.markSubmitted());
    expect(result.current.submitted).toBe(true);
    expect(Object.keys(result.current.visibleErrors)).toEqual(['name', 'email', 'age', 'iq']);
  });

  it('nhận rules tuỳ chỉnh, gồm luật chéo trường', () => {
    const rules = {
      password: (v) => (v ? null : 'bắt buộc'),
      confirm: (v, all) => (v === all.password ? null : 'không khớp'),
    };
    const { result } = setup({ rules, initialValues: { password: '', confirm: '' } });
    act(() => {
      result.current.setValue('password', 'abc');
      result.current.setValue('confirm', 'abd');
    });
    expect(result.current.errors).toEqual({ confirm: 'không khớp' });
  });
});
