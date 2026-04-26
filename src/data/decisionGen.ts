export interface Decision {
  id: string;
  timestamp: string;
  type: string;
  headline: string;
  sku: string;
  branch: string;
  units: number;
  egpValue: number;
  confidence: number;
  status: 'Pending' | 'Dispatched' | 'Delivered' | 'Cycle Closed';
  supplier: string;
  inputSignals: string;
  constraintsActive: string;
  alternativesConsidered: number;
  winningAction: string;
  expectedOutcome: string;
  financialImpact: string;
  mathExplanation: string;
}

const SKU_CODES = ['PAR-500', 'AMX-250', 'CTZ-500', 'MET-500', 'AUG-625', 'LRT-10', 'OMP-20', 'BRF-400', 'VEN-INH', 'ZIP-250'];
const BRANCH_NAMES = ['Branch-Nasr-City-04', 'Branch-Maadi-02', 'Branch-Heliopolis-07', 'Branch-New-Cairo-12', 'Branch-6th-October-03', 'Branch-Zamalek-01', 'Branch-Dokki-05', 'Branch-Smouha-08', 'Branch-Tanta-03', 'Branch-Mansoura-06'];
const SUPPLIERS_LIST = ['EIPICO', 'Sigma Pharma', 'Kahira Pharma', 'SEDICO', 'Pharco B', 'Al-Debeiky Pharma', 'Amoun Pharmaceutical'];
const STATUSES: Decision['status'][] = ['Pending', 'Dispatched', 'Delivered', 'Cycle Closed'];
const TYPES = ['transfer', 'bulk-po', 'shelf-life', 'cash-flow', 'seasonal', 'demand-spike', 'rebalance', 'cycle-close'];

function sr(seed: number) { const x = Math.sin(seed + 1) * 10000; return x - Math.floor(x); }
function pick<T>(arr: readonly T[], seed: number): T { return arr[Math.floor(sr(seed) * arr.length)]; }

function makeTs(seed: number): string {
  const h = Math.floor(sr(seed) * 24).toString().padStart(2, '0');
  const m = Math.floor(sr(seed + 1) * 60).toString().padStart(2, '0');
  const s = Math.floor(sr(seed + 2) * 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function generateDecisions(count: number, startSeed = 0): Decision[] {
  const decisions: Decision[] = [];
  for (let i = 0; i < count; i++) {
    const s = startSeed + i * 17;
    const sku = pick(SKU_CODES, s);
    const branch = pick(BRANCH_NAMES, s + 1);
    const supplier = pick(SUPPLIERS_LIST, s + 2);
    const units = 50 + Math.floor(sr(s + 3) * 4950);
    const egpValue = 5000 + Math.floor(sr(s + 4) * 295000);
    const conf = 0.82 + sr(s + 5) * 0.17;
    const status = pick(STATUSES, s + 6);
    const type = pick(TYPES, s + 7);
    const kEGP = (egpValue / 1000).toFixed(0);

    let headline = '';
    if (type === 'transfer') headline = `Transfer · WH-Cairo-Central -> ${branch} · ${units.toLocaleString()} units ${sku} · EGP ${kEGP}K secured`;
    else if (type === 'bulk-po') headline = `Bulk PO consolidated · ${supplier} · ${units.toLocaleString()} units across 3 SKUs · EGP ${kEGP}K · ${Math.floor(sr(s+8)*8)+3}% discount captured`;
    else if (type === 'shelf-life') headline = `Shelf-life intervention · ${units.toLocaleString()} units ${sku} redistributed from ${branch} · EGP ${kEGP}K loss avoided`;
    else if (type === 'cash-flow') headline = `Cash-flow optimisation · Deferred low-priority PO ${sku} · Saved EGP ${kEGP}K working capital`;
    else if (type === 'seasonal') headline = `Seasonal pre-position · Eid Al-Adha in 30 days · ${units.toLocaleString()} units ${sku} dispatched to ${Math.floor(sr(s+9)*20)+5} branches`;
    else if (type === 'demand-spike') headline = `Demand spike · ${sku} up ${Math.floor(sr(s+10)*40)+15}% in Delta region · Re-order fired · ${supplier} · ETA ${Math.floor(sr(s+11)*3)+1} days`;
    else if (type === 'rebalance') headline = `Branch rebalance · Greater Cairo cluster · ${Math.floor(sr(s+12)*30)+5} inter-branch transfers · Coverage restored to 97.8%`;
    else headline = `Replenishment cycle closed · ${sku} · ${branch} · EGP ${kEGP}K revenue cycle complete · 4.2 days`;

    decisions.push({
      id: `DEC-${String(startSeed + i + 1).padStart(6, '0')}`,
      timestamp: makeTs(s),
      type,
      headline,
      sku,
      branch,
      units,
      egpValue,
      confidence: parseFloat(conf.toFixed(3)),
      status,
      supplier,
      inputSignals: `Demand signal: ${sku} velocity +${Math.floor(sr(s+13)*30)+5}% · Stock coverage ${Math.floor(sr(s+14)*10)+2}d · Lead time ${Math.floor(sr(s+15)*4)+1}d`,
      constraintsActive: `Budget cap EGP ${(egpValue * 1.4 / 1000).toFixed(0)}K · Shelf-life ${Math.floor(sr(s+16)*12)+6}m remaining · WH-Cairo-Central capacity 82%`,
      alternativesConsidered: Math.floor(sr(s + 17) * 8) + 3,
      winningAction: headline,
      expectedOutcome: `Coverage extended to ${Math.floor(sr(s+18)*14)+7} days · Stockout risk eliminated for ${branch}`,
      financialImpact: `EGP ${kEGP}K · Payback ${Math.floor(sr(s+19)*8)+2} days`,
      mathExplanation: `${branch} had ${Math.floor(sr(s+20)*4)+1}.${Math.floor(sr(s+21)*9)} days of ${sku} cover at current demand rate. Nearest surplus location held ${units + Math.floor(sr(s+22)*500)} units with ${Math.floor(sr(s+23)*12)+8}.${Math.floor(sr(s+24)*9)} days surplus. Transfer cost EGP ${Math.floor(sr(s+25)*200)+50} vs expected stockout cost EGP ${(egpValue * 0.12).toFixed(0)}. Net benefit: EGP ${(egpValue * 0.11).toFixed(0)}.`,
    });
  }
  return decisions;
}
