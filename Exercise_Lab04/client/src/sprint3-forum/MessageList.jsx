import { Fragment } from 'react';
import styles from './MessageList.module.css';

// Tạo một lần ở module, không tạo trong thân render.
const timeFormat = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

/**
 * Danh sách tin nhắn dạng <dl>. Key là id của tin (do server cấp), không phải index.
 * JSX tự escape nên nội dung có dạng HTML chỉ hiện như chữ.
 * @param {{ messages: readonly import('./forumApi.js').Message[] }} props
 */
export function MessageList({ messages }) {
  if (messages.length === 0) {
    return <p className={styles.empty}>Chưa có tin nhắn ở kênh này.</p>;
  }

  return (
    <dl className={styles.list}>
      {messages.map((message) => (
        <Fragment key={message.id}>
          <dt className={styles.author}>
            {message.author}{' '}
            <time dateTime={message.timestamp}>{timeFormat.format(new Date(message.timestamp))}</time>
          </dt>
          <dd className={styles.text}>{message.text}</dd>
        </Fragment>
      ))}
    </dl>
  );
}

const SKELETON_ROWS = ['a', 'b', 'c'];

/** Khung chờ cho MessageList. Chữ ẩn cho trình đọc màn hình; thanh giả ẩn khỏi cây truy cập. */
export function MessageListSkeleton() {
  return (
    <div aria-busy="true">
      <span className={styles.srOnly}>Đang tải tin nhắn…</span>
      <div className={styles.skeleton} aria-hidden="true">
        {SKELETON_ROWS.map((row) => (
          <span key={row} className={styles.skeletonRow}>
            <span className={styles.skeletonAuthor} />
            <span className={styles.skeletonText} />
          </span>
        ))}
      </div>
    </div>
  );
}
