import { Profiler } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

describe('SimpleForm với bốn ô nhập', () => {
  it('có đủ bốn ô có nhãn, đúng kiểu nhập', () => {
    render(<SimpleForm />);
    expect(screen.getByLabelText('Họ tên')).toHaveAttribute('autocomplete', 'name');
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Tuổi')).toHaveAttribute('inputmode', 'numeric');
    expect(screen.getByLabelText('IQ')).toHaveAttribute('inputmode', 'decimal');
    // age và iq phải là type="text": type="number" làm chuỗi sai biến thành '' và luật không thấy.
    expect(screen.getByLabelText('Tuổi')).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('IQ')).toHaveAttribute('type', 'text');
  });

  it('mở trang chưa hiện lỗi nào', () => {
    render(<SimpleForm />);
    expect(screen.queryByText(/bắt buộc/i)).not.toBeInTheDocument();
    for (const el of screen.getAllByRole('textbox')) {
      expect(el).toHaveAttribute('aria-invalid', 'false');
    }
  });

  it('email sai rồi Tab sang ô khác thì hiện lỗi đúng ô đó', async () => {
    const user = userEvent.setup();
    render(<SimpleForm />);
    const email = screen.getByLabelText('Email');
    await user.type(email, 'abc');
    await user.tab();
    expect(screen.getByText('Email chưa đúng định dạng')).toBeInTheDocument();
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Họ tên')).toHaveAttribute('aria-invalid', 'false');
  });

  it('một phím gõ = đúng một lượt render (không có chuỗi effect)', async () => {
    const user = userEvent.setup();
    let commits = 0;
    render(
      <Profiler id="form" onRender={() => (commits += 1)}>
        <SimpleForm />
      </Profiler>,
    );
    const name = screen.getByLabelText('Họ tên');
    await user.click(name);
    const before = commits;
    await user.keyboard('a');
    expect(commits - before).toBe(1);
    await user.keyboard('bcd');
    expect(commits - before).toBe(4);
  });
});
