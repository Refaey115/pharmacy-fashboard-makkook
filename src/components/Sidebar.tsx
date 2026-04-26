import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { Role } from '../auth/AuthContext';
import styles from './Sidebar.module.css';

interface NavItem { label: string; path: string }

function buildNav(base: string): NavItem[] {
  return [
    { label: 'Overview',            path: `${base}/kpi`            },
    { label: 'Demand Forecast',     path: `${base}/demandforecast` },
    { label: 'Replenishment Plan',  path: `${base}/replplan`       },
    { label: 'Purchase Orders',     path: `${base}/purchaseorders` },
    { label: 'Inventory',           path: `${base}/inventory`      },
    { label: 'Cash Flow',           path: `${base}/cashflow`       },
    { label: 'Optimise Strategy',   path: `${base}/optimise`       },
    { label: 'Decision Log',        path: `${base}/log`            },
  ];
}

interface Props { role: Role }

export default function Sidebar({ role }: Props) {
  const { logout, username } = useAuth();
  const navigate  = useNavigate();
  const [time, setTime] = useState(new Date());
  const isAdmin = role === 'admin';
  const base    = isAdmin ? '/admin' : '/client';

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <aside className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.brand}>
        {isAdmin ? (
          <img src="/makkook-logo.png" alt="Makkook" className={styles.logoAdmin} />
        ) : (
          <div className={styles.clientBrand}>
            <div className={styles.elezabyBox}>
              <img src="/elezaby-logo.png" alt="El Ezaby" className={styles.logoClient} />
            </div>
            <div className={styles.subtitleClient}>Powered by <span>Makkook.AI</span></div>
          </div>
        )}
      </div>

      {/* AI live status */}
      <div className={styles.aiStatus}>
        <span className={styles.pulseDot} />
        <span className={styles.aiLabel}>AI Active</span>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {buildNav(base).map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.clock}>
          {time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <div className={styles.userRow}>
          <span className={`pill ${isAdmin ? 'pill-accent' : 'pill-info'}`}>
            {isAdmin ? 'Admin' : 'Client'} · {username}
          </span>
          <button
            className={styles.logoutBtn}
            title="Log out"
            onClick={() => { logout(); navigate('/login'); }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
