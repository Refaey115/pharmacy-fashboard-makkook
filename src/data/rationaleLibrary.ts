// ─── Decision Rationale Library ───────────────────────────────────────────────
// 40 templated rationale strings. Placeholders in {braces} are filled at render time.

export interface RationaleTemplate {
  type: string;
  category: 'transfer' | 'po' | 'seasonal' | 'cashflow' | 'affinity' | 'emergency';
  template: string;
}

export const RATIONALE_LIBRARY: RationaleTemplate[] = [
  // ── Transfer rationales (10) ─────────────────────────────────────────────
  {
    type: 'transfer', category: 'transfer',
    template: 'This transfer was chosen because {dest} had {coverDays} days of stock cover for {sku}. The nearest stocked branch ({origin}) had {surplusDays} days of surplus inventory. Transfer cost: ${transferCost}. Expected stockout cost if no action: ${stockoutCost}. Net benefit: ${netBenefit}. Confidence: {conf}%.',
  },
  {
    type: 'transfer', category: 'transfer',
    template: 'Inter-branch rebalance triggered by demand asymmetry. {sku} demand at {dest} ran {demandPctAbove}% above forecast over last 7 days while {origin} ran {demandPctBelow}% below. Transfer rebalances cover days from {beforeDays}d/{beforeDestDays}d to {afterDays}d/{afterDestDays}d. Avoids both stockout and surplus simultaneously.',
  },
  {
    type: 'transfer', category: 'transfer',
    template: 'Shelf-life intervention: {units} units of {sku} at {origin} would expire in {daysToExpiry} days. {dest} consumes this SKU at {dailyVelocity} units/day, sufficient to absorb the transfer before expiry. Loss avoided: ${lossAvoided}. Alternative (let expire): ${lossExpired}.',
  },
  {
    type: 'transfer', category: 'transfer',
    template: 'Critical branch resupply: {dest} dropped below safety stock ({currentStock} units, threshold {safetyStock}). Nearest source: {origin}. ETA: {etaHours}h. Faster than waiting for next supplier delivery (next ETA: {supplierEta}).',
  },
  {
    type: 'transfer', category: 'transfer',
    template: 'Transfer chosen over emergency PO because supplier lead time ({supplierLeadDays}d) exceeds branch criticality window ({criticalWindowDays}d). Internal transfer arrives {hoursAhead}h before supplier alternative.',
  },
  {
    type: 'transfer', category: 'transfer',
    template: 'Affinity-pair coverage gap: {sku1} stocked at {dest} but co-purchased {sku2} not stocked. 78% of {sku1} purchases include {sku2}. Transfer of {units} units of {sku2} from {origin} closes the gap. Estimated revenue protected: ${revenueProtected}.',
  },
  {
    type: 'transfer', category: 'transfer',
    template: 'Seasonal pre-positioning: {trigger} starts in {daysToTrigger} days. Historical demand surge: {expectedSurgePct}% on {sku} class. Pre-positioning {units} units at {dest} cluster to absorb spike. Cost of pre-position: ${prePositionCost}. Cost of reactive emergency: ${reactiveCost}.',
  },
  {
    type: 'transfer', category: 'transfer',
    template: 'Dead stock liquidation: {units} units of {sku} at {origin} unsold for {staleDays} days. Velocity at {dest}: {dailyVelocity}/day. Transfer enables consumption within {consumeDays} days vs. likely expiry at origin.',
  },
  {
    type: 'transfer', category: 'transfer',
    template: 'Cross-region rebalance: surplus identified across {regionFrom} cluster. {regionTo} cluster running below safety. Optimal transfer minimizes total network holding while restoring cover. Net inventory change: zero. Net coverage improvement: +{coverageImprovementPct}%.',
  },
  {
    type: 'transfer', category: 'transfer',
    template: 'Customer-driven trigger: 3 prescriptions for {sku} declined at {dest} in last 24h (logged stockout events). Velocity-adjusted reorder point breached. Transfer is fastest restoration. Customer recovery probability: {recoveryProb}%.',
  },

  // ── PO rationales (10) ────────────────────────────────────────────────────
  {
    type: 'bulk-po', category: 'po',
    template: 'Bulk consolidation: {n} branch-level reorders for {sku} aggregated into single {supplier} PO. Bulk threshold: {threshold} units → {discountPct}% discount. Total saved: ${savedAmount} vs. fragmented orders.',
  },
  {
    type: 'bulk-po', category: 'po',
    template: 'Supplier substitution: primary supplier {primarySupplier} on {leadDelay}h delay (logged at {timestamp}). Alternative {altSupplier} has capacity ({altCapacity} units) at {priceDelta}% price differential. Net cost vs. stockout impact: ${netImpact} favorable.',
  },
  {
    type: 'bulk-po', category: 'po',
    template: 'Early-payment opportunity: {supplier} 2/10 Net 30 terms. Days to discount cutoff: {daysLeft}. Discount value: ${discountAmount}. Opportunity cost of accelerated payment: ${opportunityCost}. Net: ${netDiscount} favorable.',
  },
  {
    type: 'demand-spike', category: 'po',
    template: 'Demand spike PO: {sku} velocity rose {velocityIncreasePct}% over baseline (signal source: {signalSource}). Standard reorder window insufficient — emergency PO fired to {supplier} at {priceMultiplier}x standard rate. Cost vs. service-level impact justifies markup.',
  },
  {
    type: 'bulk-po', category: 'po',
    template: 'Multi-SKU PO bundling: {n} SKUs from same supplier batched into one delivery. Reduces inbound logistics overhead by ${logisticsSavings}. Lead time impact: zero (all SKUs available now).',
  },
  {
    type: 'bulk-po', category: 'po',
    template: 'Strategic supplier rotation: {primarySupplier} share trending up to {currentShare}% (target ceiling: {ceilingShare}%). PO redirected to {altSupplier} to maintain risk diversification. Cost impact: +${costImpact}. Risk mitigation value: ${riskValue}.',
  },
  {
    type: 'cash-flow', category: 'po',
    template: 'Cash-flow timing: ${invoiceTotal} PO deferred {daysDeferred} days to align with receivables collection cycle. Working capital optimization: ${wcOptimization} freed during deferment window.',
  },
  {
    type: 'bulk-po', category: 'po',
    template: 'Volume tier achievement: this PO triggers next tier discount at {supplier} ({currentTierUnits} → {nextTierUnits} units annual). Tier upgrade saves {tierDiscountPct}% on all subsequent orders this fiscal year.',
  },
  {
    type: 'bulk-po', category: 'po',
    template: 'Quality-adjusted sourcing: {supplier} reliability score dropped to {currentReliabilityScore} (vs. threshold {reliabilityThreshold}). PO redirected to {altSupplier} (score: {altScore}). Lead time penalty: {leadTimePenaltyDays}d. Quality risk reduction: ${qualityValue}.',
  },
  {
    type: 'bulk-po', category: 'po',
    template: 'Regulatory compliance trigger: {sku} batch nearing serialization deadline. PO timing aligns with EDA serialization window. Compliance risk avoided: regulatory penalty estimated at ${complianceRisk}.',
  },

  // ── Seasonal rationales (5) ────────────────────────────────────────────────
  {
    type: 'seasonal', category: 'seasonal',
    template: 'Ramadan demand-build: 18 days to start. Historical surge on digestive aids: {surgePct}%. Pre-positioning {units} units across {nBranches} branches to absorb. Stockout probability without action: {stockoutProb}%. Action probability: {actionProb}%. Expected revenue captured: ${revenueCaptured}.',
  },
  {
    type: 'seasonal', category: 'seasonal',
    template: 'Cold front Cairo+Alexandria: 72-hour weather forecast. Antihistamine demand multiplier: 1.5x. {sku} pre-positioned at {nBranches} branches. Pre-position cost: ${ppCost}. Stockout cost avoided (estimated): ${stockoutCost}.',
  },
  {
    type: 'seasonal', category: 'seasonal',
    template: 'Back-to-school onset: pediatric formulation surge expected. {nSkus} SKUs reordered with elevated quantities. Historical accuracy of seasonal model: {accuracyPct}%. Forecast confidence: {confPct}%.',
  },
  {
    type: 'seasonal', category: 'seasonal',
    template: 'Winter respiratory peak detected: surveillance indicators (search volume, OTC velocity, prescription pattern) all elevated. Cough syrup and antibiotic categories pre-positioned ahead of peak. Lead time vs. surge gap closed by {hoursAhead}h.',
  },
  {
    type: 'seasonal', category: 'seasonal',
    template: 'Eid travel surge: motion sickness and sun-care products redistributed toward coastal branches ({coastalNBranches} branches) and away from inland ({inlandNBranches} branches) per historical travel patterns.',
  },

  // ── Cash-flow rationales (5) ──────────────────────────────────────────────
  {
    type: 'cash-flow', category: 'cashflow',
    template: 'Low-priority PO deferred: {sku} 2-day cover sufficient. Deferral reduces same-week cash outflow by ${cashImpact}. Timing aligned with {receivableSource} receivable inflow ({receivableDate}).',
  },
  {
    type: 'cash-flow', category: 'cashflow',
    template: 'Early-payment discount captured: {supplier} invoice ${invoiceAmount} paid day-{paymentDay} of Net-30 cycle. 2% discount = ${discountAmount}. Cost of capital for accelerated payment: ${capitalCost}. Net benefit: ${netBenefit}.',
  },
  {
    type: 'cash-flow', category: 'cashflow',
    template: 'Cash position optimization: weekly cash projection shows day-{dayN} dip below ${threshold}. PO {poId} deferred to {newDate} to maintain minimum buffer.',
  },
  {
    type: 'cash-flow', category: 'cashflow',
    template: 'Receivables-aware PO scheduling: insurance reimbursement cycle resolves on day-{nDays}. Outbound PO timing aligned to maintain cash conversion cycle target {targetDays}d.',
  },
  {
    type: 'cash-flow', category: 'cashflow',
    template: 'Working capital release through inventory rebalancing: net inventory reduction of ${reduction} via cross-branch consolidation. Capital freed: ${capitalFreed}. Reinvestment opportunity cost: ${opportunityCost}.',
  },

  // ── Affinity & dead-stock rationales (5) ──────────────────────────────────
  {
    type: 'rebalance', category: 'affinity',
    template: 'Affinity coverage gap: {sku1} (stocked) frequently co-purchased with {sku2} (not stocked) at this branch. Co-purchase rate: {coPurchaseRate}%. Auto-transfer of {units} {sku2} closes gap.',
  },
  {
    type: 'shelf-life', category: 'affinity',
    template: 'Dead-stock cleared: {units} units of {sku} unsold {staleDays} days at {origin}. Liquidation channel activated. Recovery: {recoveryPct}% of original cost. Net loss accepted to free shelf space and capital.',
  },
  {
    type: 'rebalance', category: 'affinity',
    template: 'Substitution chain: {sku} stockout at {dest} but {altSku} (therapeutic equivalent) available. Pharmacist auto-prompt enabled to offer substitute. Lost-sale recovery probability: {recoveryProb}%.',
  },
  {
    type: 'shelf-life', category: 'affinity',
    template: 'Slow-mover identification: {sku} ranks bottom-{percentile}% in velocity. Reorder paused. Existing inventory expected to deplete in {depletionDays}d. Capital reallocated to top-velocity SKUs.',
  },
  {
    type: 'rebalance', category: 'affinity',
    template: 'Cross-sell opportunity: customer purchase of {sku1} at {branch} suggests {sku2} relevance ({suggestionConfidence}% co-purchase rate). Inventory positioned to support upsell.',
  },

  // ── Emergency / disruption rationales (5) ────────────────────────────────
  {
    type: 'demand-spike', category: 'emergency',
    template: 'Supplier disruption response: {supplier} reported {hours}h delivery delay at {timestamp}. Affected SKUs: {nAffectedSkus}. Substitute supplier {altSupplier} activated. Net stockout window: {windowHours}h vs. {defaultWindowHours}h without intervention.',
  },
  {
    type: 'demand-spike', category: 'emergency',
    template: 'Branch power outage: {branch} offline for ~{outageHours}h. Cold-chain at risk: {coldChainSkus} SKUs. Transfer of cold-chain inventory to nearest active branch. Loss avoided: ${coldChainLossAvoided}.',
  },
  {
    type: 'demand-spike', category: 'emergency',
    template: 'Demand spike anomaly: {sku} velocity {velocityPct}x normal in {region}. Signal source: {sourceLabel}. Pre-emptive PO fired ahead of formal trigger, cross-validated against {nValidationSources} sources.',
  },
  {
    type: 'bulk-po', category: 'emergency',
    template: 'Customs delay impact: {supplier} import shipment delayed at port. Domestic alternative {altSupplier} engaged for {nSkus} SKUs. Cost differential: +{costPct}%. Service level maintained.',
  },
  {
    type: 'rebalance', category: 'emergency',
    template: 'Regulatory recall handling: {sku} batch {batchNum} subject to recall notice. {units} units across {nBranches} branches identified. Quarantine and reverse-logistics actions triggered. Patient safety prioritized over cost.',
  },
];

