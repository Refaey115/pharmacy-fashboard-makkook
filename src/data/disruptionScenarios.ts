export interface DisruptionScenario {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'critical';
  source: string;
  responseActions: string[];
  impactAvoided: { label: string; value: string }[];
  recoveryMilestones: { label: string; time: string }[];
}

export const DISRUPTION_SCENARIOS: DisruptionScenario[] = [
  {
    id: 'supplier-delay',
    title: 'Supplier Delay',
    description: 'EIPICO 48h delay on AMX-250',
    severity: 'critical',
    source: 'EIPICO supplier ERP integration · 23:42:18 · 48-hour delay confirmed on AMX-250 batch',
    responseActions: [
      'Substitute supplier identified · Sigma Pharma · capacity 8,400 units',
      'Emergency PO fired · 4,200 units AMX-250 from Sigma · ETA 18 hours',
      'Inter-branch rebalance · 23 transfers across Greater Cairo to bridge gap',
      '47 branches notified · auto-substitution to AMX-500 where appropriate',
    ],
    impactAvoided: [
      { label: 'Stockout duration avoided', value: '36 hours' },
      { label: 'Affected branches stabilized', value: '47 / 47' },
      { label: 'Revenue protected', value: 'EGP 184,000' },
      { label: 'Customer service incidents prevented', value: '~2,100' },
    ],
    recoveryMilestones: [
      { label: 'Disruption detected', time: 'T+0' },
      { label: 'Re-optimization complete', time: 'T+1.4s' },
      { label: 'Transfers dispatched', time: 'T+5min' },
      { label: 'Situation stabilized', time: 'T+2h' },
    ],
  },
  {
    id: 'cold-front',
    title: 'Cold Front',
    description: 'Cairo + Alexandria, 72h forecast',
    severity: 'high',
    source: 'Egypt Meteorological Authority · weather API · 72h cold front forecast confirmed',
    responseActions: [
      'Demand spike model activated · Antihistamine class x1.5 multiplier applied',
      'Pre-position order fired · CTZ-500 + LRT-10 · 28,400 units to 83 branches',
      'Respiratory SKU stock check complete · 94% branches adequately covered',
      'Seasonal alert sent to 6 warehouse operators · dispatch coordinated',
    ],
    impactAvoided: [
      { label: 'Stockouts prevented', value: '247 branch-SKU pairs' },
      { label: 'Branches pre-positioned', value: '83 / 83' },
      { label: 'Revenue protected', value: 'EGP 312,000' },
      { label: 'Customer complaints prevented', value: '~4,800' },
    ],
    recoveryMilestones: [
      { label: 'Weather signal detected', time: 'T+0' },
      { label: 'Demand model updated', time: 'T+0.8s' },
      { label: 'Pre-position dispatched', time: 'T+8min' },
      { label: 'All branches stocked', time: 'T+6h' },
    ],
  },
  {
    id: 'demand-spike',
    title: 'Demand Spike',
    description: 'Ramadan starts in 14 days',
    severity: 'high',
    source: 'Islamic calendar API · Ramadan 2026 · 14 days to start · historical pattern match 94.2%',
    responseActions: [
      'Seasonal pre-position plan generated · 6 therapeutic classes · 84,000 units',
      'Bulk PO consolidated · SEDICO + Kahira Pharma · EGP 2.4M · 8% bulk discount captured',
      'WH-Cairo-Central pre-stocked · 14-day buffer above normal safety stock',
      'Top-20 SKU shelf re-arrangement recommended to 500 branch managers',
    ],
    impactAvoided: [
      { label: 'Projected stockouts prevented', value: '1,840 branch-SKU pairs' },
      { label: 'Revenue uplift captured', value: 'EGP 1.2M' },
      { label: 'Bulk discount banked', value: 'EGP 192,000' },
      { label: 'Planning hours eliminated', value: '24 hours of manual work' },
    ],
    recoveryMilestones: [
      { label: 'Calendar trigger fired', time: 'T+0' },
      { label: 'Pre-position plan generated', time: 'T+1.4s' },
      { label: 'POs confirmed by suppliers', time: 'T+4h' },
      { label: 'All stock in position', time: 'T+3 days' },
    ],
  },
  {
    id: 'branch-emergency',
    title: 'Branch Emergency',
    description: 'Branch-Maadi power outage, 6 hours',
    severity: 'high',
    source: 'Branch manager report · Branch-Maadi-04 · power outage · cold-chain risk flagged',
    responseActions: [
      'Cold-chain SKU inventory frozen · 847 units flagged for priority review',
      'Nearest branch (Branch-Maadi-02) inventory boosted · 312 units transferred',
      'Cold-chain supplier Amoun Pharmaceutical notified · hold on pending delivery',
      'Customer traffic redirected to 3 adjacent branches · manager notifications sent',
    ],
    impactAvoided: [
      { label: 'Cold-chain units secured', value: '847 units' },
      { label: 'Estimated loss prevented', value: 'EGP 28,400' },
      { label: 'Customer redirects managed', value: '~340 customers' },
      { label: 'Regulatory incidents prevented', value: '1' },
    ],
    recoveryMilestones: [
      { label: 'Emergency logged', time: 'T+0' },
      { label: 'Adjacent branches notified', time: 'T+2min' },
      { label: 'Transfers dispatched', time: 'T+15min' },
      { label: 'Power restored, normal ops', time: 'T+6h' },
    ],
  },
];
