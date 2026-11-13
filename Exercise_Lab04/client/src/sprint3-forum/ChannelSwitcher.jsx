import styles from './ChannelSwitcher.module.css';

/**
 * Chọn kênh. Là nút (không phải liên kết) vì chỉ đổi state, không đổi URL;
 * nút đang chọn có aria-pressed và kiểu nền riêng (không chỉ dựa vào màu).
 * @param {{ channels: readonly string[], value: string, onChange: (channel: string) => void }} props
 */
export function ChannelSwitcher({ channels, value, onChange }) {
  return (
    <nav aria-label="Kênh">
      <ul className={styles.list}>
        {channels.map((channel) => (
          <li key={channel}>
            <button
              type="button"
              className={styles.button}
              aria-pressed={channel === value}
              onClick={() => onChange(channel)}
            >
              {channel}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
