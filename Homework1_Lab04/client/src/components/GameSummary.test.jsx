import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { GameSummary } from './GameSummary.jsx';

describe('GameSummary', () => {
  it('hiện heading, điểm và số lượt từng hướng trong <dl>', () => {
    render(<GameSummary score={25} tally={{ left: 1, right: 2, up: 1 }} onNewGame={() => {}} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Hết hồ sơ' })).toBeInTheDocument();
    const terms = screen.getAllByRole('term').map((el) => el.textContent);
    const values = screen.getAllByRole('definition').map((el) => el.textContent);
    expect(terms).toEqual(['Điểm', 'Thích', 'Siêu thích', 'Bỏ qua']);
    expect(values).toEqual(['25', '2', '1', '1']);
  });

  it('nút "Chơi ván mới" gọi onNewGame', async () => {
    const onNewGame = vi.fn();
    render(<GameSummary score={0} tally={{ left: 0, right: 0, up: 0 }} onNewGame={onNewGame} />);
    await userEvent.click(screen.getByRole('button', { name: 'Chơi ván mới' }));
    expect(onNewGame).toHaveBeenCalledTimes(1);
  });
});
