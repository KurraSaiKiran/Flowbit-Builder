/**
 * Notification.tsx
 * Small toast-style notification rendered at the top-center of the viewport.
 * Replaces `alert()` for a polished UX when saving the flow.
 *
 * It renders nothing when status is 'idle'.
 * Auto-dismissal is handled externally (in FlowBuilder) via setTimeout.
 */

import type { NotificationState } from '../types/nodeTypes';
import styles from './Notification.module.css';

// ─── Props ────────────────────────────────────────────────────────────────────

interface NotificationProps {
  notification: NotificationState;
}

// ─── Component ────────────────────────────────────────────────────────────────

const Notification = ({ notification }: NotificationProps) => {
  // Nothing to render when idle.
  if (notification.status === 'idle') return null;

  const isSuccess = notification.status === 'success';

  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <div className={`${styles.toast} ${isSuccess ? styles.success : styles.error}`}>
        <span className={styles.icon} aria-hidden="true">
          {isSuccess ? '✅' : '⚠️'}
        </span>
        {notification.message}
      </div>
    </div>
  );
};

export default Notification;
