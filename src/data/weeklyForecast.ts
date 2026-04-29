import type { Sku } from './skus';

// ── Regions with WH assignment ────────────────────────────────────────────────
export interface ForecastRegion {
  id:       string;
  name:     string;
  wh:       string;
  branches: number;
  share:    number;   // fraction of total network demand
  color:    string;
}

export const FORECAST_REGIONS: ForecastRegion[] = [
  { id: 'cairo',  name: 'Greater Cairo', wh: 'WH-Cairo-Central', branches: 180, share: 0.36, color: '#E1541D' },
  { id: 'alex',   name: 'Alexandria',    wh: 'WH-Alexandria',    branches: 80,  share: 0.16, color: '#60A5FA' },
  { id: 'delta',  name: 'Delta',         wh: 'WH-Delta',         branches: 90,  share: 0.18, color: '#4ADE80' },
  { id: 'upper',  name: 'Upper Egypt',   wh: 'WH-Upper-Egypt',   branches: 80,  share: 0.16, color: '#A78BFA' },
  { id: 'suez',   name: 'Suez Canal',    wh: 'WH-Suez',          branches: 40,  share: 0.08, color: '#F59E0B' },
];

// Day-of-week demand multipliers (Sunday=0 … Saturday=6)
// Egyptian market: Sun–Thu peak, Fri dip (prayer day), Sat partial
const DOW_MULT: Record<number, number> = {
  0: 0.88, // Sunday
  1: 1.06, // Monday
  2: 1.10, // Tuesday
  3: 1.09, // Wednesday
  4: 1.05, // Thursday
  5: 0.76, // Friday — lowest (pharmacies close midday)
  6: 0.90, // Saturday
};

// Deterministic noise so numbers don't change on every re-render
function seededNoise(skuCode: string, regionId: string, dayOffset: number): number {
  let h = 0;
  for (let i = 0; i < skuCode.length; i++) h = (h * 31 + skuCode.charCodeAt(i)) >>> 0;
  for (let i = 0; i < regionId.length; i++) h = (h * 17 + regionId.charCodeAt(i)) >>> 0;
  h = (h + dayOffset * 3571) >>> 0;
  return 0.90 + ((h % 200) / 1000); // range 0.90 – 1.10
}

// Forecasted daily demand (units) for a SKU in a region on a given day offset
export function forecastDemand(sku: Sku, region: ForecastRegion, dayOffset: number): number {
  const networkDailyDemand = sku.networkStock / sku.daysOfCover;
  const regionDailyBase   = networkDailyDemand * region.share;
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + dayOffset);
  const dow = targetDate.getDay();
  const noise = seededNoise(sku.code, region.id, dayOffset);
  return Math.round(regionDailyBase * DOW_MULT[dow] * noise);
}

// Current regional stock — seeded variation around ideal coverage
export function currentRegionalStock(sku: Sku, region: ForecastRegion): number {
  let h = 0;
  for (let i = 0; i < sku.code.length; i++) h = (h * 31 + sku.code.charCodeAt(i)) >>> 0;
  for (let i = 0; i < region.id.length; i++) h = (h * 17 + region.id.charCodeAt(i)) >>> 0;
  // Coverage factor: some regions over-stocked, some tight
  const coverFactor = 0.55 + ((h % 90) / 100); // 0.55 – 1.45
  const networkDailyDemand = sku.networkStock / sku.daysOfCover;
  const idealStock = networkDailyDemand * region.share * sku.daysOfCover;
  return Math.round(idealStock * coverFactor);
}

// Pending incoming orders already dispatched from DC (seeded)
export function incomingOrders(sku: Sku, region: ForecastRegion): number {
  let h = 0;
  for (let i = 0; i < sku.code.length; i++) h = (h * 13 + sku.code.charCodeAt(i)) >>> 0;
  h = (h + region.branches * 97) >>> 0;
  const networkDailyDemand = sku.networkStock / sku.daysOfCover;
  const dailyRegional = networkDailyDemand * region.share;
  // 0 to 4 days worth of incoming stock (some regions have open POs)
  const incomingDays = (h % 5); // 0–4 days
  return Math.round(dailyRegional * incomingDays);
}

export interface DispatchLine {
  region:        ForecastRegion;
  currentStock:  number;
  sevenDayDemand: number;
  incoming:      number;
  netPosition:   number;    // positive = surplus, negative = shortfall
  toRequest:     number;    // units to order from DC (0 if surplus)
  daysRemaining: number;    // how many days until stockout
  priority:      'ok' | 'monitor' | 'high' | 'critical';
  requestBy:     string;    // day name
}

export function buildDispatchLines(sku: Sku): DispatchLine[] {
  const today = new Date();
  const DAYS_AHEAD = 7;
  const safetyDays = 5; // safety stock target = 5 days of avg demand

  return FORECAST_REGIONS.map(region => {
    const weekDemand = Array.from({ length: DAYS_AHEAD }, (_, d) =>
      forecastDemand(sku, region, d)
    ).reduce((a, b) => a + b, 0);

    const avgDailyDemand = weekDemand / DAYS_AHEAD;
    const safetyStock    = Math.round(avgDailyDemand * safetyDays);
    const stock          = currentRegionalStock(sku, region);
    const incoming       = incomingOrders(sku, region);
    const netPos         = stock + incoming - weekDemand - safetyStock;
    const toRequest      = netPos < 0 ? Math.abs(netPos) : 0;
    const daysRemaining  = avgDailyDemand > 0
      ? Math.floor((stock + incoming) / avgDailyDemand)
      : 99;

    let priority: DispatchLine['priority'] = 'ok';
    if (daysRemaining < 3)  priority = 'critical';
    else if (daysRemaining < 6) priority = 'high';
    else if (daysRemaining < 10) priority = 'monitor';

    // "Request by" day — offset from today so DC can dispatch in time (lead ~2 days)
    const reqDayOffset = Math.max(0, daysRemaining - 2);
    const reqDate = new Date(today);
    reqDate.setDate(today.getDate() + reqDayOffset);
    const requestBy = priority === 'ok'
      ? '—'
      : reqDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

    return {
      region, currentStock: stock, sevenDayDemand: weekDemand,
      incoming, netPosition: netPos, toRequest, daysRemaining, priority, requestBy,
    };
  });
}

// 7-day label array starting from today
export function weekLabels(): string[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });
  });
}
