import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { Role } from '../auth/AuthContext';
import styles from './AppHeader.module.css';

interface NavItem { label: string; path: string; badge?: string; icon: string }

function buildNav(base: string): NavItem[] {
  return [
    { label: 'KPI Overview',    path: `${base}/kpi`,           icon: '📊' },
    { label: 'Demand',          path: `${base}/demand`,        icon: '📈' },
    { label: 'Supply Chain',    path: `${base}/supply`,        icon: '🚚' },
    { label: 'Inventory',       path: `${base}/inventory`,     icon: '📦' },
    { label: 'Financial ROI',   path: `${base}/roi`,           icon: '💰' },
    { label: 'Decision Log',    path: `${base}/log`,           icon: '🤖' },
    { label: 'Control Center',  path: `${base}/control`,       icon: '🎛️', badge: 'AI' },
    { label: 'Price Forecast',  path: `${base}/forecast`,      icon: '🔮', badge: 'NEW' },
    { label: 'SKU Affinity',    path: `${base}/affinity`,      icon: '🔗', badge: 'NEW' },
    { label: 'Replenishment',   path: `${base}/replenishment`, icon: '⚡', badge: 'LIVE' },
    { label: 'Cash Flow',       path: `${base}/cashflow`,      icon: '💹', badge: 'LIVE' },
  ];
}

interface Props { role: Role }

export default function AppHeader({ role }: Props) {
  const { logout, username } = useAuth();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const isAdmin = role === 'admin';
  const base = isAdmin ? '/admin' : '/client';
  const navItems = buildNav(base);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className={styles.header}>
      {/* ── Top row ── */}
      <div className={styles.topRow}>
        <div className={styles.brand}>
          {isAdmin
            ? <img src="/makkook-logo.png" alt="Makkook" className={styles.logoAdmin} />
            : (
              <div className={styles.clientBrandWrap}>
                <div className={styles.elezabyBox}>
                  <img src="/elezaby-logo.png" alt="El Ezaby" className={styles.logoClient} />
                </div>
                <div className={styles.poweredBy}>Powered by <span>Makkook.AI</span></div>
              </div>
            )
          }
        </div>

        <div className={styles.topRight}>
          <div className={styles.aiPulse}>
            <span className={styles.pulseDot} />
            <span className={styles.pulseLabel}>AI Active</span>
          </div>
          <span className={styles.time}>
            {time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span className={`pill ${isAdmin ? 'pill-accent' : 'pill-info'}`}>
            {isAdmin ? 'Admin' : 'Client'} · {username}
          </span>
          <button className={styles.logoutBtn} onClick={() => { logout(); navigate('/login'); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Nav tab row ── */}
      <nav className={styles.tabRow}>
        <div className={styles.tabScroll}>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`}
            >
              <span className={styles.tabIcon}>{item.icon}</span>
              {item.label}
              {item.badge && (
                <span className={`${styles.tabBadge} ${
                  item.badge === 'LIVE' ? styles.badgeLive :
                  item.badge === 'AI'   ? styles.badgeAi   : styles.badgeNew
                }`}>{item.badge}</span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
}
