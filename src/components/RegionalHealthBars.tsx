import { useEffect, useState } from 'react';
import styles from './RegionalHealthBars.module.css';

interface RegionData {
  name:     string;
  total:    number;
  optimal:  number;
  good:     number;
  monitor:  number;
  critical: number;
}

const REGIONS: RegionData[] = [
  { name: 'Greater Cairo',  total: 180, optimal: 156, good: 18, monitor: 5,  critical: 1  },
  { name: 'Alexandria',     total: 80,  optimal: 68,  good: 8,  monitor: 3,  critical: 1  },
  { name: 'Delta',          total: 90,  optimal: 72,  good: 14, monitor: 4,  critical: 0  },
  { name: 'Upper Egypt',    total: 80,  optimal: 58,  good: 14, monitor: 6,  critical: 2  },
  { name: 'Suez Canal',     total: 40,  optimal: 33,  good: 5,  monitor: 2,  critical: 0  },
  { name: 'Other',          total: 30,  optimal: 26,  good: 3,  monitor: 1,  critical: 0  },
];

// Ring chart: animated SVG donut
interface RingProps {
  pct: number;
  animated: boolean;
  color: string;
  size?: number;
  strokeWidth?: number;
}

function Ring({ pct, animated, color, size = 88, strokeWidth = 9 }: RingProps) {
  const r    = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const cx   = size / 2;
  const cy   = size / 2;
  const offset = circ * (1 - (animated ? pct : 0) / 100);

  return (
    <svg
      width={size}
      height={size}
      style={{ transform: 'rotate(-90deg)', display: 'block' }}
      aria-hidden
    >
      {/* Track */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth={strokeWidth}
      />
      {/* Glow behind fill */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={color}
        strokeOpacity={0.15}
        strokeWidth={strokeWidth + 6}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: animated ? 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)' : 'none' }}
      />
      {/* Main fill */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: animated ? 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)' : 'none' }}
      />
    </svg>
  );
}

function ringColor(pct: number): string {
  if (pct >= 88) return '#4ade80';
  if (pct >= 80) return '#60a5fa';
  if (pct >= 72) return '#f59e0b';
  return '#f87171';
}

export default function RegionalHealthBars() {
  const [animated, setAnimated] = useState(false);
  const [hovered, setHovered]   = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(t);
  }, []);

  const totalOptimal = REGIONS.reduce((s, r) => s + r.optimal, 0);
  const totalBranches = REGIONS.reduce((s, r) => s + r.total, 0);
  const networkPct = Math.round((totalOptimal / totalBranches) * 100);

  return (
    <div className={styles.wrap}>

      {/* Top summary bar */}
      <div className={styles.summaryStrip}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryVal}>{networkPct}%</span>
          <span className={styles.summaryLbl}>Optimal branches</span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryItem}>
          <span className={styles.summaryVal}>{totalOptimal}<span className={styles.summarySmall}>/{totalBranches}</span></span>
          <span className={styles.summaryLbl}>Branches optimised</span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryItem}>
          <span className={styles.summaryVal} style={{ color: 'var(--ok)' }}>
            <span className={styles.pulseDot} />
            14
          </span>
          <span className={styles.summaryLbl}>Critical resolved today</span>
        </div>
      </div>

      {/* Region cards grid */}
      <div className={styles.cardsGrid}>
        {REGIONS.map((r, idx) => {
          const pct   = Math.round((r.optimal / r.total) * 100);
          const color = ringColor(pct);
          const delay = idx * 130;
          const isHovered = hovered === r.name;

          return (
            <div
              key={r.name}
              className={`${styles.card} ${isHovered ? styles.cardHovered : ''}`}
              style={{ animationDelay: `${delay}ms` }}
              onMouseEnter={() => setHovered(r.name)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Ring + percent */}
              <div className={styles.ringWrap} style={{ '--ring-color': color } as React.CSSProperties}>
                <Ring pct={pct} animated={animated} color={color} />
                <div className={styles.ringCenter}>
                  <span className={styles.ringPct} style={{ color }}>{pct}</span>
                  <span className={styles.ringPctSign} style={{ color }}>%</span>
                </div>
              </div>

              {/* Region name */}
              <div className={styles.regionName}>{r.name}</div>
              <div className={styles.regionCount}>{r.total} branches</div>

              {/* Breakdown mini-bars */}
              <div className={styles.breakdown}>
                <div className={styles.bRow}>
                  <div
                    className={styles.bBar}
                    style={{
                      width: `${(r.optimal / r.total) * 100}%`,
                      background: '#4ade80',
                      opacity: animated ? 1 : 0,
                      transition: `width 1s ${delay + 200}ms ease, opacity 0.3s ${delay}ms`,
                    }}
                  />
                  <span className={styles.bLabel}>{r.optimal} optimal</span>
                </div>
                <div className={styles.bRow}>
                  <div
                    className={styles.bBar}
                    style={{
                      width: `${(r.good / r.total) * 100}%`,
                      background: '#60a5fa',
                      opacity: animated ? 1 : 0,
                      transition: `width 1s ${delay + 300}ms ease, opacity 0.3s ${delay + 100}ms`,
                    }}
                  />
                  <span className={styles.bLabel}>{r.good} good</span>
                </div>
                {r.monitor > 0 && (
                  <div className={styles.bRow}>
                    <div
                      className={styles.bBar}
                      style={{
                        width: `${(r.monitor / r.total) * 100}%`,
                        background: '#f59e0b',
                        opacity: animated ? 1 : 0,
                        transition: `width 1s ${delay + 400}ms ease, opacity 0.3s ${delay + 200}ms`,
                      }}
                    />
                    <span className={styles.bLabel}>{r.monitor} monitor</span>
                  </div>
                )}
                {r.critical > 0 && (
                  <div className={styles.bRow}>
                    <div
                      className={styles.bBar}
                      style={{
                        width: `${(r.critical / r.total) * 100}%`,
                        background: '#f87171',
                        opacity: animated ? 1 : 0,
                        transition: `width 1s ${delay + 500}ms ease, opacity 0.3s ${delay + 300}ms`,
                      }}
                    />
                    <span className={styles.bLabel} style={{ color: '#f87171' }}>{r.critical} critical</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <span className={styles.legendDot} style={{ background: '#4ade80' }} />Optimal
        <span className={styles.legendDot} style={{ background: '#60a5fa' }} />Good
        <span className={styles.legendDot} style={{ background: '#f59e0b' }} />Monitor
        <span className={styles.legendDot} style={{ background: '#f87171' }} />Critical
      </div>

    </div>
  );
}
