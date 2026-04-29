// ─── Canonical Numbers — Single Source of Truth ──────────────────────────────
// ALL panels import from here. Never hardcode these values in components.
// Anchored to: 500 branches × $2M avg annual revenue = $1B USD revenue base.

// ── Network Scale ─────────────────────────────────────────────────────────────
export const BRANCHES_COUNT          = 500;
export const SKUS_COUNT              = 70_247;
export const DECISIONS_PER_DAY      = 35_100_000;   // 500 × 70,247 × ~10 cycles
export const DECISIONS_EXECUTED_DAY =     3_510;    // actual orders/transfers executed (~0.01% of evaluations)

// ── Revenue Base ──────────────────────────────────────────────────────────────
export const ANNUAL_REVENUE_USD      = 1_040_000_000; // $1.04B
export const COGS_RATIO              = 0.60;
export const AVG_INVENTORY_BEFORE    = 51_000_000;   // 31-day holding × COGS
export const AVG_INVENTORY_AFTER     = 19_700_000;   // 12-day holding × COGS

// ── Performance KPIs (after AI) ───────────────────────────────────────────────
// Sales cycle = full inventory cycle (procurement → branch → sold). Egyptian pharma norm: 24-30 days.
export const SALES_CYCLE_AFTER       = 22;    // days  (AI-optimised: down from 30)
export const SALES_CYCLE_BEFORE      = 30;    // days  (baseline, industry average)
export const GROSS_MARGIN_AFTER      = 38.4;  // %
export const GROSS_MARGIN_BEFORE     = 28.1;  // %
export const STOCK_AVAIL_AFTER       = 96.4;  // %
export const STOCK_AVAIL_BEFORE      = 82.1;  // %
export const AI_CONFIDENCE           = 94.2;  // %
export const AI_FORECAST_ACCURACY    = 91.7;  // %
export const HOLDING_DAYS_AFTER      = 22;    // days — matches SALES_CYCLE_AFTER
export const HOLDING_DAYS_BEFORE     = 30;    // days — matches SALES_CYCLE_BEFORE

// ── Financial KPIs (USD) ─────────────────────────────────────────────────────
export const WORKING_CAPITAL_RELEASED_USD = 2_600_000;   // $2.6M
export const ANNUAL_VALUE_USD             = 8_200_000;   // $8.2M Year 1
export const ROI                          = 7.3;          // ×
export const PLATFORM_COST_USD            =  1_120_000;  // $1.12M/yr

// ── Annual Value Decomposition ────────────────────────────────────────────────
export const VALUE_DECOMPOSITION = [
  { label: 'Revenue Uplift',          valueM: 3.50, note: '$1B × 0.35% stockout reduction' },
  { label: 'Working Capital Released', valueM: 2.60, note: 'DIO reduction 31d → 12d (one-time)' },
  { label: 'Waste & Expiry Reduction', valueM: 1.00, note: '1.2% revenue × 69% reduction' },
  { label: 'Bulk Discount Capture',   valueM: 0.84, note: '12% of consolidated POs × $7M' },
  { label: 'Distribution Efficiency', valueM: 0.21, note: '15% on $1.4M logistics cost' },
];

// ── Cumulative Value — Time Windows ──────────────────────────────────────────
export const CUMULATIVE = {
  '24h': {
    value: '$124,000',
    decisions: '38,247',
    overrides: 3,
    overridesPct: '0.008%',
  },
  week: {
    value: '$487,000',
    decisions: '184,700',
    overrides: 14,
    overridesPct: '0.008%',
  },
  month: {
    value: '$1,940,000',
    decisions: '1,124,000',
    overrides: 67,
    overridesPct: '0.006%',
  },
  year: {
    value: '$5,470,000',
    decisions: '8,247,000',
    overrides: 488,
    overridesPct: '0.006%',
  },
};

// ── Per-Cycle Marginal Values ─────────────────────────────────────────────────
export const CYCLE_MIN_DECISIONS  = 33_000_000;
export const CYCLE_MAX_DECISIONS  = 37_000_000;
export const CYCLE_MIN_POS        = 40;
export const CYCLE_MAX_POS        = 55;
export const CYCLE_MIN_TRANSFERS  = 290;
export const CYCLE_MAX_TRANSFERS  = 340;
export const CYCLE_MIN_BRANCHES   = 480;
export const CYCLE_MAX_BRANCHES   = 498;
export const CYCLE_MIN_VALUE_USD  = 18_000;
export const CYCLE_MAX_VALUE_USD  = 32_000;
export const CUMULATIVE_CAP_USD   = 750_000; // daily cap when button mashed

// ── Varied Percentages ────────────────────────────────────────────────────────
export const MARGIN_LIFT_PP            = 10.3;  // pp
export const BULK_DISCOUNT_RATE        = 12;    // %
export const EARLY_PAYMENT_CAPTURE     = 78;    // % of opportunities
export const WORKING_CAPITAL_REDUCTION = 61;    // % (($51M-$19.7M)/$51M)
export const WASTE_REDUCTION_PCT       = 69;    // %
export const STOCKOUT_REDUCTION_PCT    = 87;    // %
export const BRANCH_COVERAGE_PCT       = 97.4;  // % (487/500)
export const AUTO_EXECUTION_RATE       = 99.992;// %
export const NETWORK_HEALTH_SCORE      = 87;    // /100
export const CRITICAL_RESOLVED_TODAY   = 14;

// ── Confidence Distribution ────────────────────────────────────────────────────
// 60% → 92-98%, 30% → 85-92%, 8% → 75-85%, 2% → <75%
export const CONFIDENCE_HIST = {
  labels: ['<75%', '75-84%', '85-91%', '91-94%', '94-97%', '97-100%'],
  data:   [24,    97,      284,    1048,   2184,   610],
};
