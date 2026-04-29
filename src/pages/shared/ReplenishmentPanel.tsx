import { useState, useEffect, useRef, useCallback } from 'react';
import { generateDecisions } from '../../data/decisionGen';
import type { Decision } from '../../data/decisionGen';
import { SUPPLIERS } from '../../data/suppliers';
import SpeakerHint from '../../components/SpeakerHint';
import { CUMULATIVE } from '../../data/canonicalNumbers';
import { formatUSD } from '../../utils/formatCurrency';
import styles from './ReplenishmentPanel.module.css';

const PIPELINE_STEPS = ['Demand Signal', 'Reorder Point Hit', 'Supplier Decision', 'PO Generated', 'Dispatch', 'Branch Receipt'];

const STATUS_COLOR: Record<Decision['status'], string> = {
  'Pending': 'var(--warn)',
  'Dispatched': 'var(--info)',
  'Delivered': 'var(--ok)',
  'Cycle Closed': 'var(--accent)',
};

const TYPE_COLORS: Record<string, string> = {
  'transfer': 'var(--info)',
  'bulk-po': 'var(--accent)',
  'shelf-life': 'var(--warn)',
  'cash-flow': 'var(--ok)',
  'seasonal': '#a78bfa',
  'demand-spike': 'var(--err)',
  'rebalance': 'var(--info)',
  'cycle-close': 'var(--ok)',
};

interface CycleResult {
  pos: number;
  transfers: number;
  branches: number;
  value: number;
  duration: string;
  stockoutsBlocked: number;
}

