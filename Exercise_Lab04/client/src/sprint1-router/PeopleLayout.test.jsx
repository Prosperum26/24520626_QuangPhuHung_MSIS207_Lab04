import { lazy } from 'react';
import { act, render, screen, within } from '@testing-library/react';
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

describe('PeopleLayout với route con tải lười', () => {
  function renderLazy(LazyDetail) {
    return render(
      <MemoryRouter initialEntries={['/people/a-1']}>
        <Routes>
          <Route path="people" element={<PeopleLayout people={people} />}>
            <Route path=":id" element={<LazyDetail />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
  }

  it('luôn có vùng role="status" từ đầu, kể cả khi chưa chọn ai', () => {
    renderAt('/people');
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('skeleton nằm trong vùng status và có aria-busy khi route con chưa tải xong', () => {
    const Pending = lazy(() => new Promise(() => {}));
    renderLazy(Pending);
    const status = screen.getByRole('status');
    const label = within(status).getByText(/đang tải chi tiết/i);
    expect(label.closest('[aria-busy="true"]')).not.toBeNull();
  });

  it('vùng status là cùng một phần tử trước và sau khi tải xong (live region có sẵn)', async () => {
    let resolve;
    const Deferred = lazy(() => new Promise((r) => (resolve = r)));
    renderLazy(Deferred);
    const before = screen.getByRole('status');
    await act(async () => resolve({ default: () => <p>da tai</p> }));
    expect(screen.getByRole('status')).toBe(before);
    expect(within(before).getByText('da tai')).toBeInTheDocument();
  });

  it('hiện fallback khi route con chưa tải xong, danh sách vẫn dùng được', () => {
    const Pending = lazy(() => new Promise(() => {}));
    renderLazy(Pending);
    expect(screen.getByText(/đang tải chi tiết/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ada' })).toBeInTheDocument();
  });

  it('thay fallback bằng nội dung khi tải xong', async () => {
    let resolve;
    const Deferred = lazy(() => new Promise((r) => (resolve = r)));
    renderLazy(Deferred);
    expect(screen.getByText(/đang tải chi tiết/i)).toBeInTheDocument();
    await act(async () => resolve({ default: () => <p>da tai</p> }));
    expect(screen.getByText('da tai')).toBeInTheDocument();
    expect(screen.queryByText(/đang tải chi tiết/i)).not.toBeInTheDocument();
  });
});
