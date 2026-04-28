// ─── Payment Terms Formatter ──────────────────────────────────────────────────
// American format (default): "2/10 Net 30"
// Egyptian format (admin toggle): "Net 30, mid-month invoicing"

export type TermsFormat = 'american' | 'egyptian';

interface TermsTranslation {
  american: string;
  egyptian: string;
}

const TERMS_MAP: Record<string, TermsTranslation> = {
  'Net 30':      { american: 'Net 30',         egyptian: 'Net 30, mid-month invoicing' },
  'Net 45':      { american: 'Net 45',         egyptian: 'Net 45, end-month' },
  'Net 60':      { american: 'Net 60',         egyptian: 'Net 60 with conditional 1.5% early-payment' },
  '2/10 Net 30': { american: '2/10 Net 30',    egyptian: 'Net 30, 2% if paid within 10 days' },
  'Net 15':      { american: 'Net 15',         egyptian: 'Net 15, immediate collection' },
  'Cash':        { american: 'Cash on Delivery', egyptian: 'Cash on delivery' },
  'LC Sight':    { american: 'Letter of Credit, Sight', egyptian: 'Letter of credit, sight' },
};

export function formatTerms(term: string, format: TermsFormat = 'american'): string {
  const entry = TERMS_MAP[term];
  if (!entry) return term;
  return entry[format];
}

/** Map a supplier payment terms string to the canonical term key */
export function normaliseTerms(raw: string): string {
  if (raw.toLowerCase().includes('net 60')) return 'Net 60';
  if (raw.toLowerCase().includes('2/10'))   return '2/10 Net 30';
  if (raw.toLowerCase().includes('net 45')) return 'Net 45';
  if (raw.toLowerCase().includes('net 30')) return 'Net 30';
  if (raw.toLowerCase().includes('net 15')) return 'Net 15';
  if (raw.toLowerCase().includes('cash'))   return 'Cash';
  return raw;
}
