import styles from './Toast.module.css';

export default function Toast({ toasts, onDismiss }) {
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`${styles.toast} ${styles[t.type] || ''}`}>
          <span>{t.message}</span>
          <button className={styles.close} onClick={() => onDismiss(t.id)} aria-label="Dismiss">×</button>
        </div>
      ))}
    </div>
  );
}
