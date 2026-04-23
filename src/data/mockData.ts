// ── KPI data ──────────────────────────────────────────────
export interface KpiDef {
  id: string;
  label: string;
  value: string;
  numericValue: number;
  unit: string;
  delta: string;
  deltaPositive: boolean;
  insight: string;
}

export const KPI_DATA: KpiDef[] = [
  { id: 'revenue',    label: 'Total Revenue',        value: '84.2',  numericValue: 84.2,  unit: 'M EGP',  delta: '+12.4%', deltaPositive: true,  insight: 'Driven by spring seasonal demand across Cairo and Alexandria branches.' },
  { id: 'gpm',        label: 'Gross Profit Margin',  value: '38.4',  numericValue: 38.4,  unit: '%',      delta: '+4.1pp', deltaPositive: true,  insight: 'Margin expansion via supplier consolidation and expiry waste reduction.' },
  { id: 'velocity',   label: 'Sales Cycle Velocity', value: '4.2',   numericValue: 4.2,   unit: 'days',   delta: '-1.8d',  deltaPositive: true,  insight: 'Cycle compressed from 6.0 days — now 30% faster than prior period.' },
  { id: 'cashflow',   label: 'Net Cash Flow',         value: '12.6',  numericValue: 12.6,  unit: 'M EGP',  delta: '+31.2%', deltaPositive: true,  insight: 'Working capital freed up through optimised payment scheduling and bulk POs.' },
  { id: 'roi',        label: 'ROI on AI Platform',   value: '7.3',   numericValue: 7.3,   unit: '×',      delta: '+0.9×',  deltaPositive: true,  insight: 'Derived from EGP 4.7M waste saved, 184 stockouts prevented and velocity gain.' },
  { id: 'stock',      label: 'Stock Availability',   value: '97.8',  numericValue: 97.8,  unit: '%',      delta: '+5.2pp', deltaPositive: true,  insight: '3.8pp above prior period and 4pp above the sector average of 94%.' },
];

// ── Accuracy trend (12 months) ─────────────────────────────
export const ACCURACY_TREND = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  values: [88.4, 89.7, 91.0, 92.4, 93.1, 93.8, 94.5, 95.1, 95.8, 96.5, 97.1, 97.8],
};

// ── Monthly revenue trend ──────────────────────────────────
export const MONTHLY_REVENUE = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  values: [58.4, 61.2, 67.8, 70.1, 72.4, 74.9, 76.2, 77.8, 79.3, 80.7, 82.1, 84.2],
};

// ── Calendar events ────────────────────────────────────────
export interface CalendarEvent {
  label: string;
  date: string;
  color: string;
  note: string;
}

export const CALENDAR_EVENTS: CalendarEvent[] = [
  { label: 'Ramadan (March)',     date: '2025-03-01', color: '#F59E0B', note: '✓ AI action taken' },
  { label: 'Eid Al-Fitr',        date: '2025-03-30', color: '#4ade80', note: '✓ AI action taken' },
  { label: 'Cold Front — Cairo', date: '2025-04-08', color: '#60a5fa', note: '✓ AI action taken' },
  { label: 'Eid Al-Adha (June)', date: '2025-06-06', color: '#E1541D', note: '✓ AI action taken' },
  { label: 'Back-to-School',     date: '2025-09-01', color: '#a78bfa', note: '✓ AI action taken' },
  { label: 'Winter Season',      date: '2025-12-01', color: '#60a5fa', note: '✓ AI action taken' },
];

// ── SKU demand table ───────────────────────────────────────
export interface SkuRow {
  sku: string;
  name: string;
  demandScore: number;
  status: 'Stocked' | 'Transit';
  aiAction: string;
}

