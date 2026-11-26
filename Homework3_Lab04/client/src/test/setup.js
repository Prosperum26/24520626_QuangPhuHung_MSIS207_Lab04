import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(cleanup);

// jsdom chưa có showModal/close cho <dialog>. Polyfill giữ đúng hành vi cần test:
// showModal() ném InvalidStateError khi đã mở (như trình duyệt), close() bắn sự kiện 'close'.
if (typeof HTMLDialogElement !== 'undefined' && typeof HTMLDialogElement.prototype.showModal !== 'function') {
  HTMLDialogElement.prototype.showModal = function showModal() {
    if (this.hasAttribute('open')) throw new DOMException('Dialog is already open', 'InvalidStateError');
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close() {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}
