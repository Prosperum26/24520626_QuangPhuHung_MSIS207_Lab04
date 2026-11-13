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

describe('SimpleForm gửi form', () => {
  async function fillValid(user) {
    await user.type(screen.getByLabelText('Họ tên'), 'Ada Lovelace');
    await user.type(screen.getByLabelText('Email'), 'ada@example.com');
    await user.type(screen.getByLabelText('Tuổi'), '36');
    await user.type(screen.getByLabelText('IQ'), '170.5');
  }

  it('gửi form trống: hiện tóm tắt role="alert", lộ lỗi mọi ô, đưa focus về ô lỗi đầu tiên, không có dữ liệu', async () => {
    const user = userEvent.setup();
    render(<SimpleForm />);
    await user.click(screen.getByRole('button', { name: /thêm người/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/còn lỗi/i);
    expect(screen.getByText('Họ tên là bắt buộc')).toBeInTheDocument();
    expect(screen.getByText('Email là bắt buộc')).toBeInTheDocument();
    expect(screen.getByText('Tuổi là bắt buộc')).toBeInTheDocument();
    expect(screen.getByText('IQ là bắt buộc')).toBeInTheDocument();
    expect(screen.getByLabelText('Họ tên')).toHaveFocus();
    expect(screen.queryByRole('heading', { name: /dữ liệu đã gửi/i })).not.toBeInTheDocument();
  });

  it('focus nhảy tới ô lỗi đầu tiên chứ không phải ô đầu tiên của form', async () => {
    const user = userEvent.setup();
    render(<SimpleForm />);
    await user.type(screen.getByLabelText('Họ tên'), 'Ada Lovelace');
    await user.type(screen.getByLabelText('Email'), 'ada@example.com');
    await user.click(screen.getByRole('button', { name: /thêm người/i }));
    expect(screen.getByLabelText('Tuổi')).toHaveFocus();
  });

  it('gửi form hợp lệ: hiện ShowData với age và iq là số, không còn alert', async () => {
    const user = userEvent.setup();
    render(<SimpleForm />);
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: /thêm người/i }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /dữ liệu đã gửi/i })).toBeInTheDocument();
    expect(screen.getAllByRole('term').map((el) => el.textContent)).toEqual(['name', 'email', 'age', 'iq']);
    expect(screen.getAllByRole('definition').map((el) => el.textContent)).toEqual([
      'Ada Lovelace',
      'ada@example.com',
      '36',
      '170.5',
    ]);
  });

  it('nhấn Enter trong một ô cũng gửi form (không tải lại trang)', async () => {
    const user = userEvent.setup();
    render(<SimpleForm />);
    await fillValid(user);
    await user.type(screen.getByLabelText('IQ'), '{Enter}');
    expect(screen.getByRole('heading', { level: 3, name: /dữ liệu đã gửi/i })).toBeInTheDocument();
  });

  it('gửi lại khi đã sai thì xoá dữ liệu cũ, không để kết quả lỗi thời', async () => {
    const user = userEvent.setup();
    render(<SimpleForm />);
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: /thêm người/i }));
    expect(screen.getByRole('heading', { level: 3, name: /dữ liệu đã gửi/i })).toBeInTheDocument();
    await user.clear(screen.getByLabelText('Email'));
    await user.click(screen.getByRole('button', { name: /thêm người/i }));
    expect(screen.queryByRole('heading', { level: 3, name: /dữ liệu đã gửi/i })).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('sửa hết lỗi thì tóm tắt alert tự biến mất (dẫn xuất từ submitted và isValid)', async () => {
    const user = userEvent.setup();
    render(<SimpleForm />);
    await user.click(screen.getByRole('button', { name: /thêm người/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await fillValid(user);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
