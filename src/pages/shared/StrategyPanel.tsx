import { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';
import styles from './StrategyPanel.module.css';

ChartJS.register(
  RadialLinearScale, PointElement, LineElement, Filler,
  Tooltip, Legend, CategoryScale, LinearScale, BarElement,
);

// ── Preset definitions ─────────────────────────────────────────────────────
type PresetKey = 'balanced' | 'roi' | 'cashflow' | 'stock';

interface Weights {
  stockAvailability: number;
  roiMaximisation: number;
  cashFlowSpeed: number;
  wasteReduction: number;
  distributionSpeed: number;
}

const PRESETS: Record<PresetKey, Weights> = {
  balanced: { stockAvailability: 60, roiMaximisation: 60, cashFlowSpeed: 60, wasteReduction: 55, distributionSpeed: 50 },
  roi:      { stockAvailability: 40, roiMaximisation: 90, cashFlowSpeed: 55, wasteReduction: 35, distributionSpeed: 40 },
  cashflow: { stockAvailability: 50, roiMaximisation: 50, cashFlowSpeed: 92, wasteReduction: 60, distributionSpeed: 45 },
  stock:    { stockAvailability: 92, roiMaximisation: 40, cashFlowSpeed: 38, wasteReduction: 72, distributionSpeed: 68 },
};

const PRESET_META: Record<PresetKey, { label: string; tag: string; description: string }> = {
  balanced: {
    label: 'Balanced',
    tag: 'DEFAULT',
    description: 'Equal weight across all objectives. Best for steady-state operations.',
  },
  roi: {
    label: 'ROI Focus',
    tag: 'ROI',
    description: 'Prioritises return on capital. Accepts slightly higher stockout risk in low-demand branches.',
  },
  cashflow: {
    label: 'Cash Flow',
    tag: 'CASH',
    description: 'Minimises working capital tied up. Just-in-time ordering, reduces holding days aggressively.',
  },
  stock: {
    label: 'Stock Optimisation',
    tag: 'STOCK',
    description: 'Maximises product availability. Accepts higher inventory costs to eliminate stockouts.',
  },
};

// ── Impact model (linear approximation) ──────────────────────────────────
function computeImpact(w: Weights) {
  const s  = w.stockAvailability  / 100;
  const r  = w.roiMaximisation    / 100;
  const c  = w.cashFlowSpeed      / 100;
  const ws = w.wasteReduction     / 100;
  const d  = w.distributionSpeed  / 100;

  return {
    stockAvailabilityPct:  +(82 + s * 15.5).toFixed(1),           // 82 – 97.5%
    grossMarginPct:        +(27.5 + r * 12.5).toFixed(1),          // 27.5 – 40%
    holdingDays:           Math.round(30 - c * 10),                 // 20 – 30 days
    wasteReductionPct:     Math.round(ws * 80),                     // 0 – 80%
    distributionSavingPct: Math.round(d * 22),                      // 0 – 22%
    annualValueM:          +(3.5 + r * 2.8 + s * 1.4 + c * 1.0 + ws * 0.8 + d * 0.3).toFixed(2), // $3.5 – $9.8M
    cycleTimeDays:         +(30 - c * 9 - d * 1.5).toFixed(1),    // 19.5 – 30 days
    roiX:                  +(2.8 + r * 5.5).toFixed(1),            // 2.8 – 8.3×
  };
}

const SLIDER_LABELS: Array<{ key: keyof Weights; label: string; color: string }> = [
  { key: 'stockAvailability',  label: 'Stock Availability',  color: 'var(--ok)' },
  { key: 'roiMaximisation',    label: 'ROI Maximisation',    color: 'var(--accent)' },
  { key: 'cashFlowSpeed',      label: 'Cash Flow Speed',     color: 'var(--info)' },
  { key: 'wasteReduction',     label: 'Waste Prevention',    color: 'var(--warn)' },
  { key: 'distributionSpeed',  label: 'Distribution Speed',  color: '#a78bfa' },
];

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

export default function StrategyPanel() {
  const [activePreset, setActivePreset] = useState<PresetKey | 'custom'>('balanced');
  const [weights, setWeights] = useState<Weights>({ ...PRESETS.balanced });
  const [displayWeights, setDisplayWeights] = useState<Weights>({ ...PRESETS.balanced });
  const animRef = useRef<number | null>(null);
  const fromWeightsRef = useRef<Weights>({ ...PRESETS.balanced });

  // Smooth interpolation when preset changes
  useEffect(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const from = { ...displayWeights };
    fromWeightsRef.current = from;
    const start = performance.now();
    const duration = 600;
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const next: Weights = {
        stockAvailability: lerp(from.stockAvailability, weights.stockAvailability, eased),
        roiMaximisation:   lerp(from.roiMaximisation,   weights.roiMaximisation,   eased),
        cashFlowSpeed:     lerp(from.cashFlowSpeed,      weights.cashFlowSpeed,     eased),
        wasteReduction:    lerp(from.wasteReduction,     weights.wasteReduction,    eased),
        distributionSpeed: lerp(from.distributionSpeed,  weights.distributionSpeed,  eased),
      };
      setDisplayWeights(next);
      if (t < 1) animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weights]);

  function selectPreset(key: PresetKey) {
    setActivePreset(key);
    setWeights({ ...PRESETS[key] });
  }

  function handleSlider(key: keyof Weights, val: number) {
    setActivePreset('custom');
    setWeights(prev => ({ ...prev, [key]: val }));
  }

  const impact = computeImpact(displayWeights);
  const balancedImpact = computeImpact(PRESETS.balanced);

  // ── Radar chart data ────────────────────────────────────────────────────
  const radarData = {
    labels: ['Stock\nAvailability', 'ROI\nMaximisation', 'Cash Flow\nSpeed', 'Waste\nPrevention', 'Distribution\nSpeed'],
    datasets: [
      {
        label: 'Current Strategy',
        data: [
          displayWeights.stockAvailability,
          displayWeights.roiMaximisation,
          displayWeights.cashFlowSpeed,
          displayWeights.wasteReduction,
          displayWeights.distributionSpeed,
        ],
        backgroundColor: 'rgba(225,84,29,0.18)',
        borderColor: 'rgba(225,84,29,0.9)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(225,84,29,1)',
        pointRadius: 4,
      },
      {
        label: 'Balanced Baseline',
        data: [
          PRESETS.balanced.stockAvailability,
          PRESETS.balanced.roiMaximisation,
          PRESETS.balanced.cashFlowSpeed,
          PRESETS.balanced.wasteReduction,
          PRESETS.balanced.distributionSpeed,
        ],
        backgroundColor: 'rgba(96,165,250,0.08)',
        borderColor: 'rgba(96,165,250,0.45)',
        borderWidth: 1.5,
        borderDash: [4, 3],
        pointRadius: 2,
        pointBackgroundColor: 'rgba(96,165,250,0.6)',
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#9B9B9B', font: { size: 10 as const } } },
      tooltip: { backgroundColor: '#1a1a1a', titleColor: '#EFEFEF', bodyColor: '#C6C6C6' },
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { display: false, stepSize: 25 },
        grid: { color: 'rgba(255,255,255,0.07)' },
        pointLabels: { color: '#9B9B9B', font: { size: 10 as const } },
        angleLines: { color: 'rgba(255,255,255,0.08)' },
      },
    },
  };

  // ── Impact comparison bar chart ─────────────────────────────────────────
  const impactLabels = ['Stock Avail %', 'Gross Margin %', 'Cycle Days', 'ROI ×'];
  const currentVals  = [impact.stockAvailabilityPct,  impact.grossMarginPct,  impact.cycleTimeDays, impact.roiX];
  const baselineVals = [balancedImpact.stockAvailabilityPct, balancedImpact.grossMarginPct, balancedImpact.cycleTimeDays, balancedImpact.roiX];

  const barData = {
    labels: impactLabels,
    datasets: [
      {
        label: 'Current Strategy',
        data: currentVals,
        backgroundColor: 'rgba(225,84,29,0.8)',
        borderRadius: 6,
      },
      {
        label: 'Balanced Baseline',
        data: baselineVals,
        backgroundColor: 'rgba(96,165,250,0.4)',
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#9B9B9B', font: { size: 10 as const } } },
      tooltip: { backgroundColor: '#1a1a1a', titleColor: '#EFEFEF', bodyColor: '#C6C6C6' },
    },
    scales: {
      x: { ticks: { color: '#9B9B9B', font: { size: 10 as const } }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#9B9B9B', font: { size: 10 as const } }, grid: { color: 'rgba(255,255,255,0.04)' } },
    },
  } as const;

  const tradeoffs: Array<{ label: string; value: string; delta: string; up: boolean; color: string }> = [
    {
      label: 'Stock Availability',
      value: `${impact.stockAvailabilityPct}%`,
      delta: `${impact.stockAvailabilityPct >= balancedImpact.stockAvailabilityPct ? '+' : ''}${(impact.stockAvailabilityPct - balancedImpact.stockAvailabilityPct).toFixed(1)}pp`,
      up: impact.stockAvailabilityPct >= balancedImpact.stockAvailabilityPct,
      color: 'var(--ok)',
    },
    {
      label: 'Gross Margin',
      value: `${impact.grossMarginPct}%`,
      delta: `${impact.grossMarginPct >= balancedImpact.grossMarginPct ? '+' : ''}${(impact.grossMarginPct - balancedImpact.grossMarginPct).toFixed(1)}pp`,
      up: impact.grossMarginPct >= balancedImpact.grossMarginPct,
      color: 'var(--accent)',
    },
    {
      label: 'Holding Days',
      value: `${impact.holdingDays}d`,
      delta: `${impact.holdingDays <= balancedImpact.holdingDays ? '' : '+'}${impact.holdingDays - balancedImpact.holdingDays}d`,
      up: impact.holdingDays <= balancedImpact.holdingDays,
      color: 'var(--info)',
    },
    {
      label: 'Sales Cycle',
      value: `${impact.cycleTimeDays}d`,
      delta: `${impact.cycleTimeDays <= balancedImpact.cycleTimeDays ? '' : '+'}${(impact.cycleTimeDays - balancedImpact.cycleTimeDays).toFixed(1)}d`,
      up: impact.cycleTimeDays <= balancedImpact.cycleTimeDays,
      color: 'var(--warn)',
    },
    {
      label: 'Waste Reduction',
      value: `${impact.wasteReductionPct}%`,
      delta: `${impact.wasteReductionPct >= balancedImpact.wasteReductionPct ? '+' : ''}${impact.wasteReductionPct - balancedImpact.wasteReductionPct}pp`,
      up: impact.wasteReductionPct >= balancedImpact.wasteReductionPct,
      color: '#a78bfa',
    },
    {
      label: 'Platform ROI',
      value: `${impact.roiX}×`,
      delta: `${impact.roiX >= balancedImpact.roiX ? '+' : ''}${(impact.roiX - balancedImpact.roiX).toFixed(1)}×`,
      up: impact.roiX >= balancedImpact.roiX,
      color: 'var(--ok)',
    },
    {
      label: 'Annual Value',
      value: `$${impact.annualValueM}M`,
      delta: `${impact.annualValueM >= balancedImpact.annualValueM ? '+' : ''}$${(impact.annualValueM - balancedImpact.annualValueM).toFixed(2)}M`,
      up: impact.annualValueM >= balancedImpact.annualValueM,
      color: 'var(--accent)',
    },
    {
      label: 'Dist. Savings',
      value: `${impact.distributionSavingPct}%`,
      delta: `${impact.distributionSavingPct >= balancedImpact.distributionSavingPct ? '+' : ''}${impact.distributionSavingPct - balancedImpact.distributionSavingPct}pp`,
      up: impact.distributionSavingPct >= balancedImpact.distributionSavingPct,
      color: '#f59e0b',
    },
  ];

  return (
    <div className={styles.panel}>

      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Strategy Control</h2>
          <p className={styles.pageSub}>
            Adjust the AI engine's objective weights to shift performance across ROI, cash flow, stock availability, and waste prevention. Changes take effect on the next replenishment cycle.
          </p>
        </div>
        <div className={styles.activeBadge}>
          <span className={styles.activeDot} />
          {activePreset === 'custom' ? 'Custom Strategy' : PRESET_META[activePreset].label} — Active
        </div>
      </div>

      {/* Preset buttons */}
      <div className={styles.presetRow}>
        {(Object.keys(PRESET_META) as PresetKey[]).map(key => (
          <button
            key={key}
            className={`${styles.presetBtn} ${activePreset === key ? styles.presetActive : ''}`}
            onClick={() => selectPreset(key)}
          >
            <span className={styles.presetTag}>{PRESET_META[key].tag}</span>
            <div className={styles.presetText}>
              <div className={styles.presetLabel}>{PRESET_META[key].label}</div>
              <div className={styles.presetDesc}>{PRESET_META[key].description}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Main grid */}
      <div className={styles.mainGrid}>

        {/* Left: sliders */}
        <div className={styles.slidersCard}>
          <div className={styles.cardTitle}>Objective Weights</div>
          <div className={styles.cardSub}>Drag sliders to define custom priorities. Preset buttons auto-fill recommended values.</div>
          <div className={styles.sliderList}>
            {SLIDER_LABELS.map(({ key, label, color }) => {
              const val = Math.round(displayWeights[key]);
              return (
                <div key={key} className={styles.sliderRow}>
                  <div className={styles.sliderHeader}>
                    <span className={styles.sliderLabel}>{label}</span>
                    <span className={styles.sliderVal} style={{ color }}>{val}</span>
                  </div>
                  <div className={styles.sliderTrack}>
                    <div
                      className={styles.sliderFill}
                      style={{ width: `${val}%`, background: color }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(weights[key])}
                      onChange={e => handleSlider(key, Number(e.target.value))}
                      className={styles.sliderInput}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.totalBar}>
            <span className={styles.totalLabel}>Total weight index</span>
            <span className={styles.totalVal}>
              {Math.round(
                Object.values(displayWeights).reduce((a, b) => a + b, 0)
              )}
              <span className={styles.totalMax}> / 500</span>
            </span>
          </div>
        </div>

        {/* Center: radar */}
        <div className={styles.radarCard}>
          <div className={styles.cardTitle}>Strategy Profile</div>
          <div className={styles.cardSub}>Orange = current · Blue dashed = balanced baseline</div>
          <div style={{ height: '280px', marginTop: 8 }}>
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>

        {/* Right: tradeoff metrics */}
        <div className={styles.tradeoffCard}>
          <div className={styles.cardTitle}>Projected Impact</div>
          <div className={styles.cardSub}>vs. Balanced baseline · Updates live as you adjust</div>
          <div className={styles.tradeoffGrid}>
            {tradeoffs.map(t => (
              <div key={t.label} className={styles.tradeoffItem}>
                <div className={styles.tradeoffValue} style={{ color: t.color }}>{t.value}</div>
                <div className={styles.tradeoffLabel}>{t.label}</div>
                <div
                  className={styles.tradeoffDelta}
                  style={{ color: t.up ? 'var(--ok)' : 'var(--err)' }}
                >
                  {t.up ? '▲' : '▼'} {t.delta}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar comparison chart */}
      <div className={styles.barCard}>
        <div className={styles.cardTitle}>Key Metric Comparison — Current Strategy vs. Balanced</div>
        <div className={styles.cardSub}>Lower is better for Cycle Days; higher is better for all others.</div>
        <div style={{ height: '200px', marginTop: 12 }}>
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      {/* Tradeoff narrative */}
      <div className={styles.narrativeRow}>
        <div className={styles.narrativeCard}>
          <div className={styles.narrativeTitle}>What This Strategy Optimises For</div>
          <div className={styles.narrativeText}>
            {activePreset === 'roi' && 'ROI Focus maximises return on every dollar invested. The engine prioritises bulk purchase consolidation, early payment discounts, and high-margin SKUs. Stock availability may dip slightly in lower-demand branches as the system accepts calculated shortfall risk to reduce excess carrying cost.'}
            {activePreset === 'cashflow' && 'Cash Flow mode aggressively minimises working capital. Orders are timed to arrive just before stockout, reducing holding days from a baseline of ~21 to as few as 10. This frees cash for other purposes but requires precise demand forecasting — best used when forecast accuracy exceeds 90%.'}
            {activePreset === 'stock' && 'Stock Optimisation eliminates stockouts at the cost of higher inventory. The engine pre-positions buffer stock, triggers earlier reorder points, and accepts higher carrying costs. Best for high-demand periods or branches in regions with unreliable supply lead times.'}
            {activePreset === 'balanced' && 'Balanced mode distributes weight equally across all objectives. This is the recommended default for steady-state operations. No single KPI is sacrificed — the engine trades small gains in each objective to maintain overall network resilience.'}
            {activePreset === 'custom' && 'Custom strategy — the engine will optimise according to the exact weights you have set. Monitor the Projected Impact panel to understand the tradeoffs. Submit to activate on the next replenishment cycle.'}
          </div>
        </div>

        <div className={styles.narrativeCard}>
          <div className={styles.narrativeTitle}>Tradeoff Summary</div>
          <div className={styles.tradeoffList}>
            <div className={styles.tradeoffRow}>
              <span className={styles.tradeoffRowLabel}>Higher ROI weight →</span>
              <span className={styles.tradeoffRowEffect}>Improves margin, reduces excess stock, may increase stockout risk in tail branches</span>
            </div>
            <div className={styles.tradeoffRow}>
              <span className={styles.tradeoffRowLabel}>Higher Cash Flow weight →</span>
              <span className={styles.tradeoffRowEffect}>Shortens holding days, releases working capital, increases re-order frequency</span>
            </div>
            <div className={styles.tradeoffRow}>
              <span className={styles.tradeoffRowLabel}>Higher Stock weight →</span>
              <span className={styles.tradeoffRowEffect}>Maximises availability, increases inventory investment, improves service level</span>
            </div>
            <div className={styles.tradeoffRow}>
              <span className={styles.tradeoffRowLabel}>Higher Waste weight →</span>
              <span className={styles.tradeoffRowEffect}>Tighter expiry management, more inter-branch redistribution, reduces write-offs</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
