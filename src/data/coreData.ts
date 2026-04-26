// ── Core data for the simplified focused dashboard ────────
// Demand Forecast → Replenishment Plan → Purchase Orders
// All three panels pull from here so numbers are consistent.

export const BRANCHES = [
  'Nasr City', 'Maadi', 'Zamalek', 'Heliopolis',
  'Smouha', '6th October', 'Dokki', 'New Cairo',
];

export const WAREHOUSES = [
  'WH-Cairo Central', 'WH-Alexandria', 'WH-Giza', 'WH-Delta',
];

export interface SkuInfo {
  sku: string; name: string; price: number; category: string;
}

export const SKUS: SkuInfo[] = [
  { sku: 'CTZ-500', name: 'Cetirizine 10mg',      price: 8.50,  category: 'Antihistamine' },
  { sku: 'AMX-250', name: 'Amoxicillin 250mg',    price: 12.00, category: 'Antibiotic'    },
  { sku: 'AUG-625', name: 'Augmentin 625mg',       price: 28.50, category: 'Antibiotic'    },
  { sku: 'MET-500', name: 'Metformin 500mg',       price: 4.20,  category: 'Diabetes'      },
  { sku: 'PAR-500', name: 'Paracetamol 500mg',     price: 3.20,  category: 'Analgesic'     },
  { sku: 'OMP-20',  name: 'Omeprazole 20mg',       price: 6.75,  category: 'GI'            },
  { sku: 'ATR-40',  name: 'Atorvastatin 40mg',     price: 14.50, category: 'Cardio'        },
  { sku: 'PRD-5',   name: 'Prednisolone 5mg',      price: 3.80,  category: 'Steroid'       },
  { sku: 'BRF-400', name: 'Brufen 400mg',           price: 6.80,  category: 'Analgesic'     },
  { sku: 'ZIP-250', name: 'Zithromax 250mg',        price: 18.40, category: 'Antibiotic'    },
];

// ── Daily demand (units / day) per branch per SKU ─────────
export const BRANCH_DAILY: Record<string, Record<string, number>> = {
  'Nasr City':   { 'CTZ-500':45, 'AMX-250':32, 'AUG-625':18, 'MET-500':28, 'PAR-500':65, 'OMP-20':22, 'ATR-40':15, 'PRD-5':12, 'BRF-400':25, 'ZIP-250':8  },
  'Maadi':       { 'CTZ-500':38, 'AMX-250':28, 'AUG-625':14, 'MET-500':24, 'PAR-500':58, 'OMP-20':19, 'ATR-40':13, 'PRD-5':10, 'BRF-400':21, 'ZIP-250':7  },
  'Zamalek':     { 'CTZ-500':22, 'AMX-250':15, 'AUG-625':9,  'MET-500':18, 'PAR-500':34, 'OMP-20':12, 'ATR-40':11, 'PRD-5':6,  'BRF-400':14, 'ZIP-250':5  },
  'Heliopolis':  { 'CTZ-500':41, 'AMX-250':29, 'AUG-625':16, 'MET-500':22, 'PAR-500':60, 'OMP-20':20, 'ATR-40':14, 'PRD-5':11, 'BRF-400':23, 'ZIP-250':7  },
  'Smouha':      { 'CTZ-500':35, 'AMX-250':24, 'AUG-625':12, 'MET-500':20, 'PAR-500':52, 'OMP-20':17, 'ATR-40':12, 'PRD-5':9,  'BRF-400':19, 'ZIP-250':6  },
  '6th October': { 'CTZ-500':28, 'AMX-250':19, 'AUG-625':10, 'MET-500':16, 'PAR-500':42, 'OMP-20':14, 'ATR-40':9,  'PRD-5':7,  'BRF-400':16, 'ZIP-250':5  },
  'Dokki':       { 'CTZ-500':31, 'AMX-250':22, 'AUG-625':11, 'MET-500':19, 'PAR-500':47, 'OMP-20':16, 'ATR-40':11, 'PRD-5':8,  'BRF-400':17, 'ZIP-250':5  },
  'New Cairo':   { 'CTZ-500':42, 'AMX-250':30, 'AUG-625':17, 'MET-500':26, 'PAR-500':63, 'OMP-20':21, 'ATR-40':14, 'PRD-5':11, 'BRF-400':24, 'ZIP-250':8  },
};

// ── Daily throughput (units / day) per warehouse per SKU ──
export const WAREHOUSE_DAILY: Record<string, Record<string, number>> = {
  'WH-Cairo Central': { 'CTZ-500':180,'AMX-250':130,'AUG-625':75, 'MET-500':110,'PAR-500':260,'OMP-20':88, 'ATR-40':62, 'PRD-5':48, 'BRF-400':100,'ZIP-250':33 },
  'WH-Alexandria':    { 'CTZ-500':85, 'AMX-250':60, 'AUG-625':33, 'MET-500':50, 'PAR-500':120,'OMP-20':41, 'ATR-40':29, 'PRD-5':22, 'BRF-400':47, 'ZIP-250':15 },
  'WH-Giza':          { 'CTZ-500':65, 'AMX-250':46, 'AUG-625':25, 'MET-500':38, 'PAR-500':92, 'OMP-20':31, 'ATR-40':22, 'PRD-5':17, 'BRF-400':36, 'ZIP-250':12 },
  'WH-Delta':         { 'CTZ-500':55, 'AMX-250':38, 'AUG-625':20, 'MET-500':32, 'PAR-500':78, 'OMP-20':26, 'ATR-40':18, 'PRD-5':14, 'BRF-400':30, 'ZIP-250':10 },
};