export const SKU_TABLE: SkuRow[] = [
  { sku: 'CTZ-500', name: 'Cetirizine 10mg',      demandScore: 96, status: 'Stocked', aiAction: 'Pre-positioned · 3 branches'    },
  { sku: 'AMX-250', name: 'Amoxicillin 250mg',    demandScore: 88, status: 'Stocked', aiAction: 'Reorder fired · ETA 2 days'     },
  { sku: 'AUG-625', name: 'Augmentin 625mg',      demandScore: 85, status: 'Transit', aiAction: 'Emergency PO confirmed'         },
  { sku: 'OMP-20',  name: 'Omeprazole 20mg',      demandScore: 83, status: 'Transit', aiAction: 'Transfer in progress'           },
  { sku: 'MET-500', name: 'Metformin 500mg',      demandScore: 79, status: 'Stocked', aiAction: 'Cycle closed · EGP 84K'         },
  { sku: 'PAR-500', name: 'Paracetamol 500mg',    demandScore: 77, status: 'Stocked', aiAction: 'Stock level optimal'            },
  { sku: 'ATR-40',  name: 'Atorvastatin 40mg',    demandScore: 74, status: 'Transit', aiAction: 'PO fired · 240 units'           },
  { sku: 'LOS-50',  name: 'Losartan 50mg',        demandScore: 68, status: 'Stocked', aiAction: 'Optimal stock level'            },
  { sku: 'BRF-400', name: 'Brufen 400mg',         demandScore: 65, status: 'Stocked', aiAction: 'Demand signal rising +12%'      },
  { sku: 'PRD-5',   name: 'Prednisolone 5mg',     demandScore: 61, status: 'Stocked', aiAction: 'Weather trigger applied'        },
  { sku: 'ZIP-250', name: 'Zithromax 250mg',      demandScore: 58, status: 'Transit', aiAction: 'Cold-season pre-position active' },
  { sku: 'IBU-400', name: 'Ibuprofen 400mg',      demandScore: 55, status: 'Transit', aiAction: 'Dead stock cleared · 3 sites'   },
  { sku: 'CLR-10',  name: 'Clarithromycin 250mg', demandScore: 51, status: 'Stocked', aiAction: 'Seasonal batch incoming'        },
  { sku: 'AML-5',   name: 'Amlodipine 5mg',       demandScore: 48, status: 'Stocked', aiAction: 'Replenishment cycle complete'   },
];

// ── Supply chain flows ─────────────────────────────────────
export interface FlowItem {
  from: string;
  to: string;
  units: number;
  sku: string;
  status: 'In Transit' | 'Delivered' | 'Pending';
}

export const FLOW_DATA: FlowItem[] = [
  { from: 'WH-Cairo-Central', to: 'Branch-Nasr-City',    units: 480, sku: 'CTZ-500', status: 'In Transit' },
  { from: 'WH-Alexandria',    to: 'Branch-Smouha',       units: 220, sku: 'AMX-250', status: 'Delivered'  },
  { from: 'WH-Cairo-Central', to: 'Branch-Maadi',        units: 150, sku: 'OMP-20',  status: 'In Transit' },
  { from: 'Supplier-EIPICO',  to: 'WH-Cairo-Central',    units: 900, sku: 'MET-500', status: 'Pending'    },
  { from: 'Branch-Zamalek',   to: 'Branch-Heliopolis',   units: 80,  sku: 'ATR-40',  status: 'Delivered'  },
  { from: 'WH-Giza',          to: 'Branch-6th-October',  units: 340, sku: 'LOS-50',  status: 'In Transit' },
  { from: 'Supplier-Sigma',   to: 'WH-Alexandria',       units: 600, sku: 'AUG-625', status: 'Pending'    },
  { from: 'WH-Cairo-Central', to: 'Branch-New-Cairo',    units: 200, sku: 'PAR-500', status: 'Delivered'  },
  { from: 'Branch-Dokki',     to: 'Branch-Mohandessin',  units: 120, sku: 'PRD-5',   status: 'In Transit' },
  { from: 'WH-Delta',         to: 'Branch-Tanta',        units: 450, sku: 'IBU-400', status: 'Pending'    },
  { from: 'Supplier-SEDICO',  to: 'WH-Giza',             units: 720, sku: 'ZIP-250', status: 'Pending'    },
  { from: 'WH-Cairo-Central', to: 'Branch-Zamalek',      units: 90,  sku: 'BRF-400', status: 'Delivered'  },
];

export const SUPPLY_MINI_STATS = [
  { label: 'Transfers',  value: '63',       sub: 'Active routes' },
  { label: 'POs Fired',  value: '38',       sub: 'This month'    },
  { label: 'In Transit', value: 'EGP 3.8M', sub: 'Value moving'  },
];

// ── Inventory mini stats ────────────────────────────────────
export interface InventoryStat {
  label: string;
  count: string;
  value: string;
  color: string;
}

