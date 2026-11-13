import { useId, useState } from 'react';
import { CHANNELS } from './forumApi.js';
import { ChannelSwitcher } from './ChannelSwitcher.jsx';
import { MessageList, MessageListSkeleton } from './MessageList.jsx';
import { useForumMessages } from './useForumMessages.js';
import styles from './ForumPage.module.css';

/** Trang /forum: chọn kênh, đọc tin. Kênh hiện tại là state cục bộ của trang (một chỗ duy nhất). */
export default function ForumPage() {
  const headingId = useId();
  const [channel, setChannel] = useState(CHANNELS[0]);
  const { messages, status, error, retry } = useForumMessages(channel);

  return (
    <section aria-labelledby={headingId} className={styles.panel}>
      <h2 id={headingId}>Forum</h2>
      <ChannelSwitcher channels={CHANNELS} value={channel} onChange={setChannel} />
      <div className={styles.board}>
        {/* Vùng status có sẵn từ đầu (live region phải tồn tại trước khi nội dung đổi). */}
        <div role="status">{status === 'loading' && <MessageListSkeleton />}</div>
        {status === 'error' && (
          <section role="alert" className={styles.error}>
            <p>Không tải được tin nhắn: {error.message}</p>
            <button type="button" className={styles.retry} onClick={retry}>
              Thử lại
            </button>
          </section>
        )}
        {status === 'success' && <MessageList messages={messages} />}
      </div>
    </section>
  );
}
