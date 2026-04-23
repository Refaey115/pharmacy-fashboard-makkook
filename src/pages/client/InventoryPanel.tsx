import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import MiniStat from '../../components/MiniStat';
import { INVENTORY_STATS, HOLDING_DAYS } from '../../data/mockData';
import styles from '../admin/InventoryPanel.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#9B9B9B', font: { family: 'Inter', size: 11 } } },
    tooltip: { backgroundColor: '#2a2a2a', titleColor: '#EFEFEF', bodyColor: '#C6C6C6' },
  },
  scales: {
    x: {
      ticks: { color: '#9B9B9B', font: { family: 'Inter', size: 11 } },
      grid:  { color: 'rgba(255,255,255,0.04)' },
    },
    y: {
      ticks: { color: '#9B9B9B', font: { family: 'Inter', size: 11 }, callback: (v: number | string) => `${v}d` },
      grid:  { color: 'rgba(255,255,255,0.04)' },
    },
  },
};

const chartData = {
  labels: HOLDING_DAYS.labels,
  datasets: [
    {
      label: 'Before AI',
      data: HOLDING_DAYS.before,
      backgroundColor: 'rgba(248,113,113,0.5)',
      borderRadius: 4,
    },
    {
      label: 'After AI',
      data: HOLDING_DAYS.after,
      backgroundColor: 'rgba(225,84,29,0.7)',
      borderRadius: 4,
    },
  ],
};

export default function InventoryPanel() {
  return (
    <div>
      <div className="section-title">Inventory Actions</div>
      <div className="grid-5" style={{ marginBottom: 24 }}>
        {INVENTORY_STATS.map(s => (
          <MiniStat
            key={s.label}
            label={s.label}
            count={s.count}
            value={s.value}
            accentColor={s.color}
          />
        ))}
      </div>
      <div className="section-title">Holding Days: Before vs After AI</div>
      <div className={styles.chartWrap}>
        <Bar data={chartData} options={CHART_OPTIONS as any} />
      </div>
    </div>
  );
}
