import { useEffect, useState, useRef } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Filler, Tooltip, Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import styles from './CashFlowPanel.module.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface PO {
  id: string; supplier: string; sku: string; qty: number;
  value: number; status: 'pending' | 'approved' | 'paid' | 'processing';
  eta: string; branch: string; createdAt: string;
}

interface CashPoint { label: string; inflow: number; outflow: number; net: number; }

const SUPPLIERS = ['EIPICO','Sigma Pharma','Kahira Pharma','SEDICO','Pharco B','Al-Debeiky Pharma'];
const SKUS = ['CTZ-500','AMX-250','OMP-20','MET-500','ATR-40','AUG-625','PAR-500','BRF-400','ZIP-500','LOS-50'];
const BRANCHES = ['Nasr City','Maadi','Zamalek','Heliopolis','Smouha','6th October','Dokki','New Cairo'];
const PO_STATUSES: PO['status'][] = ['pending','approved','paid','processing'];

const STATUS_CFG = {
  pending:    { color: 'var(--warn)',   label: 'Pending',    icon: '⏳' },
  approved:   { color: 'var(--info)',   label: 'Approved',   icon: '✅' },
  paid:       { color: 'var(--ok)',     label: 'Paid',       icon: '💳' },
  processing: { color: 'var(--accent)', label: 'Processing', icon: '⚙️' },
};

const AI_ACTIONS = [
  'Deferred low-urgency PO to improve 7-day cash position',
  'Consolidated 3 EIPICO orders into bulk PO — saved EGP 14,200',
  'Flagged Sigma Pharma invoice 72h overdue — escalated to finance',
  'Shifted Zamalek branch reorder to post-payroll window',
  'Auto-approved AUG-625 emergency PO within credit limit',
  'Rerouted New Cairo PO through Nasr City warehouse — EGP 3,800 saved',
  'Identified early-payment discount from SEDICO — net benefit EGP 6,100',
  'Cash reserve below 12% threshold — paused 2 non-critical orders',
  'Optimized payment schedule across 5 suppliers for this week',
  'Predicted cash dip Thursday — pre-authorized EGP 120K credit line',
];

function rand(n: number) { return Math.floor(Math.random() * n); }
function pick<T>(a: T[]): T { return a[rand(a.length)]; }

function makePO(): PO {
  const qty = (rand(20) + 1) * 50;
  return {
    id: 'PO-' + Math.random().toString(36).slice(2,8).toUpperCase(),
    supplier: pick(SUPPLIERS),
    sku: pick(SKUS),
    qty,
    value: qty * (5 + rand(20)),
    status: pick(PO_STATUSES),
    eta: `${rand(5)+1}d`,
    branch: pick(BRANCHES),
    createdAt: new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}),
  };
}

function buildHistory(): CashPoint[] {
  const pts: CashPoint[] = [];
  let net = 480000;
  const now = new Date();
  for (let i = 19; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 3 * 60000);
    const label = d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
    const inflow  = 18000 + rand(24000);
    const outflow = 14000 + rand(20000);
    net = Math.max(200000, net + inflow - outflow + (rand(10000) - 5000));
    pts.push({ label, inflow, outflow, net });
  }
  return pts;
}

