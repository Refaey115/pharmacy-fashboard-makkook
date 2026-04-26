export interface Supplier {
  name: string;
  categories: string[];
  leadTimeDaysMin: number;
  leadTimeDaysMax: number;
  paymentTerms: string;
  reliabilityScore: number;
  currentInvoiceBalance: number;
  bulkDiscountThreshold: number;
  bulkDiscountPct: number;
  todayPoVolume: number;
}

export const SUPPLIERS: Supplier[] = [
  { name: 'EIPICO', categories: ['Antibiotics', 'Antihistamines', 'GI'], leadTimeDaysMin: 2, leadTimeDaysMax: 4, paymentTerms: 'Net-45', reliabilityScore: 94, currentInvoiceBalance: 284000, bulkDiscountThreshold: 10000, bulkDiscountPct: 3, todayPoVolume: 847000 },
  { name: 'Sigma Pharma', categories: ['Diabetes', 'Cardiovascular', 'GI'], leadTimeDaysMin: 3, leadTimeDaysMax: 5, paymentTerms: '2/10 Net-30', reliabilityScore: 91, currentInvoiceBalance: 156000, bulkDiscountThreshold: 5000, bulkDiscountPct: 2, todayPoVolume: 623000 },
  { name: 'Kahira Pharma', categories: ['Antibiotics', 'OTC', 'Pediatric'], leadTimeDaysMin: 2, leadTimeDaysMax: 3, paymentTerms: 'Net-30', reliabilityScore: 88, currentInvoiceBalance: 98000, bulkDiscountThreshold: 8000, bulkDiscountPct: 4, todayPoVolume: 412000 },
  { name: 'SEDICO', categories: ['Generics', 'Antibiotics', 'Analgesics'], leadTimeDaysMin: 4, leadTimeDaysMax: 6, paymentTerms: 'Net-60', reliabilityScore: 85, currentInvoiceBalance: 220000, bulkDiscountThreshold: 5000, bulkDiscountPct: 5, todayPoVolume: 387000 },
  { name: 'Pharco B', categories: ['Analgesics', 'Respiratory'], leadTimeDaysMin: 3, leadTimeDaysMax: 4, paymentTerms: 'Net-30', reliabilityScore: 92, currentInvoiceBalance: 134000, bulkDiscountThreshold: 6000, bulkDiscountPct: 3, todayPoVolume: 298000 },
  { name: 'Al-Debeiky Pharma', categories: ['Vitamins', 'Supplements', 'OTC'], leadTimeDaysMin: 2, leadTimeDaysMax: 3, paymentTerms: 'Net-30', reliabilityScore: 90, currentInvoiceBalance: 67000, bulkDiscountThreshold: 4000, bulkDiscountPct: 2, todayPoVolume: 184000 },
  { name: 'Amoun Pharmaceutical', categories: ['Cardiovascular', 'Diabetes'], leadTimeDaysMin: 3, leadTimeDaysMax: 5, paymentTerms: '1/15 Net-30', reliabilityScore: 87, currentInvoiceBalance: 178000, bulkDiscountThreshold: 7000, bulkDiscountPct: 3, todayPoVolume: 241000 },
];
