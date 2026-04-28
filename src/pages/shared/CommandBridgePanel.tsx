import { useEffect, useState, useRef } from 'react';
import { SKUS } from '../../data/skus';
import { SEASONAL_EVENTS } from '../../data/seasonality';
import SpeakerHint from '../../components/SpeakerHint';
import RegionalHealthBars from '../../components/RegionalHealthBars';
import ShowMath from '../../components/ShowMath';
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

export default function CommandBridgePanel() {
  const branchCount = useCountUp(BRANCHES_COUNT, 1200, 0);
  const skuCount = useCountUp(SKUS_COUNT, 1400, 800);
  const decisionRaw = useCountUp(DECISIONS_PER_DAY, 1600, 1600);

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
              <div className={styles.heroNumber}>
                <ShowMath
                  formula="branches × active SKUs × 1 daily evaluation cycle"
                  inputs={[
                    { label: 'Branches', value: '500' },
                    { label: 'Active SKUs', value: '70,247' },
                    { label: 'Eval cycles/day', value: '1' },
                  ]}
                  output="35,123,500 decisions/day"
                  source="Standard multi-echelon replenishment evaluation model"
                >
                  {decisionStr}
                </ShowMath>
              </div>
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

      {/* Regional health + SKU row */}
      <div className={styles.bottomRow}>
        {/* Regional Health Bars */}
        <SpeakerHint text="This is the live network health breakdown. Each bar shows what percentage of branches in each region are fully stocked vs. at risk. Green dominates — that is the DIOS effect.">
          <div className={styles.mapCard}>
            <div className={styles.mapHeader}>
              <span className={styles.sectionTitle}>Network Health by Region</span>
              <span className={styles.mapCounter} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="dios-heartbeat" />
                Updated every cycle · <strong className={styles.mono}>{optimizeCounter}</strong>s ago
              </span>
            </div>
            <RegionalHealthBars />
          </div>
        </SpeakerHint>

        {/* Right column */}
        <div className={styles.rightCol}>
          {/* Seasonal triggers */}
          <div className={styles.card}>
            <div className={styles.sectionTitle}>Seasonal Triggers</div>
            <div className={styles.seasonList}>
              {SEASONAL_EVENTS.map(ev => (
                <div key={ev.name} className={styles.seasonRow} style={{ opacity: ev.status === 'completed' ? 0.55 : 1 }}>
                  <div className={styles.seasonName}>{ev.name}</div>
                  <div className={styles.seasonMeta}>
                    <span
                      className={styles.pill}
                      style={{
                        background: ev.status === 'completed' ? 'rgba(255,255,255,0.06)' : ev.status === 'active' ? 'rgba(225,84,29,0.15)' : 'rgba(96,165,250,0.12)',
                        color: ev.status === 'completed' ? 'var(--text-3)' : ev.status === 'active' ? 'var(--accent)' : 'var(--info)',
                      }}
                    >
                      {ev.status === 'completed' ? `${ev.daysUntil}d ago` : ev.status === 'active' ? 'NOW' : `+${ev.daysUntil}d`}
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
          <span className={`${styles.mono} ${styles.roiValue}`}>
            <ShowMath
              formula="Revenue Uplift + Working Capital + Waste + Bulk Discount + Distribution"
              inputs={[
                { label: 'Revenue uplift (stockout reduction)', value: '$3.5M/yr' },
                { label: 'Working capital released (one-time)', value: '$2.6M' },
                { label: 'Waste & expiry reduction', value: '$1.0M/yr' },
                { label: 'Bulk discount capture', value: '$0.84M/yr' },
                { label: 'Distribution efficiency', value: '$0.21M/yr' },
              ]}
              output="$8.2M Year 1 ($5.55M ongoing)"
              source="Pharmacy retail benchmarks (Retalon, Netstock 2024-25)"
            >
              {formatUSD(ANNUAL_VALUE_USD, { compact: true })}
            </ShowMath>
          </span>
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
