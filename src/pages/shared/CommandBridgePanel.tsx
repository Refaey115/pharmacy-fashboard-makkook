import { useEffect, useState, useRef } from 'react';
import { BRANCHES } from '../../data/branches';
import type { Branch } from '../../data/branches';
import { SKUS } from '../../data/skus';
import { SEASONAL_EVENTS } from '../../data/seasonality';
import SpeakerHint from '../../components/SpeakerHint';
import {
  BRANCHES_COUNT, SKUS_COUNT, DECISIONS_PER_DAY,
  SALES_CYCLE_AFTER, SALES_CYCLE_BEFORE,
  GROSS_MARGIN_AFTER, GROSS_MARGIN_BEFORE,
  STOCK_AVAIL_AFTER,
  ANNUAL_VALUE_USD, ROI,
} from '../../data/canonicalNumbers';
import { formatUSD } from '../../utils/formatCurrency';
import styles from './CommandBridgePanel.module.css';

function useCountUp(target: number, duration: number, delay: number = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let animId: number;
    let startTime: number | null = null;
    const delayTimer = setTimeout(() => {
      const animate = (ts: number) => {
        if (!startTime) startTime = ts;
        const progress = Math.min((ts - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.floor(eased * target));
        if (progress < 1) animId = requestAnimationFrame(animate);
        else setValue(target);
      };
      animId = requestAnimationFrame(animate);
    }, delay);
    return () => { clearTimeout(delayTimer); cancelAnimationFrame(animId); };
  }, [target, duration, delay]);
  return value;
}

function toSvgX(lng: number, W: number) {
  return 10 + ((lng - 24.5) / (36.5 - 24.5)) * (W - 20);
}
function toSvgY(lat: number, H: number) {
  return H - 10 - ((lat - 22.0) / (31.8 - 22.0)) * (H - 20);
}

function healthColor(score: number) {
  if (score >= 75) return 'var(--ok)';
  if (score >= 55) return 'var(--warn)';
  if (score >= 40) return '#F97316';
  return 'var(--err)';
}

const W = 800;
const H = 300;

