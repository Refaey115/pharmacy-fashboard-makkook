import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import styles from './KpiCard.module.css';
import type { KpiDef } from '../data/mockData';

interface Props {
  kpi: KpiDef;
  editable?: boolean;
  onValueChange?: (id: string, val: string) => void;
}

export default function KpiCard({ kpi, editable = false, onValueChange }: Props) {
  const [displayVal, setDisplayVal] = useState(0);
  const [editing, setEditing]       = useState(false);
  const [editVal, setEditVal]       = useState(kpi.value);
  const inputRef = useRef<HTMLInputElement>(null);

  // count-up animation on mount
  useEffect(() => {
    const target = kpi.numericValue;
    const duration = 1200;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      setDisplayVal(+current.toFixed(1));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [kpi.numericValue]);

  const handleDblClick = () => {
    if (!editable) return;
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 10);
  };

  const handleBlur = () => {
    setEditing(false);
    onValueChange?.(kpi.id, editVal);
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') inputRef.current?.blur();
    if (e.key === 'Escape') { setEditing(false); setEditVal(kpi.value); }
  };

  return (
    <div
      className={`${styles.card} ${editable ? styles.editable : ''}`}
      onDoubleClick={handleDblClick}
      title={editable ? 'Double-click to edit' : undefined}
    >
      <div className={styles.label}>{kpi.label}</div>
      <div className={styles.valueRow}>
        {editing ? (
          <input
            ref={inputRef}
            className={styles.editInput}
            value={editVal}
            onChange={e => setEditVal(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKey}
          />
        ) : (
          <span className={styles.value}>{displayVal}</span>
        )}
        <span className={styles.unit}>{kpi.unit}</span>
      </div>
      <div className={`${styles.delta} ${kpi.deltaPositive ? styles.deltaPos : styles.deltaNeg}`}>
        {kpi.delta} vs prior period
      </div>
      {kpi.insight && (
        <div className={styles.insight}>{kpi.insight}</div>
      )}
      {editable && <div className={styles.editHint}>dbl-click to edit</div>}
    </div>
  );
}
