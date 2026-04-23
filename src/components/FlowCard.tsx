import styles from './FlowCard.module.css';
import type { FlowItem } from '../data/mockData';

const STATUS_CLASS: Record<FlowItem['status'], string> = {
  'In Transit': 'pill-info',
  'Delivered':  'pill-ok',
  'Pending':    'pill-warn',
};

interface Props {
  item: FlowItem;
}

export default function FlowCard({ item }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.route}>
        <span className={styles.node}>{item.from}</span>
        <svg width="28" height="12" viewBox="0 0 28 12" fill="none" className={styles.arrow}>
          <path d="M0 6h24M18 1l6 5-6 5" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className={styles.node}>{item.to}</span>
      </div>
      <div className={styles.meta}>
        <span className={`${styles.sku} mono`}>{item.sku}</span>
        <span className={styles.units}>{item.units.toLocaleString()} units</span>
        <span className={`pill ${STATUS_CLASS[item.status]}`}>{item.status}</span>
      </div>
    </div>
  );
}
