export interface SeasonalEvent {
  name: string;
  startDate: string;
  endDate: string;
  demandMultiplier: number;
  affectedClasses: string[];
  aiActionTaken: string;
  unitsPrePositioned: number;
  status: 'completed' | 'active' | 'upcoming';
  daysUntil: number;
}

export const SEASONAL_EVENTS: SeasonalEvent[] = [
  { name: 'Ramadan 2026', startDate: '2026-02-18', endDate: '2026-03-19', demandMultiplier: 1.6, affectedClasses: ['GI/Acid', 'Supplements', 'Pediatric'], aiActionTaken: 'Pre-positioned', unitsPrePositioned: 84000, status: 'completed', daysUntil: -68 },
  { name: 'Eid Al-Fitr', startDate: '2026-03-20', endDate: '2026-03-22', demandMultiplier: 1.4, affectedClasses: ['Antihistamine', 'OTC'], aiActionTaken: 'Pre-positioned', unitsPrePositioned: 24000, status: 'completed', daysUntil: -38 },
  { name: 'Cold Front Cairo', startDate: '2026-03-25', endDate: '2026-04-15', demandMultiplier: 1.5, affectedClasses: ['Antihistamine', 'Respiratory'], aiActionTaken: 'Pre-positioned', unitsPrePositioned: 38000, status: 'completed', daysUntil: -12 },
  { name: 'Eid Al-Adha', startDate: '2026-05-27', endDate: '2026-05-30', demandMultiplier: 1.3, affectedClasses: ['GI/Acid', 'Analgesic'], aiActionTaken: 'Reorder fired', unitsPrePositioned: 32000, status: 'upcoming', daysUntil: 30 },
  { name: 'Summer Respiratory Peak', startDate: '2026-06-01', endDate: '2026-08-31', demandMultiplier: 1.4, affectedClasses: ['Respiratory', 'Supplement', 'OTC'], aiActionTaken: 'Monitoring', unitsPrePositioned: 0, status: 'upcoming', daysUntil: 35 },
  { name: 'Back-to-School', startDate: '2026-08-25', endDate: '2026-09-15', demandMultiplier: 1.4, affectedClasses: ['Pediatric', 'Vitamins'], aiActionTaken: 'Pending', unitsPrePositioned: 0, status: 'upcoming', daysUntil: 120 },
  { name: 'Winter Respiratory Peak', startDate: '2026-11-01', endDate: '2027-01-31', demandMultiplier: 1.7, affectedClasses: ['Respiratory', 'Antibiotic', 'Analgesic'], aiActionTaken: 'Pending', unitsPrePositioned: 0, status: 'upcoming', daysUntil: 188 },
];
