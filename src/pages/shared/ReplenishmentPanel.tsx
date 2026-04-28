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

export default function ReplenishmentPanel() {
  const [running, setRunning] = useState(false);
  const [cycleComplete, setCycleComplete] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(-1);
  const [idleHighlight, setIdleHighlight] = useState(0);
  const [evalCount, setEvalCount] = useState(0);
  const [salesCycleDisplay, setSalesCycleDisplay] = useState(4.2);
  const [marginDisplay, setMarginDisplay] = useState(38.4);
  const [showFinancial, setShowFinancial] = useState(false);
  const [showFootnote, setShowFootnote] = useState(false);
  const [feed, setFeed] = useState<Decision[]>([]);
  const [feedFilter, setFeedFilter] = useState('All');

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
    setShowFinancial(false);
    setShowFootnote(false);
    setSalesCycleDisplay(4.2);
    setMarginDisplay(38.4);
    setEvalCount(0);
    setPipelineStep(0);

    [0, 1, 2, 3, 4, 5].forEach(step => {
      setTimeout(() => setPipelineStep(step), 400 + step * 300);
    });

    const counterStart = 400;
    const counterDuration = 1800;
    const counterTarget = 35124847;
    const startTime = Date.now() + counterStart;
    const tick = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < 0) { setTimeout(tick, 50); return; }
      const progress = Math.min(elapsed / counterDuration, 1);
      setEvalCount(Math.floor(progress * counterTarget));
      if (progress < 1) setTimeout(tick, 50);
      else setEvalCount(counterTarget);
    };
    setTimeout(tick, counterStart);

    setTimeout(() => {
      setCycleComplete(true);
      setPipelineStep(6);
    }, 2200);

    setTimeout(() => {
      setShowFinancial(true);
      const animStart = Date.now();
      const animDur = 1500;
      const tickFin = () => {
        const prog = Math.min((Date.now() - animStart) / animDur, 1);
        setSalesCycleDisplay(parseFloat((4.2 - prog * 0.3).toFixed(2)));
        setMarginDisplay(parseFloat((38.4 + prog * 0.8).toFixed(1)));
        if (prog < 1) setTimeout(tickFin, 30);
      };
      tickFin();
    }, 3800);

    setTimeout(() => setShowFootnote(true), 5800);
    setTimeout(() => setRunning(false), 7500);
  }, [running]);

  const allTypes = ['All', 'transfer', 'bulk-po', 'shelf-life', 'cash-flow', 'seasonal', 'demand-spike', 'rebalance', 'cycle-close'];
  const filteredFeed = feedFilter === 'All' ? feed : feed.filter(d => d.type === feedFilter);

  const topSuppliers = [...SUPPLIERS].sort((a, b) => b.todayPoVolume - a.todayPoVolume).slice(0, 6);

  return (
    <div className={styles.panel}>
      <div className={styles.topRow}>
        {/* Left: Pipeline + Run */}
        <div className={styles.pipelineCard}>
          <SpeakerHint text="Click Run Now. This simulates a full replenishment cycle for 500 branches, 70,247 SKUs. Watch the counter — that is how many decisions DIOS evaluated in under 2 seconds.">
            <div className={styles.runArea}>
              <div className={styles.runHeader}>
                <div>
                  <div className={styles.cardTitle}>Replenishment Engine</div>
                  <div className={styles.cardSub}>Full network optimization cycle · 500 branches · 70,247 SKUs</div>
                </div>
                <button
                  className={`${styles.runBtn} ${running ? styles.running : ''}`}
                  onClick={handleRun}
                  disabled={running}
                >
                  {running ? 'Running...' : 'Run Now'}
                </button>
              </div>

              <div className={styles.counterWrap}>
                <span className={styles.counterLabel}>Decisions evaluated</span>
                <span className={`${styles.mono} ${styles.counterValue}`}>{evalCount.toLocaleString()}</span>
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
                      <div className={styles.stepNum}>{isDone ? '\u2713' : idx + 1}</div>
                      <div className={styles.stepLabel}>{step}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </SpeakerHint>

          {cycleComplete && showFinancial && (
            <SpeakerHint text="This is the causal chain. Faster cycle = higher turnover = released working capital = margin expansion. The numbers move live to show the compounding effect.">
              <div className={styles.financialPanel}>
                <div className={styles.financialTitle}>Financial Transformation — Live</div>
                <div className={styles.financialGrid}>
                  <div className={styles.financialCard} style={{ borderLeft: '3px solid var(--ok)' }}>
                    <div className={styles.financialLabel}>Sales Cycle</div>
                    <div className={styles.financialValue}><span className={styles.mono}>{salesCycleDisplay.toFixed(1)}</span> days</div>
                    <div className={styles.financialSub} style={{ color: 'var(--ok)' }}>Compressing in real time</div>
                  </div>
                  <div className={styles.financialArrow}>
                    <div className={styles.arrowLabel}>Causal: faster cycles released capital margin lift</div>
                  </div>
                  <div className={styles.financialCard} style={{ borderLeft: '3px solid var(--accent)' }}>
                    <div className={styles.financialLabel}>Gross Margin</div>
                    <div className={styles.financialValue}><span className={styles.mono}>{marginDisplay.toFixed(1)}</span>%</div>
                    <div className={styles.financialSub} style={{ color: 'var(--accent)' }}>Expanding via turnover</div>
                  </div>
                </div>
                {showFootnote && (
                  <div className={styles.footnote}>
                    $2.6M working capital released · 7.3x ROI on platform · Annual value generated: $8.2M Year 1
                  </div>
                )}
              </div>
            </SpeakerHint>
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
              <div className={`${styles.mono} ${styles.metricValue}`}>412,890</div>
              <div className={styles.metricLabel}>Units in Transit</div>
            </div>
            <div className={styles.metricTile}>
              <div className={`${styles.mono} ${styles.metricValue}`} style={{ fontSize: 12 }}>Auto-runs every 4 min</div>
              <div className={styles.metricLabel}>Next cycle: {Math.floor(Math.random() * 3) + 1}m away</div>
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
