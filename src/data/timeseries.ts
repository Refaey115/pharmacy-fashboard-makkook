export interface MonthlyPoint {
  month: string;
  salesCycleDays: number;
  grossMarginPct: number;
  revenueEGPM: number;
  aiAccuracyPct: number;
  workingCapitalReleasedEGPM: number;
}

export const MONTHLY_SERIES: MonthlyPoint[] = [
  { month: 'Jan', salesCycleDays: 6.2, grossMarginPct: 28.1, revenueEGPM: 58.4, aiAccuracyPct: 88.4, workingCapitalReleasedEGPM: 0 },
  { month: 'Feb', salesCycleDays: 5.9, grossMarginPct: 29.4, revenueEGPM: 61.2, aiAccuracyPct: 90.1, workingCapitalReleasedEGPM: 0.8 },
  { month: 'Mar', salesCycleDays: 5.6, grossMarginPct: 31.0, revenueEGPM: 67.8, aiAccuracyPct: 91.8, workingCapitalReleasedEGPM: 2.1 },
  { month: 'Apr', salesCycleDays: 5.3, grossMarginPct: 32.4, revenueEGPM: 63.1, aiAccuracyPct: 93.2, workingCapitalReleasedEGPM: 3.4 },
  { month: 'May', salesCycleDays: 5.1, grossMarginPct: 33.6, revenueEGPM: 65.4, aiAccuracyPct: 94.1, workingCapitalReleasedEGPM: 5.0 },
  { month: 'Jun', salesCycleDays: 4.8, grossMarginPct: 34.8, revenueEGPM: 68.9, aiAccuracyPct: 95.0, workingCapitalReleasedEGPM: 6.4 },
  { month: 'Jul', salesCycleDays: 4.7, grossMarginPct: 35.7, revenueEGPM: 71.2, aiAccuracyPct: 95.6, workingCapitalReleasedEGPM: 7.8 },
  { month: 'Aug', salesCycleDays: 4.5, grossMarginPct: 36.5, revenueEGPM: 74.8, aiAccuracyPct: 96.2, workingCapitalReleasedEGPM: 8.9 },
  { month: 'Sep', salesCycleDays: 4.4, grossMarginPct: 37.1, revenueEGPM: 76.4, aiAccuracyPct: 96.7, workingCapitalReleasedEGPM: 10.1 },
  { month: 'Oct', salesCycleDays: 4.3, grossMarginPct: 37.6, revenueEGPM: 78.2, aiAccuracyPct: 97.1, workingCapitalReleasedEGPM: 11.2 },
  { month: 'Nov', salesCycleDays: 4.2, grossMarginPct: 38.1, revenueEGPM: 81.4, aiAccuracyPct: 97.5, workingCapitalReleasedEGPM: 11.8 },
  { month: 'Dec', salesCycleDays: 4.2, grossMarginPct: 38.4, revenueEGPM: 84.2, aiAccuracyPct: 97.8, workingCapitalReleasedEGPM: 12.6 },
];
