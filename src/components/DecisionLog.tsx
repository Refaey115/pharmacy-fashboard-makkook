import { useEffect, useRef, useState } from 'react';
import styles from './DecisionLog.module.css';
import { generateDecision, seedDecisions } from '../data/mockData';
import type { DecisionEntry } from '../data/mockData';

interface Props {
  showConfidence?: boolean;
}

export default function DecisionLog({ showConfidence = false }: Props) {
  const [entries, setEntries] = useState<DecisionEntry[]>(seedDecisions);
  const [newId, setNewId]     = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const entry = generateDecision();
      setNewId(entry.id);
      setEntries(prev => {
        const next = [entry, ...prev];
        return next.slice(0, 40);
      });
      setTimeout(() => setNewId(null), 800);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.log} ref={scrollRef}>
      {entries.map(e => (
        <div
          key={e.id}
          className={`${styles.entry} ${e.id === newId ? styles.flash : ''}`}
        >
          <div className={styles.iconBox}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className={styles.body}>
            <span className={styles.ts}>{e.timestamp}</span>
            <span className={styles.text}>{e.text}</span>
            {showConfidence && (
              <span className={styles.conf}>
                confidence <strong>{(e.confidence * 100).toFixed(0)}%</strong>
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
