import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import EventsList from '../../components/EventsList';
import SkuTable   from '../../components/SkuTable';
import { ACCURACY_TREND } from '../../data/mockData';
import styles from './DemandPanel.module.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#9B9B9B', font: { family: 'Inter', size: 11 } } },
    tooltip: { backgroundColor: '#2a2a2a', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1, titleColor: '#EFEFEF', bodyColor: '#C6C6C6' },
  },
  scales: {
    x: {
      ticks: { color: '#9B9B9B', font: { family: 'Inter', size: 11 } },
      grid:  { color: 'rgba(255,255,255,0.04)' },
    },
    y: {
      min: 88,
      max: 100,
      ticks: { color: '#9B9B9B', font: { family: 'Inter', size: 11 }, callback: (v: number | string) => `${v}%` },
      grid: { color: 'rgba(255,255,255,0.04)' },
    },
  },
};

const chartData = {
  labels: ACCURACY_TREND.labels,
  datasets: [{
    label: 'AI Execution Accuracy %',
    data:  ACCURACY_TREND.values,
    borderColor:     '#E1541D',
    backgroundColor: 'rgba(225,84,29,0.08)',
    pointBackgroundColor: '#E1541D',
    pointRadius: 4,
    tension: 0.35,
    fill: true,
  }],
};

export default function DemandPanel() {
  return (
    <div>
      <div className="section-title">Demand Forecast</div>
      <div className={styles.top}>
        <EventsList />
        <div className={styles.chartWrap}>
          <div className={styles.chartTitle}>AI Execution Accuracy %</div>
          <div className={styles.chart}>
            <Line data={chartData} options={CHART_OPTIONS as any} />
          </div>
        </div>
      </div>
      <div className="section-title" style={{ marginTop: 24 }}>Top SKUs by Demand Score</div>
      <SkuTable />
    </div>
  );
}