/** Pick a rationale template for a given decision type, deterministically by decision ID */
export function getRationale(decisionType: string, decisionId: string): RationaleTemplate {
  const matching = RATIONALE_LIBRARY.filter(r => r.type === decisionType);
  const pool = matching.length > 0 ? matching : RATIONALE_LIBRARY;
  // Deterministic pick based on ID hash
  const hash = decisionId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return pool[hash % pool.length];
}

/** Fill template placeholders with realistic demo values */
export function fillRationale(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return vars[key] !== undefined ? String(vars[key]) : `{${key}}`;
  });
}

/** Generate realistic placeholder values for a decision */
export function buildRationaleVars(d: {
  sku: string; branch: string; units: number; egpValue: number;
  confidence: number; supplier: string; type: string;
}): Record<string, string | number> {
  const usd = Math.round(d.egpValue / 5);
  const conf = Math.round(d.confidence * 100);
  return {
    sku: d.sku,
    dest: d.branch,
    origin: `Branch-Cairo-${Math.floor(Math.random() * 20) + 1}`,
    units: d.units,
    supplier: d.supplier,
    altSupplier: 'Sigma Pharma',
    primarySupplier: d.supplier,
    coverDays: Math.floor(Math.random() * 5) + 2,
    surplusDays: Math.floor(Math.random() * 15) + 8,
    transferCost: Math.round(usd * 0.04),
    stockoutCost: Math.round(usd * 0.18),
    netBenefit: Math.round(usd * 0.14),
    conf,
    demandPctAbove: Math.floor(Math.random() * 40) + 15,
    demandPctBelow: Math.floor(Math.random() * 20) + 8,
    beforeDays: Math.floor(Math.random() * 4) + 2,
    afterDays: Math.floor(Math.random() * 6) + 10,
    beforeDestDays: Math.floor(Math.random() * 3) + 1,
    afterDestDays: Math.floor(Math.random() * 5) + 8,
    daysToExpiry: Math.floor(Math.random() * 20) + 5,
    dailyVelocity: Math.floor(Math.random() * 12) + 3,
    lossAvoided: Math.round(usd * 0.22),
    lossExpired: Math.round(usd * 0.85),
    currentStock: Math.floor(Math.random() * 30) + 5,
    safetyStock: 50,
    etaHours: Math.floor(Math.random() * 6) + 2,
    supplierEta: `${Math.floor(Math.random() * 3) + 2} days`,
    supplierLeadDays: Math.floor(Math.random() * 4) + 2,
    criticalWindowDays: 1,
    hoursAhead: Math.floor(Math.random() * 36) + 8,
    revenueProtected: Math.round(usd * 0.12),
    sku1: d.sku,
    sku2: 'AMX-500',
    trigger: 'Ramadan',
    daysToTrigger: Math.floor(Math.random() * 30) + 10,
    expectedSurgePct: Math.floor(Math.random() * 40) + 20,
    prePositionCost: Math.round(usd * 0.08),
    reactiveCost: Math.round(usd * 0.35),
    staleDays: Math.floor(Math.random() * 30) + 20,
    consumeDays: Math.floor(Math.random() * 10) + 5,
    regionFrom: 'Cairo South',
    regionTo: 'Alexandria',
    coverageImprovementPct: Math.floor(Math.random() * 15) + 8,
    recoveryProb: Math.floor(Math.random() * 20) + 75,
    n: Math.floor(Math.random() * 15) + 8,
    threshold: Math.floor(Math.random() * 200) + 100,
    discountPct: Math.floor(Math.random() * 5) + 2,
    savedAmount: Math.round(usd * 0.06),
    leadDelay: Math.floor(Math.random() * 48) + 12,
    timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    altCapacity: Math.floor(Math.random() * 2000) + 500,
    priceDelta: (Math.random() * 4 + 1).toFixed(1),
    netImpact: Math.round(usd * 0.09),
    daysLeft: Math.floor(Math.random() * 8) + 1,
    discountAmount: Math.round(usd * 0.02),
    opportunityCost: Math.round(usd * 0.005),
    netDiscount: Math.round(usd * 0.015),
    velocityIncreasePct: Math.floor(Math.random() * 80) + 40,
    signalSource: 'OTC velocity index',
    priceMultiplier: (1 + Math.random() * 0.15).toFixed(2),
    logisticsSavings: Math.round(usd * 0.03),
    currentShare: Math.floor(Math.random() * 20) + 30,
    ceilingShare: 50,
    costImpact: Math.round(usd * 0.015),
    riskValue: Math.round(usd * 0.08),
    invoiceTotal: Math.round(usd * 2.4),
    daysDeferred: Math.floor(Math.random() * 14) + 7,
    wcOptimization: Math.round(usd * 0.18),
    currentTierUnits: Math.floor(Math.random() * 5000) + 8000,
    nextTierUnits: 15000,
    tierDiscountPct: Math.floor(Math.random() * 3) + 1,
    currentReliabilityScore: (60 + Math.random() * 15).toFixed(0),
    reliabilityThreshold: 75,
    altScore: (80 + Math.random() * 15).toFixed(0),
    leadTimePenaltyDays: Math.floor(Math.random() * 3) + 1,
    qualityValue: Math.round(usd * 0.12),
    complianceRisk: Math.round(usd * 0.5),
    surgePct: Math.floor(Math.random() * 60) + 30,
    nBranches: Math.floor(Math.random() * 100) + 80,
    stockoutProb: Math.floor(Math.random() * 20) + 65,
    actionProb: Math.floor(Math.random() * 5) + 2,
    revenueCaptured: Math.round(usd * 0.24),
    ppCost: Math.round(usd * 0.05),
    // stockoutCost already defined above (reuse same key)
    nSkus: Math.floor(Math.random() * 8) + 4,
    accuracyPct: (88 + Math.random() * 8).toFixed(1),
    confPct: (90 + Math.random() * 6).toFixed(1),
    hoursAheadSeasonal: Math.floor(Math.random() * 36) + 12,
    coastalNBranches: Math.floor(Math.random() * 40) + 30,
    inlandNBranches: Math.floor(Math.random() * 60) + 60,
    cashImpact: Math.round(usd * 0.15),
    receivableSource: 'insurance reimbursement',
    receivableDate: 'day-28',
    invoiceAmount: Math.round(usd * 2.8),
    paymentDay: Math.floor(Math.random() * 8) + 3,
    capitalCost: Math.round(usd * 0.004),
    dayN: Math.floor(Math.random() * 5) + 2,
    poId: `PO-${Math.floor(Math.random() * 9000) + 1000}`,
    newDate: '+7 days',
    nDays: Math.floor(Math.random() * 10) + 20,
    targetDays: 30,
    reduction: Math.round(usd * 0.35),
    capitalFreed: Math.round(usd * 0.28),
    coPurchaseRate: Math.floor(Math.random() * 30) + 55,
    altSku: 'AMX-250',
    percentile: Math.floor(Math.random() * 15) + 15,
    depletionDays: Math.floor(Math.random() * 30) + 20,
    branch: d.branch,
    suggestionConfidence: Math.floor(Math.random() * 20) + 65,
    hours: Math.floor(Math.random() * 36) + 12,
    nAffectedSkus: Math.floor(Math.random() * 8) + 3,
    windowHours: Math.floor(Math.random() * 8) + 2,
    defaultWindowHours: Math.floor(Math.random() * 24) + 16,
    outageHours: Math.floor(Math.random() * 6) + 2,
    coldChainSkus: Math.floor(Math.random() * 4) + 2,
    coldChainLossAvoided: Math.round(usd * 0.45),
    velocityPct: (2 + Math.random() * 4).toFixed(1),
    region: 'Cairo',
    sourceLabel: 'OTC velocity signal',
    nValidationSources: Math.floor(Math.random() * 3) + 2,
    costPct: (3 + Math.random() * 6).toFixed(1),
    batchNum: `B${Math.floor(Math.random() * 9000) + 1000}`,
    recoveryPct: Math.floor(Math.random() * 25) + 60,
  };
}
