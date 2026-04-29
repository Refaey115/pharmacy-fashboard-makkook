import { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import type { ChartData } from 'chart.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { MONTHLY_SERIES } from '../../data/timeseries';
import SpeakerHint from '../../components/SpeakerHint';
import ShowMath from '../../components/ShowMath';
import {
  SALES_CYCLE_AFTER, SALES_CYCLE_BEFORE,
  GROSS_MARGIN_AFTER, GROSS_MARGIN_BEFORE,
  STOCK_AVAIL_AFTER, STOCK_AVAIL_BEFORE,
  HOLDING_DAYS_AFTER, HOLDING_DAYS_BEFORE,
  WORKING_CAPITAL_RELEASED_USD, ANNUAL_VALUE_USD, ROI,
  AI_CONFIDENCE,
  VALUE_DECOMPOSITION,
} from '../../data/canonicalNumbers';
import { formatUSD } from '../../utils/formatCurrency';
import styles from './MarginEnginePanel.module.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend);

// Gradient plugin — runs before each draw to inject canvas gradients
const gradientPlugin = {
  id: 'areaGradient',
  beforeDatasetsDraw(chart: ChartJS) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;
    const { top, bottom } = chartArea;
    (chart.data.datasets as unknown as Array<Record<string, unknown>>).forEach(ds => {
      if (!ds['_g0'] || !ds['_g1']) return;
      const g = ctx.createLinearGradient(0, top, 0, bottom);
      g.addColorStop(0,   ds['_g0'] as string);
      g.addColorStop(0.5, ds['_g0'] as string);
      g.addColorStop(1,   ds['_g1'] as string);
      ds['backgroundColor'] = g;
    });
  },
};
ChartJS.register(gradientPlugin);

interface ChainNode {
  label: string;
  value: string;
  delay: number;
  highlight?: boolean;
}

const CHAIN_NODES: ChainNode[] = [
  { label: 'Faster Replenishment', value: 'Every 4 minutes', delay: 0 },
  { label: 'Sales Cycle', value: `${SALES_CYCLE_AFTER} days`, delay: 200 },
  { label: 'Inventory Turnover', value: '14x / yr', delay: 400 },
  { label: 'Working Capital', value: `${formatUSD(WORKING_CAPITAL_RELEASED_USD, { compact: true })} released`, delay: 600 },
  { label: 'Carrying Cost', value: '-61%', delay: 800 },
  { label: 'Gross Margin', value: `+${GROSS_MARGIN_AFTER}%`, delay: 1000, highlight: true },
];

const BEFORE_AFTER = [
  { label: 'Sales Cycle',         before: `${SALES_CYCLE_BEFORE} days`,   after: `${SALES_CYCLE_AFTER} days` },
  { label: 'Gross Margin',        before: `${GROSS_MARGIN_BEFORE}%`,       after: `${GROSS_MARGIN_AFTER}%` },
  { label: 'Stock Availability',  before: `${STOCK_AVAIL_BEFORE}%`,        after: `${STOCK_AVAIL_AFTER}%` },
  { label: 'Holding Days',        before: `${HOLDING_DAYS_BEFORE} days`,   after: `${HOLDING_DAYS_AFTER} days` },
  { label: 'Working Capital',     before: '$51M tied up',                  after: `${formatUSD(WORKING_CAPITAL_RELEASED_USD, { compact: true })} released` },
  { label: 'AI Decision Conf.',   before: '78.2%',                         after: `${AI_CONFIDENCE}%` },
];

