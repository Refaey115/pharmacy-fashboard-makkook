import { useEffect, useState, useRef } from 'react';
import styles from './ReplenishmentPanel.module.css';

interface RepEvent {
  id: string; ts: string; sku: string; branch: string;
  action: string; qty: number; status: 'fired' | 'dispatched' | 'delivered' | 'pending';
  value: number;
}

const SKUS = ['CTZ-500','AMX-250','OMP-20','MET-500','ATR-40','LOS-50','PRD-5','IBU-400','AUG-625','PAR-500','BRF-400','ZIP-500'];
const BRANCHES = ['Nasr City','Maadi','Zamalek','Heliopolis','Smouha','6th October','Dokki','Mohandessin','New Cairo','Tanta'];
const SUPPLIERS = ['EIPICO','Sigma Pharma','Kahira Pharma','SEDICO','Pharco B','Al-Debeiky Pharma'];
const STATUSES: RepEvent['status'][] = ['fired','dispatched','delivered','pending'];

function rand(n: number) { return Math.floor(Math.random() * n); }
function pick<T>(a: T[]): T { return a[rand(a.length)]; }

function makeEvent(): RepEvent {
  const actions = [
    `PO fired to ${pick(SUPPLIERS)}`,
    `Transfer: ${pick(BRANCHES)} → ${pick(BRANCHES)}`,
    `Emergency reorder from ${pick(SUPPLIERS)}`,
    `Replenishment cycle triggered`,
    `Auto-reorder: demand threshold crossed`,
  ];
  const qty = (rand(20) + 1) * 50;
  return {
    id: Math.random().toString(36).slice(2),
    ts: new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit'}),
    sku: pick(SKUS),
    branch: pick(BRANCHES),
    action: pick(actions),
    qty,
    status: pick(STATUSES),
    value: qty * (4 + rand(14)),
  };
}

const STATUS_CFG = {
  fired:      { color: 'var(--accent)', label: 'PO Fired',   icon: '⚡' },
  dispatched: { color: 'var(--info)',   label: 'Dispatched', icon: '🚚' },
  delivered:  { color: 'var(--ok)',     label: 'Delivered',  icon: '✓'  },
  pending:    { color: 'var(--warn)',   label: 'Pending',    icon: '⏳' },
};

const PIPELINE_STEPS = [
  { label: 'Demand Signal',     icon: '📡', desc: 'AI monitors stock levels, sales velocity & forecasts' },
  { label: 'Reorder Point Hit', icon: '🎯', desc: 'Threshold crossed → replenishment rule triggered'      },
  { label: 'Supplier Decision', icon: '🤝', desc: 'Best supplier selected on price, lead time & history'  },
  { label: 'PO Generated',      icon: '📋', desc: 'Purchase order auto-filed and confirmed in < 2 min'    },
  { label: 'Dispatch',          icon: '🚚', desc: 'Item picked, packed and dispatched to branch'          },
  { label: 'Branch Receipt',    icon: '🏪', desc: 'Stock updated in real time on arrival scan'            },
];

