import { useEffect, useState } from 'react';
import styles from './RegionalHealthBars.module.css';

interface RegionData {
  name: string;
  total: number;
  optimal: number;   // 90-100
  good: number;      // 75-89
  monitor: number;   // 60-74
  critical: number;  // <60
}

const REGIONS: RegionData[] = [
  { name: 'Greater Cairo',  total: 180, optimal: 142, good: 28, monitor: 8,  critical: 2 },
  { name: 'Alexandria',     total: 80,  optimal: 60,  good: 14, monitor: 5,  critical: 1 },
  { name: 'Delta',          total: 90,  optimal: 65,  good: 18, monitor: 6,  critical: 1 },
  { name: 'Upper Egypt',    total: 80,  optimal: 58,  good: 16, monitor: 5,  critical: 1 },
  { name: 'Suez Canal',     total: 40,  optimal: 29,  good: 8,  monitor: 3,  critical: 0 },
  { name: 'Other',          total: 30,  optimal: 24,  good: 6,  monitor: 0,  critical: 0 },
];

// Top 3 sample branches per segment for tooltip
const SAMPLE_BRANCHES: Record<string, Record<string, string[]>> = {
  'Greater Cairo': {
    optimal:  ['Branch-Heliopolis-7 (98)', 'Branch-Maadi-3 (96)', 'Branch-Zamalek-1 (95)'],
    good:     ['Branch-Nasr-4 (87)', 'Branch-Dokki-2 (84)', 'Branch-Mohandessin-5 (82)'],
    monitor:  ['Branch-Shubra-1 (71)', 'Branch-Matareya-3 (68)', 'Branch-Imbaba-2 (65)'],
    critical: ['Branch-Ain-Shams-4 (52)', 'Branch-Badr-1 (48)'],
  },
  'Alexandria': {
    optimal:  ['Branch-Smouha-2 (97)', 'Branch-Stanley-1 (94)', 'Branch-Gleem-3 (93)'],
    good:     ['Branch-Sidi-Gaber-4 (88)', 'Branch-Laurent-1 (85)', 'Branch-Ibrahimia-2 (81)'],
    monitor:  ['Branch-Dekheila-1 (72)', 'Branch-Agami-3 (67)', 'Branch-Amreya-2 (61)'],
    critical: ['Branch-Mex-1 (49)'],
  },
};

interface Tooltip { region: string; segment: string; x: number; y: number }

function getSamples(region: string, segment: string): string[] {
  return SAMPLE_BRANCHES[region]?.[segment] ?? [
    `Branch-${region.replace(/\s/g, '')}-1`,
    `Branch-${region.replace(/\s/g, '')}-2`,
    `Branch-${region.replace(/\s/g, '')}-3`,
  ];
}

export default function RegionalHealthBars() {
  const [drawn, setDrawn] = useState<boolean[]>(REGIONS.map(() => false));
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  useEffect(() => {
    REGIONS.forEach((_, i) => {
      setTimeout(() => {
        setDrawn(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, i * 200);
    });
  }, []);

  return (
    <div className={styles.wrap}>
      {/* Summary row */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryNum}>87<span className={styles.summaryUnit}>/100</span></span>
          <span className={styles.summaryLabel}>Network Health Score</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryNum}>14</span>
          <span className={styles.summaryLabel}>Critical Branches Resolved Today</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryNum}>
            487<span className={styles.summaryUnit}>/500</span>
          </span>
          <div className={styles.summaryLabelRow}>
            <span className={styles.pulseDot} />
            <span className={styles.summaryLabel}>Optimized Last Cycle</span>
          </div>
        </div>
      </div>

      {/* Regional bars */}
      <div className={styles.barsGrid}>
        {REGIONS.map((r, i) => (
          <div key={r.name} className={styles.regionRow}>
            <div className={styles.regionName}>{r.name}</div>
            <div className={styles.barOuter}>
              {/* Optimal segment */}
              <div
                className={`${styles.seg} ${styles.segOptimal} ${drawn[i] ? styles.drawn : ''}`}
                style={{ width: `${(r.optimal / r.total) * 100}%`, transitionDelay: `${i * 200}ms` }}
                onMouseEnter={e => setTooltip({ region: r.name, segment: 'optimal', x: (e.target as HTMLElement).getBoundingClientRect().left, y: (e.target as HTMLElement).getBoundingClientRect().top })}
                onMouseLeave={() => setTooltip(null)}
              >
                {r.optimal >= 12 && <span className={styles.segCount}>{r.optimal}</span>}
              </div>
              {/* Good segment */}
              {r.good > 0 && (
                <div
                  className={`${styles.seg} ${styles.segGood} ${drawn[i] ? styles.drawn : ''}`}
                  style={{ width: `${(r.good / r.total) * 100}%`, transitionDelay: `${i * 200 + 80}ms` }}
                  onMouseEnter={e => setTooltip({ region: r.name, segment: 'good', x: (e.target as HTMLElement).getBoundingClientRect().left, y: (e.target as HTMLElement).getBoundingClientRect().top })}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {r.good >= 8 && <span className={styles.segCount}>{r.good}</span>}
                </div>
              )}
              {/* Monitor segment */}
              {r.monitor > 0 && (
                <div
                  className={`${styles.seg} ${styles.segMonitor} ${drawn[i] ? styles.drawn : ''}`}
                  style={{ width: `${(r.monitor / r.total) * 100}%`, transitionDelay: `${i * 200 + 160}ms` }}
                  onMouseEnter={e => setTooltip({ region: r.name, segment: 'monitor', x: (e.target as HTMLElement).getBoundingClientRect().left, y: (e.target as HTMLElement).getBoundingClientRect().top })}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {r.monitor >= 5 && <span className={styles.segCount}>{r.monitor}</span>}
                </div>
              )}
              {/* Critical segment */}
              {r.critical > 0 && (
                <div
                  className={`${styles.seg} ${styles.segCritical} ${drawn[i] ? styles.drawn : ''}`}
                  style={{ width: `${(r.critical / r.total) * 100}%`, transitionDelay: `${i * 200 + 240}ms` }}
                  onMouseEnter={e => setTooltip({ region: r.name, segment: 'critical', x: (e.target as HTMLElement).getBoundingClientRect().left, y: (e.target as HTMLElement).getBoundingClientRect().top })}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {r.critical >= 3 && <span className={styles.segCount}>{r.critical}</span>}
                </div>
              )}
            </div>
            <span className={styles.regionTotal}>{r.total} branches</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <span className={`${styles.dot} ${styles.dotOptimal}`} /> Optimal (90-100)
        <span className={`${styles.dot} ${styles.dotGood}`} /> Good (75-89)
        <span className={`${styles.dot} ${styles.dotMonitor}`} /> Monitor (60-74)
        <span className={`${styles.dot} ${styles.dotCritical}`} /> Critical (&lt;60)
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className={styles.tooltip}>
          <div className={styles.tooltipHeader}>{tooltip.region} — {tooltip.segment}</div>
          <div className={styles.tooltipList}>
            {getSamples(tooltip.region, tooltip.segment).map((b, i) => (
              <div key={i} className={styles.tooltipItem}>{b}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
