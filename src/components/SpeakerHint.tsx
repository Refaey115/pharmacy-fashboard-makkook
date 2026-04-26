import { useState, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';
import styles from './SpeakerHint.module.css';

interface Props { text: string; children: ReactNode; }

export default function SpeakerHint({ text, children }: Props) {
  const { role } = useAuth();
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = useCallback(() => {
    if (role !== 'admin') return;
    timerRef.current = setTimeout(() => setVisible(true), 1500);
  }, [role]);

  const handleLeave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  return (
    <div className={styles.wrap} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {children}
      {visible && role === 'admin' && (
        <div className={styles.hint}>
          <span className={styles.badge}>M</span>
          <p className={styles.text}>{text}</p>
        </div>
      )}
    </div>
  );
}