export default function ReplenishmentPanel() {
  const [events, setEvents] = useState<RepEvent[]>(() => Array.from({length:12},makeEvent));
  const [newId, setNewId]   = useState<string|null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [filter, setFilter] = useState<'all'|RepEvent['status']>('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Inject new events every 3.5s
  useEffect(() => {
    const t = setInterval(() => {
      const e = makeEvent();
      setNewId(e.id);
      setEvents(prev => [e,...prev].slice(0,50));
      setTimeout(()=>setNewId(null),800);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  // Animate pipeline step every 2s
  useEffect(() => {
    const t = setInterval(() => setActiveStep(s => (s+1) % PIPELINE_STEPS.length), 2000);
    return () => clearInterval(t);
  }, []);

  const totals = {
    fired:      events.filter(e=>e.status==='fired').length,
    dispatched: events.filter(e=>e.status==='dispatched').length,
    delivered:  events.filter(e=>e.status==='delivered').length,
    pending:    events.filter(e=>e.status==='pending').length,
  };

  const filtered = filter === 'all' ? events : events.filter(e=>e.status===filter);
  const totalValue = events.reduce((s,e)=>s+e.value,0);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Replenishment Automation</h2>
          <p className={styles.sub}>
            Every reorder, transfer and PO is triggered and tracked autonomously in real time.
          </p>
        </div>
        <div className={styles.livePill}>
          <span className={styles.liveDot} />
          LIVE
        </div>
      </div>

      {/* Summary stats */}
      <div className={styles.statsRow}>
        {(Object.entries(totals) as [RepEvent['status'],number][]).map(([s,n]) => {
          const cfg = STATUS_CFG[s];
          return (
            <button
              key={s}
              className={`${styles.statCard} ${filter===s ? styles.statActive : ''}`}
              onClick={() => setFilter(filter===s ? 'all' : s)}
              style={{ '--stat-color': cfg.color } as React.CSSProperties}
            >
              <span className={styles.statIcon}>{cfg.icon}</span>
              <span className={styles.statNum} style={{color:cfg.color}}>{n}</span>
              <span className={styles.statLabel}>{cfg.label}</span>
            </button>
          );
        })}
        <div className={styles.statCard} style={{'--stat-color':'var(--ok)'}as React.CSSProperties}>
          <span className={styles.statIcon}>💰</span>
          <span className={styles.statNum} style={{color:'var(--ok)'}}>EGP {(totalValue/1000).toFixed(1)}K</span>
          <span className={styles.statLabel}>Total Value</span>
        </div>
      </div>

      {/* Animated pipeline */}
      <div className={styles.pipeline}>
        <div className={styles.pipelineTitle}>Automated Replenishment Pipeline</div>
        <div className={styles.pipelineSteps}>
          {PIPELINE_STEPS.map((step, i) => (
            <div key={i} className={`${styles.step} ${i === activeStep ? styles.stepActive : ''} ${i < activeStep ? styles.stepDone : ''}`}>
              <div className={styles.stepIconWrap}>
                <div className={styles.stepIcon}>{step.icon}</div>
                {i < PIPELINE_STEPS.length-1 && <div className={`${styles.stepLine} ${i < activeStep ? styles.stepLineDone : ''}`} />}
              </div>
              <div className={styles.stepLabel}>{step.label}</div>
              {i === activeStep && <div className={styles.stepDesc}>{step.desc}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Live feed */}
      <div className={styles.feedSection}>
        <div className={styles.feedHeader}>
          <div className={styles.secLabel}>Live Replenishment Feed</div>
          <div className={styles.filterRow}>
            {(['all','fired','dispatched','delivered','pending'] as const).map(f => (
              <button
                key={f}
                className={`${styles.filterBtn} ${filter===f ? styles.filterActive : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : STATUS_CFG[f].label}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.feed} ref={scrollRef}>
          {filtered.map(e => {
            const cfg = STATUS_CFG[e.status];
            return (
              <div key={e.id} className={`${styles.feedRow} ${e.id===newId ? styles.feedRowNew : ''}`}>
                <span className={styles.feedTs}>{e.ts}</span>
                <span className={styles.feedIcon}>{cfg.icon}</span>
                <div className={styles.feedBody}>
                  <span className={styles.feedAction}>{e.action}</span>
                  <span className={styles.feedMeta}>
                    <span className={styles.feedSku}>{e.sku}</span>
                    <span>·</span>
                    <span>{e.branch}</span>
                    <span>·</span>
                    <span>{e.qty.toLocaleString()} units</span>
                    <span>·</span>
                    <span style={{color:'var(--ok)'}}>EGP {e.value.toLocaleString()}</span>
                  </span>
                </div>
                <span className={styles.feedStatus} style={{color:cfg.color,borderColor:`${cfg.color}40`,background:`${cfg.color}10`}}>
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
