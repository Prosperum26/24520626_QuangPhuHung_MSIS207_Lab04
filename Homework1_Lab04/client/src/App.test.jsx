import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App.jsx';

describe('App', () => {
  it('có đúng một h1 "Hẹn Hò Nhưng Không Yêu"', () => {
    render(<App />);
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Hẹn Hò Nhưng Không Yêu');
  });
});
