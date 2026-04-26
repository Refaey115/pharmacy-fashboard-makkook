import { useState, useMemo } from 'react';
import styles from './PurchaseOrdersPanel.module.css';
import {
  BRANCHES, SKUS,
  BRANCH_DAILY, WAREHOUSE_STOCK,
  BRANCH_STOCK, SKU_SUPPLIER, SUPPLIER_TERMS, SUPPLIER_LEAD,
  coverageDays, coverageStatus, fmtDate, addDays,
} from '../../data/coreData';

type Horizon = 7 | 14 | 30;
type GroupBy  = 'supplier' | 'date' | 'status';

const TODAY            = new Date(2026, 3, 23);
const OPENING_BALANCE  = 850_000; // EGP opening cash balance (demo)

function bestWarehouseStock(sku: string): number {
  return Math.max(...Object.values(WAREHOUSE_STOCK).map(m => m[sku] ?? 0));
}

// ── PO line item ──────────────────────────────────────────
interface PoLine {
  poId:         string;
  branch:       string;
  sku:          string;
  skuName:      string;
  supplier:     string;
  units:        number;
  unitPrice:    number;
  lineTotal:    number;
  coverDays:    number;
  status:       'critical' | 'low' | 'ok';
  orderDate:    string;
  deliveryDate: string;
  paymentType:  string;
  paymentDays:  number;
  paymentDue:   string;
  paymentDueRaw: Date;
  isCash:       boolean;
  leadDays:     number;
}

// ── Grouped PO (per supplier per day) ────────────────────
interface PoGroup {
  groupKey:    string;
  supplier:    string;
  paymentType: string;
  paymentDays: number;
  isCash:      boolean;
  lines:       PoLine[];
  total:       number;
  paymentDue:  string;
  paymentDueRaw: Date;
  orderDate:   string;
  deliveryDate: string;
  status:      'open' | 'pending';
}

