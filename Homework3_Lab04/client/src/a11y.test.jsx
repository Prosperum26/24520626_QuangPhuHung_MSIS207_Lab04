import { render } from '@testing-library/react';
import axe from 'axe-core';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { App } from './App.jsx';

// jsdom không tính được màu thật nên bỏ rule color-contrast ở đây; tương phản kiểm bằng Lighthouse (cũng chạy axe) trên Edge.
const AXE_OPTIONS = { rules: { 'color-contrast': { enabled: false } } };

const ROUTES = [
  '/',
  '/?category=scene',
  '/?category=document&photoId=p06',
  '/?photoId=zz',
  '/about',
  '/khong-co',
];

describe('axe-core', () => {
  for (const path of ROUTES) {
    it(`không có vi phạm ở ${path}`, async () => {
      const { container, findByRole } = render(
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>,
      );
      await findByRole('main');
      if (path === '/about') await findByRole('heading', { name: 'Giới thiệu' });
      const { violations } = await axe.run(container, AXE_OPTIONS);
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
    });
  }
});
