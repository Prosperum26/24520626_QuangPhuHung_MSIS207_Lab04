import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(cleanup);

// jsdom chưa có PointerEvent: thiếu thì fireEvent.pointerDown tạo Event thường, mất clientX/clientY.
if (typeof window.PointerEvent === 'undefined') {
  class PointerEvent extends MouseEvent {
    constructor(type, init = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 1;
      this.pointerType = init.pointerType ?? 'mouse';
    }
  }
  window.PointerEvent = PointerEvent;
}

// jsdom cũng chưa có pointer capture.
for (const method of ['setPointerCapture', 'releasePointerCapture']) {
  if (!Element.prototype[method]) Element.prototype[method] = () => {};
}
if (!Element.prototype.hasPointerCapture) Element.prototype.hasPointerCapture = () => false;
