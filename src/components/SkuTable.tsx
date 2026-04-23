import styles from './SkuTable.module.css';
import { SKU_TABLE } from '../data/mockData';

export default function SkuTable() {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>SKU</th>
            <th>Product</th>
            <th>Demand Score</th>
            <th>Status</th>
            <th>AI Action</th>
          </tr>
        </thead>
        <tbody>
          {SKU_TABLE.map(row => (
            <tr key={row.sku}>
              <td><span className={`${styles.skuCode} mono`}>{row.sku}</span></td>
              <td>{row.name}</td>
              <td>
                <div className={styles.barWrap}>
                  <div className={styles.barFill} style={{ width: `${row.demandScore}%` }} />
                  <span className={styles.barLabel}>{row.demandScore}</span>
                </div>
              </td>
              <td>
                <span className={`pill ${row.status === 'Stocked' ? 'pill-ok' : 'pill-info'}`}>
                  {row.status}
                </span>
              </td>
              <td><span className={styles.action}>{row.aiAction}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