export default function CommandBridgePanel() {
  const branchCount = useCountUp(BRANCHES_COUNT, 1200, 0);
  const skuCount = useCountUp(SKUS_COUNT, 1400, 800);
  const decisionRaw = useCountUp(DECISIONS_PER_DAY, 1600, 1600);

  const [hoveredBranch, setHoveredBranch] = useState<Branch | null>(null);
  const [optimizeCounter, setOptimizeCounter] = useState(4);
  const optimizeRef = useRef(4);

  useEffect(() => {
    const iv = setInterval(() => {
      optimizeRef.current += 4;
      setOptimizeCounter(optimizeRef.current);
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  const topSkus = [...SKUS].sort((a, b) => b.demandScore - a.demandScore).slice(0, 8);

  const decisionStr =
    decisionRaw >= 1000000
      ? `${(decisionRaw / 1000000).toFixed(1)}M`
      : decisionRaw.toLocaleString();

  return (
    <div className={styles.panel}>
      {/* Hero strip */}
      <SpeakerHint text="Pause here 5 seconds. Let the numbers land. 35.1 million decisions processed today — ask the room: how many staff would that take?">
        <div className={styles.hero}>
          <div className={styles.heroGrid}>
            <div className={styles.heroStat}>
              <div className={styles.heroNumber}>{branchCount.toLocaleString()}</div>
              <div className={styles.heroLabel}>Branches — Live Network</div>
            </div>
            <div className={styles.heroStat}>
              <div className={styles.heroNumber}>{skuCount.toLocaleString()}</div>
              <div className={styles.heroLabel}>Active SKUs Managed</div>
            </div>
            <div className={styles.heroStat}>
              <div className={styles.heroNumber}>{decisionStr}</div>
              <div className={styles.heroLabel}>AI Decisions Today</div>
            </div>
          </div>
          <div className={styles.heroSubtext}>
            Makkook DIOS — Decision Intelligence Operating System — managing the network in real time
          </div>
        </div>
      </SpeakerHint>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Sales Cycle Velocity</div>
          <div className={styles.kpiValue}><span className={styles.mono}>{SALES_CYCLE_AFTER}</span> days</div>
          <div className={styles.kpiDelta} style={{ color: 'var(--ok)' }}>-{(SALES_CYCLE_BEFORE - SALES_CYCLE_AFTER).toFixed(1)}d vs baseline</div>
          <div className={styles.kpiInsight}>30% faster than industry standard</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Gross Profit Margin</div>
          <div className={styles.kpiValue}><span className={styles.mono}>{GROSS_MARGIN_AFTER}</span>%</div>
          <div className={styles.kpiDelta} style={{ color: 'var(--ok)' }}>+{(GROSS_MARGIN_AFTER - GROSS_MARGIN_BEFORE).toFixed(1)}pp vs baseline</div>
          <div className={styles.kpiInsight}>Margin expansion via supplier consolidation</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Stock Availability</div>
          <div className={styles.kpiValue}><span className={styles.mono}>{STOCK_AVAIL_AFTER}</span>%</div>
          <div className={styles.kpiDelta} style={{ color: 'var(--ok)' }}>+{(STOCK_AVAIL_AFTER - 82.1).toFixed(1)}pp vs baseline</div>
          <div className={styles.kpiInsight}>2.4pp above sector average of 94%</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Working Capital Released</div>
          <div className={styles.kpiValue}><span className={styles.mono}>{formatUSD(2_600_000, { compact: true })}</span></div>
          <div className={styles.kpiDelta} style={{ color: 'var(--ok)' }}>61% of trapped capital freed</div>
          <div className={styles.kpiInsight}>DIO reduced from 31 to 12 days</div>
        </div>
      </div>

      {/* Map + SKU row */}
      <div className={styles.bottomRow}>
        {/* SVG heatmap */}
        <SpeakerHint text="Each dot is a real branch. Green = health above 75. This is a live optimized network — point out the density in Greater Cairo vs sparse Upper Egypt.">
          <div className={styles.mapCard}>
            <div className={styles.mapHeader}>
              <span className={styles.sectionTitle}>Branch Network — Egypt</span>
              <span className={styles.mapCounter}>
                All <strong>500</strong> branches optimized in the last <strong className={styles.mono}>{optimizeCounter}</strong>s
              </span>
            </div>
            <div className={styles.mapWrap}>
              <svg
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="xMidYMid meet"
                style={{ width: '100%', height: '100%' }}
              >
                {BRANCHES.map(b => (
                  <circle
                    key={b.id}
                    cx={toSvgX(b.lng, W)}
                    cy={toSvgY(b.lat, H)}
                    r={hoveredBranch?.id === b.id ? 5 : 3}
                    fill={healthColor(b.healthScore)}
                    opacity={hoveredBranch ? (hoveredBranch.id === b.id ? 1 : 0.4) : 0.75}
                    style={{ cursor: 'pointer', transition: 'opacity 0.15s, r 0.15s' }}
                    onMouseEnter={() => setHoveredBranch(b)}
                    onMouseLeave={() => setHoveredBranch(null)}
                  />
                ))}
              </svg>
              {hoveredBranch && (
                <div className={styles.mapTooltip}>
                  <div className={styles.tooltipName}>{hoveredBranch.name}</div>
                  <div className={styles.tooltipRow}>
                    <span>{hoveredBranch.district}</span>
                    <span className={styles.mono}>Health: {hoveredBranch.healthScore}</span>
                  </div>
                  <div className={styles.tooltipRow}>
                    <span>{hoveredBranch.region}</span>
                    <span className={styles.mono}>Rev: ${(hoveredBranch.monthlyRevenue / 1000).toFixed(0)}K/mo</span>
                  </div>
                </div>
              )}
            </div>
            <div className={styles.mapLegend}>
              <span className={styles.legendDot} style={{ background: 'var(--ok)' }} /> Optimal (75-100)
              <span className={styles.legendDot} style={{ background: 'var(--warn)' }} /> Monitor (55-74)
              <span className={styles.legendDot} style={{ background: '#F97316' }} /> Attention (40-54)
              <span className={styles.legendDot} style={{ background: 'var(--err)' }} /> Critical (&lt;40)
            </div>
          </div>
        </SpeakerHint>

        {/* Right column */}
        <div className={styles.rightCol}>
          {/* Seasonal triggers */}
          <div className={styles.card}>
            <div className={styles.sectionTitle}>Seasonal Triggers</div>
            <div className={styles.seasonList}>
              {SEASONAL_EVENTS.map(ev => (
                <div key={ev.name} className={styles.seasonRow}>
                  <div className={styles.seasonName}>{ev.name}</div>
                  <div className={styles.seasonMeta}>
                    <span
                      className={styles.pill}
                      style={{
                        background: ev.status === 'completed' ? 'rgba(74,222,128,0.12)' : ev.status === 'active' ? 'rgba(225,84,29,0.12)' : 'rgba(96,165,250,0.12)',
                        color: ev.status === 'completed' ? 'var(--ok)' : ev.status === 'active' ? 'var(--accent)' : 'var(--info)',
                      }}
                    >
                      {ev.status === 'completed' ? 'Done' : ev.status === 'active' ? 'Active' : `+${ev.daysUntil}d`}
                    </span>
                    <span className={styles.seasonAction}>{ev.aiActionTaken}</span>
                    {ev.unitsPrePositioned > 0 && (
                      <span className={styles.mono} style={{ fontSize: 11, color: 'var(--text-3)' }}>
                        {ev.unitsPrePositioned.toLocaleString()} units
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top SKUs by demand */}
          <div className={styles.card}>
            <div className={styles.sectionTitle}>Top SKUs by Demand Score</div>
            <div className={styles.skuList}>
              {topSkus.map(sku => (
                <div key={sku.code} className={styles.skuRow}>
                  <span className={`${styles.mono} ${styles.skuCode}`}>{sku.code}</span>
                  <span className={styles.skuName}>{sku.genericName}</span>
                  <div className={styles.skuBarWrap}>
                    <div
                      className={styles.skuBar}
                      style={{ width: `${sku.demandScore}%`, background: sku.demandScore >= 90 ? 'var(--accent)' : 'var(--info)' }}
                    />
                  </div>
                  <span className={`${styles.mono} ${styles.skuScore}`}>{sku.demandScore}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ROI Summary strip */}
      <div className={styles.roiStrip}>
        <div className={styles.roiItem}>
          <span className={styles.roiLabel}>Annual Value Generated</span>
          <span className={`${styles.mono} ${styles.roiValue}`}>{formatUSD(ANNUAL_VALUE_USD, { compact: true })}</span>
        </div>
        <div className={styles.roiDivider} />
        <div className={styles.roiItem}>
          <span className={styles.roiLabel}>ROI on Platform</span>
          <span className={`${styles.mono} ${styles.roiValue}`}>{ROI}x</span>
        </div>
        <div className={styles.roiDivider} />
        <div className={styles.roiItem}>
          <span className={styles.roiLabel}>Sales Cycle Compression</span>
          <span className={`${styles.mono} ${styles.roiValue}`}>{SALES_CYCLE_BEFORE}d → {SALES_CYCLE_AFTER}d</span>
        </div>
        <div className={styles.roiDivider} />
        <div className={styles.roiItem}>
          <span className={styles.roiLabel}>Margin Expansion</span>
          <span className={`${styles.mono} ${styles.roiValue}`}>{GROSS_MARGIN_BEFORE}% → {GROSS_MARGIN_AFTER}%</span>
        </div>
      </div>
    </div>
  );
}
