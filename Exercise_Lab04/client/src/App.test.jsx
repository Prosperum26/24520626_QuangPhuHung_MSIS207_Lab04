import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, it, expect } from 'vitest';
import { App } from './App.jsx';

describe('App (khung Sprint 0)', () => {
  it('hiện tiêu đề h1 duy nhất', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1, name: /lab 04/i })).toBeInTheDocument();
  });
});
