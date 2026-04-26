import { useState, useMemo } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Tooltip, Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import styles from './DemandForecastPanel.module.css';
import {
  BRANCHES, WAREHOUSES, SKUS,
  BRANCH_DAILY, WAREHOUSE_DAILY,
  BRANCH_STOCK, WAREHOUSE_STOCK,
  coverageDays, coverageStatus, fmtDate, addDays,
} from '../../data/coreData';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type View    = 'branch' | 'warehouse';
type Horizon = 7 | 14 | 30;

const TODAY = new Date(2026, 3, 23); // April 23 2026

export default function DemandForecastPanel() {
  const [view,    setView]    = useState<View>('branch');
  const [horizon, setHorizon] = useState<Horizon>(14);
  const [skuFilter, setSku]   = useState<string>('ALL');

  const locations  = view === 'branch' ? BRANCHES : WAREHOUSES;
  const dailyMap   = view === 'branch' ? BRANCH_DAILY : WAREHOUSE_DAILY;
  const stockMap   = view === 'branch' ? BRANCH_STOCK : WAREHOUSE_STOCK;
  const filteredSkus = skuFilter === 'ALL' ? SKUS : SKUS.filter(s => s.sku === skuFilter);

  // Build row data: location × SKU
  const rows = useMemo(() => {
    const result: {
      location: string; sku: string; name: string; category: string;
      price: number; dailyDemand: number; forecastUnits: number;
      cashDemand: number; currentStock: number; coverDays: number;
      status: 'critical' | 'low' | 'ok'; shortfall: number;
      shortfallCash: number;
    }[] = [];

    for (const loc of locations) {
      for (const skuInfo of filteredSkus) {
        const daily   = (dailyMap[loc] ?? {})[skuInfo.sku] ?? 0;
        const stock   = (stockMap[loc] ?? {})[skuInfo.sku] ?? 0;
        const fUnits  = Math.round(daily * horizon);
        const cash    = parseFloat((fUnits * skuInfo.price).toFixed(2));
        const cover   = coverageDays(stock, daily);
        const status  = coverageStatus(cover);
        const shortU  = cover < horizon ? Math.round((horizon - cover) * daily) : 0;
        const shortC  = parseFloat((shortU * skuInfo.price).toFixed(2));

        result.push({
          location: loc, sku: skuInfo.sku, name: skuInfo.name,
          category: skuInfo.category, price: skuInfo.price,
          dailyDemand: daily, forecastUnits: fUnits, cashDemand: cash,
          currentStock: stock, coverDays: cover, status,
          shortfall: shortU, shortfallCash: shortC,
        });
      }
    }
    return result;
  }, [view, horizon, skuFilter, locations, filteredSkus, dailyMap, stockMap]);

  // Summary KPIs
  const totalCash      = rows.reduce((s, r) => s + r.cashDemand, 0);
  const criticalCount  = rows.filter(r => r.status === 'critical').length;
  const lowCount       = rows.filter(r => r.status === 'low').length;
  const shortfallTotal = rows.reduce((s, r) => s + r.shortfallCash, 0);

  // Bar chart: cash demand per location (sum of all shown SKUs)
  const chartLabels = locations.map(l => l.replace('WH-', ''));
  const cashByLoc   = locations.map(loc =>
    rows.filter(r => r.location === loc).reduce((s, r) => s + r.cashDemand, 0)
  );

  const barData = {
    labels: chartLabels,
    datasets: [{
      label: `Cash Demand EGP (${horizon}d)`,
      data: cashByLoc,
      backgroundColor: cashByLoc.map((_, i) => i % 2 === 0 ? '#E1541D' : '#c44418'),
      borderRadius: 4,
    }],
  };

  const barOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed: { y: number | null } }) =>
            ` EGP ${(ctx.parsed.y ?? 0).toLocaleString('en-EG', { minimumFractionDigits: 0 })}`,
        },
      },
    },
    scales: {
      x: { ticks: { color: '#888', font: { size: 11 } }, grid: { display: false } },
      y: { ticks: { color: '#888', font: { size: 11 } }, grid: { color: '#333' } },
    },
  } as const;

  const endDate = fmtDate(addDays(TODAY, horizon));

  return (
    <div className={styles.wrap}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Demand Forecast</h2>
          <p className={styles.sub}>
            AI-generated forward demand · Horizon ends <strong>{endDate}</strong>
          </p>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.btnGroup}>
            {(['branch', 'warehouse'] as View[]).map(v => (
              <button
                key={v}
                className={`${styles.btn} ${view === v ? styles.btnActive : ''}`}
                onClick={() => setView(v)}
              >
                {v === 'branch' ? 'Branches' : 'Warehouses'}
              </button>
            ))}
          </div>

          <div className={styles.btnGroup}>
            {([7, 14, 30] as Horizon[]).map(h => (
              <button
                key={h}
                className={`${styles.btn} ${horizon === h ? styles.btnActive : ''}`}
                onClick={() => setHorizon(h)}
              >
                {h}d
              </button>
            ))}
          </div>

          <select
            className={styles.select}
            value={skuFilter}
            onChange={e => setSku(e.target.value)}
          >
            <option value="ALL">All SKUs</option>
            {SKUS.map(s => (
              <option key={s.sku} value={s.sku}>{s.sku} — {s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI strip */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Total Cash Demand</span>
          <span className={styles.kpiVal}>
            EGP {totalCash.toLocaleString('en-EG', { minimumFractionDigits: 0 })}
          </span>
          <span className={styles.kpiSub}>across all {view}s · {horizon}d</span>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiErr}`}>
          <span className={styles.kpiLabel}>Critical Stock</span>
          <span className={styles.kpiVal}>{criticalCount}</span>
          <span className={styles.kpiSub}>items ≤ 3 days coverage</span>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiWarn}`}>
          <span className={styles.kpiLabel}>Low Stock</span>
          <span className={styles.kpiVal}>{lowCount}</span>
          <span className={styles.kpiSub}>items 4–7 days coverage</span>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiInfo}`}>
          <span className={styles.kpiLabel}>Shortfall Cost</span>
          <span className={styles.kpiVal}>
            EGP {shortfallTotal.toLocaleString('en-EG', { minimumFractionDigits: 0 })}
          </span>
          <span className={styles.kpiSub}>units needed before stockout</span>
        </div>
      </div>

      {/* Bar chart */}
      <div className={styles.chartCard}>
        <div className={styles.chartTitle}>Cash Demand by {view === 'branch' ? 'Branch' : 'Warehouse'} — {horizon}-Day Window (EGP)</div>
        <div className={styles.chartWrap}>
          <Bar data={barData} options={barOpts} />
        </div>
      </div>

      {/* Detail table */}
      <div className={styles.tableCard}>
        <div className={styles.tableTitle}>
          Forecast Detail — {locations.length} {view}s × {filteredSkus.length} SKUs
          &nbsp;·&nbsp; Horizon: {horizon} days · Ends {endDate}
        </div>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{view === 'branch' ? 'Branch' : 'Warehouse'}</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Daily Demand</th>
                <th>Forecast Units</th>
                <th>Unit Price</th>
                <th>Cash Demand</th>
                <th>Current Stock</th>
                <th>Coverage</th>
                <th>Status</th>
                <th>Shortfall Units</th>
                <th>Shortfall Cost</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className={r.status === 'critical' ? styles.rowCrit : r.status === 'low' ? styles.rowWarn : ''}>
                  <td className={styles.locCell}>{r.location}</td>
                  <td className={styles.skuCell}>{r.sku}</td>
                  <td><span className={styles.catTag}>{r.category}</span></td>
                  <td>{r.dailyDemand} u/d</td>
                  <td className={styles.numCell}>{r.forecastUnits.toLocaleString()}</td>
                  <td>EGP {r.price.toFixed(2)}</td>
                  <td className={styles.cashCell}>
                    EGP {r.cashDemand.toLocaleString('en-EG', { minimumFractionDigits: 0 })}
                  </td>
                  <td>{r.currentStock.toLocaleString()}</td>
                  <td>
                    <span className={`${styles.coverBadge} ${styles['cover_' + r.status]}`}>
                      {r.coverDays >= 99 ? '99+ d' : `${r.coverDays} d`}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.statusDot} ${styles['dot_' + r.status]}`}>
                      {r.status.toUpperCase()}
                    </span>
                  </td>
                  <td className={r.shortfall > 0 ? styles.shortCell : ''}>
                    {r.shortfall > 0 ? r.shortfall.toLocaleString() : '—'}
                  </td>
                  <td className={r.shortfallCash > 0 ? styles.shortCell : ''}>
                    {r.shortfallCash > 0
                      ? `EGP ${r.shortfallCash.toLocaleString('en-EG', { minimumFractionDigits: 0 })}`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
