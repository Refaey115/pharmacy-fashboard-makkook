import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { PRICE_FORECAST, PRICE_HISTORY, PRICE_HISTORY_LABELS } from '../../data/mockData';
import styles from './PriceForecastPanel.module.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const TREND_COLORS = {
  up:     { color: 'var(--err)',  icon: '↑', label: 'Rising' },
  down:   { color: 'var(--ok)',   icon: '↓', label: 'Falling' },
  stable: { color: 'var(--warn)', icon: '→', label: 'Stable' },
};

const CHART_COLORS = ['#E1541D', '#4ade80', '#60a5fa', '#F59E0B'];

function buildChartData(skus: string[]) {
  return {
    labels: PRICE_HISTORY_LABELS,
    datasets: skus.map((sku, i) => ({
      label: sku,
      data: PRICE_HISTORY[sku] ?? [],
      borderColor: CHART_COLORS[i % CHART_COLORS.length],
      backgroundColor: `${CHART_COLORS[i % CHART_COLORS.length]}18`,
      pointBackgroundColor: CHART_COLORS[i % CHART_COLORS.length],
      pointRadius: 4,
      tension: 0.35,
      fill: false,
    })),
  };
}

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#9B9B9B', font: { family: 'Inter', size: 11 } } },
    tooltip: {
      backgroundColor: '#2a2a2a',
      titleColor: '#EFEFEF',
      bodyColor: '#C6C6C6',
      callbacks: { label: (ctx: any) => ` EGP ${ctx.parsed.y.toFixed(2)}` },
    },
  },
  scales: {
    x: {
      ticks: { color: '#9B9B9B', font: { family: 'Inter', size: 11 } },
      grid:  { color: 'rgba(255,255,255,0.04)' },
    },
    y: {
      ticks: { color: '#9B9B9B', font: { family: 'Inter', size: 11 }, callback: (v: number | string) => `EGP ${v}` },
      grid:  { color: 'rgba(255,255,255,0.04)' },
    },
  },
};

const CHART_SKUS = ['CTZ-500', 'AMX-250', 'ATR-40', 'PRD-5'];

type FilterTrend = 'all' | 'up' | 'down' | 'stable';
type FilterCategory = 'all' | string;