export default function PurchaseOrdersPanel() {
  const [horizon,  setHorizon]  = useState<Horizon>(14);
  const [groupBy,  setGroupBy]  = useState<GroupBy>('supplier');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // ── Build all PO lines ────────────────────────────────
  const allLines = useMemo<PoLine[]>(() => {
    const lines: PoLine[] = [];
    let seq = 1;

    for (const branch of BRANCHES) {
      for (const skuInfo of SKUS) {
        const daily  = (BRANCH_DAILY[branch] ?? {})[skuInfo.sku] ?? 0;
        const stock  = (BRANCH_STOCK[branch] ?? {})[skuInfo.sku] ?? 0;
        const cover  = coverageDays(stock, daily);
        const status = coverageStatus(cover);
        const maxWh  = bestWarehouseStock(skuInfo.sku);

        const target = Math.round(daily * horizon * 1.2);
        const needed = Math.max(0, target - stock);
        if (needed === 0) continue;
        if (maxWh >= needed) continue; // covered by internal transfer

        const supplier    = SKU_SUPPLIER[skuInfo.sku] ?? 'Unknown';
        const terms       = SUPPLIER_TERMS[supplier] ?? { type: 'Cash', days: 0 };
        const lead        = SUPPLIER_LEAD[supplier] ?? 3;
        const delivDate   = addDays(TODAY, lead);
        const payDueDate  = addDays(delivDate, terms.days);
        const lineTotal   = parseFloat((needed * skuInfo.price).toFixed(2));

        lines.push({
          poId:          `PO-${String(seq++).padStart(4, '0')}`,
          branch, sku: skuInfo.sku, skuName: skuInfo.name,
          supplier, units: needed, unitPrice: skuInfo.price, lineTotal,
          coverDays: cover, status,
          orderDate:    fmtDate(TODAY),
          deliveryDate: fmtDate(delivDate),
          paymentType:  terms.type,
          paymentDays:  terms.days,
          paymentDue:   fmtDate(payDueDate),
          paymentDueRaw: payDueDate,
          isCash:       terms.days === 0,
          leadDays:     lead,
        });
      }
    }
    lines.sort((a, b) => a.coverDays - b.coverDays);
    return lines;
  }, [horizon]);

  // ── Group into PO orders ──────────────────────────────
  const poGroups = useMemo<PoGroup[]>(() => {
    const map = new Map<string, PoGroup>();

    for (const line of allLines) {
      const key = groupBy === 'supplier'
        ? line.supplier
        : groupBy === 'date'
        ? line.deliveryDate
        : line.status;

      if (!map.has(key)) {
        map.set(key, {
          groupKey:     key,
          supplier:     line.supplier,
          paymentType:  line.paymentType,
          paymentDays:  line.paymentDays,
          isCash:       line.isCash,
          lines:        [],
          total:        0,
          paymentDue:   line.paymentDue,
          paymentDueRaw: line.paymentDueRaw,
          orderDate:    line.orderDate,
          deliveryDate: line.deliveryDate,
          status:       'open',
        });
      }
      const g = map.get(key)!;
      g.lines.push(line);
      g.total = parseFloat((g.total + line.lineTotal).toFixed(2));
      // Use earliest payment due
      if (line.paymentDueRaw < g.paymentDueRaw) {
        g.paymentDue    = line.paymentDue;
        g.paymentDueRaw = line.paymentDueRaw;
      }
    }

    return Array.from(map.values())
      .sort((a, b) => a.paymentDueRaw.getTime() - b.paymentDueRaw.getTime());
  }, [allLines, groupBy]);

  // ── Cash flow timeline ────────────────────────────────
  const cashFlow = useMemo(() => {
    // Group payments by due date
    const byDate = new Map<string, number>();
    for (const line of allLines) {
      const k = line.paymentDue;
      byDate.set(k, (byDate.get(k) ?? 0) + line.lineTotal);
    }
    const sorted = Array.from(byDate.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());

    let running = OPENING_BALANCE;
    return sorted.map(([date, amount]) => {
      running -= amount;
      return { date, amount, balance: running };
    });
  }, [allLines]);

  // ── Summary ───────────────────────────────────────────
  const totalPoCash   = allLines.filter(l =>  l.isCash).reduce((s, l) => s + l.lineTotal, 0);
  const totalPoCredit = allLines.filter(l => !l.isCash).reduce((s, l) => s + l.lineTotal, 0);
  const totalAll      = totalPoCash + totalPoCredit;
  const criticalLines = allLines.filter(l => l.status === 'critical').length;

  const toggle = (key: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const statusBadge = (s: string) => (
    <span className={`${styles.badge} ${styles['badge_' + s]}`}>{s.toUpperCase()}</span>
  );

  return (
    <div className={styles.wrap}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Purchase Orders</h2>
          <p className={styles.sub}>
            AI-generated POs · {allLines.length} line items · {poGroups.length} orders · {fmtDate(TODAY)}
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
            {(['supplier', 'date', 'status'] as GroupBy[]).map(g => (
              <button key={g}
                className={`${styles.btn} ${groupBy === g ? styles.btnActive : ''}`}
                onClick={() => setGroupBy(g)}>
                By {g.charAt(0).toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Total PO Value</span>
          <span className={styles.kpiVal}>EGP {totalAll.toLocaleString('en-EG', { minimumFractionDigits: 0 })}</span>
          <span className={styles.kpiSub}>{allLines.length} lines · {poGroups.length} orders</span>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiCash}`}>
          <span className={styles.kpiLabel}>Cash Immediate</span>
          <span className={styles.kpiVal}>EGP {totalPoCash.toLocaleString('en-EG', { minimumFractionDigits: 0 })}</span>
          <span className={styles.kpiSub}>paid on delivery · cash suppliers</span>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiCredit}`}>
          <span className={styles.kpiLabel}>On Credit (Deferred)</span>
          <span className={styles.kpiVal}>EGP {totalPoCredit.toLocaleString('en-EG', { minimumFractionDigits: 0 })}</span>
          <span className={styles.kpiSub}>Net-15 / 30 / 45 / 60 terms</span>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiErr}`}>
          <span className={styles.kpiLabel}>Critical Stock Lines</span>
          <span className={styles.kpiVal}>{criticalLines}</span>
          <span className={styles.kpiSub}>≤ 3 days · urgent dispatch</span>
        </div>
      </div>

      {/* Cash flow timeline */}
      <div className={styles.timelineCard}>
        <div className={styles.tlHeader}>
          <span className={styles.tlTitle}>Cash Flow Impact Timeline</span>
          <span className={styles.tlBalance}>
            Opening Balance: <strong>EGP {OPENING_BALANCE.toLocaleString('en-EG')}</strong>
          </span>
        </div>
        <div className={styles.tlRow}>
          {cashFlow.map((cf, i) => (
            <div key={i} className={`${styles.tlChip} ${cf.balance < 0 ? styles.tlNeg : ''}`}>
              <div className={styles.tlDate}>{cf.date}</div>
              <div className={styles.tlAmount}>−EGP {cf.amount.toLocaleString('en-EG', { minimumFractionDigits: 0 })}</div>
              <div className={`${styles.tlBal} ${cf.balance < 100_000 ? styles.tlBalWarn : ''}`}>
                Bal: {cf.balance.toLocaleString('en-EG', { minimumFractionDigits: 0 })}
              </div>
            </div>
          ))}
          {cashFlow.length === 0 && (
            <div className={styles.tlEmpty}>No scheduled payments for this horizon.</div>
          )}
        </div>
      </div>

      {/* PO Groups */}
      <div className={styles.poList}>
        {poGroups.map(g => (
          <div key={g.groupKey} className={styles.poCard}>
            {/* PO card header */}
            <div
              className={`${styles.poHead} ${g.isCash ? styles.poHeadCash : styles.poHeadCredit}`}
              onClick={() => toggle(g.groupKey)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.poMeta}>
                <span className={styles.poKey}>{g.groupKey}</span>
                <span className={styles.poType}>
                  {g.isCash
                    ? <span className={styles.cashTag}>CASH</span>
                    : <span className={styles.creditTag}>{g.paymentType}</span>}
                </span>
                <span className={styles.poLineCount}>{g.lines.length} line{g.lines.length !== 1 ? 's' : ''}</span>
              </div>
              <div className={styles.poRight}>
                {!g.isCash && (
                  <div className={styles.poDue}>
                    Due: <span className={styles.dueDateVal}>{g.paymentDue}</span>
                  </div>
                )}
                <div className={styles.poTotal}>
                  EGP {g.total.toLocaleString('en-EG', { minimumFractionDigits: 0 })}
                </div>
                <span className={styles.chevron}>{expanded.has(g.groupKey) ? '▲' : '▼'}</span>
              </div>
            </div>

            {/* Line items */}
            {expanded.has(g.groupKey) && (
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>PO #</th>
                      <th>Branch</th>
                      <th>SKU</th>
                      <th>Product</th>
                      <th>Stock</th>
                      <th>Coverage</th>
                      <th>Units</th>
                      <th>Unit Price</th>
                      <th>Line Total</th>
                      <th>Payment Type</th>
                      <th>Payment Due</th>
                      <th>Delivery By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.lines.map(l => (
                      <tr key={l.poId}
                        className={l.status === 'critical' ? styles.rowCrit : l.status === 'low' ? styles.rowWarn : ''}>
                        <td className={styles.poIdCell}>{l.poId}</td>
                        <td className={styles.locCell}>{l.branch}</td>
                        <td className={styles.skuCell}>{l.sku}</td>
                        <td className={styles.nameCell}>{l.skuName}</td>
                        <td>{l.coverDays >= 99 ? '99+d' : `${l.coverDays}d`}</td>
                        <td>{statusBadge(l.status)}</td>
                        <td className={styles.boldCell}>{l.units.toLocaleString()}</td>
                        <td>EGP {l.unitPrice.toFixed(2)}</td>
                        <td className={styles.cashCell}>
                          EGP {l.lineTotal.toLocaleString('en-EG', { minimumFractionDigits: 0 })}
                        </td>
                        <td>
                          {l.isCash
                            ? <span className={styles.cashTag}>CASH</span>
                            : <span className={styles.creditTag}>{l.paymentType}</span>}
                        </td>
                        <td className={l.isCash ? styles.greyCell : styles.dateCell}>
                          {l.isCash ? 'On delivery' : l.paymentDue}
                        </td>
                        <td className={styles.dateCell}>{l.deliveryDate}</td>
                      </tr>
                    ))}
                    {/* Subtotal row */}
                    <tr className={styles.subtotalRow}>
                      <td colSpan={8} className={styles.subtotalLabel}>Subtotal</td>
                      <td className={styles.subtotalVal} colSpan={4}>
                        EGP {g.total.toLocaleString('en-EG', { minimumFractionDigits: 0 })}
                        {!g.isCash && (
                          <span className={styles.dueTip}> · Due {g.paymentDue}</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {allLines.length === 0 && (
        <div className={styles.emptyState}>
          All branches can be replenished from warehouse stock. No supplier POs required.
        </div>
      )}
    </div>
  );
}
