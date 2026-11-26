import { useId, useRef, useState } from 'react';
import { DIRECTION_LABEL, SWIPE_THRESHOLD_PX } from '../domain/swipeConfig.js';
import styles from './SwipeCard.module.css';

/**
 * Hướng quẹt theo độ dời; chưa quá ngưỡng thì null. Kéo dọc mạnh hơn kéo ngang thì chỉ
 * tính lên trên (kéo xuống không có nghĩa).
 */
function directionOf(dx, dy) {
  if (Math.abs(dy) > Math.abs(dx)) return dy < -SWIPE_THRESHOLD_PX ? 'up' : null;
  if (dx > SWIPE_THRESHOLD_PX) return 'right';
  if (dx < -SWIPE_THRESHOLD_PX) return 'left';
  return null;
}

/**
 * Thẻ hồ sơ kéo được bằng Pointer Events (chuột, cảm ứng, bút). Bàn phím và nút bấm nằm ngoài
 * thẻ (useSwipeKeyboard, SwipeControls), nên kéo thả không phải cách duy nhất để quẹt.
 * @param {{ profile: { id: string, name: string, age: number, gender: 'male'|'female', bio: string },
 *   onSwipe: (direction: 'left'|'right'|'up') => void }} props
 */
export function SwipeCard({ profile, onSwipe }) {
  const titleId = useId();
  const cardRef = useRef(null);
  const startRef = useRef(null); // { x, y } khi đang kéo, null khi không
  // Chỉ re-render khi hướng đổi; vị trí từng pixel đi qua CSS custom property.
  const [dragDirection, setDragDirection] = useState(null);

  function setOffset(dx, dy) {
    cardRef.current?.style.setProperty('--dx', `${dx}px`);
    cardRef.current?.style.setProperty('--dy', `${dy}px`);
  }

  function reset() {
    startRef.current = null;
    cardRef.current?.style.removeProperty('--dx');
    cardRef.current?.style.removeProperty('--dy');
    setDragDirection(null);
  }

  function handlePointerDown(e) {
    if (e.button !== 0) return;
    startRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e) {
    const start = startRef.current;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    setOffset(dx, dy);
    const next = directionOf(dx, dy);
    if (next !== dragDirection) setDragDirection(next);
  }

  function handlePointerUp(e) {
    const start = startRef.current;
    if (!start) return; // pointerup không có pointerdown: bỏ qua
    const direction = directionOf(e.clientX - start.x, e.clientY - start.y);
    reset();
    if (direction) onSwipe(direction);
  }

  return (
    <article
      ref={cardRef}
      className={styles.card}
      aria-labelledby={titleId}
      data-drag={dragDirection ?? undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={reset}
    >
      <img className={styles.avatar} src={`/avatars/${profile.gender}.svg`} alt="" width="120" height="120" draggable="false" />
      <h2 id={titleId} className={styles.name}>
        {profile.name}, {profile.age}
      </h2>
      <p className={styles.bio}>{profile.bio}</p>
      {dragDirection && (
        <p className={styles.stamp} data-direction={dragDirection} aria-hidden="true">
          {DIRECTION_LABEL[dragDirection].toLocaleUpperCase('vi')}
        </p>
      )}
    </article>
  );
}
