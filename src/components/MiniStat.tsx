import styles from './MiniStat.module.css';

interface Props {
  label: string;
  value: string;
  sub?: string;
  accentColor?: string;
  count?: string;
}

export default function MiniStat({ label, value, sub, accentColor, count }: Props) {
  return (
    <div className={styles.card}>
      {count && (
        <div className={styles.count} style={{ color: accentColor || 'var(--accent)' }}>
          {count}
        </div>
      )}
      <div className={styles.value} style={{ color: accentColor || 'var(--accent)' }}>
        {value}
      </div>
      <div className={styles.label}>{label}</div>
      {sub && <div className={styles.sub}>{sub}</div>}
    </div>
  );
}