export default function CashFlowPanel() {
  const [history, setHistory]   = useState<CashPoint[]>(buildHistory);
  const [pos, setPOs]           = useState<PO[]>(() => Array.from({length:10}, makePO));
  const [newPOId, setNewPOId]   = useState<string|null>(null);
  const [aiLog, setAiLog]       = useState<string[]>(() => AI_ACTIONS.slice(0,4));
  const [aiFlash, setAiFlash]   = useState(false);
  const [poFilter, setPoFilter] = useState<'all'|PO['status']>('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Live cash flow data every 4s
  useEffect(() => {
    const t = setInterval(() => {
      setHistory(prev => {
        const last = prev[prev.length-1];
        const inflow  = 16000 + rand(28000);
        const outflow = 12000 + rand(22000);
        const net = Math.max(180000, last.net + inflow - outflow + (rand(12000)-6000));
        const label = new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
        return [...prev.slice(-29), { label, inflow, outflow, net }];
      });
    }, 4000);
    return () => clearInterval(t);
  }, []);

  // New PO every 5s
  useEffect(() => {
    const t = setInterval(() => {
      const po = makePO();
      setNewPOId(po.id);
      setPOs(prev => [po, ...prev].slice(0, 40));
      setTimeout(() => setNewPOId(null), 900);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  // AI action every 6s
  useEffect(() => {
    const t = setInterval(() => {
      setAiFlash(true);
      setAiLog(prev => [pick(AI_ACTIONS), ...prev].slice(0,8));
      setTimeout(() => setAiFlash(false), 700);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  const latest = history[history.length - 1];
  const inflow7d  = history.slice(-7).reduce((s,p)=>s+p.inflow,0);
  const outflow7d = history.slice(-7).reduce((s,p)=>s+p.outflow,0);
  const netPos    = latest?.net ?? 0;
  const burnRate  = Math.round(outflow7d / 7);

  const filteredPOs = poFilter === 'all' ? pos : pos.filter(p => p.status === poFilter);

  const chartData = {
    labels: history.map(p => p.label),
    datasets: [
      {
        label: 'Inflow',
        data: history.map(p => p.inflow),
        borderColor: 'rgba(74,222,128,0.8)',
        backgroundColor: 'rgba(74,222,128,0.07)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: 'Outflow',
        data: history.map(p => p.outflow),
        borderColor: 'rgba(248,113,113,0.7)',
        backgroundColor: 'rgba(248,113,113,0.06)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: 'Net Position',
        data: history.map(p => p.net),
        borderColor: 'rgba(225,84,29,0.9)',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2.5,
        yAxisID: 'y1',
      },
    ],
  };

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        labels: { color: 'rgba(255,255,255,0.5)', font: { size: 11 }, boxWidth: 12, padding: 16 },
      },
      tooltip: {
        backgroundColor: '#1a1a1a',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: 'rgba(255,255,255,0.6)',
        callbacks: {
          label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) =>
            ` ${ctx.dataset.label}: EGP ${(ctx.parsed.y ?? 0).toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 }, maxTicksLimit: 8 },
        grid:  { color: 'rgba(255,255,255,0.04)' },
      },
      y: {
        position: 'left' as const,
        ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 },
          callback: (v: string | number) => `${(Number(v)/1000).toFixed(0)}K` },
        grid: { color: 'rgba(255,255,255,0.04)' },
      },
      y1: {
        position: 'right' as const,
        ticks: { color: 'rgba(225,84,29,0.6)', font: { size: 10 },
          callback: (v: string | number) => `${(Number(v)/1000).toFixed(0)}K` },
        grid: { drawOnChartArea: false },
      },
    },
  };

  const poTotals = {
    pending:    pos.filter(p=>p.status==='pending').length,
    approved:   pos.filter(p=>p.status==='approved').length,
    paid:       pos.filter(p=>p.status==='paid').length,
    processing: pos.filter(p=>p.status==='processing').length,
  };
  const totalPOValue = pos.reduce((s,p)=>s+p.value,0);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Cash Flow & Purchasing Orders</h2>
          <p className={styles.sub}>Real-time treasury optimization — AI manages payment timing, supplier POs and liquidity.</p>
        </div>
        <div className={styles.livePill}>
          <span className={styles.liveDot} />
          LIVE
        </div>
      </div>

      {/* KPI strip */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiIcon}>💰</span>
          <span className={styles.kpiVal} style={{color:'var(--ok)'}}>EGP {(netPos/1000).toFixed(0)}K</span>
          <span className={styles.kpiLbl}>Net Cash Position</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiIcon}>📥</span>
          <span className={styles.kpiVal} style={{color:'var(--ok)'}}>EGP {(inflow7d/1000).toFixed(0)}K</span>
          <span className={styles.kpiLbl}>7-Day Inflow</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiIcon}>📤</span>
          <span className={styles.kpiVal} style={{color:'var(--err)'}}>EGP {(outflow7d/1000).toFixed(0)}K</span>
          <span className={styles.kpiLbl}>7-Day Outflow</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiIcon}>🔥</span>
          <span className={styles.kpiVal} style={{color:'var(--warn)'}}>EGP {(burnRate/1000).toFixed(1)}K/d</span>
          <span className={styles.kpiLbl}>Daily Burn Rate</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiIcon}>🧾</span>
          <span className={styles.kpiVal} style={{color:'var(--accent)'}}>EGP {(totalPOValue/1000).toFixed(0)}K</span>
          <span className={styles.kpiLbl}>Open PO Value</span>
        </div>
      </div>

      {/* Chart */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <span className={styles.secLabel}>Live Cash Flow — Inflow / Outflow / Net Position</span>
          <span className={styles.chartNote}>Auto-updates every 4s</span>
        </div>
        <div className={styles.chartWrap}>
          <Line data={chartData} options={chartOpts} />
        </div>
      </div>

      {/* AI Optimization Log */}
      <div className={styles.aiCard}>
        <div className={styles.aiHeader}>
          <div className={styles.aiTitle}>
            <span className={styles.aiDot} />
            AI Cash Optimization Log
          </div>
          <span className={`${styles.aiCount} ${aiFlash ? styles.aiCountFlash : ''}`}>
            {aiLog.length} actions today
          </span>
        </div>
        <div className={styles.aiList}>
          {aiLog.map((a, i) => (
            <div key={i} className={`${styles.aiRow} ${i === 0 && aiFlash ? styles.aiRowNew : ''}`}>
              <span className={styles.aiRowIcon}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className={styles.aiRowText}>{a}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PO Section */}
      <div className={styles.poSection}>
        <div className={styles.poHeader}>
          <div className={styles.poHeaderLeft}>
            <span className={styles.secLabel}>Corporate Purchase Orders</span>
            <div className={styles.poStats}>
              {(Object.entries(poTotals) as [PO['status'],number][]).map(([s,n]) => {
                const cfg = STATUS_CFG[s];
                return (
                  <button
                    key={s}
                    className={`${styles.poStat} ${poFilter===s ? styles.poStatActive : ''}`}
                    onClick={() => setPoFilter(poFilter===s ? 'all' : s)}
                    style={{'--st-color': cfg.color} as React.CSSProperties}
                  >
                    <span style={{color:cfg.color}}>{n}</span>
                    <span>{cfg.label}</span>
                  </button>
                );
              })}
              <button
                className={`${styles.poStat} ${poFilter==='all' ? styles.poStatActive : ''}`}
                onClick={() => setPoFilter('all')}
                style={{'--st-color':'var(--text-3)'} as React.CSSProperties}
              >
                <span style={{color:'var(--text-2)'}}>{pos.length}</span>
                <span>All</span>
              </button>
            </div>
          </div>
        </div>

        <div className={styles.poTable} ref={scrollRef}>
          <div className={styles.poTableHead}>
            <span>PO ID</span>
            <span>Supplier</span>
            <span>SKU</span>
            <span>Branch</span>
            <span>Qty</span>
            <span>Value</span>
            <span>ETA</span>
            <span>Status</span>
          </div>
          {filteredPOs.map(po => {
            const cfg = STATUS_CFG[po.status];
            return (
              <div key={po.id} className={`${styles.poRow} ${po.id===newPOId ? styles.poRowNew : ''}`}>
                <span className={styles.poId}>{po.id}</span>
                <span className={styles.poSupplier}>{po.supplier}</span>
                <span className={styles.poSku}>{po.sku}</span>
                <span className={styles.poBranch}>{po.branch}</span>
                <span className={styles.poQty}>{po.qty.toLocaleString()}</span>
                <span className={styles.poValue} style={{color:'var(--ok)'}}>EGP {po.value.toLocaleString()}</span>
                <span className={styles.poEta}>{po.eta}</span>
                <span
                  className={styles.poStatus}
                  style={{color:cfg.color,borderColor:`${cfg.color}40`,background:`${cfg.color}10`}}
                >
                  {cfg.icon} {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
