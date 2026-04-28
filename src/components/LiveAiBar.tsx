import { useEffect, useRef, useState } from 'react';
import styles from './LiveAiBar.module.css';

// Fix 14.6: category classification for color squares
type TickerCat = 'replenishment' | 'cashflow' | 'seasonal' | 'emergency' | 'shelf';

interface Tick { id: string; text: string; ts: string; cat: TickerCat }

const TICKER_MESSAGES: Array<{ text: string; cat: TickerCat }> = [
  { cat: 'replenishment', text: 'Transfer · WH-Cairo-Central -> Branch-Nasr-City-04 · 480 units CTZ-500 · $16.8K secured' },
  { cat: 'replenishment', text: 'Bulk PO consolidated · EIPICO · 12,400 units AMX-250 · $29.6K · 3% discount captured' },
  { cat: 'shelf',         text: 'Shelf-life intervention · 247 units BRF-400 redistributed from Branch-Zamalek-01 · $5.6K loss avoided' },
  { cat: 'emergency',     text: 'Demand spike · CTZ-500 up 28% in Delta region · Re-order fired · Kahira Pharma · ETA 2 days' },
  { cat: 'replenishment', text: 'Branch rebalance · Greater Cairo cluster · 23 inter-branch transfers · Coverage restored to 96.4%' },
  { cat: 'replenishment', text: 'Replenishment cycle closed · PAR-500 · Branch-Maadi-02 · $12.4K revenue cycle complete · 4.2 days' },
  { cat: 'seasonal',      text: 'Seasonal pre-position · Eid Al-Adha in 30 days · 2,400 units AUG-625 dispatched to 18 branches' },
  { cat: 'cashflow',      text: 'Cash-flow optimisation · Deferred low-priority PO OMP-20 · Saved $6.2K working capital' },
  { cat: 'replenishment', text: 'Transfer · WH-Alexandria -> Branch-Smouha-08 · 220 units LRT-10 · $7.6K secured' },
  { cat: 'replenishment', text: 'Bulk PO consolidated · Sigma Pharma · 8,200 units MET-500 · $18.4K · 2% discount captured' },
  { cat: 'emergency',     text: 'Demand spike · VEN-INH up 34% in Greater Cairo · Re-order fired · Pharco B · ETA 1 day' },
  { cat: 'replenishment', text: 'Rebalance · 6 transfers fired · AUG-625 · Branch-Heliopolis-07 coverage extended to 14 days' },
  { cat: 'replenishment', text: 'Replenishment cycle closed · MET-500 · Branch-New-Cairo-12 · $23.8K revenue cycle · 4.2 days' },
  { cat: 'shelf',         text: 'Shelf-life alert cleared · 184 units ZIP-250 · Branch-Tanta-03 · redistribution complete' },
  { cat: 'replenishment', text: 'Transfer · WH-Delta -> Branch-Mansoura-06 · 620 units PAR-500 · $9.4K secured' },
  { cat: 'emergency',     text: 'Emergency PO confirmed · AMX-250 · Sigma Pharma substitute · 4,200 units · ETA 18 hours' },
  { cat: 'cashflow',      text: 'Network availability · 96.4% across 500 branches · 35.1M decisions processed today' },
  { cat: 'cashflow',      text: 'Working capital released · $2.6M cumulative · optimised payment scheduling · DIO 31d → 12d' },
  { cat: 'cashflow',      text: 'Sales cycle compressed · 6.0 days to 4.2 days · 30% faster than prior period' },
  { cat: 'cashflow',      text: 'Gross margin expanded · 28.1% to 38.4% · supplier consolidation + cycle compression' },
];

const CAT_CLASS: Record<TickerCat, string> = {
  replenishment: 'ticker-cat-replenishment',
  cashflow:      'ticker-cat-cashflow',
  seasonal:      'ticker-cat-seasonal',
  emergency:     'ticker-cat-emergency',
  shelf:         'ticker-cat-shelf',
};

let _tickCounter = 0;

function makeTick(): Tick {
  const idx = _tickCounter % TICKER_MESSAGES.length;
  _tickCounter++;
  const now = new Date();
  const ts = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return {
    id: `tick-${_tickCounter}-${Math.random().toString(36).slice(2)}`,
    text: TICKER_MESSAGES[idx].text,
    cat: TICKER_MESSAGES[idx].cat,
    ts,
  };
}

export default function LiveAiBar() {
  const [ticks, setTicks] = useState<Tick[]>(() => Array.from({ length: 20 }, makeTick));
  const [newId, setNewId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fix 8: variable injection interval 3.5-6.5s
    let timeoutId: ReturnType<typeof setTimeout>;
    const scheduleNext = () => {
      const delay = 3500 + Math.random() * 3000;
      timeoutId = setTimeout(() => {
        const tick = makeTick();
        setNewId(tick.id);
        setTicks(prev => [tick, ...prev].slice(0, 40));
        setTimeout(() => setNewId(null), 600);
        scheduleNext();
      }, delay);
    };
    scheduleNext();
    return () => clearTimeout(timeoutId);
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
              {/* Fix 14.6: category color square */}
              <span className={`ticker-cat-sq ${CAT_CLASS[tick.cat]}`} />
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
