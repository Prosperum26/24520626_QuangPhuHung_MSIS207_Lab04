import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { describe, it, expect } from 'vitest';
import PersonDetail from './PersonDetail.jsx';
import { PEOPLE } from './people.js';

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/people/:id" element={<PersonDetail people={PEOPLE} />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PersonDetail', () => {
  it('/people/sp-2 hiện Albert Einstein bằng <dl> có đủ cặp dt/dd', () => {
    renderAt('/people/sp-2');
    expect(screen.getByRole('heading', { level: 2, name: 'Albert Einstein' })).toBeInTheDocument();
    const terms = screen.getAllByRole('term').map((el) => el.textContent);
    expect(terms).toEqual(['Name', 'Age', 'IQ']);
    const definitions = screen.getAllByRole('definition').map((el) => el.textContent);
    expect(definitions).toEqual(['Albert Einstein', '76', '205']);
  });

  it('id không tồn tại hiện 404 role="alert"', () => {
    renderAt('/people/sp-999');
    expect(screen.getByRole('alert')).toHaveTextContent(/404/);
    expect(screen.queryByRole('term')).not.toBeInTheDocument();
  });

  it('id lạ (khoảng trắng, hoa thường, rỗng sau mã hoá) không ném lỗi mà hiện 404', () => {
    for (const bad of ['%20', 'SP-2', 'sp-2%20', '0']) {
      const { unmount } = renderAt(`/people/${bad}`);
      expect(within(document.body).getByRole('alert')).toHaveTextContent(/404/);
      unmount();
    }
  });
});