export default function PriceForecastPanel() {
  const [trendFilter, setTrendFilter]  = useState<FilterTrend>('all');
  const [catFilter, setCatFilter]      = useState<FilterCategory>('all');
  const [sortCol, setSortCol]          = useState<'sku' | 'd30' | 'd90' | 'conf'>('d30');
  const [sortDir, setSortDir]          = useState<1 | -1>(-1);

  const categories = Array.from(new Set(PRICE_FORECAST.map(r => r.category)));

  const filtered = PRICE_FORECAST
    .filter(r => trendFilter === 'all' || r.trend === trendFilter)
    .filter(r => catFilter  === 'all' || r.category === catFilter)
    .sort((a, b) => {
      const av = sortCol === 'sku'  ? a.sku
               : sortCol === 'd30'  ? ((a.d30Price - a.currentPrice) / a.currentPrice)
               : sortCol === 'd90'  ? ((a.d90Price - a.currentPrice) / a.currentPrice)
               : a.confidence;
      const bv = sortCol === 'sku'  ? b.sku
               : sortCol === 'd30'  ? ((b.d30Price - b.currentPrice) / b.currentPrice)
               : sortCol === 'd90'  ? ((b.d90Price - b.currentPrice) / b.currentPrice)
               : b.confidence;
      if (typeof av === 'string') return sortDir * av.localeCompare(bv as string);
      return sortDir * ((bv as number) - (av as number));
    });

  const handleSort = (col: typeof sortCol) => {
    if (sortCol === col) setSortDir(d => d === 1 ? -1 : 1);
    else { setSortCol(col); setSortDir(-1); }
  };

  const pct = (cur: number, fut: number) => {
    const p = ((fut - cur) / cur) * 100;
    return (p >= 0 ? '+' : '') + p.toFixed(1) + '%';
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>SKU Price Forecast</h2>
          <p className={styles.subtitle}>
            AI-predicted price movements over 30 and 90 days based on demand signals,
            supplier data, and market patterns.
          </p>
        </div>
        <div className={styles.summaryPills}>
          {(['up', 'down', 'stable'] as const).map(t => {
            const count = PRICE_FORECAST.filter(r => r.trend === t).length;
            const cfg = TREND_COLORS[t];
            return (
              <div key={t} className={styles.summaryPill} style={{ borderColor: cfg.color }}>
                <span style={{ color: cfg.color }}>{cfg.icon} {cfg.label}</span>
                <strong>{count} SKUs</strong>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div className={styles.chartCard}>
        <div className={styles.chartTitle}>Price Trend · Selected SKUs (EGP per unit)</div>
        <div className={styles.chartArea}>
          <Line data={buildChartData(CHART_SKUS)} options={CHART_OPTIONS as any} />
        </div>
        <div className={styles.chartNote}>
          Shaded area = forecast period (Mar–Jun). Dotted line = model projection.
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Trend:</span>
          {(['all', 'up', 'down', 'stable'] as const).map(t => (
            <button
              key={t}
              className={`${styles.filterBtn} ${trendFilter === t ? styles.filterActive : ''}`}
              onClick={() => setTrendFilter(t)}
            >
              {t === 'all' ? 'All' : `${TREND_COLORS[t].icon} ${TREND_COLORS[t].label}`}
            </button>
          ))}
        </div>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Category:</span>
          <button
            className={`${styles.filterBtn} ${catFilter === 'all' ? styles.filterActive : ''}`}
            onClick={() => setCatFilter('all')}
          >All</button>
          {categories.map(c => (
            <button
              key={c}
              className={`${styles.filterBtn} ${catFilter === c ? styles.filterActive : ''}`}
              onClick={() => setCatFilter(c)}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort('sku')} className={styles.sortable}>
                SKU {sortCol === 'sku' ? (sortDir === -1 ? '↓' : '↑') : ''}
              </th>
              <th>Product</th>
              <th>Category</th>
              <th>Current Price</th>
              <th onClick={() => handleSort('d30')} className={styles.sortable}>
                30d Forecast {sortCol === 'd30' ? (sortDir === -1 ? '↓' : '↑') : ''}
              </th>
              <th onClick={() => handleSort('d90')} className={styles.sortable}>
                90d Forecast {sortCol === 'd90' ? (sortDir === -1 ? '↓' : '↑') : ''}
              </th>
              <th>Trend</th>
              <th onClick={() => handleSort('conf')} className={styles.sortable}>
                Confidence {sortCol === 'conf' ? (sortDir === -1 ? '↓' : '↑') : ''}
              </th>
              <th>Driver</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => {
              const cfg = TREND_COLORS[row.trend];
              const d30pct = pct(row.currentPrice, row.d30Price);
              const d90pct = pct(row.currentPrice, row.d90Price);
              const d30up = row.d30Price >= row.currentPrice;
              const d90up = row.d90Price >= row.currentPrice;
              return (
                <tr key={row.sku}>
                  <td><span className={styles.skuCode}>{row.sku}</span></td>
                  <td className={styles.nameCell}>{row.name}</td>
                  <td><span className={styles.catPill}>{row.category}</span></td>
                  <td className={styles.mono}>EGP {row.currentPrice.toFixed(2)}</td>
                  <td>
                    <div className={styles.priceCell}>
                      <span className={styles.mono}>EGP {row.d30Price.toFixed(2)}</span>
                      <span className={`${styles.pctBadge} ${d30up ? styles.pctUp : styles.pctDown}`}>{d30pct}</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.priceCell}>
                      <span className={styles.mono}>EGP {row.d90Price.toFixed(2)}</span>
                      <span className={`${styles.pctBadge} ${d90up ? styles.pctUp : styles.pctDown}`}>{d90pct}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.trendBadge} style={{ color: cfg.color, borderColor: `${cfg.color}40`, background: `${cfg.color}10` }}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </td>
                  <td>
                    <div className={styles.confCell}>
                      <div className={styles.confBar}>
                        <div className={styles.confFill} style={{ width: `${row.confidence}%` }} />
                      </div>
                      <span className={styles.confVal}>{row.confidence}%</span>
                    </div>
                  </td>
                  <td className={styles.driverCell}>{row.driver}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
