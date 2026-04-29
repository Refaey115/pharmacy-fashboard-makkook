import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const { login, role } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (role === 'admin')  navigate('/admin/command', { replace: true });
    if (role === 'client') navigate('/client/command', { replace: true });
  }, [role, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const ok = login(username.trim(), password);
    setLoading(false);
    if (!ok) setError('Invalid username or password. Please try again.');
  };

  return (
    <div className={styles.page}>
      <div className={styles.gridOverlay} aria-hidden />
      <div className={styles.glow1}    aria-hidden />
      <div className={styles.glow2}    aria-hidden />

      {/* Left hero column */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <img src="/makkook-logo.png" alt="Makkook" className={styles.heroLogo} />
          <h1 className={styles.heroHeadline}>
            Makkook
          </h1>
          <p className={styles.heroSub}>
            Real-time autonomous decisions that prevent stockouts,
            reduce waste, and maximise revenue — across every branch,
            every cycle.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatVal}>91.7%</span>
              <span className={styles.heroStatLabel}>Forecast Accuracy</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatVal}>7.3×</span>
              <span className={styles.heroStatLabel}>ROI on Platform</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatVal}>96.4%</span>
              <span className={styles.heroStatLabel}>Stock Availability</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right login column */}
      <div className={styles.formCol}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <img src="/makkook-logo.png" alt="Makkook" className={styles.makkookSmall} />
          </div>

          <h2 className={styles.heading}>Sign in to your workspace</h2>
          <p className={styles.subtext}>Access your personalised pharmacy intelligence dashboard</p>

          <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">
            <div className={styles.field}>
              <label className={styles.label} htmlFor="username">Username</label>
              <div className={styles.inputWrap}>
                <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
                </svg>
                <input
                  id="username"
                  className={styles.input}
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">Password</label>
              <div className={styles.inputWrap}>
                <svg className={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                <input
                  id="password"
                  className={styles.input}
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className={styles.error}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
                  <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <circle cx="12" cy="16" r="1" fill="currentColor"/>
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? (
                <><span className={styles.spinner} />Signing in...</>
              ) : (
                <>Sign In
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className={styles.credHints}>
            <div className={styles.credTitle}>Demo credentials</div>
            <div className={styles.credRow}>
              <span className={styles.credRole}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Admin
              </span>
              <code className={styles.credCode}>makkook / makkook2026</code>
            </div>
            <div className={styles.credRow}>
              <span className={styles.credRole}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Client
              </span>
              <code className={styles.credCode}>client / client2026</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
