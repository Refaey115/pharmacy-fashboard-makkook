import DecisionLog from '../../components/DecisionLog';
import styles from '../admin/LogPanel.module.css';

export default function LogPanel() {
  return (
    <div>
      <div className="section-title">What the AI Did For You</div>
      <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16 }}>
        A live feed of autonomous decisions made on behalf of your network — optimising inventory, preventing stockouts, and securing revenue cycles in real time.
      </p>
      <div className={styles.wrapper}>
        <DecisionLog showConfidence={false} />
      </div>
    </div>
  );
}
