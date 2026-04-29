export interface MonthlyPoint {
  month: string;
  salesCycleDays: number;
  grossMarginPct: number;
  revenueEGPM: number;
  aiAccuracyPct: number;
  workingCapitalReleasedEGPM: number;
}

// Sales cycle = full inventory cycle days (procurement → sold). Baseline ~30d, optimised to 22d.
export const MONTHLY_SERIES: MonthlyPoint[] = [
  { month: 'Jan', salesCycleDays: 30.0, grossMarginPct: 28.1, revenueEGPM: 58.4, aiAccuracyPct: 88.4, workingCapitalReleasedEGPM: 0 },
  { month: 'Feb', salesCycleDays: 29.2, grossMarginPct: 29.4, revenueEGPM: 61.2, aiAccuracyPct: 90.1, workingCapitalReleasedEGPM: 0.8 },
  { month: 'Mar', salesCycleDays: 28.1, grossMarginPct: 31.0, revenueEGPM: 67.8, aiAccuracyPct: 91.8, workingCapitalReleasedEGPM: 2.1 },
  { month: 'Apr', salesCycleDays: 27.4, grossMarginPct: 32.4, revenueEGPM: 63.1, aiAccuracyPct: 93.2, workingCapitalReleasedEGPM: 3.4 },
  { month: 'May', salesCycleDays: 26.6, grossMarginPct: 33.6, revenueEGPM: 65.4, aiAccuracyPct: 94.1, workingCapitalReleasedEGPM: 5.0 },
  { month: 'Jun', salesCycleDays: 25.8, grossMarginPct: 34.8, revenueEGPM: 68.9, aiAccuracyPct: 95.0, workingCapitalReleasedEGPM: 6.4 },
  { month: 'Jul', salesCycleDays: 25.1, grossMarginPct: 35.7, revenueEGPM: 71.2, aiAccuracyPct: 95.6, workingCapitalReleasedEGPM: 7.8 },
  { month: 'Aug', salesCycleDays: 24.4, grossMarginPct: 36.5, revenueEGPM: 74.8, aiAccuracyPct: 96.2, workingCapitalReleasedEGPM: 8.9 },
  { month: 'Sep', salesCycleDays: 23.8, grossMarginPct: 37.1, revenueEGPM: 76.4, aiAccuracyPct: 96.7, workingCapitalReleasedEGPM: 10.1 },
  { month: 'Oct', salesCycleDays: 23.2, grossMarginPct: 37.6, revenueEGPM: 78.2, aiAccuracyPct: 97.1, workingCapitalReleasedEGPM: 11.2 },
  { month: 'Nov', salesCycleDays: 22.5, grossMarginPct: 38.1, revenueEGPM: 81.4, aiAccuracyPct: 97.5, workingCapitalReleasedEGPM: 11.8 },
  { month: 'Dec', salesCycleDays: 22.0, grossMarginPct: 38.4, revenueEGPM: 84.2, aiAccuracyPct: 97.8, workingCapitalReleasedEGPM: 12.6 },
];