export const INVENTORY_STATS: InventoryStat[] = [
  { label: 'Overstock Resolved',      count: '47',    value: 'EGP 3.2M',  color: 'var(--info)'   },
  { label: 'Stockouts Prevented',     count: '184',   value: 'EGP 11.7M', color: 'var(--ok)'     },
  { label: 'Transfers Executed',      count: '1,140', value: 'EGP 4.6M',  color: 'var(--accent)' },
  { label: 'Dead Stock Eliminated',   count: '93',    value: 'EGP 2.4M',  color: 'var(--warn)'   },
  { label: 'Replenishment Cycles',    count: '1,820', value: 'EGP 21.3M', color: 'var(--ok)'     },
  { label: 'Emergency POs Resolved',  count: '12',    value: 'EGP 0.9M',  color: 'var(--err)'    },
];

// ── Holding days before/after ──────────────────────────────
export const HOLDING_DAYS = {
  labels:  ['CTZ-500', 'AMX-250', 'AUG-625', 'OMP-20', 'MET-500', 'ATR-40', 'LOS-50', 'PRD-5', 'IBU-400', 'PAR-500'],
  before:  [28, 34, 31, 22, 41, 19, 30, 26, 38, 24],
  after:   [11, 14, 12,  9, 16,  8, 12, 10, 15,  9],
};

// ── Branch performance ─────────────────────────────────────
export interface BranchPerf {
  branch: string; region: string;
  score: number; revenue: string; stockout: number; waste: number;
}

export const BRANCH_PERFORMANCE: BranchPerf[] = [
  { branch: 'Nasr City',    region: 'Greater Cairo', score: 94, revenue: 'EGP 8.2M',  stockout: 1.2, waste: 0.8 },
  { branch: 'Maadi',        region: 'Greater Cairo', score: 91, revenue: 'EGP 7.4M',  stockout: 1.8, waste: 1.1 },
  { branch: 'Zamalek',      region: 'Greater Cairo', score: 88, revenue: 'EGP 5.1M',  stockout: 2.1, waste: 1.4 },
  { branch: 'Heliopolis',   region: 'Greater Cairo', score: 90, revenue: 'EGP 6.8M',  stockout: 1.5, waste: 0.9 },
  { branch: 'Mohandessin',  region: 'Greater Cairo', score: 86, revenue: 'EGP 5.6M',  stockout: 2.4, waste: 1.7 },
  { branch: 'Dokki',        region: 'Greater Cairo', score: 84, revenue: 'EGP 4.9M',  stockout: 2.7, waste: 2.0 },
  { branch: 'New Cairo',    region: 'Greater Cairo', score: 92, revenue: 'EGP 7.9M',  stockout: 1.3, waste: 0.7 },
  { branch: '6th October',  region: 'Greater Cairo', score: 82, revenue: 'EGP 4.3M',  stockout: 3.1, waste: 2.3 },
  { branch: 'Smouha',       region: 'Alexandria',    score: 89, revenue: 'EGP 6.2M',  stockout: 1.9, waste: 1.2 },
  { branch: 'Sidi Gaber',   region: 'Alexandria',    score: 85, revenue: 'EGP 4.8M',  stockout: 2.5, waste: 1.8 },
  { branch: 'Tanta',        region: 'Delta',         score: 80, revenue: 'EGP 3.9M',  stockout: 3.4, waste: 2.6 },
  { branch: 'Mansoura',     region: 'Delta',         score: 78, revenue: 'EGP 3.6M',  stockout: 3.8, waste: 3.0 },
];

// ── ROI comparison ─────────────────────────────────────────
export interface RoiMetric {
  label: string;
  before: string;
  after: string;
  positive: boolean;
}

export const ROI_METRICS: RoiMetric[] = [
  { label: 'Gross Margin',     before: '28.1%',    after: '38.4%',    positive: true  },
  { label: 'Waste Cost',       before: 'EGP 6.8M', after: 'EGP 2.1M', positive: true  },
  { label: 'Sales Cycles',     before: '6.0 days', after: '4.2 days',  positive: true  },
  { label: 'Cash Flow',        before: 'EGP 4.2M', after: 'EGP 12.6M', positive: true  },
  { label: 'Stock Avail.',     before: '82.6%',    after: '97.8%',    positive: true  },
  { label: 'Holding Days',     before: '31 days',  after: '12 days',   positive: true  },
];

export const ROI_BAR_DATA = {
  labels: ['Revenue Uplift', 'Waste Reduction', 'Working Capital', 'Distribution'],
  values: [14.8, 3.2, 6.7, 2.1],
};

// ── Decision log seed ──────────────────────────────────────
export interface DecisionEntry {
  id: string;
  timestamp: string;
  text: string;
  confidence: number;
}

