import { useEffect, useRef, useState } from 'react';
import { generateDecision } from '../data/mockData';
import styles from './LiveAiBar.module.css';

interface Tick { id: string; text: string; ts: string }

function makeTick(): Tick {
  const d = generateDecision();
  return { id: d.id, text: d.text, ts: d.timestamp };
}

export default function LiveAiBar() {
  const [ticks, setTicks] = useState<Tick[]>(() => Array.from({ length: 6 }, makeTick));
  const [newId, setNewId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => {
      const tick = makeTick();
      setNewId(tick.id);
      setTicks(prev => [tick, ...prev].slice(0, 20));
      setTimeout(() => setNewId(null), 600);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={styles.bar}>
      <div className={styles.label}>
        <span className={styles.dot} />
        <span>AI</span>
      </div>
      <div className={styles.scroll} ref={scrollRef}>
        <div className={styles.track}>
          {ticks.map(tick => (
            <span
              key={tick.id}
              className={`${styles.item} ${tick.id === newId ? styles.itemNew : ''}`}
            >
              <span className={styles.itemTs}>{tick.ts}</span>
              <span className={styles.itemText}>{tick.text}</span>
            </span>
          ))}
        </div>
      </div>
      <div className={styles.fadeRight} />
    </div>
  );
}