const ANNUAL_VALUE_LABELS = VALUE_DECOMPOSITION.map(v => v.label);
const ANNUAL_VALUE_DATA   = VALUE_DECOMPOSITION.map(v => v.valueM);

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
        borderColor: '#f87171',
        backgroundColor: 'rgba(248,113,113,0.18)',
        yAxisID: 'y',
        tension: 0.48,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 7,
        borderWidth: 2.5,
        pointBackgroundColor: '#f87171',
        pointBorderColor: 'rgba(248,113,113,0.3)',
        pointBorderWidth: 2,
        _g0: 'rgba(248,113,113,0.35)',
        _g1: 'rgba(248,113,113,0.02)',
      },
      {
        label: 'Gross Margin (%)',
        data: marginPct,
        borderColor: '#4ade80',
        backgroundColor: 'rgba(74,222,128,0.18)',
        yAxisID: 'y2',
        tension: 0.48,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 7,
        borderWidth: 2.5,
        pointBackgroundColor: '#4ade80',
        pointBorderColor: 'rgba(74,222,128,0.3)',
        pointBorderWidth: 2,
        _g0: 'rgba(74,222,128,0.35)',
        _g1: 'rgba(74,222,128,0.02)',
      },
    ],
  } as unknown as ChartData<'line'>;

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    animation: { duration: 800, easing: 'easeInOutQuart' as const },
    plugins: {
      legend: {
        labels: {
          color: '#9B9B9B',
          font: { size: 11 as const },
          usePointStyle: true,
          pointStyleWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(18,18,18,0.95)',
        titleColor: '#EFEFEF',
        bodyColor: '#C6C6C6',
        borderColor: 'rgba(225,84,29,0.3)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        ticks: { color: '#9B9B9B', font: { size: 10 as const } },
        grid: { color: 'rgba(255,255,255,0.04)' },
        border: { display: false },
      },
      y: {
        type: 'linear' as const,
        position: 'left' as const,
        min: 3.5,
        max: 7,
        title: { display: true, text: 'Sales Cycle (days)', color: '#9B9B9B', font: { size: 10 as const } },
        ticks: { color: '#9B9B9B', font: { size: 10 as const } },
        grid: { color: 'rgba(255,255,255,0.04)' },
        border: { display: false },
      },
      y2: {
        type: 'linear' as const,
        position: 'right' as const,
        min: 25,
        max: 42,
        title: { display: true, text: 'Gross Margin (%)', color: '#9B9B9B', font: { size: 10 as const } },
        ticks: { color: '#9B9B9B', font: { size: 10 as const } },
        grid: { drawOnChartArea: false },
        border: { display: false },
      },
    },
  } as const;

  const annualData = {
    labels: ANNUAL_VALUE_LABELS,
    datasets: [
      {
        label: 'Value ($M)',
        data: ANNUAL_VALUE_DATA,
        backgroundColor: [
          'rgba(225,84,29,0.9)',
          'rgba(74,222,128,0.8)',
          'rgba(96,165,250,0.8)',
          'rgba(167,139,250,0.8)',
          'rgba(245,158,11,0.8)',
        ],
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: [
          'rgba(225,84,29,1)',
          'rgba(74,222,128,1)',
          'rgba(96,165,250,1)',
          'rgba(167,139,250,1)',
          'rgba(245,158,11,1)',
        ],
      },
    ],
  };

  const annualOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1000, easing: 'easeInOutQuart' as const },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(18,18,18,0.95)',
        titleColor: '#EFEFEF',
        bodyColor: '#C6C6C6',
        borderColor: 'rgba(225,84,29,0.3)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: { parsed: { x: number | null } }) => ` $${ctx.parsed.x ?? 0}M`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#9B9B9B', font: { size: 10 as const } },
        grid: { color: 'rgba(255,255,255,0.04)' },
        border: { display: false },
        title: { display: true, text: 'USD ($M)', color: '#9B9B9B', font: { size: 10 as const } },
      },
      y: {
        ticks: { color: '#9B9B9B', font: { size: 10 as const } },
        grid: { color: 'rgba(255,255,255,0.04)' },
        border: { display: false },
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
          <div className={styles.chartTitle}>
            Annual Value Generated —{' '}
            <ShowMath
              formula="Revenue Uplift + Working Capital + Waste + Bulk Discount + Distribution"
              inputs={[
                { label: 'Revenue uplift', value: '$3.5M/yr' },
                { label: 'Working capital (one-time)', value: '$2.6M' },
                { label: 'Waste reduction', value: '$1.0M/yr' },
                { label: 'Bulk discount capture', value: '$0.84M/yr' },
                { label: 'Distribution efficiency', value: '$0.21M/yr' },
              ]}
              output="$8.2M Year 1 ($5.55M ongoing)"
              source="Pharmacy retail benchmarks (Retalon, Netstock 2024-25)"
            >
              {formatUSD(ANNUAL_VALUE_USD, { compact: true })} Year 1
            </ShowMath>
          </div>
          <div style={{ height: '240px' }}>
            <Bar data={annualData} options={annualOptions} />
          </div>
        </div>
      </div>

      {/* Summary strip */}
      <div className={styles.summaryStrip}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Sales Cycle Compression</span>
          <span className={`${styles.mono} ${styles.summaryValue}`}>{SALES_CYCLE_BEFORE}d → {SALES_CYCLE_AFTER}d</span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Margin Expansion</span>
          <span className={`${styles.mono} ${styles.summaryValue}`}>{GROSS_MARGIN_BEFORE}% → {GROSS_MARGIN_AFTER}%</span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Working Capital Released</span>
          <span className={`${styles.mono} ${styles.summaryValue}`}>{formatUSD(WORKING_CAPITAL_RELEASED_USD, { compact: true })}</span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Annual Value Generated</span>
          <span className={`${styles.mono} ${styles.summaryValue}`}>{formatUSD(ANNUAL_VALUE_USD, { compact: true })} Year 1</span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Platform ROI</span>
          <span className={`${styles.mono} ${styles.summaryValue}`}>{ROI}x</span>
        </div>
      </div>
    </div>
  );
}
