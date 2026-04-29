import { useState, useMemo } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, BarElement, Filler, Tooltip, Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { SKUS } from '../../data/skus';
import {
  FORECAST_REGIONS, forecastDemand, buildDispatchLines, weekLabels,
} from '../../data/weeklyForecast';
import type { DispatchLine } from '../../data/weeklyForecast';
import styles from './RegionalForecastSection.module.css';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Filler, Tooltip, Legend,
);

const PRIORITY_COLOR: Record<DispatchLine['priority'], string> = {
  ok:       'var(--ok)',
  monitor:  '#f59e0b',
  high:     'var(--accent)',
  critical: 'var(--err)',
};

const PRIORITY_LABEL: Record<DispatchLine['priority'], string> = {
  ok:       'Sufficient',
  monitor:  'Monitor',
  high:     'Order Soon',
  critical: 'Urgent',
};

// Top 10 SKUs by demand score for the selector
const TOP_SKUS = [...SKUS].sort((a, b) => b.demandScore - a.demandScore).slice(0, 10);

export default function RegionalForecastSection() {
  const [selectedSku, setSelectedSku] = useState(TOP_SKUS[0].code);
  const [activeRegions, setActiveRegions] = useState<Set<string>>(
    new Set(FORECAST_REGIONS.map(r => r.id))
  );

  const sku      = SKUS.find(s => s.code === selectedSku)!;
  const labels   = useMemo(() => weekLabels(), []);
  const dispatch = useMemo(() => buildDispatchLines(sku), [sku]);

  function toggleRegion(id: string) {
    setActiveRegions(prev => {
      const next = new Set(prev);
      if (next.has(id)) { if (next.size > 1) next.delete(id); }
      else next.add(id);
      return next;
    });
  }

  // Build chart datasets: one line per active region
  const chartData = useMemo(() => ({
    labels,
    datasets: FORECAST_REGIONS.filter(r => activeRegions.has(r.id)).map(region => {
      const data = Array.from({ length: 7 }, (_, d) =>
        forecastDemand(sku, region, d)
      );
      return {
        label:            region.name,
        data,
        borderColor:      region.color,
        backgroundColor:  region.color + '22',
        borderWidth:      2.5,
        fill:             false,
        tension:          0.42,
        pointRadius:      4,
        pointHoverRadius: 7,
        pointBackgroundColor: region.color,
        pointBorderColor: region.color + '44',
        pointBorderWidth: 2,
      };
    }),
  }), [sku, labels, activeRegions]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600, easing: 'easeInOutQuart' as const },
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        labels: {
          color: '#9B9B9B',
          font: { size: 11 as const },
          usePointStyle: true,
          pointStyleWidth: 10,
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
        callbacks: {
          label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) =>
            ` ${ctx.dataset.label}: ${(ctx.parsed.y ?? 0).toLocaleString()} units`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#9B9B9B', font: { size: 10 as const } },
        grid:  { color: 'rgba(255,255,255,0.04)' },
        border: { display: false },
      },
      y: {
        ticks: { color: '#9B9B9B', font: { size: 10 as const } },
        grid:  { color: 'rgba(255,255,255,0.04)' },
        border: { display: false },
        title: {
          display: true,
          text: 'Units / Day',
          color: '#9B9B9B',
          font: { size: 10 as const },
        },
      },
    },
  } as const;

  const totalWeekRequest = dispatch.reduce((s, d) => s + d.toRequest, 0);
  const criticalCount    = dispatch.filter(d => d.priority === 'critical').length;
  const highCount        = dispatch.filter(d => d.priority === 'high').length;

  return (
    <div className={styles.section}>
      {/* Section header */}
      <div className={styles.sectionHeader}>
        <div>
          <div className={styles.sectionTitle}>Weekly Demand Forecast — By Region</div>
          <div className={styles.sectionSub}>
            7-day demand projection per regional warehouse · dispatch recommendations from WH-Cairo-Central
          </div>
        </div>
        {(criticalCount > 0 || highCount > 0) && (
          <div className={styles.alertBadge}>
            {criticalCount > 0 && (
              <span className={styles.alertPill} style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', borderColor: 'rgba(248,113,113,0.3)' }}>
                {criticalCount} Urgent
              </span>
            )}
            {highCount > 0 && (
              <span className={styles.alertPill} style={{ background: 'rgba(225,84,29,0.12)', color: 'var(--accent)', borderColor: 'rgba(225,84,29,0.3)' }}>
                {highCount} Order Soon
              </span>
            )}
          </div>
        )}
      </div>

      {/* SKU selector */}
      <div className={styles.skuSelector}>
        <span className={styles.selectorLabel}>SKU</span>
        <div className={styles.skuPills}>
          {TOP_SKUS.map(s => (
            <button
              key={s.code}
              className={`${styles.skuPill} ${selectedSku === s.code ? styles.skuPillActive : ''}`}
              onClick={() => setSelectedSku(s.code)}
            >
              <span className={styles.skuCode}>{s.code}</span>
              <span className={styles.skuName}>{s.genericName}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected SKU info bar */}
      <div className={styles.skuInfoBar}>
        <div className={styles.skuInfoItem}>
          <span className={styles.skuInfoLabel}>Product</span>
          <span className={styles.skuInfoVal}>{sku.genericName}</span>
        </div>
        <div className={styles.skuInfoItem}>
          <span className={styles.skuInfoLabel}>Class</span>
          <span className={styles.skuInfoVal}>{sku.therapeuticClass}</span>
        </div>
        <div className={styles.skuInfoItem}>
          <span className={styles.skuInfoLabel}>Network Stock</span>
          <span className={`${styles.skuInfoVal} ${styles.mono}`}>{sku.networkStock.toLocaleString()} units</span>
        </div>
        <div className={styles.skuInfoItem}>
          <span className={styles.skuInfoLabel}>Days of Cover</span>
          <span className={`${styles.skuInfoVal} ${styles.mono}`}>{sku.daysOfCover}d</span>
        </div>
        <div className={styles.skuInfoItem}>
          <span className={styles.skuInfoLabel}>Total Week Request</span>
          <span className={`${styles.skuInfoVal} ${styles.mono}`} style={{ color: totalWeekRequest > 0 ? 'var(--accent)' : 'var(--ok)' }}>
            {totalWeekRequest > 0 ? `${totalWeekRequest.toLocaleString()} units` : 'All regions sufficient'}
          </span>
        </div>
      </div>

      <div className={styles.mainRow}>
        {/* Chart */}
        <div className={styles.chartCard}>
          {/* Region toggles */}
          <div className={styles.regionToggles}>
            {FORECAST_REGIONS.map(r => (
              <button
                key={r.id}
                className={`${styles.regionToggle} ${activeRegions.has(r.id) ? styles.regionActive : styles.regionInactive}`}
                style={activeRegions.has(r.id)
                  ? { borderColor: r.color, color: r.color, background: r.color + '15' }
                  : {}}
                onClick={() => toggleRegion(r.id)}
              >
                <span
                  className={styles.regionDot}
                  style={{ background: activeRegions.has(r.id) ? r.color : 'var(--text-3)' }}
                />
                {r.name}
              </button>
            ))}
          </div>
          <div style={{ height: '260px', padding: '0 4px 4px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
          <div className={styles.chartNote}>
            Demand peaks Tue–Thu · Drops Friday · Recovers Saturday. Seeded deterministic model based on network velocity.
          </div>
        </div>

        {/* Dispatch table */}
        <div className={styles.dispatchCard}>
          <div className={styles.dispatchTitle}>DC Dispatch Schedule</div>
          <div className={styles.dispatchSub}>Units WH-Cairo-Central should prepare</div>
          <div className={styles.dispatchList}>
            {dispatch.map(line => (
              <div key={line.region.id} className={styles.dispatchRow}>
                <div className={styles.dispatchRegion}>
                  <span
                    className={styles.dispatchDot}
                    style={{ background: line.region.color }}
                  />
                  <div>
                    <div className={styles.dispatchRegionName}>{line.region.name}</div>
                    <div className={styles.dispatchWh}>{line.region.wh}</div>
                  </div>
                </div>

                <div className={styles.dispatchMetrics}>
                  <div className={styles.dispatchMetric}>
                    <span className={styles.dispatchMetricVal}>{line.daysRemaining}d</span>
                    <span className={styles.dispatchMetricLbl}>coverage</span>
                  </div>
                  <div className={styles.dispatchMetric}>
                    <span className={`${styles.dispatchMetricVal} ${styles.mono}`}
                      style={{ color: line.toRequest > 0 ? 'var(--accent)' : 'var(--ok)' }}>
                      {line.toRequest > 0 ? `+${line.toRequest.toLocaleString()}` : '—'}
                    </span>
                    <span className={styles.dispatchMetricLbl}>to request</span>
                  </div>
                  <div className={styles.dispatchMetric}>
                    <span className={styles.dispatchMetricVal}
                      style={{ color: PRIORITY_COLOR[line.priority] }}>
                      {PRIORITY_LABEL[line.priority]}
                    </span>
                    <span className={styles.dispatchMetricLbl}>
                      {line.priority === 'ok' ? '—' : `by ${line.requestBy}`}
                    </span>
                  </div>
                </div>

                <div
                  className={styles.priorityBar}
                  style={{ background: PRIORITY_COLOR[line.priority] }}
                />
              </div>
            ))}
          </div>

          {/* Weekly summary */}
          <div className={styles.dispatchSummary}>
            <div className={styles.summaryRow}>
              <span>Total units to dispatch this week</span>
              <span className={styles.mono} style={{ color: 'var(--accent)' }}>
                {totalWeekRequest.toLocaleString()}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span>Regions requiring action</span>
              <span className={styles.mono}>{dispatch.filter(d => d.priority !== 'ok').length} / 5</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Estimated dispatch value</span>
              <span className={styles.mono} style={{ color: 'var(--ok)' }}>
                ${Math.round(totalWeekRequest * sku.unitCost).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
