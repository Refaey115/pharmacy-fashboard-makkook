// ─── Currency Formatter ───────────────────────────────────────────────────────
// All displayed values are USD. EGP available only via explicit flag.

export function formatUSD(value: number, opts?: { compact?: boolean; decimals?: number }): string {
  const { compact = false, decimals } = opts ?? {};
  if (compact) {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(decimals ?? 2)}B`;
    if (value >= 1_000_000)     return `$${(value / 1_000_000).toFixed(decimals ?? 1)}M`;
    if (value >= 1_000)         return `$${(value / 1_000).toFixed(decimals ?? 0)}K`;
    return `$${value.toFixed(decimals ?? 0)}`;
  }
  return '$' + value.toLocaleString('en-US', {
    minimumFractionDigits: decimals ?? 0,
    maximumFractionDigits: decimals ?? 0,
  });
}

/** Format a raw numeric string or number for display: comma separators, $ prefix */
export function fmtUSD(value: number): string {
  return formatUSD(value);
}
