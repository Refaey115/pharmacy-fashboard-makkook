import { useState, useCallback } from 'react';
import {
  Chart as ChartJS, RadialLinearScale, PointElement,
  LineElement, Filler, Tooltip, Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import styles from './SimpleControlCenter.module.css';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface Weight {
  key:   string;
  label: string;
  desc:  string;
  value: number;
  color: string;
}

const DEFAULT_WEIGHTS: Weight[] = [
  { key: 'cashFlow',    label: 'Cash Flow Optimisation', desc: 'Prioritise payment timing to preserve working capital', value: 80, color: '#E1541D' },
  { key: 'serviceLevel',label: 'Service Level',          desc: 'Avoid stockouts even if it means higher holding cost',  value: 75, color: '#F59E0B' },
  { key: 'turnover',    label: 'Inventory Turnover',     desc: 'Reduce dead stock; push faster-moving SKUs',           value: 65, color: '#4ade80' },
  { key: 'supplierRisk',label: 'Supplier Risk Buffer',   desc: 'Hold extra safety stock for long-lead suppliers',      value: 55, color: '#60a5fa' },
  { key: 'costMin',     label: 'Cost Minimisation',      desc: 'Favour bulk orders and better payment terms',          value: 70, color: '#a78bfa' },
];

function impact(weights: Weight[]) {
  const get = (k: string) => weights.find(w => w.key === k)?.value ?? 50;
  return {
    forecastAccuracy: Math.round(60 + get('serviceLevel') * 0.3 + get('turnover') * 0.1),
    cashAtRisk:       Math.round(100 - get('cashFlow') * 0.7 - get('supplierRisk') * 0.1),
    stockoutRisk:     Math.round(100 - get('serviceLevel') * 0.6 - get('supplierRisk') * 0.3),
    overstockRisk:    Math.round(100 - get('turnover') * 0.5 - get('costMin') * 0.3),
    supplierScore:    Math.round(40 + get('supplierRisk') * 0.4 + get('costMin') * 0.2),
    workingCapital:   Math.round(40 + get('cashFlow') * 0.5 + get('costMin') * 0.1),
  };
}

export default function SimpleControlCenter() {
  const [weights,  setWeights]  = useState<Weight[]>(DEFAULT_WEIGHTS);
  const [applied,  setApplied]  = useState(false);
  const [snapshot, setSnapshot] = useState<Weight[] | null>(null);

  const setVal = useCallback((key: string, v: number) => {
    setApplied(false);
    setWeights(ws => ws.map(w => w.key === key ? { ...w, value: v } : w));
  }, []);

  const handleApply = () => {
    setSnapshot([...weights]);
    setApplied(true);
  };

  const handleReset = () => {
    setWeights(DEFAULT_WEIGHTS);
    setApplied(false);
    setSnapshot(null);
  };

  const imp     = impact(weights);
  const prevImp = snapshot ? impact(snapshot) : null;

  const radarData = {
    labels: ['Cash Flow', 'Service Level', 'Inv. Turnover', 'Supplier Risk', 'Cost Min'],
    datasets: [
      {
        label:           'Current',
        data:            weights.map(w => w.value),
        backgroundColor: 'rgba(225,84,29,.2)',
        borderColor:     '#E1541D',
        borderWidth:     2,
        pointRadius:     3,
      },
      ...(snapshot ? [{
        label:           'Applied',
        data:            snapshot.map(w => w.value),
        backgroundColor: 'rgba(96,165,250,.1)',
        borderColor:     '#60a5fa',
        borderWidth:     1.5,
        borderDash:      [4, 3],
        pointRadius:     2,
      }] : []),
    ],
  };

  const radarOpts = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0, max: 100,
        ticks:     { display: false },
        grid:      { color: 'rgba(255,255,255,.08)' },
        pointLabels: { color: '#aaa', font: { size: 11 } },
        angleLines: { color: 'rgba(255,255,255,.06)' },
      },
    },
    plugins: {
      legend: {
        labels: { color: '#aaa', boxWidth: 12, font: { size: 11 } },
      },
    },
  } as const;

  const delta = (cur: number, prev: number | undefined) => {
    if (prev === undefined) return null;
    const d = cur - prev;
    if (d === 0) return null;
    return (
      <span className={d > 0 ? styles.deltaUp : styles.deltaDn}>
        {d > 0 ? '▲' : '▼'} {Math.abs(d)}
      </span>
    );
  };

  return (
    <div className={styles.wrap}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Optimise Strategy</h2>
          <p className={styles.sub}>
            Tune AI weights · Changes apply to Demand Forecast, Replenishment Plan and Purchase Orders
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.resetBtn} onClick={handleReset}>Reset Defaults</button>
          <button
            className={`${styles.applyBtn} ${applied ? styles.applyDone : ''}`}
            onClick={handleApply}
          >
            {applied ? '✓ Applied' : 'Apply'}
          </button>
        </div>
      </div>

      {applied && (
        <div className={styles.appliedBanner}>
          Strategy applied — AI has updated Demand Forecast, Replenishment Plan and Purchase Orders.
        </div>
      )}

      <div className={styles.twoCol}>
        {/* Sliders */}
        <div className={styles.sliderBlock}>
          <div className={styles.blockTitle}>Priority Weights</div>
          {weights.map(w => (
            <div
              key={w.key}
              className={styles.sliderRow}
              style={{ '--row-color': w.color } as React.CSSProperties}
            >
              <div className={styles.sliderMeta}>
                <span className={styles.sliderLabel}>{w.label}</span>
                <span className={styles.sliderVal}>{w.value}</span>
              </div>
              <div className={styles.sliderDesc}>{w.desc}</div>
              <input
                type="range" min={0} max={100} value={w.value}
                className={styles.range}
                style={{ '--thumb-color': w.color } as React.CSSProperties}
                onChange={e => setVal(w.key, Number(e.target.value))}
              />
            </div>
          ))}
        </div>

        {/* Radar chart */}
        <div className={styles.radarBlock}>
          <div className={styles.blockTitle}>Strategy Profile</div>
          <div className={styles.radarWrap}>
            <Radar data={radarData} options={radarOpts} />
          </div>
        </div>
      </div>

      {/* Impact grid */}
      <div className={styles.impactGrid}>
        <div className={styles.blockTitle} style={{ gridColumn: '1/-1' }}>
          Projected Impact
          {!applied && <span className={styles.impactNote}>&nbsp;— press Apply to lock in</span>}
        </div>

        {([
          { key: 'forecastAccuracy', label: 'Forecast Accuracy', unit: '%',  good: 'high' },
          { key: 'cashAtRisk',       label: 'Cash at Risk',       unit: '%',  good: 'low'  },
          { key: 'stockoutRisk',     label: 'Stockout Risk',      unit: '%',  good: 'low'  },
          { key: 'overstockRisk',    label: 'Overstock Risk',     unit: '%',  good: 'low'  },
          { key: 'supplierScore',    label: 'Supplier Score',     unit: '/100', good: 'high' },
          { key: 'workingCapital',   label: 'Working Capital',    unit: '/100', good: 'high' },
        ] as { key: keyof typeof imp; label: string; unit: string; good: 'high' | 'low' }[]).map(m => {
          const cur  = imp[m.key];
          const prev = prevImp ? prevImp[m.key] : undefined;
          const ok   = m.good === 'high' ? cur >= 70 : cur <= 30;
          const warn = m.good === 'high' ? cur >= 50 : cur <= 50;
          return (
            <div key={m.key}
              className={`${styles.impactCard} ${ok ? styles.impOk : warn ? styles.impWarn : styles.impBad}`}>
              <span className={styles.impLabel}>{m.label}</span>
              <div className={styles.impValRow}>
                <span className={styles.impVal}>{cur}{m.unit}</span>
                {delta(cur, prev)}
              </div>
              <div className={styles.impBar}>
                <div
                  className={`${styles.impBarFill} ${ok ? styles.barOk : warn ? styles.barWarn : styles.barBad}`}
                  style={{ width: `${Math.min(100, cur)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
