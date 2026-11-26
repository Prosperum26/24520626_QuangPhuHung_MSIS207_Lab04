import { act, renderHook } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigationType } from 'react-router';
import { describe, expect, it } from 'vitest';
import { useGalleryParams } from './useGalleryParams.js';

function setup(url) {
  const history = [];
  const hook = renderHook(
    () => {
      const params = useGalleryParams();
      const location = useLocation();
      const type = useNavigationType();
      history.push(`${type} ${location.search}`);
      return { ...params, search: location.search };
    },
    { wrapper: ({ children }) => <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter> },
  );
  return { ...hook, history };
}

const query = (search) => Object.fromEntries(new URLSearchParams(search));

describe('useGalleryParams', () => {
  it('đọc category và photoId từ URL', () => {
    const { result } = setup('/?category=chart&photoId=p09&utm=1');
    expect(result.current.category).toBe('chart');
    expect(result.current.photoId).toBe('p09');
  });

  it('closePhoto chỉ xóa photoId và dùng replace (R2)', () => {
    const { result, history } = setup('/?category=chart&photoId=p09&utm=1');
    act(() => result.current.closePhoto());
    expect(query(result.current.search)).toEqual({ category: 'chart', utm: '1' });
    expect(history.at(-1).startsWith('REPLACE')).toBe(true);
  });

  it('closePhoto khi không có photoId thì không đổi URL', () => {
    const { result, history } = setup('/?category=chart');
    const before = history.length;
    act(() => result.current.closePhoto());
    expect(history).toHaveLength(before);
  });

  it('searchFor giữ các tham số khác', () => {
    const { result } = setup('/?category=chart&utm=1');
    expect(query(result.current.searchFor({ photoId: 'p10' }))).toEqual({ category: 'chart', utm: '1', photoId: 'p10' });
    expect(result.current.searchFor({ category: null })).toBe('?utm=1');
  });

  it('searchFor trả chuỗi rỗng khi hết tham số', () => {
    const { result } = setup('/?category=chart');
    expect(result.current.searchFor({ category: null })).toBe('');
  });

  it('category lạ thì coi là all (R4)', () => {
    expect(setup('/?category=xyz').result.current.category).toBe('all');
  });
});
