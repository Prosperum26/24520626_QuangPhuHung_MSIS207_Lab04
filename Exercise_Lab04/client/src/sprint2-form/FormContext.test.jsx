import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useFormContext } from './FormContext.js';

describe('useFormContext', () => {
  it('ném lỗi dễ hiểu khi dùng ngoài <FormProvider>', () => {
    // React in lỗi ra console khi hook ném; che đi để output test sạch.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useFormContext())).toThrow(/FormProvider/);
    spy.mockRestore();
  });
});
