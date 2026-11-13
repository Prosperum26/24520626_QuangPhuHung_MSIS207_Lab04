import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { FormProvider } from './FormProvider.jsx';
import { InputField } from './InputField.jsx';

function renderFields(fields) {
  return render(
    <FormProvider>
      {fields.map((props) => (
        <InputField key={props.name} {...props} />
      ))}
    </FormProvider>,
  );
}

describe('InputField', () => {
  it('nhãn gắn đúng ô nhập (label htmlFor + id)', () => {
    renderFields([{ name: 'name', label: 'Họ tên' }]);
    const input = screen.getByLabelText('Họ tên');
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveAttribute('name', 'name');
  });

  it('mở trang chưa báo lỗi dù ô đang rỗng: aria-invalid=false, không aria-describedby', () => {
    renderFields([{ name: 'name', label: 'Họ tên' }]);
    const input = screen.getByLabelText('Họ tên');
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(screen.queryByText(/bắt buộc/i)).not.toBeInTheDocument();
  });

  it('đang gõ (chưa blur) thì chưa hiện lỗi', async () => {
    const user = userEvent.setup();
    renderFields([{ name: 'name', label: 'Họ tên' }]);
    await user.type(screen.getByLabelText('Họ tên'), 'A');
    expect(screen.queryByText(/ít nhất 2 ký tự/i)).not.toBeInTheDocument();
  });

  it('gõ sai rồi blur thì hiện lỗi; aria-invalid và aria-describedby trỏ đúng phần tử lỗi', async () => {
    const user = userEvent.setup();
    renderFields([{ name: 'name', label: 'Họ tên' }]);
    const input = screen.getByLabelText('Họ tên');
    await user.type(input, 'A');
    await user.tab();
    const message = screen.getByText('Họ tên cần ít nhất 2 ký tự');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', message.id);
    expect(message.id).not.toBe('');
  });

  it('sửa đúng thì lỗi biến mất ngay trong lượt render đó', async () => {
    const user = userEvent.setup();
    renderFields([{ name: 'name', label: 'Họ tên' }]);
    const input = screen.getByLabelText('Họ tên');
    await user.type(input, 'A');
    await user.tab();
    expect(screen.getByText('Họ tên cần ít nhất 2 ký tự')).toBeInTheDocument();
    await user.type(input, 'b');
    expect(screen.queryByText('Họ tên cần ít nhất 2 ký tự')).not.toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).toHaveValue('Ab');
  });

  it('chuyển các prop còn lại xuống <input> (type, inputMode, autoComplete)', () => {
    renderFields([{ name: 'age', label: 'Tuổi', type: 'text', inputMode: 'numeric', autoComplete: 'off' }]);
    const input = screen.getByLabelText('Tuổi');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('inputmode', 'numeric');
    expect(input).toHaveAttribute('autocomplete', 'off');
  });

  it('prop từ ngoài không ghi đè id, value, onChange do form quản lý', async () => {
    const user = userEvent.setup();
    renderFields([{ name: 'name', label: 'Họ tên', id: 'hacked', value: 'x' }]);
    const input = screen.getByLabelText('Họ tên');
    expect(input).not.toHaveAttribute('id', 'hacked');
    await user.type(input, 'Ada');
    expect(input).toHaveValue('Ada');
  });

  it('mỗi InputField có id riêng (không dùng chung một useId)', () => {
    renderFields([
      { name: 'name', label: 'Họ tên' },
      { name: 'email', label: 'Email' },
      { name: 'age', label: 'Tuổi' },
      { name: 'iq', label: 'IQ' },
    ]);
    const ids = screen.getAllByRole('textbox').map((el) => el.id);
    expect(ids).toHaveLength(4);
    expect(ids.every((id) => id !== '')).toBe(true);
    expect(new Set(ids).size).toBe(4);
  });
});
