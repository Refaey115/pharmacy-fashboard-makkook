import { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { MONTHLY_SERIES } from '../../data/timeseries';
import SpeakerHint from '../../components/SpeakerHint';
import styles from './MarginEnginePanel.module.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

interface ChainNode {
  label: string;
  value: string;
  delay: number;
  highlight?: boolean;
}

const CHAIN_NODES: ChainNode[] = [
  { label: 'Faster Replenishment', value: 'Every 4 seconds', delay: 0 },
  { label: 'Sales Cycle', value: '4.2 days', delay: 200 },
  { label: 'Inventory Turnover', value: '8.7x / yr', delay: 400 },
  { label: 'Working Capital', value: 'EGP 12.6M released', delay: 600 },
  { label: 'Carrying Cost', value: '-34%', delay: 800 },
  { label: 'Gross Margin', value: '+38.4%', delay: 1000, highlight: true },
];

const BEFORE_AFTER = [
  { label: 'Sales Cycle', before: '6.0 days', after: '4.2 days' },
  { label: 'Gross Margin', before: '28.1%', after: '38.4%' },
  { label: 'Stock Availability', before: '82.6%', after: '97.8%' },
  { label: 'Holding Days', before: '31 days', after: '12 days' },
  { label: 'Working Capital', before: 'EGP 4.2M', after: 'EGP 12.6M' },
  { label: 'AI Decision Accuracy', before: '88.4%', after: '97.8%' },
];

const ANNUAL_VALUE_LABELS = ['Revenue Uplift', 'Waste Reduction', 'Working Capital', 'Distribution', 'Stockout Prevention'];
const ANNUAL_VALUE_DATA = [18.4, 4.6, 6.7, 2.1, 7.6];

export default function MarginEnginePanel() {
  const [visibleNodes, setVisibleNodes] = useState<boolean[]>(CHAIN_NODES.map(() => false));

  useEffect(() => {
    CHAIN_NODES.forEach((node, i) => {
      setTimeout(() => {
        setVisibleNodes(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, node.delay + 300);
    });
  }, []);

  const labels = MONTHLY_SERIES.map(p => p.month);
  const cycleDays = MONTHLY_SERIES.map(p => p.salesCycleDays);
  const marginPct = MONTHLY_SERIES.map(p => p.grossMarginPct);

  const trendData = {
    labels,
    datasets: [
      {
        label: 'Sales Cycle (days)',
        data: cycleDays,
        borderColor: 'var(--err)',
        backgroundColor: 'rgba(248,113,113,0.08)',
        yAxisID: 'y',
        tension: 0.4,
        pointRadius: 3,
      },
      {
        label: 'Gross Margin (%)',
        data: marginPct,
        borderColor: 'var(--ok)',
        backgroundColor: 'rgba(74,222,128,0.08)',
        yAxisID: 'y2',
        tension: 0.4,
        pointRadius: 3,
      },
    ],
  };

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { labels: { color: '#9B9B9B', font: { size: 11 as const } } },
      tooltip: { backgroundColor: '#1a1a1a', titleColor: '#EFEFEF', bodyColor: '#C6C6C6' },
    },
    scales: {
      x: { ticks: { color: '#9B9B9B', font: { size: 10 as const } }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: {
        type: 'linear' as const,
        position: 'left' as const,
        min: 3.5,
        max: 7,
        title: { display: true, text: 'Sales Cycle (days)', color: '#9B9B9B', font: { size: 10 as const } },
        ticks: { color: '#9B9B9B', font: { size: 10 as const } },
        grid: { color: 'rgba(255,255,255,0.04)' },
      },
      y2: {
        type: 'linear' as const,
        position: 'right' as const,
        min: 25,
        max: 42,
        title: { display: true, text: 'Gross Margin (%)', color: '#9B9B9B', font: { size: 10 as const } },
        ticks: { color: '#9B9B9B', font: { size: 10 as const } },
        grid: { drawOnChartArea: false },
      },
    },
  } as const;

  const annualData = {
    labels: ANNUAL_VALUE_LABELS,
    datasets: [
      {
        label: 'Value (EGP M)',
        data: ANNUAL_VALUE_DATA,
        backgroundColor: ['rgba(225,84,29,0.85)', 'rgba(74,222,128,0.7)', 'rgba(96,165,250,0.7)', 'rgba(167,139,250,0.7)', 'rgba(245,158,11,0.7)'],
        borderRadius: 4,
      },
    ],
  };

  const annualOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#1a1a1a', titleColor: '#EFEFEF', bodyColor: '#C6C6C6' },
    },
    scales: {
      x: {
        ticks: { color: '#9B9B9B', font: { size: 10 as const } },
        grid: { color: 'rgba(255,255,255,0.04)' },
        title: { display: true, text: 'EGP M', color: '#9B9B9B', font: { size: 10 as const } },
      },
      y: {
        ticks: { color: '#9B9B9B', font: { size: 10 as const } },
        grid: { color: 'rgba(255,255,255,0.04)' },
      },
    },
  } as const;

  return (
    <div className={styles.panel}>
      {/* Causal chain */}
      <SpeakerHint text="This is the causal engine. Each node is a measurable financial consequence. Sales cycle compression is not just operational — it drives every downstream number you see.">
        <div className={styles.chainCard}>
          <div className={styles.chainTitle}>Margin Causal Chain — How DIOS Generates Value</div>
          <div className={styles.chainNodes}>
            {CHAIN_NODES.map((node, i) => (
              <div key={node.label} className={styles.chainNodeWrap}>
                <div
                  className={`${styles.chainNode} ${node.highlight ? styles.chainNodeHighlight : ''} ${visibleNodes[i] ? styles.visible : ''}`}
                >
                  <div className={styles.chainNodeLabel}>{node.label}</div>
                  <div className={`${styles.chainNodeValue} ${styles.mono}`}>{node.value}</div>
                </div>
                {i < CHAIN_NODES.length - 1 && (
                  <div className={`${styles.chainArrow} ${visibleNodes[i] ? styles.arrowVisible : ''}`}>
                    &rarr;
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </SpeakerHint>

      {/* Before/After grid */}
      <div className={styles.baGrid}>
        <div className={styles.baCard} style={{ borderLeft: '3px solid var(--err)' }}>
          <div className={styles.baTitle} style={{ color: 'var(--err)' }}>Before DIOS — Baseline</div>
          {BEFORE_AFTER.map(row => (
            <div key={row.label} className={styles.baRow}>
              <span className={styles.baLabel}>{row.label}</span>
              <span className={`${styles.mono} ${styles.baValue}`} style={{ color: 'var(--err)' }}>{row.before}</span>
            </div>
          ))}
        </div>
        <div className={styles.baCard} style={{ borderLeft: '3px solid var(--ok)' }}>
          <div className={styles.baTitle} style={{ color: 'var(--ok)' }}>After DIOS — Current</div>
          {BEFORE_AFTER.map(row => (
            <div key={row.label} className={styles.baRow}>
              <span className={styles.baLabel}>{row.label}</span>
              <span className={`${styles.mono} ${styles.baValue}`} style={{ color: 'var(--ok)' }}>{row.after}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className={styles.chartsRow}>
        {/* Trend chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>Sales Cycle vs Gross Margin — 12 Month Trend</div>
          <div style={{ height: '240px' }}>
            <Line data={trendData} options={trendOptions} />
          </div>
        </div>

        {/* Annual value chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>Annual Value Generated — EGP 39.4M</div>
          <div style={{ height: '240px' }}>
            <Bar data={annualData} options={annualOptions} />
          </div>
        </div>
      </div>

      {/* Summary strip */}
      <div className={styles.summaryStrip}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Sales Cycle Compression</span>
          <span className={`${styles.mono} ${styles.summaryValue}`}>6.0d → 4.2d</span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Margin Expansion</span>
          <span className={`${styles.mono} ${styles.summaryValue}`}>28.1% → 38.4%</span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Working Capital Released</span>
          <span className={`${styles.mono} ${styles.summaryValue}`}>EGP 12.6M</span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Annual Value Generated</span>
          <span className={`${styles.mono} ${styles.summaryValue}`}>EGP 39.4M</span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Platform ROI</span>
          <span className={`${styles.mono} ${styles.summaryValue}`}>7.3x</span>
        </div>
      </div>
    </div>
  );
}
