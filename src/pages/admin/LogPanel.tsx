import DecisionLog from '../../components/DecisionLog';
import styles from './LogPanel.module.css';

export default function LogPanel() {
  return (
    <div>
      <div className="admin-warn-banner">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            stroke="currentColor" strokeWidth="1.8"/>
          <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <circle cx="12" cy="17" r="1" fill="currentColor"/>
        </svg>
        Raw confidence scores shown · Admin view only
      </div>
      <div className="section-title">Autonomous Decision Log</div>
      <div className={styles.wrapper}>
        <DecisionLog showConfidence={true} />
      </div>
    </div>
  );
}
