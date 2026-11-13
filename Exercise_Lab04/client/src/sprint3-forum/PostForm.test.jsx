import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import PostForm from './PostForm.jsx';

const submit = () => screen.getByRole('button', { name: /gửi/i });

describe('PostForm', () => {
  it('có hai ô có nhãn và nút gửi type="submit"', () => {
    render(<PostForm onPost={vi.fn()} />);
    expect(screen.getByLabelText('Tên')).toBeInTheDocument();
    expect(screen.getByLabelText('Nội dung').tagName).toBe('TEXTAREA');
    expect(submit()).toHaveAttribute('type', 'submit');
  });

  it('chưa bấm gửi thì chưa báo lỗi dù ô còn rỗng', () => {
    render(<PostForm onPost={vi.fn()} />);
    expect(screen.queryByText(/bắt buộc/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Tên')).toHaveAttribute('aria-invalid', 'false');
  });

  it('gửi form trống: báo lỗi từng ô (aria-describedby), không gọi onPost, focus ô lỗi đầu', async () => {
    const onPost = vi.fn();
    const user = userEvent.setup();
    render(<PostForm onPost={onPost} />);
    await user.click(submit());
    const author = screen.getByLabelText('Tên');
    expect(onPost).not.toHaveBeenCalled();
    expect(author).toHaveAttribute('aria-invalid', 'true');
    expect(author).toHaveAttribute('aria-describedby', screen.getByText('Tên là bắt buộc').id);
    expect(screen.getByLabelText('Nội dung')).toHaveAttribute(
      'aria-describedby',
      screen.getByText('Nội dung là bắt buộc').id,
    );
    expect(author).toHaveFocus();
  });

  it('vượt giới hạn thì không gọi onPost (khớp server)', async () => {
    const onPost = vi.fn();
    const user = userEvent.setup();
    render(<PostForm onPost={onPost} />);
    await user.type(screen.getByLabelText('Tên'), 'a'.repeat(41));
    await user.click(screen.getByLabelText('Nội dung'));
    await user.paste('b'.repeat(501));
    await user.click(submit());
    expect(screen.getByText('Tên tối đa 40 ký tự')).toBeInTheDocument();
    expect(screen.getByText('Nội dung tối đa 500 ký tự')).toBeInTheDocument();
    expect(onPost).not.toHaveBeenCalled();
  });

  it('hợp lệ: gọi onPost với dữ liệu đã cắt khoảng trắng; xoá nội dung, giữ tên, không còn lỗi', async () => {
    const onPost = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<PostForm onPost={onPost} />);
    await user.type(screen.getByLabelText('Tên'), '  Ada  ');
    await user.type(screen.getByLabelText('Nội dung'), '  Hello  ');
    await user.click(submit());
    expect(onPost).toHaveBeenCalledWith({ author: 'Ada', text: 'Hello' });
    expect(screen.getByLabelText('Nội dung')).toHaveValue('');
    expect(screen.getByLabelText('Tên')).toHaveValue('  Ada  ');
    expect(screen.queryByText(/bắt buộc/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('server từ chối: hiện role="alert" với thông điệp của server, giữ nguyên nội dung đã gõ', async () => {
    const onPost = vi.fn().mockRejectedValue(new Error('author is required'));
    const user = userEvent.setup();
    render(<PostForm onPost={onPost} />);
    await user.type(screen.getByLabelText('Tên'), 'Ada');
    await user.type(screen.getByLabelText('Nội dung'), 'Hello');
    await user.click(submit());
    expect(await screen.findByRole('alert')).toHaveTextContent('author is required');
    expect(screen.getByLabelText('Nội dung')).toHaveValue('Hello');
  });

  it('đang gửi thì nút bị khoá, bấm đúp không gửi hai lần', async () => {
    let finish;
    const onPost = vi.fn(() => new Promise((resolve) => (finish = resolve)));
    const user = userEvent.setup();
    render(<PostForm onPost={onPost} />);
    await user.type(screen.getByLabelText('Tên'), 'Ada');
    await user.type(screen.getByLabelText('Nội dung'), 'Hello');
    await user.click(submit());
    expect(submit()).toBeDisabled();
    await user.click(submit());
    await user.keyboard('{Enter}');
    expect(onPost).toHaveBeenCalledTimes(1);
    finish();
    expect(await screen.findByRole('button', { name: /gửi/i })).toBeEnabled();
  });
});
