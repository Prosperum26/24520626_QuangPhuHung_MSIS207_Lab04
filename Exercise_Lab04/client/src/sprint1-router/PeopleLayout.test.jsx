import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router';
import { describe, it, expect } from 'vitest';
import PeopleLayout from './PeopleLayout.jsx';

const people = [
  { id: 'a-1', name: 'Ada', age: 36, iq: 170 },
  { id: 'a-2', name: 'Alan', age: 41, iq: 185 },
];

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="people" element={<PeopleLayout people={people} />}>
          <Route index element={<p>chua chon</p>} />
          <Route path=":id" element={<p>chi tiet</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('PeopleLayout', () => {
  it('mỗi người là một liên kết trong danh sách có nhãn', () => {
    renderAt('/people');
    const nav = screen.getByRole('navigation', { name: /danh sách người/i });
    expect(nav).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(people.length);
    expect(screen.getByRole('link', { name: 'Ada' })).toHaveAttribute('href', '/people/a-1');
  });

  it('/people hiện route index trong vùng nội dung', () => {
    renderAt('/people');
    expect(screen.getByText('chua chon')).toBeInTheDocument();
  });

  it('bấm một người thì <Outlet/> đổi và liên kết có aria-current', async () => {
    const user = userEvent.setup();
    renderAt('/people');
    await user.click(screen.getByRole('link', { name: 'Alan' }));
    expect(screen.getByText('chi tiet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Alan' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Ada' })).not.toHaveAttribute('aria-current');
  });
});
