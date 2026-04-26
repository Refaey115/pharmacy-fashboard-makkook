import { useEffect, useRef, useState } from 'react';
import styles from './LiveAiBar.module.css';

interface Tick { id: string; text: string; ts: string }

const TICKER_MESSAGES = [
  'Transfer · WH-Cairo-Central -> Branch-Nasr-City-04 · 480 units CTZ-500 · EGP 84K secured',
  'Bulk PO consolidated · EIPICO · 12,400 units AMX-250 · EGP 148K · 3% discount captured',
  'Shelf-life intervention · 247 units BRF-400 redistributed from Branch-Zamalek-01 · EGP 28K loss avoided',
  'Demand spike · CTZ-500 up 28% in Delta region · Re-order fired · Kahira Pharma · ETA 2 days',
  'Branch rebalance · Greater Cairo cluster · 23 inter-branch transfers · Coverage restored to 97.8%',
  'Replenishment cycle closed · PAR-500 · Branch-Maadi-02 · EGP 62K revenue cycle complete · 4.2 days',
  'Seasonal pre-position · Eid Al-Adha in 30 days · 2,400 units AUG-625 dispatched to 18 branches',
  'Cash-flow optimisation · Deferred low-priority PO OMP-20 · Saved EGP 31K working capital',
  'Transfer · WH-Alexandria -> Branch-Smouha-08 · 220 units LRT-10 · EGP 38K secured',
  'Bulk PO consolidated · Sigma Pharma · 8,200 units MET-500 · EGP 92K · 2% discount captured',
  'Demand spike · VEN-INH up 34% in Greater Cairo · Re-order fired · Pharco B · ETA 1 day',
  'Rebalance · 6 transfers fired · AUG-625 · Branch-Heliopolis-07 coverage extended to 14 days',
  'Replenishment cycle closed · MET-500 · Branch-New-Cairo-12 · EGP 119K revenue cycle · 4.2 days',
  'Shelf-life alert cleared · 184 units ZIP-250 · Branch-Tanta-03 · redistribution complete',
  'Transfer · WH-Delta -> Branch-Mansoura-06 · 620 units PAR-500 · EGP 47K secured',
  'Emergency PO confirmed · AMX-250 · Sigma Pharma substitute · 4,200 units · ETA 18 hours',
  'Network availability · 97.8% across 500 branches · 35.1M decisions processed today',
  'Working capital released · EGP 12.6M cumulative · optimised payment scheduling',
  'Sales cycle compressed · 6.0 days to 4.2 days · 30% faster than prior period',
  'Gross margin expanded · 28.1% to 38.4% · supplier consolidation + cycle compression',
];

let _tickCounter = 0;

function makeTick(): Tick {
  const idx = _tickCounter % TICKER_MESSAGES.length;
  _tickCounter++;
  const now = new Date();
  const ts = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return {
    id: `tick-${_tickCounter}-${Math.random().toString(36).slice(2)}`,
    text: TICKER_MESSAGES[idx],
    ts,
  };
}

export default function LiveAiBar() {
  const [ticks, setTicks] = useState<Tick[]>(() => Array.from({ length: 20 }, makeTick));
  const [newId, setNewId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => {
      const tick = makeTick();
      setNewId(tick.id);
      setTicks(prev => [tick, ...prev].slice(0, 40));
      setTimeout(() => setNewId(null), 600);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={styles.bar}>
      <div className={styles.label}>
        <span className={styles.dot} />
        <span>DIOS</span>
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
