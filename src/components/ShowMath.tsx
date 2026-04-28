import { useState, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import styles from './ShowMath.module.css';

export interface ShowMathProps {
  children: ReactNode;
  formula: string;
  inputs: Array<{ label: string; value: string }>;
  output: string;
  source?: string;
}

export default function ShowMath({ children, formula, inputs, output, source }: ShowMathProps) {
  const [visible, setVisible] = useState(false);
  const hoverRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = useCallback(() => {
    hoverRef.current = setTimeout(() => setVisible(true), 400);
  }, []);

  const handleLeave = useCallback(() => {
    if (hoverRef.current) clearTimeout(hoverRef.current);
    setVisible(false);
  }, []);

  const handleClick = useCallback(() => {
    setVisible(v => !v);
  }, []);

  return (
    <span
      className={styles.wrap}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={handleClick}
    >
      <span className={styles.trigger}>{children}</span>

      {visible && (
        <span className={styles.card} onClick={e => e.stopPropagation()}>
          <div className={styles.formula}>{formula}</div>
          <div className={styles.inputGrid}>
            {inputs.map((inp, i) => (
              <div key={i} className={styles.inputRow}>
                <span className={styles.inputLabel}>{inp.label}</span>
                <span className={styles.inputValue}>{inp.value}</span>
              </div>
            ))}
          </div>
          <div className={styles.outputRow}>
            <span className={styles.outputLabel}>Result</span>
            <span className={styles.outputValue}>{output}</span>
          </div>
          {source && (
            <div className={styles.source}>Source: {source}</div>
          )}
        </span>
      )}
    </span>
  );
}
