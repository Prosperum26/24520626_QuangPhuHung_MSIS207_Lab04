import { describe, expect, it } from 'vitest';
import { MAX_AUTHOR, MAX_TEXT } from './forumApi.js';
import { validatePost } from './postValidation.js';

describe('validatePost', () => {
  it('hợp lệ cho object rỗng', () => {
    expect(validatePost({ author: 'Ada', text: 'Hello' })).toEqual({});
  });

  it('rỗng hoặc chỉ khoảng trắng là bắt buộc', () => {
    expect(validatePost({ author: '', text: '' })).toEqual({
      author: 'Tên là bắt buộc',
      text: 'Nội dung là bắt buộc',
    });
    expect(validatePost({ author: '   ', text: '\n ' })).toEqual({
      author: 'Tên là bắt buộc',
      text: 'Nội dung là bắt buộc',
    });
  });

  it('giới hạn khớp server: author 40, text 500 (tính sau trim)', () => {
    expect(MAX_AUTHOR).toBe(40);
    expect(MAX_TEXT).toBe(500);
    expect(validatePost({ author: 'a'.repeat(40), text: 'b'.repeat(500) })).toEqual({});
    expect(validatePost({ author: ` ${'a'.repeat(40)} `, text: 'b' })).toEqual({});
    expect(validatePost({ author: 'a'.repeat(41), text: 'b' })).toEqual({ author: 'Tên tối đa 40 ký tự' });
    expect(validatePost({ author: 'a', text: 'b'.repeat(501) })).toEqual({ text: 'Nội dung tối đa 500 ký tự' });
  });
});
