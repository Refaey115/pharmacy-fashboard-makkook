export interface SeasonalEvent {
  name: string;
  startDate: string;
  endDate: string;
  demandMultiplier: number;
  affectedClasses: string[];
  aiActionTaken: string;
  unitsPrePositioned: number;
  status: 'completed' | 'active' | 'upcoming';
  daysUntil: number;  // negative = past, 0 = active, positive = upcoming
}

function computeDaysUntil(startDate: string, endDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (today >= start && today <= end) return 0; // active
  if (today > end) return Math.round((today.getTime() - end.getTime()) / -86400000);
  return Math.round((start.getTime() - today.getTime()) / 86400000);
}

function computeStatus(startDate: string, endDate: string): 'completed' | 'active' | 'upcoming' {
  const d = computeDaysUntil(startDate, endDate);
  if (d === 0) return 'active';
  if (d < 0) return 'completed';
  return 'upcoming';
}

function makeEvent(
  name: string,
  startDate: string,
  endDate: string,
  demandMultiplier: number,
  affectedClasses: string[],
  aiActionTakenFn: (status: string) => string,
  unitsPrePositioned: number,
): SeasonalEvent {
  const status = computeStatus(startDate, endDate);
  const daysUntil = computeDaysUntil(startDate, endDate);
  return {
    name, startDate, endDate, demandMultiplier, affectedClasses,
    aiActionTaken: aiActionTakenFn(status),
    unitsPrePositioned: status === 'completed' ? unitsPrePositioned : status === 'active' ? unitsPrePositioned : 0,
    status,
    daysUntil,
  };
}

const RAW_EVENTS = [
  makeEvent('Ramadan 2026',         '2026-02-18', '2026-03-19', 1.6, ['GI/Acid', 'Supplements', 'Pediatric'],      s => s === 'completed' ? 'Pre-positioned +$84K captured' : s === 'active' ? 'Actively managing' : 'Reorder fired',    84000),
  makeEvent('Eid Al-Fitr',          '2026-03-20', '2026-03-22', 1.4, ['Antihistamine', 'OTC'],                     s => s === 'completed' ? 'Pre-positioned +$24K captured' : s === 'active' ? 'Actively managing' : 'Reorder fired',    24000),
  makeEvent('Cold Front Cairo',     '2026-04-15', '2026-04-30', 1.5, ['Antihistamine', 'Respiratory'],             s => s === 'completed' ? 'Pre-positioned +$18K captured' : s === 'active' ? 'Actively managing' : 'Pre-positioning',  38000),
  makeEvent('Eid Al-Adha',          '2026-05-27', '2026-05-30', 1.3, ['GI/Acid', 'Analgesic'],                    s => s === 'upcoming' ? 'Reorder fired' : s === 'active' ? 'Actively managing' : 'Pre-positioned +$32K',             32000),
  makeEvent('Summer Respiratory',   '2026-06-01', '2026-08-31', 1.4, ['Respiratory', 'Supplement', 'OTC'],        s => s === 'upcoming' ? 'Monitoring signals' : s === 'active' ? 'Actively managing' : 'Completed',                    0),
  makeEvent('Back-to-School',       '2026-08-25', '2026-09-15', 1.4, ['Pediatric', 'Vitamins'],                   s => s === 'upcoming' ? 'Pending — 14 days out' : s === 'active' ? 'Actively managing' : 'Completed',                 0),
  makeEvent('Winter Respiratory',   '2026-11-01', '2027-01-31', 1.7, ['Respiratory', 'Antibiotic', 'Analgesic'],  s => s === 'upcoming' ? 'Pending — early signals' : s === 'active' ? 'Actively managing' : 'Completed',               0),
  makeEvent('Ramadan 2027',         '2027-02-07', '2027-03-08', 1.6, ['GI/Acid', 'Supplements', 'Pediatric'],     s => s === 'upcoming' ? 'Pending — forecast ready' : 'Active',                                                         0),
];

// Sort: active first, then upcoming by days ascending, then completed by days descending (most recent first)
export const SEASONAL_EVENTS: SeasonalEvent[] = [...RAW_EVENTS].sort((a, b) => {
  if (a.status === 'active' && b.status !== 'active') return -1;
  if (b.status === 'active' && a.status !== 'active') return 1;
  if (a.status === 'completed' && b.status === 'completed') return b.daysUntil - a.daysUntil; // most recent first (least negative)
  if (a.status === 'upcoming' && b.status === 'upcoming') return a.daysUntil - b.daysUntil; // closest first
  if (a.status === 'upcoming') return -1; // upcoming before completed
  return 1;
});
