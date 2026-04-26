import { useState, useMemo } from 'react';
import styles from './ReplenishmentPlanPanel.module.css';
import {
  BRANCHES, SKUS,
  BRANCH_DAILY, WAREHOUSE_DAILY,
  BRANCH_STOCK, WAREHOUSE_STOCK,
  SKU_SUPPLIER, SUPPLIER_LEAD,
  coverageDays, coverageStatus, fmtDate, addDays,
} from '../../data/coreData';

type Horizon = 7 | 14 | 30;
type FilterMode = 'all' | 'critical' | 'low';

const TODAY = new Date(2026, 3, 23);

// Pick the best warehouse to source a SKU from (most stock)
function bestWarehouse(sku: string): string {
  let best = 'WH-Cairo Central';
  let max  = 0;
  for (const [wh, map] of Object.entries(WAREHOUSE_STOCK)) {
    if ((map[sku] ?? 0) > max) { max = map[sku] ?? 0; best = wh; }
  }
  return best;
}

export default function ReplenishmentPlanPanel() {
  const [horizon,  setHorizon]  = useState<Horizon>(14);
  const [filter,   setFilter]   = useState<FilterMode>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  // ── Build plan items ──────────────────────────────────────
  const plan = useMemo(() => {
    const transfers: {
      id: string; branch: string; sku: string; skuName: string; supplier: string;
      currentStock: number; dailyDemand: number; coverDays: number;
      status: 'critical' | 'low' | 'ok';
      reorderUnits: number; reorderCost: number;
      sourceWarehouse: string; whStock: number; whDailyOut: number;
      whCoverDays: number; type: 'transfer'; deliveryDate: string; priority: number;
    }[] = [];

    const supplierPos: {
      id: string; branch: string; sku: string; skuName: string; supplier: string;
      currentStock: number; dailyDemand: number; coverDays: number;
      status: 'critical' | 'low' | 'ok';
      reorderUnits: number; reorderCost: number;
      leadDays: number; deliveryDate: string; type: 'po'; priority: number;
    }[] = [];

    for (const branch of BRANCHES) {
      for (const skuInfo of SKUS) {
        const daily  = (BRANCH_DAILY[branch] ?? {})[skuInfo.sku] ?? 0;
        const stock  = (BRANCH_STOCK[branch] ?? {})[skuInfo.sku] ?? 0;
        const cover  = coverageDays(stock, daily);
        const status = coverageStatus(cover);

        if (status === 'ok' && filter !== 'all') continue;
        if (filter === 'critical' && status !== 'critical') continue;
        if (filter === 'low'      && status === 'ok')       continue;

        // Target: top up to horizon × daily (plus 20% safety buffer)
        const target  = Math.round(daily * horizon * 1.2);
        const needed  = Math.max(0, target - stock);
        if (needed === 0) continue;

        const cost      = parseFloat((needed * skuInfo.price).toFixed(2));
        const supplier  = SKU_SUPPLIER[skuInfo.sku] ?? 'Unknown';
        const wh        = bestWarehouse(skuInfo.sku);
        const whStock   = (WAREHOUSE_STOCK[wh] ?? {})[skuInfo.sku] ?? 0;
        const whDaily   = (WAREHOUSE_DAILY[wh] ?? {})[skuInfo.sku] ?? 0;
        const whCover   = coverageDays(whStock, whDaily);
        const priority  = status === 'critical' ? 1 : status === 'low' ? 2 : 3;
        const id        = `${branch}-${skuInfo.sku}`;

        if (whStock >= needed) {
          // Warehouse can fulfil → internal transfer (1-day delivery)
          transfers.push({
            id, branch, sku: skuInfo.sku, skuName: skuInfo.name, supplier,
            currentStock: stock, dailyDemand: daily, coverDays: cover, status,
            reorderUnits: needed, reorderCost: cost,
            sourceWarehouse: wh, whStock, whDailyOut: whDaily, whCoverDays: whCover,
            type: 'transfer',
            deliveryDate: fmtDate(addDays(TODAY, 1)),
            priority,
          });
        } else {
          // Need supplier PO
          const lead = SUPPLIER_LEAD[supplier] ?? 3;
          supplierPos.push({
            id, branch, sku: skuInfo.sku, skuName: skuInfo.name, supplier,
            currentStock: stock, dailyDemand: daily, coverDays: cover, status,
            reorderUnits: needed, reorderCost: cost,
            leadDays: lead, deliveryDate: fmtDate(addDays(TODAY, lead)),
            type: 'po',
            priority,
          });
        }
      }
    }

    transfers.sort((a, b) => a.priority - b.priority || a.coverDays - b.coverDays);
    supplierPos.sort((a, b) => a.priority - b.priority || a.coverDays - b.coverDays);
    return { transfers, supplierPos };
  }, [horizon, filter]);

  const totalTransferCost = plan.transfers.reduce((s, r) => s + r.reorderCost, 0);
  const totalPoCost       = plan.supplierPos.reduce((s, r) => s + r.reorderCost, 0);
  const critT = plan.transfers.filter(r => r.status === 'critical').length;
  const critP = plan.supplierPos.filter(r => r.status === 'critical').length;

  const statusBadge = (s: string) => (
    <span className={`${styles.badge} ${styles['badge_' + s]}`}>{s.toUpperCase()}</span>
  );

  return (
    <div className={styles.wrap}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Replenishment Plan</h2>
          <p className={styles.sub}>
            AI-generated · Based on {horizon}-day demand forecast · {fmtDate(TODAY)}
          </p>
        </div>
        <div className={styles.controls}>
          <div className={styles.btnGroup}>
            {([7, 14, 30] as Horizon[]).map(h => (
              <button key={h}
                className={`${styles.btn} ${horizon === h ? styles.btnActive : ''}`}
                onClick={() => setHorizon(h)}>
                {h}d
              </button>
            ))}
          </div>
          <div className={styles.btnGroup}>
            {(['all', 'critical', 'low'] as FilterMode[]).map(f => (
              <button key={f}
                className={`${styles.btn} ${filter === f ? styles.btnActive : ''}`}
                onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Internal Transfers</span>
          <span className={styles.kpiVal}>{plan.transfers.length}</span>
          <span className={styles.kpiSub}>warehouse → branch · 1-day delivery</span>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiAccent}`}>
          <span className={styles.kpiLabel}>Transfer Cost</span>
          <span className={styles.kpiVal}>
            EGP {totalTransferCost.toLocaleString('en-EG', { minimumFractionDigits: 0 })}
          </span>
          <span className={styles.kpiSub}>{critT} critical items</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Supplier POs Needed</span>
          <span className={styles.kpiVal}>{plan.supplierPos.length}</span>
          <span className={styles.kpiSub}>warehouse stock insufficient</span>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiWarn}`}>
          <span className={styles.kpiLabel}>PO Budget Required</span>
          <span className={styles.kpiVal}>
            EGP {totalPoCost.toLocaleString('en-EG', { minimumFractionDigits: 0 })}
          </span>
          <span className={styles.kpiSub}>{critP} critical items</span>
        </div>
      </div>

      {/* ── Section A: Internal Transfers ── */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>↕</span>
            Section A — Internal Warehouse Transfers
            <span className={styles.count}>{plan.transfers.length} items</span>
          </div>
          <span className={styles.sectionNote}>Warehouse has sufficient stock · Same-day dispatch · 1-day delivery</span>
        </div>

        {plan.transfers.length === 0 ? (
          <div className={styles.empty}>No transfers needed for current filter.</div>
        ) : (
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Branch</th>
                  <th>SKU</th>
                  <th>Status</th>
                  <th>Stock</th>
                  <th>Coverage</th>
                  <th>Daily Use</th>
                  <th>Units Needed</th>
                  <th>Source WH</th>
                  <th>WH Stock</th>
                  <th>WH Coverage</th>
                  <th>Cost (EGP)</th>
                  <th>Delivery</th>
                </tr>
              </thead>
              <tbody>
                {plan.transfers.map(r => (
                  <tr key={r.id}
                    className={r.status === 'critical' ? styles.rowCrit : r.status === 'low' ? styles.rowWarn : ''}
                    onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                    style={{ cursor: 'pointer' }}>
                    <td className={styles.locCell}>{r.branch}</td>
                    <td className={styles.skuCell}>{r.sku}</td>
                    <td>{statusBadge(r.status)}</td>
                    <td>{r.currentStock.toLocaleString()}</td>
                    <td>
                      <span className={`${styles.coverBadge} ${styles['cover_' + r.status]}`}>
                        {r.coverDays >= 99 ? '99+d' : `${r.coverDays}d`}
                      </span>
                    </td>
                    <td>{r.dailyDemand} u/d</td>
                    <td className={styles.boldCell}>{r.reorderUnits.toLocaleString()}</td>
                    <td className={styles.whCell}>{r.sourceWarehouse.replace('WH-', '')}</td>
                    <td>{r.whStock.toLocaleString()}</td>
                    <td>
                      <span className={`${styles.coverBadge} ${r.whCoverDays <= 3 ? styles.cover_critical : r.whCoverDays <= 7 ? styles.cover_low : styles.cover_ok}`}>
                        {r.whCoverDays >= 99 ? '99+d' : `${r.whCoverDays}d`}
                      </span>
                    </td>
                    <td className={styles.cashCell}>
                      {r.reorderCost.toLocaleString('en-EG', { minimumFractionDigits: 0 })}
                    </td>
                    <td className={styles.dateCell}>{r.deliveryDate}</td>
                  </tr>
                ))}
                {expanded && (() => {
                  const r = plan.transfers.find(x => x.id === expanded);
                  if (!r) return null;
                  return (
                    <tr key={`${expanded}-detail`} className={styles.detailRow}>
                      <td colSpan={12} className={styles.detailCell}>
                        <div className={styles.detailBox}>
                          <strong>AI Reasoning:</strong> {r.skuName} at <em>{r.branch}</em> has only{' '}
                          <strong>{r.coverDays} days</strong> of stock remaining at {r.dailyDemand} u/d demand rate.
                          Transferring <strong>{r.reorderUnits.toLocaleString()} units</strong> from{' '}
                          {r.sourceWarehouse} (current stock {r.whStock.toLocaleString()} units,{' '}
                          {r.whCoverDays}d coverage) brings branch to{' '}
                          {horizon}-day target with 20% safety buffer.
                          Estimated transfer cost: <strong>EGP {r.reorderCost.toLocaleString('en-EG')}</strong>.
                          Supplier: {r.supplier}.
                        </div>
                      </td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Section B: Supplier POs ── */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📦</span>
            Section B — Supplier Purchase Orders Required
            <span className={styles.count}>{plan.supplierPos.length} items</span>
          </div>
          <span className={styles.sectionNote}>Warehouse stock insufficient · External order needed · Lead time applies</span>
        </div>

        {plan.supplierPos.length === 0 ? (
          <div className={styles.empty}>No supplier POs needed for current filter.</div>
        ) : (
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Branch</th>
                  <th>SKU</th>
                  <th>Status</th>
                  <th>Stock</th>
                  <th>Coverage</th>
                  <th>Daily Use</th>
                  <th>Units Needed</th>
                  <th>Supplier</th>
                  <th>Lead Time</th>
                  <th>Cost (EGP)</th>
                  <th>Expected By</th>
                </tr>
              </thead>
              <tbody>
                {plan.supplierPos.map(r => (
                  <tr key={r.id}
                    className={r.status === 'critical' ? styles.rowCrit : r.status === 'low' ? styles.rowWarn : ''}>
                    <td className={styles.locCell}>{r.branch}</td>
                    <td className={styles.skuCell}>{r.sku}</td>
                    <td>{statusBadge(r.status)}</td>
                    <td>{r.currentStock.toLocaleString()}</td>
                    <td>
                      <span className={`${styles.coverBadge} ${styles['cover_' + r.status]}`}>
                        {r.coverDays >= 99 ? '99+d' : `${r.coverDays}d`}
                      </span>
                    </td>
                    <td>{r.dailyDemand} u/d</td>
                    <td className={styles.boldCell}>{r.reorderUnits.toLocaleString()}</td>
                    <td className={styles.suppCell}>{r.supplier}</td>
                    <td>{r.leadDays}d</td>
                    <td className={styles.cashCell}>
                      {r.reorderCost.toLocaleString('en-EG', { minimumFractionDigits: 0 })}
                    </td>
                    <td className={styles.dateCell}>{r.deliveryDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
