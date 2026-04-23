import styles from './EventsList.module.css';
import { CALENDAR_EVENTS } from '../data/mockData';

export default function EventsList() {
  return (
    <div className={styles.list}>
      <div className={styles.title}>Upcoming Events</div>
      {CALENDAR_EVENTS.map((ev, i) => (
        <div key={i} className={styles.row}>
          <span className={styles.dot} style={{ background: ev.color }} />
          <div className={styles.info}>
            <span className={`${styles.date} mono`}>{ev.date}</span>
            <span className={styles.label}>{ev.label}</span>
            <span className={styles.note}>{ev.note}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
