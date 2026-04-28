import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { SKUS } from '../../data/skus';
import SpeakerHint from '../../components/SpeakerHint';
import styles from './NetworkPanel.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const SUPPLIERS_TOP = ['EIPICO', 'Sigma Pharma', 'Kahira Pharma', 'SEDICO', 'Pharco B', 'Al-Debeiky'];
const REGIONAL_WH = ['WH-Cairo\nCentral', 'WH-Alexandria', 'WH-Delta', 'WH-Upper Egypt', 'WH-Suez'];

const W = 800;
const toX = (idx: number, total: number, margin = 40) => margin + (idx / (total - 1)) * (W - 2 * margin);

function healthColor(score: number) {
  if (score >= 75) return 'var(--ok)';
  if (score >= 55) return 'var(--warn)';
  if (score >= 40) return '#F97316';
  return 'var(--err)';
}

export default function NetworkPanel() {
  const holdingLabels = SKUS.slice(0, 10).map(s => s.code);
  const holdingBefore = SKUS.slice(0, 10).map(s => s.holdingDaysBefore);
  const holdingAfter = SKUS.slice(0, 10).map(s => s.holdingDaysAfter);

  const holdingData = {
    labels: holdingLabels,
    datasets: [
      {
        label: 'Before DIOS',
        data: holdingBefore,
        backgroundColor: 'rgba(248,113,113,0.55)',
        borderRadius: 4,
      },
      {
        label: 'After DIOS',
        data: holdingAfter,
        backgroundColor: 'rgba(225,84,29,0.85)',
        borderRadius: 4,
      },
    ],
  };

  const holdingOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#9B9B9B', font: { size: 11 as const } } },
      tooltip: { backgroundColor: '#1a1a1a', titleColor: '#EFEFEF', bodyColor: '#C6C6C6' },
    },
    scales: {
      x: { ticks: { color: '#9B9B9B', font: { size: 10 as const } }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: {
        ticks: { color: '#9B9B9B', font: { size: 10 as const } },
        grid: { color: 'rgba(255,255,255,0.04)' },
        title: { display: true, text: 'Holding Days', color: '#9B9B9B', font: { size: 10 as const } },
      },
    },
  } as const;

  return (
    <div className={styles.panel}>
      {/* Topology SVG */}
      <SpeakerHint text="This is the live supply chain topology. Every orange line represents stock flowing right now. Ask: how many staff would it take to manually coordinate this?">
        <div className={styles.topologyCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Supply Chain Topology — Live Flow</span>
            <div className={styles.topoStats}>
              <span className={styles.topoStat}><strong>847</strong> Active Transfers</span>
              <span className={styles.topoStat}><strong>123</strong> POs in Flight</span>
              <span className={styles.topoStat}><strong>8.4M</strong> Units in Network</span>
              <span className={styles.topoStat}><strong>EGP 124M</strong> Network Value</span>
            </div>
          </div>
          <div className={styles.topoWrap}>
            <svg viewBox={`0 0 ${W} 340`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '340px' }}>
              {/* Supplier boxes row */}
              {SUPPLIERS_TOP.map((sup, i) => {
                const x = toX(i, SUPPLIERS_TOP.length);
                return (
                  <g key={sup}>
                    <rect x={x - 48} y={10} width={96} height={34} rx={6} fill="#2a2a2a" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
                    <text x={x} y={32} textAnchor="middle" fill="#9B9B9B" fontSize={9}>{sup}</text>
                    {/* Line to central WH */}
                    <line x1={x} y1={44} x2={W / 2} y2={116} className={styles.flowLine} />
                  </g>
                );
              })}

              {/* Central WH */}
              <rect x={W / 2 - 80} y={116} width={160} height={44} rx={8} fill="#1a1a1a" stroke="var(--accent)" strokeWidth={1.5} />
              <text x={W / 2} y={133} textAnchor="middle" fill="var(--accent)" fontSize={12} fontWeight="600">WH-Cairo-Central</text>
              <text x={W / 2} y={150} textAnchor="middle" fill="#9B9B9B" fontSize={9}>18,400 units active</text>

              {/* Lines to regional WHs */}
              {REGIONAL_WH.map((rwh, i) => {
                const x = toX(i, REGIONAL_WH.length);
                const label = rwh.replace('\n', ' ');
                return (
                  <g key={label}>
                    <line x1={W / 2} y1={160} x2={x} y2={216} className={styles.flowLine} />
                    <rect x={x - 52} y={216} width={104} height={36} rx={6} fill="#2a2a2a" stroke="rgba(225,84,29,0.35)" strokeWidth={1} />
                    <text x={x} y={234} textAnchor="middle" fill="#C6C6C6" fontSize={9}>{label}</text>
                    <text x={x} y={246} textAnchor="middle" fill="#9B9B9B" fontSize={8}>{[3840, 1680, 2240, 1920, 960][i]} units</text>
                    {/* Line to branch density bar */}
                    <line x1={x} y1={252} x2={toX(i, REGIONAL_WH.length, 20)} y2={296} className={styles.flowLineDim} />
                  </g>
                );
              })}

              {/* Branch density bar */}
              <rect x={20} y={296} width={W - 40} height={28} rx={6} fill="rgba(225,84,29,0.08)" stroke="rgba(225,84,29,0.25)" strokeWidth={1} />
              <text x={W / 2} y={316} textAnchor="middle" fill="#9B9B9B" fontSize={9}>500 Branches — National Network — 96.4% Stock Availability</text>
            </svg>
          </div>
        </div>
      </SpeakerHint>

      {/* Inventory health table */}
      <div className={styles.tableCard}>
        <div className={styles.cardTitle} style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          Inventory Health — All SKUs
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Code</th>
                <th>Product</th>
                <th>Class</th>
                <th>Network Stock</th>
                <th>Days Cover</th>
                <th>Stocked Out</th>
                <th>Overstocked</th>
                <th>Health</th>
                <th>AI Action</th>
              </tr>
            </thead>
            <tbody>
              {SKUS.map(sku => (
                <tr key={sku.code}>
                  <td className={styles.mono} style={{ color: 'var(--accent)' }}>{sku.code}</td>
                  <td>{sku.genericName}</td>
                  <td style={{ color: 'var(--text-3)', fontSize: 11 }}>{sku.therapeuticClass}</td>
                  <td className={styles.mono}>{sku.networkStock.toLocaleString()}</td>
                  <td className={styles.mono}>{sku.daysOfCover}d</td>
                  <td className={styles.mono} style={{ color: sku.branchesStockedOut > 10 ? 'var(--err)' : sku.branchesStockedOut > 5 ? 'var(--warn)' : 'var(--ok)' }}>
                    {sku.branchesStockedOut}
                  </td>
                  <td className={styles.mono} style={{ color: sku.branchesOverstocked > 30 ? 'var(--warn)' : 'var(--text-3)' }}>
                    {sku.branchesOverstocked}
                  </td>
                  <td>
                    <div className={styles.healthBarWrap}>
                      <div
                        className={styles.healthBar}
                        style={{ width: `${sku.healthScore}%`, background: healthColor(sku.healthScore) }}
                      />
                      <span className={styles.mono} style={{ fontSize: 10, color: 'var(--text-3)' }}>{sku.healthScore}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--text-3)' }}>{sku.aiAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Holding days chart */}
      <div className={styles.chartCard}>
        <div className={styles.cardTitle} style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          Inventory Holding Days — Before vs After DIOS
        </div>
        <div style={{ padding: '16px', height: '220px' }}>
          <Bar data={holdingData} options={holdingOptions} />
        </div>
      </div>
    </div>
  );
}
