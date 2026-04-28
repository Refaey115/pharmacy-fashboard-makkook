import { useState, useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';
import { generateDecisions } from '../../data/decisionGen';
import type { Decision } from '../../data/decisionGen';
import SpeakerHint from '../../components/SpeakerHint';
import { CUMULATIVE, CONFIDENCE_HIST } from '../../data/canonicalNumbers';
import { getRationale, fillRationale, buildRationaleVars } from '../../data/rationaleLibrary';
import styles from './LedgerPanel.module.css';

type TimeWindow = '24h' | 'week' | 'month' | 'year';
const TIME_LABELS: Record<TimeWindow, string> = {
  '24h': '24 Hours', week: 'This Week', month: 'This Month', year: 'This Year (YTD)',
};

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

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

const ALL_TYPES = ['All', 'transfer', 'bulk-po', 'shelf-life', 'cash-flow', 'seasonal', 'demand-spike', 'rebalance', 'cycle-close'];

// CONFIDENCE_HIST imported from canonicalNumbers

export default function LedgerPanel() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [modalDecision, setModalDecision] = useState<Decision | null>(null);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('24h');
  const seedRef = useRef(0);

  useEffect(() => {
    setDecisions(generateDecisions(40));
    const iv = setInterval(() => {
      seedRef.current++;
      setDecisions(prev => {
        const newEntry = generateDecisions(1, seedRef.current * 200 + 9000)[0];
        return [newEntry, ...prev].slice(0, 120);
      });
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  const filtered = decisions.filter(d => {
    const typeMatch = filter === 'All' || d.type === filter;
    const searchMatch = !search || d.headline.toLowerCase().includes(search.toLowerCase()) || d.sku.toLowerCase().includes(search.toLowerCase());
    return typeMatch && searchMatch;
  });

  const histData = {
    labels: CONFIDENCE_HIST.labels,
    datasets: [
      {
        label: 'Decision Count',
        data: CONFIDENCE_HIST.data,
        backgroundColor: [
          'rgba(245,158,11,0.5)',
          'rgba(245,158,11,0.6)',
          'rgba(74,222,128,0.5)',
          'rgba(74,222,128,0.65)',
          'rgba(74,222,128,0.8)',
          'rgba(74,222,128,1)',
        ],
        borderRadius: 4,
      },
    ],
  };

  const histOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#1a1a1a', titleColor: '#EFEFEF', bodyColor: '#C6C6C6' },
    },
    scales: {
      x: { ticks: { color: '#9B9B9B', font: { size: 9 as const } }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#9B9B9B', font: { size: 9 as const } }, grid: { color: 'rgba(255,255,255,0.04)' } },
    },
  } as const;

  return (
    <div className={styles.panel}>
      {/* Time window toggle */}
      <div className={styles.timeToggleRow}>
        {(Object.keys(TIME_LABELS) as TimeWindow[]).map(w => (
          <button
            key={w}
            className={`${styles.timeBtn} ${timeWindow === w ? styles.timeBtnActive : ''}`}
            onClick={() => setTimeWindow(w)}
          >
            {TIME_LABELS[w]}
          </button>
        ))}
      </div>

      {/* Header stats */}
      <div className={styles.statsStrip}>
        <div className={styles.statItem}>
          <span className={`${styles.mono} ${styles.statValue}`}>{CUMULATIVE[timeWindow].decisions}</span>
          <span className={styles.statLabel}>Decisions · {TIME_LABELS[timeWindow]}</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={`${styles.mono} ${styles.statValue}`}>{CUMULATIVE[timeWindow].value}</span>
          <span className={styles.statLabel}>Value Captured · {TIME_LABELS[timeWindow]}</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={`${styles.mono} ${styles.statValue}`}>94.2%</span>
          <span className={styles.statLabel}>Average Confidence</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={`${styles.mono} ${styles.statValue}`}>
            {CUMULATIVE[timeWindow].overrides} <span className={styles.statSub}>({CUMULATIVE[timeWindow].overridesPct})</span>
          </span>
          <span className={styles.statLabel}>Human Overrides</span>
        </div>
      </div>

      <div className={styles.mainRow}>
        {/* Decision feed */}
        <SpeakerHint text="Every decision here has a traceable math explanation. Click Expand on any row then View Math. This is full auditability — DIOS explains every action.">
          <div className={styles.feedCard}>
            <div className={styles.feedHeader}>
              <div className={styles.feedControls}>
                <div className={styles.filterPills}>
                  {ALL_TYPES.map(t => (
                    <button
                      key={t}
                      className={`${styles.filterPill} ${filter === t ? styles.activePill : ''}`}
                      onClick={() => setFilter(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <input
                  className={styles.searchInput}
                  placeholder="Search decisions..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.feedList}>
              {filtered.slice(0, 40).map(d => (
                <div key={d.id} className={styles.feedItem}>
                  <div className={styles.feedItemTop}>
                    <span className={`${styles.mono} ${styles.feedTs}`}>{d.timestamp}</span>
                    <span className={styles.feedType} style={{ color: TYPE_COLORS[d.type] || 'var(--text-3)' }}>
                      {d.type}
                    </span>
                    <span className={styles.feedHeadline}>{d.headline}</span>
                    <span className={styles.feedConfBadge} style={{ color: d.confidence > 0.94 ? 'var(--ok)' : 'var(--warn)' }}>
                      {(d.confidence * 100).toFixed(1)}%
                    </span>
                    <span className={styles.feedStatus} style={{ color: STATUS_COLOR[d.status] }}>
                      {d.status}
                    </span>
                    <button
                      className={styles.expandBtn}
                      onClick={() => setExpanded(expanded === d.id ? null : d.id)}
                    >
                      {expanded === d.id ? 'Collapse' : 'Expand'}
                    </button>
                  </div>

                  {expanded === d.id && (
                    <div className={styles.feedItemDetail}>
                      <div className={styles.detailGrid}>
                        <div><span className={styles.detailLabel}>SKU</span><span className={`${styles.mono} ${styles.detailValue}`}>{d.sku}</span></div>
                        <div><span className={styles.detailLabel}>Branch</span><span className={styles.detailValue}>{d.branch}</span></div>
                        <div><span className={styles.detailLabel}>Supplier</span><span className={styles.detailValue}>{d.supplier}</span></div>
                        <div><span className={styles.detailLabel}>Units</span><span className={`${styles.mono} ${styles.detailValue}`}>{d.units.toLocaleString()}</span></div>
                        <div><span className={styles.detailLabel}>USD Value</span><span className={`${styles.mono} ${styles.detailValue}`}>${Math.round(d.egpValue / 5).toLocaleString()}</span></div>
                        <div><span className={styles.detailLabel}>Alternatives</span><span className={`${styles.mono} ${styles.detailValue}`}>{d.alternativesConsidered}</span></div>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Input Signals</span>
                        <span className={styles.detailText}>{d.inputSignals}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Constraints Active</span>
                        <span className={styles.detailText}>{d.constraintsActive}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Expected Outcome</span>
                        <span className={styles.detailText}>{d.expectedOutcome}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Financial Impact</span>
                        <span className={styles.detailText}>{d.financialImpact}</span>
                      </div>
                      <button
                        className={styles.mathBtn}
                        onClick={() => setModalDecision(d)}
                      >
                        View Math
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </SpeakerHint>

        {/* Right: histogram */}
        <div className={styles.histCard}>
          <div className={styles.histTitle}>Confidence Distribution</div>
          <div style={{ height: '180px' }}>
            <Bar data={histData} options={histOptions} />
          </div>
          <div className={styles.histMeta}>
            <span>Average: <strong className={styles.mono}>94.2%</strong></span>
            <span>Total: <strong className={styles.mono}>{CUMULATIVE[timeWindow].decisions}</strong></span>
          </div>
        </div>
      </div>

      {/* Math modal */}
      {modalDecision && (
        <div className={styles.modalOverlay} onClick={() => setModalDecision(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.modalTitle}>Decision Math — {modalDecision.id}</div>
                <div className={styles.modalSub}>{modalDecision.headline}</div>
              </div>
              <button className={styles.modalClose} onClick={() => setModalDecision(null)}>Close</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.mathSection}>
                <div className={styles.mathLabel}>Decision Rationale</div>
                <div className={styles.mathText}>
                  {fillRationale(
                    getRationale(modalDecision.type, modalDecision.id).template,
                    buildRationaleVars(modalDecision)
                  )}
                </div>
              </div>
              <div className={styles.mathSection}>
                <div className={styles.mathLabel}>System Explanation</div>
                <div className={styles.mathText}>{modalDecision.mathExplanation}</div>
              </div>
              <div className={styles.mathGrid}>
                <div className={styles.mathItem}>
                  <span className={styles.mathItemLabel}>Confidence</span>
                  <span className={`${styles.mono} ${styles.mathItemValue}`}>{(modalDecision.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className={styles.mathItem}>
                  <span className={styles.mathItemLabel}>Alternatives Evaluated</span>
                  <span className={`${styles.mono} ${styles.mathItemValue}`}>{modalDecision.alternativesConsidered}</span>
                </div>
                <div className={styles.mathItem}>
                  <span className={styles.mathItemLabel}>Financial Impact</span>
                  <span className={`${styles.mono} ${styles.mathItemValue}`}>{modalDecision.financialImpact}</span>
                </div>
                <div className={styles.mathItem}>
                  <span className={styles.mathItemLabel}>Status</span>
                  <span className={styles.mathItemValue} style={{ color: STATUS_COLOR[modalDecision.status] }}>
                    {modalDecision.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
