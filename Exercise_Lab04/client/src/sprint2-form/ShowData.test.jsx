import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ShowData } from './ShowData.jsx';

describe('ShowData', () => {
  it('mỗi entry là một cặp dt/dd theo thứ tự khoá', () => {
    render(<ShowData data={{ name: 'Ada', age: 36, iq: 170.5 }} />);
    expect(screen.getAllByRole('term').map((el) => el.textContent)).toEqual(['name', 'age', 'iq']);
    expect(screen.getAllByRole('definition').map((el) => el.textContent)).toEqual(['Ada', '36', '170.5']);
  });

  it('chuỗi trông giống HTML hiển thị như chữ, không tạo phần tử', () => {
    const { container } = render(<ShowData data={{ name: '<img src=x onerror=alert(1)>' }} />);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByRole('definition')).toHaveTextContent('<img src=x onerror=alert(1)>');
  });

  it('data rỗng vẫn render <dl> rỗng, không lỗi', () => {
    const { container } = render(<ShowData data={{}} />);
    expect(container.querySelector('dl')).not.toBeNull();
    expect(screen.queryAllByRole('term')).toHaveLength(0);
  });
});