// ── Current stock per branch per SKU ──────────────────────
export const BRANCH_STOCK: Record<string, Record<string, number>> = {
  'Nasr City':   { 'CTZ-500':180, 'AMX-250':64,  'AUG-625':42,  'MET-500':196,'PAR-500':325,'OMP-20':110,'ATR-40':120,'PRD-5':72, 'BRF-400':100,'ZIP-250':24 },
  'Maadi':       { 'CTZ-500':228, 'AMX-250':140, 'AUG-625':28,  'MET-500':144,'PAR-500':290,'OMP-20':95, 'ATR-40':91, 'PRD-5':60, 'BRF-400':84, 'ZIP-250':28 },
  'Zamalek':     { 'CTZ-500':132, 'AMX-250':90,  'AUG-625':18,  'MET-500':108,'PAR-500':170,'OMP-20':72, 'ATR-40':77, 'PRD-5':36, 'BRF-400':56, 'ZIP-250':20 },
  'Heliopolis':  { 'CTZ-500':82,  'AMX-250':58,  'AUG-625':16,  'MET-500':132,'PAR-500':240,'OMP-20':80, 'ATR-40':84, 'PRD-5':44, 'BRF-400':69, 'ZIP-250':21 },
  'Smouha':      { 'CTZ-500':210, 'AMX-250':120, 'AUG-625':60,  'MET-500':160,'PAR-500':364,'OMP-20':119,'ATR-40':108,'PRD-5':63, 'BRF-400':95, 'ZIP-250':30 },
  '6th October': { 'CTZ-500':84,  'AMX-250':38,  'AUG-625':20,  'MET-500':96, 'PAR-500':126,'OMP-20':56, 'ATR-40':54, 'PRD-5':28, 'BRF-400':48, 'ZIP-250':15 },
  'Dokki':       { 'CTZ-500':155, 'AMX-250':88,  'AUG-625':33,  'MET-500':152,'PAR-500':282,'OMP-20':96, 'ATR-40':99, 'PRD-5':56, 'BRF-400':85, 'ZIP-250':25 },
  'New Cairo':   { 'CTZ-500':126, 'AMX-250':60,  'AUG-625':17,  'MET-500':156,'PAR-500':252,'OMP-20':84, 'ATR-40':98, 'PRD-5':44, 'BRF-400':72, 'ZIP-250':16 },
};

export const WAREHOUSE_STOCK: Record<string, Record<string, number>> = {
  'WH-Cairo Central': { 'CTZ-500':900,'AMX-250':520,'AUG-625':225,'MET-500':660,'PAR-500':1300,'OMP-20':440,'ATR-40':310,'PRD-5':240,'BRF-400':500,'ZIP-250':99  },
  'WH-Alexandria':    { 'CTZ-500':255,'AMX-250':120,'AUG-625':33, 'MET-500':200,'PAR-500':360, 'OMP-20':123,'ATR-40':87, 'PRD-5':66, 'BRF-400':141,'ZIP-250':30  },
  'WH-Giza':          { 'CTZ-500':325,'AMX-250':230,'AUG-625':125,'MET-500':304,'PAR-500':552, 'OMP-20':217,'ATR-40':154,'PRD-5':119,'BRF-400':252,'ZIP-250':84  },
  'WH-Delta':         { 'CTZ-500':275,'AMX-250':190,'AUG-625':60, 'MET-500':256,'PAR-500':468, 'OMP-20':182,'ATR-40':126,'PRD-5':98, 'BRF-400':210,'ZIP-250':70  },
};

// ── Supplier per SKU ──────────────────────────────────────
export const SKU_SUPPLIER: Record<string, string> = {
  'CTZ-500': 'EIPICO',
  'AMX-250': 'Sigma Pharma',
  'AUG-625': 'Kahira Pharma',
  'MET-500': 'EIPICO',
  'PAR-500': 'SEDICO',
  'OMP-20':  'Pharco B',
  'ATR-40':  'Al-Debeiky Pharma',
  'PRD-5':   'SEDICO',
  'BRF-400': 'Sigma Pharma',
  'ZIP-250': 'Kahira Pharma',
};

// ── Supplier payment terms ────────────────────────────────
export const SUPPLIER_TERMS: Record<string, { type: string; days: number }> = {
  'EIPICO':            { type: 'Net-30',  days: 30 },
  'Sigma Pharma':      { type: 'Net-45',  days: 45 },
  'Kahira Pharma':     { type: 'Cash',    days: 0  },
  'SEDICO':            { type: 'Net-30',  days: 30 },
  'Pharco B':          { type: 'Net-60',  days: 60 },
  'Al-Debeiky Pharma': { type: 'Net-15',  days: 15 },
};

// ── Supplier lead time (days) ─────────────────────────────
export const SUPPLIER_LEAD: Record<string, number> = {
  'EIPICO':            3,
  'Sigma Pharma':      4,
  'Kahira Pharma':     2,
  'SEDICO':            3,
  'Pharco B':          5,
  'Al-Debeiky Pharma': 2,
};

// ── Helper: add business days to a date ──────────────────
export function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

export function fmtDate(d: Date) {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Coverage days calculation ─────────────────────────────
export function coverageDays(stock: number, dailyDemand: number): number {
  if (dailyDemand === 0) return 99;
  return Math.floor(stock / dailyDemand);
}

export function coverageStatus(days: number): 'critical' | 'low' | 'ok' {
  if (days <= 3)  return 'critical';
  if (days <= 7)  return 'low';
  return 'ok';
}