const BRANCHES = [
  'Nasr-City', 'Maadi', 'Zamalek', 'Heliopolis', 'Smouha',
  '6th-October', 'Dokki', 'Mohandessin', 'New-Cairo', 'Obour',
  'Tanta', 'Mansoura', 'Sidi-Gaber',
];
const SUPPLIERS = ['EIPICO', 'Sigma Pharma', 'Kahira Pharma', 'SEDICO', 'Pharco B', 'Al-Debeiky Pharma'];
const SKUS_LIST = ['CTZ-500', 'AMX-250', 'AUG-625', 'OMP-20', 'MET-500', 'ATR-40', 'LOS-50', 'PRD-5', 'IBU-400', 'PAR-500', 'BRF-400', 'ZIP-250'];

function rand(n: number) { return Math.floor(Math.random() * n); }
function pick<T>(arr: T[]): T { return arr[rand(arr.length)]; }
function ts() {
  const d = new Date(Date.now() - rand(3600000));
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function generateDecision(): DecisionEntry {
  const sku  = pick(SKUS_LIST);
  const br1  = pick(BRANCHES);
  const br2  = pick(BRANCHES.filter(b => b !== br1));
  const n    = (rand(400) + 50);
  const k    = ((rand(120) + 20));
  const days = (rand(5) + 2);
  const conf = +(0.82 + Math.random() * 0.16).toFixed(2);

  const templates = [
    `Transferred ${n} units of ${sku} · Branch ${br1} → Branch ${br2} · Stockout prevented · EGP ${k}K secured`,
    `Fired PO to ${pick(SUPPLIERS)} · ${n} units ${sku} · Demand build · ETA ${days} days`,
    `Shelf-life intervention · ${n} units ${sku} moved to Branch ${br2} · EGP ${k}K loss avoided`,
    `Weather trigger · Cold front detected · ${n} units Cetirizine pre-positioned · ${rand(6) + 3} branches`,
    `Replenishment cycle closed · ${sku} · Branch ${br1} · EGP ${k}K revenue cycle complete`,
    `Monthly refill cycle · ${n} units ${sku} auto-reordered · ${rand(8) + 4} branches restocked`,
    `Demand spike detected · ${sku} up ${rand(40)+15}% · Pre-position order dispatched to ${br2}`,
    `Bulk PO consolidated · ${pick(SUPPLIERS)} · ${n * 3} units across 3 SKUs · EGP ${k * 2}K saved`,
    `Expiry alert cleared · ${n} units ${sku} redistributed from ${br1} before expiry window`,
    `Cash-flow trigger · Deferred low-priority PO · ${sku} · Saved EGP ${k}K in working capital`,
  ];

  return {
    id: Math.random().toString(36).slice(2),
    timestamp: ts(),
    text: pick(templates),
    confidence: conf,
  };
}

export function seedDecisions(): DecisionEntry[] {
  return Array.from({ length: 10 }, generateDecision);
}

// ── Control Center ─────────────────────────────────────────
export interface OptimizationWeight {
  id: string;
  label: string;
  description: string;
  value: number;       // 0–100
  color: string;
}

export const DEFAULT_WEIGHTS: OptimizationWeight[] = [
  { id: 'roi',          label: 'ROI Maximisation',    description: 'Prioritise actions that generate highest financial return',        value: 70, color: '#E1541D' },
  { id: 'shelflife',    label: 'Shelf-life / Waste',  description: 'Minimise expiry losses and overstock write-offs',                   value: 55, color: '#F59E0B' },
  { id: 'availability', label: 'Stock Availability',  description: 'Ensure maximum in-stock rate across all branches',                  value: 80, color: '#4ade80' },
  { id: 'cashflow',     label: 'Cash Flow Speed',     description: 'Reduce days-sales-outstanding and working capital lock-up',         value: 60, color: '#60a5fa' },
  { id: 'distribution', label: 'Distribution Speed',  description: 'Accelerate transfer and replenishment cycle times',                 value: 50, color: '#a78bfa' },
];

export interface ImpactRow {
  metric: string;
  baseline: number;
  unit: string;
  higherIsBetter: boolean;
  sensitivities: Record<string, number>;
}

export const IMPACT_MATRIX: ImpactRow[] = [
  { metric: 'Gross Margin %',     baseline: 38.4, unit: '%',  higherIsBetter: true,  sensitivities: { roi: +0.4,  shelflife: +0.2, availability: +0.1, cashflow: +0.15, distribution: +0.05 } },
  { metric: 'Waste Cost (M EGP)', baseline: 2.1,  unit: 'M', higherIsBetter: false, sensitivities: { roi: +0.05, shelflife: -0.2, availability: -0.1, cashflow: -0.05, distribution: -0.03 } },
  { metric: 'Sales Velocity (d)', baseline: 4.2,  unit: 'd', higherIsBetter: false, sensitivities: { roi: -0.05, shelflife: +0.02,availability: -0.08,cashflow: -0.12, distribution: -0.15 } },
  { metric: 'Cash Flow (M EGP)',  baseline: 12.6, unit: 'M', higherIsBetter: true,  sensitivities: { roi: +0.3,  shelflife: +0.1, availability: +0.2, cashflow: +0.5,  distribution: +0.1  } },
  { metric: 'Stock Avail. %',     baseline: 97.8, unit: '%', higherIsBetter: true,  sensitivities: { roi: -0.1,  shelflife: -0.15,availability: +0.3, cashflow: +0.05, distribution: +0.1  } },
  { metric: 'Holding Days',       baseline: 12.0, unit: 'd', higherIsBetter: false, sensitivities: { roi: +0.15, shelflife: -0.3, availability: +0.2, cashflow: -0.1,  distribution: -0.2  } },
];

// ── Price Forecast ─────────────────────────────────────────
export interface PriceForecastRow {
  sku: string;
  name: string;
  currentPrice: number;
  d30Price: number;
  d90Price: number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  driver: string;
  category: string;
}

export const PRICE_FORECAST: PriceForecastRow[] = [
  { sku: 'CTZ-500', name: 'Cetirizine 10mg',      currentPrice: 8.50,  d30Price: 9.20,  d90Price: 9.80,  trend: 'up',     confidence: 87, driver: 'Seasonal allergy peak',       category: 'Antihistamine' },
  { sku: 'AMX-250', name: 'Amoxicillin 250mg',    currentPrice: 12.00, d30Price: 11.40, d90Price: 10.80, trend: 'down',   confidence: 72, driver: 'Generic competition entry',    category: 'Antibiotic'    },
  { sku: 'OMP-20',  name: 'Omeprazole 20mg',      currentPrice: 6.75,  d30Price: 6.90,  d90Price: 7.20,  trend: 'up',     confidence: 65, driver: 'API cost increase',            category: 'GI'            },
  { sku: 'MET-500', name: 'Metformin 500mg',      currentPrice: 4.20,  d30Price: 4.18,  d90Price: 4.15,  trend: 'stable', confidence: 91, driver: 'Stable generic supply',        category: 'Diabetes'      },
  { sku: 'ATR-40',  name: 'Atorvastatin 40mg',    currentPrice: 14.50, d30Price: 13.80, d90Price: 12.90, trend: 'down',   confidence: 78, driver: 'Multi-source approval',        category: 'Cardio'        },
  { sku: 'LOS-50',  name: 'Losartan 50mg',        currentPrice: 9.30,  d30Price: 9.50,  d90Price: 9.80,  trend: 'up',     confidence: 69, driver: 'Raw material shortage',        category: 'Cardio'        },
  { sku: 'PRD-5',   name: 'Prednisolone 5mg',     currentPrice: 3.80,  d30Price: 4.10,  d90Price: 4.60,  trend: 'up',     confidence: 83, driver: 'Demand spike post-winter',     category: 'Steroid'       },
  { sku: 'IBU-400', name: 'Ibuprofen 400mg',      currentPrice: 5.60,  d30Price: 5.30,  d90Price: 4.90,  trend: 'down',   confidence: 74, driver: 'OTC market saturation',        category: 'Analgesic'     },
  { sku: 'AUG-625', name: 'Augmentin 625mg',      currentPrice: 28.50, d30Price: 29.80, d90Price: 31.20, trend: 'up',     confidence: 80, driver: 'Import cost & EGP pressure',   category: 'Antibiotic'    },
  { sku: 'PAR-500', name: 'Paracetamol 500mg',    currentPrice: 3.20,  d30Price: 3.25,  d90Price: 3.30,  trend: 'stable', confidence: 94, driver: 'Fully localised production',   category: 'Analgesic'     },
  { sku: 'ZIP-250', name: 'Zithromax 250mg',      currentPrice: 18.40, d30Price: 17.60, d90Price: 16.80, trend: 'down',   confidence: 71, driver: 'Biosimilar market entry',      category: 'Antibiotic'    },
  { sku: 'BRF-400', name: 'Brufen 400mg',         currentPrice: 6.80,  d30Price: 7.10,  d90Price: 7.40,  trend: 'up',     confidence: 68, driver: 'Packaging cost increase',      category: 'Analgesic'     },
];

export const PRICE_HISTORY: Record<string, number[]> = {
  'CTZ-500': [7.80, 7.95, 8.10, 8.30, 8.50, 9.20, 9.80],
  'AMX-250': [13.20, 12.90, 12.60, 12.20, 12.00, 11.40, 10.80],
  'ATR-40':  [15.80, 15.40, 15.10, 14.80, 14.50, 13.80, 12.90],
  'PRD-5':   [3.20, 3.35, 3.50, 3.65, 3.80, 4.10, 4.60],
  'AUG-625': [24.00, 25.20, 26.10, 27.00, 28.50, 29.80, 31.20],
  'ZIP-250': [20.10, 19.80, 19.40, 18.90, 18.40, 17.60, 16.80],
};
export const PRICE_HISTORY_LABELS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar (F)', 'Jun (F)'];

// ── SKU Affinity ───────────────────────────────────────────
export interface AffinityPair {
  skuA: string; nameA: string;
  skuB: string; nameB: string;
  copurchaseRate: number;
  condition: string;
  bothStocked: number; onlyA: number; onlyB: number; totalBranches: number;
  gapAlert: boolean;
}

export const AFFINITY_PAIRS: AffinityPair[] = [
  { skuA: 'CTZ-500', nameA: 'Cetirizine',   skuB: 'PRD-5',   nameB: 'Prednisolone', copurchaseRate: 78, condition: 'Clinical',   bothStocked: 12, onlyA: 3, onlyB: 2, totalBranches: 17, gapAlert: true  },
  { skuA: 'AMX-250', nameA: 'Amoxicillin',  skuB: 'OMP-20',  nameB: 'Omeprazole',   copurchaseRate: 65, condition: 'Clinical',   bothStocked: 15, onlyA: 1, onlyB: 1, totalBranches: 17, gapAlert: false },
  { skuA: 'ATR-40',  nameA: 'Atorvastatin', skuB: 'LOS-50',  nameB: 'Losartan',     copurchaseRate: 71, condition: 'Behavioral', bothStocked: 14, onlyA: 2, onlyB: 1, totalBranches: 17, gapAlert: true  },
  { skuA: 'MET-500', nameA: 'Metformin',    skuB: 'ATR-40',  nameB: 'Atorvastatin', copurchaseRate: 58, condition: 'Clinical',   bothStocked: 16, onlyA: 0, onlyB: 1, totalBranches: 17, gapAlert: false },
  { skuA: 'IBU-400', nameA: 'Ibuprofen',    skuB: 'OMP-20',  nameB: 'Omeprazole',   copurchaseRate: 52, condition: 'Clinical',   bothStocked: 13, onlyA: 2, onlyB: 2, totalBranches: 17, gapAlert: true  },
  { skuA: 'CTZ-500', nameA: 'Cetirizine',   skuB: 'IBU-400', nameB: 'Ibuprofen',    copurchaseRate: 44, condition: 'Seasonal',   bothStocked: 15, onlyA: 1, onlyB: 1, totalBranches: 17, gapAlert: false },
  { skuA: 'AUG-625', nameA: 'Augmentin',    skuB: 'PAR-500', nameB: 'Paracetamol',  copurchaseRate: 61, condition: 'Clinical',   bothStocked: 14, onlyA: 2, onlyB: 1, totalBranches: 17, gapAlert: true  },
  { skuA: 'LOS-50',  nameA: 'Losartan',     skuB: 'MET-500', nameB: 'Metformin',    copurchaseRate: 49, condition: 'Clinical',   bothStocked: 15, onlyA: 1, onlyB: 1, totalBranches: 17, gapAlert: false },
];

export const BRANCH_AFFINITY_GAPS: Array<{ branch: string; pairs: string[] }> = [
  { branch: 'Nasr-City',    pairs: ['CTZ-500 / PRD-5'] },
  { branch: 'Heliopolis',   pairs: ['ATR-40 / LOS-50', 'IBU-400 / OMP-20'] },
  { branch: 'Zamalek',      pairs: ['CTZ-500 / PRD-5', 'AUG-625 / PAR-500'] },
  { branch: '6th-October',  pairs: ['IBU-400 / OMP-20'] },
  { branch: 'Mohandessin',  pairs: ['ATR-40 / LOS-50'] },
  { branch: 'Tanta',        pairs: ['AUG-625 / PAR-500', 'CTZ-500 / PRD-5'] },
];
