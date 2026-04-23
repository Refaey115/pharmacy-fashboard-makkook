import { useMemo } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Filler, Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import KpiRow from '../../components/KpiRow';
import {
  MONTHLY_REVENUE, ACCURACY_TREND,
  CALENDAR_EVENTS, SKU_TABLE, seedDecisions,
} from '../../data/mockData';
import styles from './KpiPanel.module.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const miniOpts = (min: number, max: number, suffix = '') => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 600 },
  plugins: { legend: { display: false }, tooltip: {
    backgroundColor: '#1e1e1e',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    titleColor: '#fff',
    bodyColor: 'rgba(255,255,255,0.6)',
    callbacks: { label: (c: { parsed: { y: number } }) => ` ${c.parsed.y}${suffix}` },
  }},
  scales: {
    x: { ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 9 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
    y: { min, max, ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 9 }, callback: (v: string | number) => `${v}${suffix}` }, grid: { color: 'rgba(255,255,255,0.04)' } },
  },
});

const MONTH_COLOR = '#E1541D';
const ACC_COLOR   = '#4ade80';

export default function KpiPanel() {
  const recentDecisions = useMemo(() => seedDecisions().slice(0, 5), []);

  const revenueData = {
    labels: MONTHLY_REVENUE.labels,
    datasets: [{
      data: MONTHLY_REVENUE.values,
      borderColor: MONTH_COLOR,
      backgroundColor: 'rgba(225,84,29,0.08)',
      fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2,
    }],
  };

  const accuracyData = {
    labels: ACCURACY_TREND.labels,
    datasets: [{
      data: ACCURACY_TREND.values,
      borderColor: ACC_COLOR,
      backgroundColor: 'rgba(74,222,128,0.07)',
      fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2,
    }],
  };

  const topSkus = [...SKU_TABLE].sort((a, b) => b.demandScore - a.demandScore).slice(0, 6);

  return (
    <div className={styles.page}>
      {/* Hero banner */}
      <div className="hero-banner">
        <h2>Your network. Fully optimised.</h2>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-val">EGP 26.8M</span>
            <span className="hero-stat-label">Value Generated</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-val">1,820</span>
            <span className="hero-stat-label">Replenishment Cycles</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-val">184</span>
            <span className="hero-stat-label">Stockouts Prevented</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-val">97.8%</span>
            <span className="hero-stat-label">Stock Availability</span>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className={styles.sectionLabel}>Key Performance Indicators</div>
      <KpiRow editable={false} />

      {/* Trend charts row */}
      <div className={styles.chartsRow}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <span className={styles.chartTitle}>Monthly Revenue</span>
            <span className={styles.chartSub}>EGP M · Jan – Dec</span>
          </div>
          <div className={styles.chartWrap}>
            <Line data={revenueData} options={miniOpts(50, 90, 'M') as never} />
          </div>
        </div>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <span className={styles.chartTitle}>AI Execution Accuracy</span>
            <span className={styles.chartSub}>% · Jan – Dec</span>
          </div>
          <div className={styles.chartWrap}>
            <Line data={accuracyData} options={miniOpts(86, 100, '%') as never} />
          </div>
        </div>
      </div>

      {/* Bottom 3-col briefing row */}
      <div className={styles.briefRow}>
        {/* Calendar */}
        <div className={styles.briefCard}>
          <div className={styles.briefTitle}>Seasonal Events</div>
          <div className={styles.eventList}>
            {CALENDAR_EVENTS.map((ev, i) => (
              <div key={i} className={styles.eventRow}>
                <span className={styles.eventDot} style={{ background: ev.color }} />
                <div className={styles.eventBody}>
                  <span className={styles.eventLabel}>{ev.label}</span>
                  <span className={styles.eventDate}>{ev.date}</span>
                </div>
                <span className={styles.eventNote}>{ev.note}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top SKUs */}
        <div className={styles.briefCard}>
          <div className={styles.briefTitle}>Top SKUs by Demand Score</div>
          <div className={styles.skuList}>
            {topSkus.map(sku => (
              <div key={sku.sku} className={styles.skuRow}>
                <div className={styles.skuLeft}>
                  <span className={styles.skuCode}>{sku.sku}</span>
                  <span className={styles.skuName}>{sku.name}</span>
                </div>
                <div className={styles.skuBarWrap}>
                  <div className={styles.skuBar}
                    style={{ width: `${sku.demandScore}%`, background: sku.demandScore >= 90 ? 'var(--ok)' : sku.demandScore >= 75 ? MONTH_COLOR : 'var(--warn)' }}
                  />
                </div>
                <span className={styles.skuScore}>{sku.demandScore}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className={styles.briefCard}>
          <div className={styles.briefTitle}>Recent AI Activity</div>
          <div className={styles.activityList}>
            {recentDecisions.map(d => (
              <div key={d.id} className={styles.activityRow}>
                <div className={styles.activityDot} />
                <div className={styles.activityBody}>
                  <span className={styles.activityTs}>{d.timestamp}</span>
                  <span className={styles.activityText}>{d.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
