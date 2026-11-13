import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PersonDetailSkeleton from './PersonDetailSkeleton.jsx';

describe('PersonDetailSkeleton', () => {
  it('đánh dấu aria-busy và có chữ cho trình đọc màn hình', () => {
    const { container } = render(<PersonDetailSkeleton />);
    expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText(/đang tải chi tiết/i)).toBeInTheDocument();
  });

  it('thanh giả ẩn khỏi cây truy cập', () => {
    const { container } = render(<PersonDetailSkeleton />);
    const bars = container.querySelectorAll('[aria-hidden="true"]');
    expect(bars.length).toBeGreaterThan(0);
  });
});
