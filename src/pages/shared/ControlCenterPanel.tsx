import { useState, useMemo, useEffect } from 'react';
import {
  Chart as ChartJS, RadialLinearScale, PointElement,
  LineElement, Filler, Tooltip, Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { DEFAULT_WEIGHTS, IMPACT_MATRIX, PRICE_FORECAST } from '../../data/mockData';
import type { OptimizationWeight } from '../../data/mockData';
import styles from './ControlCenterPanel.module.css';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// ── Regions / Branches ─────────────────────────────────────
const REGIONS: Record<string, string[]> = {
  'All Regions':  [],
  'Greater Cairo': ['Nasr City', 'Maadi', 'Zamalek', 'Heliopolis', 'Mohandessin', 'Dokki', 'New Cairo', '6th October'],
  'Alexandria':    ['Smouha', 'Sidi Gaber', 'Miami', 'Montaza'],
  'Delta':         ['Tanta', 'Mansoura', 'Mahalla', 'Zagazig'],
  'Upper Egypt':   ['Assiut', 'Sohag', 'Luxor', 'Aswan'],
};

const OVERSTOCK_SKUS = [
  { sku: 'CTZ-500', name: 'Cetirizine 10mg',     unit: 'units' },
  { sku: 'AMX-250', name: 'Amoxicillin 250mg',   unit: 'units' },
  { sku: 'AUG-625', name: 'Augmentin 625mg',     unit: 'units' },
  { sku: 'PRD-5',   name: 'Prednisolone 5mg',    unit: 'units' },
  { sku: 'ATR-40',  name: 'Atorvastatin 40mg',   unit: 'units' },
  { sku: 'IBU-400', name: 'Ibuprofen 400mg',     unit: 'units' },
  { sku: 'OMP-20',  name: 'Omeprazole 20mg',     unit: 'units' },
  { sku: 'PAR-500', name: 'Paracetamol 500mg',   unit: 'units' },
];

// ── Emergency interface — purely human, no AI ──────────────
interface EmergencyRecord {
  id: string;
  title: string;
  category: string;
  severity: 'critical' | 'high' | 'medium';
  region: string;
  branch: string;
  impactDesc: string;
  actionsNotes: string;
  active: boolean;
  acknowledged: boolean;
  timestamp: string;
}

const SEED_EMERGENCIES: EmergencyRecord[] = [
  {
    id: 'e1', title: 'Port Said Customs Delay — Antibiotics Shipment',
    category: 'Supply Disruption', severity: 'critical',
    region: 'All Regions', branch: '',
    impactDesc: 'AMX-250 and AUG-625 stock depletes in 4 days across 8 branches. Risk of full stockout by Thursday.',
    actionsNotes: 'Contacted Sigma Pharma for emergency local supply. Awaiting confirmation on 2,400-unit PO.',
    active: true, acknowledged: false, timestamp: '08:14:22',
  },
  {
    id: 'e2', title: 'Sandstorm Warning — Alexandria Region',
    category: 'Logistics', severity: 'high',
    region: 'Alexandria', branch: '',
    impactDesc: 'Delivery routes blocked 24–48 hours. 4 Alexandria branches at risk of stockout.',
    actionsNotes: 'Pre-positioned 72h safety stock to all Alexandria branches before 14:00. Non-critical transfers deferred.',
    active: true, acknowledged: true, timestamp: '09:02:11',
  },
  {
    id: 'e3', title: 'Influenza Spike — Cairo North Clusters',
    category: 'Demand Surge', severity: 'high',
    region: 'Greater Cairo', branch: 'Nasr City',
    impactDesc: 'CTZ-500 and OMP-20 demand up 340% in Nasr City, Heliopolis, Obour.',
    actionsNotes: 'Emergency reorder of 3,000 units CTZ-500 placed. Inbound shipment re-routed to hit affected branches first.',
    active: false, acknowledged: true, timestamp: '06:55:44',
  },
];

// ── Presets ────────────────────────────────────────────────
const PRESETS: Record<string, Partial<Record<string, number>>> = {
  'Balanced':       { roi: 70, shelflife: 55, availability: 80, cashflow: 60, distribution: 50 },
  'Max ROI':        { roi: 100, shelflife: 30, availability: 60, cashflow: 80, distribution: 40 },
  'Zero Waste':     { roi: 40, shelflife: 100, availability: 70, cashflow: 40, distribution: 60 },
  'Full Stock':     { roi: 50, shelflife: 60, availability: 100, cashflow: 50, distribution: 70 },
  'Cash Sprint':    { roi: 60, shelflife: 40, availability: 65, cashflow: 100, distribution: 80 },
  'Speed Delivery': { roi: 50, shelflife: 50, availability: 75, cashflow: 60, distribution: 100 },
};

function computeImpact(weights: OptimizationWeight[]) {
  return IMPACT_MATRIX.map(row => {
    const defaultW = DEFAULT_WEIGHTS;
    let delta = 0;
    weights.forEach(w => {
      const def = defaultW.find(d => d.id === w.id)!;
      const diff = (w.value - def.value) / 10;
      delta += (row.sensitivities[w.id] ?? 0) * diff;
    });
    const projected = +(row.baseline + delta).toFixed(2);
    const pct = row.baseline !== 0 ? +((delta / row.baseline) * 100).toFixed(1) : 0;
    const improved = (row.higherIsBetter && delta > 0) || (!row.higherIsBetter && delta < 0);
    const worsened = (row.higherIsBetter && delta < 0) || (!row.higherIsBetter && delta > 0);
    return { ...row, projected, delta, pct, improved, worsened };
  });
}

type SubTab = 'optimize' | 'branch' | 'overstock' | 'emergencies';

export default function ControlCenterPanel() {
  const [tab, setTab]         = useState<SubTab>('optimize');
  const [weights, setWeights] = useState<OptimizationWeight[]>(DEFAULT_WEIGHTS.map(w => ({ ...w })));
  const [activePreset, setActivePreset] = useState('Balanced');
  const [applied, setApplied]           = useState(false);
  const [, setAnimTick]                 = useState(0);

  // Branch control state
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [branchWeights, setBranchWeights]   = useState<OptimizationWeight[]>(DEFAULT_WEIGHTS.map(w => ({ ...w })));
  const [branchApplied, setBranchApplied]   = useState(false);

  // Overstock state
  const [overstockRegion, setOverstockRegion]     = useState('All Regions');
  const [overstockBranch, setOverstockBranch]     = useState('');
  const [overstockSku, setOverstockSku]           = useState('CTZ-500');
  const [overstockQty, setOverstockQty]           = useState(500);
  const [overstockReason, setOverstockReason]     = useState('Seasonal preparation');
  const [overstockScheduled, setOverstockScheduled] = useState(false);

  // Emergency state — purely human
  const [emergencies, setEmergencies] = useState<EmergencyRecord[]>(SEED_EMERGENCIES);
  // New emergency form
  const [newTitle, setNewTitle]       = useState('');
  const [newCategory, setNewCategory] = useState('Supply Disruption');
  const [newSeverity, setNewSeverity] = useState<EmergencyRecord['severity']>('high');
  const [newRegion, setNewRegion]     = useState('All Regions');
  const [newBranch, setNewBranch]     = useState('');
  const [newImpact, setNewImpact]     = useState('');
  const [newNotes, setNewNotes]       = useState('');

  useEffect(() => { setAnimTick(t => t + 1); }, [weights]);

  const impact = useMemo(() => computeImpact(weights), [weights]);

  const radarData = {
    labels: weights.map(w => w.label.split('/')[0].trim()),
    datasets: [
      {
        label: 'Active Strategy',
        data: weights.map(w => w.value),
        borderColor: '#E1541D',
        backgroundColor: 'rgba(225,84,29,0.15)',
        pointBackgroundColor: '#E1541D',
        pointRadius: 5,
        borderWidth: 2,
      },
      {
        label: 'Baseline',
        data: DEFAULT_WEIGHTS.map(w => w.value),
        borderColor: 'rgba(255,255,255,0.15)',
        backgroundColor: 'rgba(255,255,255,0.03)',
        pointBackgroundColor: 'rgba(255,255,255,0.3)',
        pointRadius: 3,
        borderWidth: 1,
        borderDash: [4, 4],
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    plugins: {
      legend: { labels: { color: '#9B9B9B', font: { family: 'Inter', size: 11 } } },
      tooltip: { backgroundColor: '#2a2a2a', titleColor: '#EFEFEF', bodyColor: '#C6C6C6' },
    },
    scales: {
      r: {
        min: 0, max: 100,
        ticks: { stepSize: 25, color: '#9B9B9B', font: { family: 'Inter', size: 10 }, backdropColor: 'transparent' },
        grid:        { color: 'rgba(255,255,255,0.06)' },
        angleLines:  { color: 'rgba(255,255,255,0.08)' },
        pointLabels: { color: '#9B9B9B', font: { family: 'Inter', size: 11 } },
      },
    },
  };

  const applyPreset = (name: string) => {
    const p = PRESETS[name];
    setActivePreset(name);
    setWeights(prev => prev.map(w => ({ ...w, value: p[w.id] ?? w.value })));
    setApplied(false);
  };

  const handleSlider = (id: string, val: number) => {
    setActivePreset('Custom');
    setApplied(false);
    setWeights(prev => prev.map(w => w.id === id ? { ...w, value: val } : w));
  };

  const handleApply = () => { setApplied(true); };

  const branchList = selectedRegion === 'All Regions'
    ? Object.values(REGIONS).flat()
    : REGIONS[selectedRegion] ?? [];

  const overstockBranchList = overstockRegion === 'All Regions'
    ? Object.values(REGIONS).flat()
    : REGIONS[overstockRegion] ?? [];

  const newBranchList = newRegion === 'All Regions'
    ? [] : REGIONS[newRegion] ?? [];

  const getSeverityClass = (s: EmergencyRecord['severity']) =>
    s === 'critical' ? styles.sevCritical : s === 'high' ? styles.sevHigh : styles.sevMedium;

  const addEmergency = () => {
    if (!newTitle.trim()) return;
    const e: EmergencyRecord = {
      id: Math.random().toString(36).slice(2),
      title:       newTitle.trim(),
      category:    newCategory,
      severity:    newSeverity,
      region:      newRegion,
      branch:      newBranch,
      impactDesc:  newImpact.trim() || '—',
      actionsNotes: newNotes.trim() || '—',
      active:      true,
      acknowledged: false,
      timestamp:   new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setEmergencies(prev => [e, ...prev]);
    setNewTitle(''); setNewCategory('Supply Disruption');
    setNewSeverity('high'); setNewRegion('All Regions');
    setNewBranch(''); setNewImpact(''); setNewNotes('');
  };

  const updateNotes = (id: string, notes: string) => {
    setEmergencies(prev => prev.map(e => e.id === id ? { ...e, actionsNotes: notes } : e));
  };

  const resolveEmergency = (id: string) => {
    setEmergencies(prev => prev.map(e => e.id === id ? { ...e, active: false } : e));
  };

  const acknowledgeEmergency = (id: string) => {
    setEmergencies(prev => prev.map(e => e.id === id ? { ...e, acknowledged: true } : e));
  };

  const critCount = emergencies.filter(e => e.severity === 'critical' && e.active).length;
  const highCount = emergencies.filter(e => e.severity === 'high'     && e.active).length;
  const medCount  = emergencies.filter(e => e.severity === 'medium'   && e.active).length;
  const unackCount = emergencies.filter(e => e.active && !e.acknowledged).length;

  const SUB_TABS: { id: SubTab; label: string; badge?: string }[] = [
    { id: 'optimize',    label: 'Optimize Strategy' },
    { id: 'branch',      label: 'Branch Control',     badge: selectedRegion !== 'All Regions' ? selectedRegion : undefined },
    { id: 'overstock',   label: 'Overstock Manager' },
    { id: 'emergencies', label: 'Emergencies',         badge: unackCount > 0 ? String(unackCount) : undefined },
  ];

  const CATEGORIES = ['Supply Disruption', 'Logistics', 'Demand Surge', 'Infrastructure', 'External Event', 'Other'];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>Optimization Control Center</h2>
          <p className={styles.pageSub}>
            Full control over how the AI allocates priorities — globally, by region, or single branch.
          </p>
        </div>
        {applied && (
          <div className={styles.appliedBadge}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Strategy Active
          </div>
        )}
      </div>

      {/* Sub-tabs */}
      <div className={styles.subTabs}>
        {SUB_TABS.map(t => (
          <button
            key={t.id}
            className={`${styles.subTab} ${tab === t.id ? styles.subTabActive : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.badge && (
              <span className={`${styles.subBadge} ${t.id === 'emergencies' ? styles.subBadgeAlert : ''}`}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB: Optimize ── */}
      {tab === 'optimize' && (
        <div className={styles.optimizeLayout}>
          {/* Left: Sliders */}
          <div className={styles.sliderPanel}>
            <div className={styles.secLabel}>Quick Presets</div>
            <div className={styles.presets}>
              {Object.keys(PRESETS).map(name => (
                <button
                  key={name}
                  className={`${styles.presetBtn} ${activePreset === name ? styles.presetActive : ''}`}
                  onClick={() => applyPreset(name)}
                >
                  {name}
                </button>
              ))}
            </div>

            <div className={styles.secLabel} style={{ marginTop: 20 }}>Priority Weights</div>
            <div className={styles.sliders}>
              {weights.map(w => (
                <div key={w.id} className={styles.sliderRow}
                  style={{ '--row-color': w.color } as React.CSSProperties}>
                  <div className={styles.sliderTop}>
                    <span className={styles.sliderLabel}>{w.label}</span>
                    <span className={styles.sliderNum} style={{ color: w.color }}>{w.value}</span>
                  </div>
                  <div className={styles.gaugeTrack}>
                    <div
                      className={styles.gaugeFill}
                      style={{
                        width: `${w.value}%`,
                        background: `linear-gradient(90deg, ${w.color}80, ${w.color})`,
                        boxShadow: `0 0 8px ${w.color}40`,
                        transition: 'width 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                      }}
                    />
                    <input
                      type="range" min={0} max={100} value={w.value}
                      onChange={e => handleSlider(w.id, +e.target.value)}
                      className={styles.rangeInput}
                    />
                  </div>
                  <div className={styles.sliderDesc}>{w.description}</div>
                </div>
              ))}
            </div>

            <button className={styles.applyBtn} onClick={handleApply}>
              Apply
            </button>
          </div>

          {/* Centre: Radar */}
          <div className={styles.radarPanel}>
            <div className={styles.secLabel}>Strategy Profile</div>
            <div className={styles.radarWrap}>
              <Radar data={radarData} options={radarOptions as never} />
            </div>
            <div className={styles.radarLegend}>
              <span className={styles.radarLegItem}><span className={styles.radarDotActive} />Active</span>
              <span className={styles.radarLegItem}><span className={styles.radarDotBase} />Baseline</span>
            </div>
          </div>

          {/* Right: Impact grid */}
          <div className={styles.impactPanel}>
            <div className={styles.secLabel}>Projected KPI Impact</div>
            <div className={styles.impactGrid}>
              {impact.map(row => (
                <div
                  key={row.metric}
                  className={`${styles.impactCard} ${row.improved ? styles.impactGood : ''} ${row.worsened ? styles.impactBad : ''}`}
                >
                  <div className={styles.impactMetric}>{row.metric}</div>
                  <div className={styles.impactRow}>
                    <span className={styles.impactBase}>{row.baseline}{row.unit}</span>
                    <span>→</span>
                    <span className={styles.impactProj}
                      style={{ color: row.improved ? 'var(--ok)' : row.worsened ? 'var(--err)' : 'var(--text-2)' }}>
                      {row.projected}{row.unit}
                    </span>
                    <span className={`${styles.deltaPill} ${row.improved ? styles.dGood : row.worsened ? styles.dBad : styles.dFlat}`}>
                      {row.pct >= 0 ? '+' : ''}{row.pct}%
                    </span>
                  </div>
                  <div className={styles.impactBar}>
                    <div className={styles.impactBarFill}
                      style={{
                        width: `${Math.min(Math.abs(row.pct) * 5, 100)}%`,
                        background: row.improved ? 'var(--ok)' : row.worsened ? 'var(--err)' : 'var(--text-3)',
                        transition: 'width 0.5s ease',
                      }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Branch Control ── */}
      {tab === 'branch' && (
        <div className={styles.branchLayout}>
          <div className={styles.branchLeft}>
            <div className={styles.secLabel}>Scope</div>
            <div className={styles.scopeRow}>
              <div className={styles.regionSelect}>
                <label className={styles.fieldLabel}>Region</label>
                <select className={styles.select} value={selectedRegion}
                  onChange={e => { setSelectedRegion(e.target.value); setSelectedBranch(''); }}>
                  {Object.keys(REGIONS).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {selectedRegion !== 'All Regions' && (
                <div className={styles.branchSelect}>
                  <label className={styles.fieldLabel}>Branch (optional)</label>
                  <select className={styles.select} value={selectedBranch}
                    onChange={e => setSelectedBranch(e.target.value)}>
                    <option value="">All branches in {selectedRegion}</option>
                    {branchList.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className={styles.scopeInfo}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
              </svg>
              {selectedBranch
                ? `Overrides will apply to ${selectedBranch} only.`
                : selectedRegion === 'All Regions'
                  ? 'Changes will apply globally to all branches.'
                  : `Changes will apply to all ${branchList.length} branches in ${selectedRegion}.`}
            </div>

            <div className={styles.secLabel} style={{ marginTop: 20 }}>Branch Priority Weights</div>
            <div className={styles.sliders}>
              {branchWeights.map(w => (
                <div key={w.id} className={styles.sliderRow}
                  style={{ '--row-color': w.color } as React.CSSProperties}>
                  <div className={styles.sliderTop}>
                    <span className={styles.sliderLabel}>{w.label}</span>
                    <span className={styles.sliderNum} style={{ color: w.color }}>{w.value}</span>
                  </div>
                  <div className={styles.gaugeTrack}>
                    <div className={styles.gaugeFill}
                      style={{ width: `${w.value}%`, background: `linear-gradient(90deg, ${w.color}80, ${w.color})`, transition: 'width 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}
                    />
                    <input type="range" min={0} max={100} value={w.value}
                      onChange={e => {
                        setBranchApplied(false);
                        setBranchWeights(prev => prev.map(bw => bw.id === w.id ? { ...bw, value: +e.target.value } : bw));
                      }}
                      className={styles.rangeInput}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button className={styles.applyBtn}
              onClick={() => setBranchApplied(true)}>
              Apply to {selectedBranch || selectedRegion}
            </button>
            {branchApplied && (
              <div className={styles.appliedInline}>
                ✓ Applied to {selectedBranch || selectedRegion}
              </div>
            )}
          </div>

          <div className={styles.branchRight}>
            <div className={styles.secLabel}>Branch Performance Snapshot</div>
            <div className={styles.branchCards}>
              {(selectedRegion === 'All Regions' ? Object.values(REGIONS).flat().slice(0, 8) : branchList).map((branch, i) => {
                const score = 72 + ((i * 7 + 3) % 28);
                const color = score >= 90 ? 'var(--ok)' : score >= 75 ? 'var(--warn)' : 'var(--err)';
                return (
                  <div key={branch}
                    className={`${styles.branchCard} ${selectedBranch === branch ? styles.branchCardSelected : ''}`}
                    onClick={() => setSelectedBranch(branch === selectedBranch ? '' : branch)}>
                    <div className={styles.branchName}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.8"/>
                      </svg>
                      {branch}
                    </div>
                    <div className={styles.branchScore} style={{ color }}>
                      {score}<span className={styles.branchScoreLabel}>/100</span>
                    </div>
                    <div className={styles.branchBar}>
                      <div className={styles.branchBarFill} style={{ width: `${score}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Overstock ── */}
      {tab === 'overstock' && (
        <div className={styles.overstockLayout}>
          <div className={styles.overstockForm}>
            <div className={styles.secLabel}>Schedule Overstock Order</div>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Region</label>
                <select className={styles.select} value={overstockRegion}
                  onChange={e => { setOverstockRegion(e.target.value); setOverstockBranch(''); }}>
                  {Object.keys(REGIONS).map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              {overstockRegion !== 'All Regions' && (
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Branch (optional)</label>
                  <select className={styles.select} value={overstockBranch}
                    onChange={e => setOverstockBranch(e.target.value)}>
                    <option value="">All in {overstockRegion}</option>
                    {overstockBranchList.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              )}
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>SKU</label>
                <select className={styles.select} value={overstockSku}
                  onChange={e => setOverstockSku(e.target.value)}>
                  {OVERSTOCK_SKUS.map(s => (
                    <option key={s.sku} value={s.sku}>{s.sku} — {s.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Target Qty (units)</label>
                <input type="number" className={styles.inputField} value={overstockQty}
                  min={100} step={100} onChange={e => setOverstockQty(+e.target.value)} />
              </div>
              <div className={`${styles.formField} ${styles.formFieldFull}`}>
                <label className={styles.fieldLabel}>Reason</label>
                <input type="text" className={styles.inputField} value={overstockReason}
                  onChange={e => setOverstockReason(e.target.value)}
                  placeholder="e.g. Seasonal preparation, event pre-stock…" />
              </div>
            </div>

            <div className={styles.overstockPreview}>
              <div className={styles.overstockPreviewTitle}>Order Impact Preview</div>
              <div className={styles.previewGrid}>
                <div className={styles.previewItem}>
                  <span className={styles.previewKey}>Estimated Cost</span>
                  <span className={styles.previewVal} style={{ color: 'var(--warn)' }}>
                    EGP {(overstockQty * (PRICE_FORECAST.find(p => p.sku === overstockSku)?.currentPrice ?? 8)).toLocaleString()}
                  </span>
                </div>
                <div className={styles.previewItem}>
                  <span className={styles.previewKey}>Shelf-life Risk</span>
                  <span className={styles.previewVal} style={{ color: overstockQty > 1000 ? 'var(--warn)' : 'var(--ok)' }}>
                    {overstockQty > 1000 ? 'Medium' : 'Low'}
                  </span>
                </div>
                <div className={styles.previewItem}>
                  <span className={styles.previewKey}>Coverage Days</span>
                  <span className={styles.previewVal} style={{ color: 'var(--info)' }}>
                    ~{Math.round(overstockQty / 18)} days
                  </span>
                </div>
                <div className={styles.previewItem}>
                  <span className={styles.previewKey}>Stockout Probability</span>
                  <span className={styles.previewVal} style={{ color: 'var(--ok)' }}>
                    {Math.max(2, 18 - Math.floor(overstockQty / 100))}%
                  </span>
                </div>
              </div>
            </div>

            <button className={styles.applyBtn} onClick={() => setOverstockScheduled(true)} style={{ marginTop: 16 }}>
              Schedule Overstock Order
            </button>
            {overstockScheduled && (
              <div className={styles.appliedInline}>
                ✓ Order scheduled and queued for processing
              </div>
            )}
          </div>

          <div className={styles.overstockActive}>
            <div className={styles.secLabel}>Active Overstock Orders</div>
            {[
              { sku: 'CTZ-500', branch: 'All Cairo',   qty: 2400, reason: 'Seasonal preparation (spring)',  status: 'Confirmed',  cost: 'EGP 20.4K' },
              { sku: 'PRD-5',   branch: 'Alexandria',  qty: 800,  reason: 'Cold front weather forecast',    status: 'In Transit', cost: 'EGP 3.1K'  },
              { sku: 'OMP-20',  branch: 'Nasr City',   qty: 400,  reason: 'Demand spike detected',          status: 'Pending',    cost: 'EGP 2.7K'  },
              { sku: 'AUG-625', branch: 'Delta Region', qty: 600, reason: 'Customs delay contingency',      status: 'Confirmed',  cost: 'EGP 17.1K' },
            ].map((o, i) => (
              <div key={i} className={styles.osCard}>
                <div className={styles.osTop}>
                  <span className={styles.osSkuChip}>{o.sku}</span>
                  <span className={`pill ${o.status === 'Confirmed' ? 'pill-ok' : o.status === 'In Transit' ? 'pill-info' : 'pill-warn'}`}>
                    {o.status}
                  </span>
                </div>
                <div className={styles.osMeta}>{o.branch} · {o.qty.toLocaleString()} units · {o.cost}</div>
                <div className={styles.osReason}>{o.reason}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: Emergencies — purely human ── */}
      {tab === 'emergencies' && (
        <div className={styles.emergLayout}>
          {/* Stats bar */}
          <div className={styles.emergStatsRow}>
            <div className={`${styles.emergStat} ${styles.sevCritical}`}>
              <span className={styles.emergStatNum}>{critCount}</span>
              <span className={styles.emergStatLabel}>Critical</span>
            </div>
            <div className={`${styles.emergStat} ${styles.sevHigh}`}>
              <span className={styles.emergStatNum}>{highCount}</span>
              <span className={styles.emergStatLabel}>High</span>
            </div>
            <div className={`${styles.emergStat} ${styles.sevMedium}`}>
              <span className={styles.emergStatNum}>{medCount}</span>
              <span className={styles.emergStatLabel}>Medium</span>
            </div>
            <div className={styles.emergHumanNote}>
              This tab is for human-managed emergency records only. No automated responses are generated.
            </div>
          </div>

          {/* Add form */}
          <div className={styles.emergForm}>
            <div className={styles.emergFormTitle}>Log New Emergency</div>
            <div className={styles.emergFormGrid}>
              <div className={`${styles.formField} ${styles.formFieldFull}`}>
                <label className={styles.fieldLabel}>Title / Description *</label>
                <input type="text" className={styles.inputField} value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Brief description of the emergency situation" />
              </div>
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Category</label>
                <select className={styles.select} value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Severity</label>
                <select className={styles.select} value={newSeverity}
                  onChange={e => setNewSeverity(e.target.value as EmergencyRecord['severity'])}>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                </select>
              </div>
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Region</label>
                <select className={styles.select} value={newRegion}
                  onChange={e => { setNewRegion(e.target.value); setNewBranch(''); }}>
                  {Object.keys(REGIONS).map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              {newRegion !== 'All Regions' && (
                <div className={styles.formField}>
                  <label className={styles.fieldLabel}>Branch (optional)</label>
                  <select className={styles.select} value={newBranch}
                    onChange={e => setNewBranch(e.target.value)}>
                    <option value="">All in {newRegion}</option>
                    {newBranchList.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              )}
              <div className={`${styles.formField} ${styles.formFieldFull}`}>
                <label className={styles.fieldLabel}>Impact Description</label>
                <textarea className={`${styles.inputField} ${styles.textArea}`}
                  value={newImpact} onChange={e => setNewImpact(e.target.value)}
                  placeholder="Describe the operational impact, affected SKUs, branches, timeline…" rows={2} />
              </div>
              <div className={`${styles.formField} ${styles.formFieldFull}`}>
                <label className={styles.fieldLabel}>Actions / Notes</label>
                <textarea className={`${styles.inputField} ${styles.textArea}`}
                  value={newNotes} onChange={e => setNewNotes(e.target.value)}
                  placeholder="What steps have been taken or are planned?" rows={2} />
              </div>
            </div>
            <button className={styles.emergAddBtn} onClick={addEmergency}
              disabled={!newTitle.trim()}>
              Log Emergency
            </button>
          </div>

          {/* Emergency cards */}
          <div className={styles.emergList}>
            {emergencies.map(e => (
              <div key={e.id}
                className={`${styles.emergCard} ${getSeverityClass(e.severity)} ${!e.active ? styles.emergResolved : ''} ${e.acknowledged ? styles.emergAcked : ''}`}
              >
                <div className={styles.emergCardTop}>
                  <div className={styles.emergCardLeft}>
                    <span className={`${styles.sevPill} ${getSeverityClass(e.severity)}`}>
                      {e.severity.toUpperCase()}
                    </span>
                    <span className={styles.emergCat}>{e.category}</span>
                    <span className={styles.emergScope}>
                      {e.branch ? `${e.region} · ${e.branch}` : e.region}
                    </span>
                    <span className={styles.emergTs}>{e.timestamp}</span>
                  </div>
                  <div className={styles.emergCardActions}>
                    {e.active && !e.acknowledged && (
                      <button className={styles.emergAckBtn}
                        onClick={() => acknowledgeEmergency(e.id)}>
                        Acknowledge
                      </button>
                    )}
                    {e.active && (
                      <button className={styles.emergResolveBtn}
                        onClick={() => resolveEmergency(e.id)}>
                        Resolve
                      </button>
                    )}
                  </div>
                </div>

                <div className={styles.emergTitle}>{e.title}</div>

                <div className={styles.emergSection}>
                  <span className={styles.emergSectionLabel}>Impact</span>
                  <span className={styles.emergSectionText}>{e.impactDesc}</span>
                </div>

                <div className={styles.emergSection}>
                  <span className={styles.emergSectionLabel}>Actions / Notes</span>
                  {e.active ? (
                    <textarea
                      className={`${styles.inputField} ${styles.textArea} ${styles.emergNotesInput}`}
                      value={e.actionsNotes}
                      onChange={ev => updateNotes(e.id, ev.target.value)}
                      placeholder="Add notes or actions taken…"
                      rows={2}
                    />
                  ) : (
                    <span className={styles.emergSectionText}>{e.actionsNotes}</span>
                  )}
                </div>

                {!e.active && (
                  <div className={styles.emergResolvedBadge}>✓ Resolved</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
