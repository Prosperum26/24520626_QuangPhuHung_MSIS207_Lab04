import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SimpleForm from './SimpleForm.jsx';

describe('SimpleForm (khung)', () => {
  it('có <form> có tên, fieldset có legend và nút gửi type="submit"', () => {
    render(<SimpleForm />);
    expect(screen.getByRole('form', { name: /thêm người/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /thông tin/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /thêm người/i })).toHaveAttribute('type', 'submit');
  });

  it('có tiêu đề h2 (h1 nằm ở AppLayout)', () => {
    render(<SimpleForm />);
    expect(screen.getByRole('heading', { level: 2, name: /thêm người/i })).toBeInTheDocument();
  });

  it('render không phát warning hay error ra console', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<SimpleForm />);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });
});