export default function ReplenishmentPanel() {
  const [running, setRunning] = useState(false);
  const [cycleComplete, setCycleComplete] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(-1);
  const [idleHighlight, setIdleHighlight] = useState(0);
  const [evalCount, setEvalCount] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [cycleResults, setCycleResults] = useState<CycleResult | null>(null);
  const [feed, setFeed] = useState<Decision[]>([]);
  const [feedFilter, setFeedFilter] = useState('All');
  const [nextCycleMin] = useState(() => Math.floor(Math.random() * 3) + 1);

  const feedSeedRef = useRef(30);

  // Fix 14.8: idle pipeline highlight cycles through steps every 1.5s
  useEffect(() => {
    if (running) return;
    const iv = setInterval(() => {
      setIdleHighlight(prev => (prev + 1) % PIPELINE_STEPS.length);
    }, 1500);
    return () => clearInterval(iv);
  }, [running]);

  useEffect(() => {
    setFeed(generateDecisions(30));
    const iv = setInterval(() => {
      feedSeedRef.current++;
      setFeed(prev => {
        const newEntry = generateDecisions(1, feedSeedRef.current * 100)[0];
        return [newEntry, ...prev].slice(0, 80);
      });
    }, 2500);
    return () => clearInterval(iv);
  }, []);

  const handleRun = useCallback(() => {
    if (running) return;
    setRunning(true);
    setCycleComplete(false);
    setShowResults(false);
    setCycleResults(null);
    setEvalCount(0);
    setPipelineStep(0);

    // Pipeline steps spread over 3.5s (each step ~580ms)
    [0, 1, 2, 3, 4, 5].forEach(step => {
      setTimeout(() => setPipelineStep(step), 300 + step * 580);
    });

    // Counter: 35,124 active SKU-branch positions scanned (those above reorder threshold)
    const counterTarget = 35_124;
    const counterDuration = 2800;
    const startTime = Date.now() + 300;
    const tick = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < 0) { setTimeout(tick, 30); return; }
      const progress = Math.min(elapsed / counterDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setEvalCount(Math.floor(eased * counterTarget));
      if (progress < 1) setTimeout(tick, 30);
      else setEvalCount(counterTarget);
    };
    setTimeout(tick, 300);

    // Cycle completes at ~3.5s
    setTimeout(() => {
      setCycleComplete(true);
      setPipelineStep(6);
      const seed = Date.now();
      const r = (a: number, b: number) => a + Math.floor(((seed % 997) / 997) * (b - a));
      setCycleResults({
        pos:             r(38, 52),
        transfers:       r(290, 340),
        branches:        r(487, 496),
        value:           r(19_800, 28_600),
        duration:        (1.4 + ((seed % 7) / 10)).toFixed(1),
        stockoutsBlocked: r(4, 11),
      });
    }, 3500);

    setTimeout(() => setShowResults(true), 3900);
    setTimeout(() => setRunning(false), 5200);
  }, [running]);

  const allTypes = ['All', 'transfer', 'bulk-po', 'shelf-life', 'cash-flow', 'seasonal', 'demand-spike', 'rebalance', 'cycle-close'];
  const filteredFeed = feedFilter === 'All' ? feed : feed.filter(d => d.type === feedFilter);

  const topSuppliers = [...SUPPLIERS].sort((a, b) => b.todayPoVolume - a.todayPoVolume).slice(0, 6);

  return (
    <div className={styles.panel}>
      <div className={styles.topRow}>
        {/* Left: Pipeline + Run */}
        <div className={styles.pipelineCard}>
          <SpeakerHint text="Click Run Cycle to simulate one full replenishment pass across 500 branches. The engine scans 35,124 active SKU-branch positions and generates purchase orders + inter-branch transfers in under 2 seconds.">
            <div className={styles.runArea}>
              <div className={styles.runHeader}>
                <div>
                  <div className={styles.cardTitle}>Replenishment Engine</div>
                  <div className={styles.cardSub}>Automated cycle · 500 branches · 35,124 active positions monitored</div>
                </div>
                <button
                  className={`${styles.runBtn} ${running ? styles.running : ''}`}
                  onClick={handleRun}
                  disabled={running}
                >
                  {running ? 'Running…' : 'Run Cycle'}
                </button>
              </div>

              <div className={styles.counterWrap}>
                <span className={styles.counterLabel}>Active inventory positions scanned</span>
                <span className={`${styles.mono} ${styles.counterValue}`}>{evalCount.toLocaleString()}</span>
                {evalCount > 0 && evalCount < 35_124 && (
                  <span className={styles.counterSub}>of 35,124 monitored positions</span>
                )}
              </div>

              <div className={styles.pipeline}>
                {PIPELINE_STEPS.map((step, idx) => {
                  const isActive = pipelineStep === idx;
                  const isDone = pipelineStep > idx;
                  return (
                    <div
                      key={step}
                      className={`${styles.pipeStep} ${isActive ? styles.active : ''} ${isDone ? styles.done : ''} ${!running && !isActive && !isDone && idleHighlight === idx ? styles.idlePulse : ''}`}
                    >
                      <div className={styles.stepNum}>{isDone ? '✓' : idx + 1}</div>
                      <div className={styles.stepLabel}>{step}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </SpeakerHint>

          {cycleComplete && showResults && cycleResults && (
            <div className={styles.resultsPanel}>
              <div className={styles.resultsTitle}>Cycle Complete — Actions Executed</div>
              <div className={styles.resultsGrid}>
                <div className={styles.resultCard} style={{ borderTop: '3px solid var(--ok)' }}>
                  <div className={`${styles.mono} ${styles.resultValue}`} style={{ color: 'var(--ok)' }}>{cycleResults.pos}</div>
                  <div className={styles.resultLabel}>Purchase Orders</div>
                </div>
                <div className={styles.resultCard} style={{ borderTop: '3px solid var(--info)' }}>
                  <div className={`${styles.mono} ${styles.resultValue}`} style={{ color: 'var(--info)' }}>{cycleResults.transfers}</div>
                  <div className={styles.resultLabel}>Inter-Branch Transfers</div>
                </div>
                <div className={styles.resultCard} style={{ borderTop: '3px solid var(--accent)' }}>
                  <div className={`${styles.mono} ${styles.resultValue}`} style={{ color: 'var(--accent)' }}>{cycleResults.branches}/500</div>
                  <div className={styles.resultLabel}>Branches Updated</div>
                </div>
                <div className={styles.resultCard} style={{ borderTop: '3px solid var(--warn)' }}>
                  <div className={`${styles.mono} ${styles.resultValue}`} style={{ color: 'var(--warn)' }}>{cycleResults.stockoutsBlocked}</div>
                  <div className={styles.resultLabel}>Stockouts Blocked</div>
                </div>
                <div className={styles.resultCard} style={{ borderTop: '3px solid #a78bfa' }}>
                  <div className={`${styles.mono} ${styles.resultValue}`} style={{ color: '#a78bfa' }}>
                    ${cycleResults.value.toLocaleString()}
                  </div>
                  <div className={styles.resultLabel}>Value Captured</div>
                </div>
                <div className={styles.resultCard} style={{ borderTop: '3px solid var(--text-3)' }}>
                  <div className={`${styles.mono} ${styles.resultValue}`} style={{ color: 'var(--text-2)' }}>{cycleResults.duration}s</div>
                  <div className={styles.resultLabel}>Cycle Duration</div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.metricsRow}>
            <div className={styles.metricTile}>
              <div className={`${styles.mono} ${styles.metricValue}`}>12</div>
              <div className={styles.metricLabel}>Cycles Today</div>
            </div>
            <div className={styles.metricTile}>
              <div className={`${styles.mono} ${styles.metricValue}`}>{CUMULATIVE['24h'].value}</div>
              <div className={styles.metricLabel}>Captured Today</div>
            </div>
            <div className={styles.metricTile}>
              <div className={`${styles.mono} ${styles.metricValue}`}>24,180</div>
              <div className={styles.metricLabel}>Units in Transit</div>
            </div>
            <div className={styles.metricTile}>
              <div className={`${styles.mono} ${styles.metricValue}`} style={{ fontSize: 12 }}>Every 4 min</div>
              <div className={styles.metricLabel}>Next cycle: {nextCycleMin}m away</div>
            </div>
          </div>
        </div>

        <div className={styles.rightCol}>
          <div className={styles.card}>
            <div className={styles.sectionTitle}>Supplier Activity — Today</div>
            {topSuppliers.map(s => (
              <div key={s.name} className={styles.supplierRow}>
                <div className={styles.supplierName}>{s.name}</div>
                <div className={styles.supplierBarWrap}>
                  <div
                    className={styles.supplierBar}
                    style={{ width: `${(s.todayPoVolume / 847000) * 100}%` }}
                  />
                </div>
                <span className={styles.mono} style={{ fontSize: 11, color: 'var(--text-3)' }}>
                  {formatUSD(s.todayPoVolume, { compact: true })}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.card}>
            <div className={styles.sectionTitle}>Branch Health Breakdown</div>
            <div className={styles.healthGrid}>
              <div className={styles.healthItem} style={{ borderTop: '3px solid var(--ok)' }}>
                <span className={`${styles.mono} ${styles.healthCount}`} style={{ color: 'var(--ok)' }}>312</span>
                <span className={styles.healthLabel}>Optimal</span>
              </div>
              <div className={styles.healthItem} style={{ borderTop: '3px solid var(--warn)' }}>
                <span className={`${styles.mono} ${styles.healthCount}`} style={{ color: 'var(--warn)' }}>148</span>
                <span className={styles.healthLabel}>Monitor</span>
              </div>
              <div className={styles.healthItem} style={{ borderTop: '3px solid #F97316' }}>
                <span className={`${styles.mono} ${styles.healthCount}`} style={{ color: '#F97316' }}>28</span>
                <span className={styles.healthLabel}>Attention</span>
              </div>
              <div className={styles.healthItem} style={{ borderTop: '3px solid var(--err)' }}>
                <span className={`${styles.mono} ${styles.healthCount}`} style={{ color: 'var(--err)' }}>12</span>
                <span className={styles.healthLabel}>Critical</span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.sectionTitle}>Strategy Weights — Active</div>
            {[
              { label: 'Stock Availability', val: 80, color: 'var(--ok)' },
              { label: 'ROI Maximisation', val: 70, color: 'var(--accent)' },
              { label: 'Cash Flow Speed', val: 60, color: 'var(--info)' },
              { label: 'Shelf-life / Waste', val: 55, color: 'var(--warn)' },
              { label: 'Distribution Speed', val: 50, color: '#a78bfa' },
            ].map(w => (
              <div key={w.label} className={styles.weightRow}>
                <span className={styles.weightLabel}>{w.label}</span>
                <div className={styles.weightBarWrap}>
                  <div className={styles.weightBar} style={{ width: `${w.val}%`, background: w.color }} />
                </div>
                <span className={`${styles.mono} ${styles.weightVal}`}>{w.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.feedCard}>
        <div className={styles.feedHeader}>
          <span className={styles.sectionTitle} style={{ marginBottom: 0 }}>Live Decision Feed</span>
          <div className={styles.filterPills}>
            {allTypes.map(t => (
              <button
                key={t}
                className={`${styles.filterPill} ${feedFilter === t ? styles.activePill : ''}`}
                onClick={() => setFeedFilter(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.feedList}>
          {filteredFeed.slice(0, 20).map(d => (
            <div key={d.id} className={styles.feedItem}>
              <span className={`${styles.mono} ${styles.feedTs}`}>{d.timestamp}</span>
              <span
                className={styles.feedType}
                style={{ color: TYPE_COLORS[d.type] || 'var(--text-3)' }}
              >
                {d.type}
              </span>
              <span className={styles.feedHeadline}>{d.headline}</span>
              <span
                className={styles.feedStatus}
                style={{ color: STATUS_COLOR[d.status] }}
              >
                {d.status}
              </span>
              <span className={`${styles.mono} ${styles.feedConf}`}>
                {(d.confidence * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
