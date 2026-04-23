import styles from './RoiCompare.module.css';
import { ROI_METRICS } from '../data/mockData';

export default function RoiCompare() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.cardTitle}>
          <span className={styles.dot} style={{ background: 'var(--err)' }} />
          Before Makkook.AI
        </div>
        {ROI_METRICS.map(m => (
          <div key={m.label} className={styles.row}>
            <span className={styles.metric}>{m.label}</span>
            <span className={styles.valBefore}>{m.before}</span>
          </div>
        ))}
      </div>

      <div className={`${styles.card} ${styles.cardAfter}`}>
        <div className={styles.cardTitle}>
          <span className={styles.dot} style={{ background: 'var(--ok)' }} />
          With Makkook.AI
        </div>
        {ROI_METRICS.map(m => (
          <div key={m.label} className={styles.row}>
            <span className={styles.metric}>{m.label}</span>
            <span className={styles.valAfter}>{m.after}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
