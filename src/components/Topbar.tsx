import { useEffect, useState } from 'react';
import styles from './Topbar.module.css';
import { useAuth } from '../auth/AuthContext';

interface Props {
  title: string;
}

export default function Topbar({ title }: Props) {
  const { role, username } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeStr = time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = time.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <h1 className={styles.title}>{title}</h1>
      </div>
      <div className={styles.right}>
        <span className={`${styles.clock} mono`}>{timeStr}</span>
        <span className={styles.date}>{dateStr}</span>
        <span className={`pill ${role === 'admin' ? 'pill-accent' : 'pill-info'}`}>
          {role === 'admin' ? 'Admin' : 'Client'} · {username}
        </span>
      </div>
    </header>
  );
}
