import { useState } from 'react';
import { AFFINITY_PAIRS, BRANCH_AFFINITY_GAPS } from '../../data/mockData';
import styles from './SkuAffinityPanel.module.css';

const CONDITION_STYLE: Record<string, { bg: string; color: string }> = {
  Clinical:   { bg: 'rgba(96,165,250,0.1)',  color: 'var(--info)' },
  Behavioral: { bg: 'rgba(245,158,11,0.1)',  color: 'var(--warn)' },
  Seasonal:   { bg: 'rgba(74,222,128,0.1)',  color: 'var(--ok)'   },
};

export default function SkuAffinityPanel() {
  const [selectedPair, setSelectedPair] = useState<number | null>(null);

  const totalGaps = AFFINITY_PAIRS.reduce((s, p) => s + p.onlyA + p.onlyB, 0);
  const gapPairs  = AFFINITY_PAIRS.filter(p => p.gapAlert).length;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>SKU Affinity & Co-Availability</h2>
          <p className={styles.subtitle}>
            Products that are frequently purchased together. The AI ensures co-availability
            across all branches — if one half of a pair is stocked, the other must be too.
          </p>
        </div>
        <div className={styles.summaryCards}>
          <div className={styles.sCard}>
            <span className={styles.sCardVal}>{AFFINITY_PAIRS.length}</span>
            <span className={styles.sCardLabel}>Affinity Pairs</span>
          </div>
          <div className={`${styles.sCard} ${gapPairs > 0 ? styles.sCardWarn : ''}`}>
            <span className={styles.sCardVal} style={{ color: gapPairs > 0 ? 'var(--warn)' : 'var(--ok)' }}>{gapPairs}</span>
            <span className={styles.sCardLabel}>Pairs with Gaps</span>
          </div>
          <div className={`${styles.sCard} ${totalGaps > 0 ? styles.sCardWarn : ''}`}>
            <span className={styles.sCardVal} style={{ color: totalGaps > 0 ? 'var(--warn)' : 'var(--ok)' }}>{totalGaps}</span>
            <span className={styles.sCardLabel}>Branch Gaps</span>
          </div>
          <div className={styles.sCard}>
            <span className={styles.sCardVal} style={{ color: 'var(--ok)' }}>
              {AFFINITY_PAIRS.reduce((s, p) => s + p.bothStocked, 0)}
            </span>
            <span className={styles.sCardLabel}>Fully Co-stocked</span>
          </div>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Pairs table */}
        <div className={styles.tableSection}>
          <div className={styles.sectionLabel}>Affinity Pairs</div>
          <div className={styles.pairsTable}>
            {AFFINITY_PAIRS.map((pair, i) => {
              const coveragePct = Math.round((pair.bothStocked / pair.totalBranches) * 100);
              const condStyle   = CONDITION_STYLE[pair.condition] ?? CONDITION_STYLE.Clinical;
              const isSelected  = selectedPair === i;
              return (
                <div
                  key={i}
                  className={`${styles.pairRow} ${pair.gapAlert ? styles.pairGap : ''} ${isSelected ? styles.pairSelected : ''}`}
                  onClick={() => setSelectedPair(isSelected ? null : i)}
                >
                  {/* Pair header */}
                  <div className={styles.pairHeader}>
                    <div className={styles.pairSkus}>
                      <span className={styles.skuChip}>{pair.skuA}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={styles.linkIcon}>
                        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                      <span className={styles.skuChip}>{pair.skuB}</span>
                    </div>
                    <div className={styles.pairMeta}>
                      <span className={styles.condBadge} style={condStyle}>{pair.condition}</span>
                      {pair.gapAlert && (
                        <span className={styles.alertBadge}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          Gap Alert
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Names */}
                  <div className={styles.pairNames}>
                    {pair.nameA} + {pair.nameB}
                  </div>

                  {/* Stats */}
                  <div className={styles.pairStats}>
                    <div className={styles.pairStat}>
                      <span className={styles.pairStatVal}>{pair.copurchaseRate}%</span>
                      <span className={styles.pairStatKey}>Co-purchase rate</span>
                    </div>
                    <div className={styles.pairStat}>
                      <span className={styles.pairStatVal} style={{ color: 'var(--ok)' }}>{pair.bothStocked}</span>
                      <span className={styles.pairStatKey}>Both stocked</span>
                    </div>
                    <div className={styles.pairStat}>
                      <span className={styles.pairStatVal} style={{ color: pair.onlyA > 0 ? 'var(--warn)' : 'var(--text-3)' }}>{pair.onlyA}</span>
                      <span className={styles.pairStatKey}>Only {pair.skuA}</span>
                    </div>
                    <div className={styles.pairStat}>
                      <span className={styles.pairStatVal} style={{ color: pair.onlyB > 0 ? 'var(--warn)' : 'var(--text-3)' }}>{pair.onlyB}</span>
                      <span className={styles.pairStatKey}>Only {pair.skuB}</span>
                    </div>
                  </div>

                  {/* Coverage bar */}
                  <div className={styles.covRow}>
                    <span className={styles.covLabel}>Branch coverage</span>
                    <div className={styles.covTrack}>
                      <div
                        className={styles.covFill}
                        style={{
                          width: `${coveragePct}%`,
                          background: coveragePct >= 90 ? 'var(--ok)' : coveragePct >= 70 ? 'var(--warn)' : 'var(--err)',
                        }}
                      />
                    </div>
                    <span className={styles.covPct}>{coveragePct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Gap map + AI actions */}
        <div className={styles.right}>
          <div className={styles.sectionLabel}>Branch Gap Map</div>
          <div className={styles.gapCards}>
            {BRANCH_AFFINITY_GAPS.map((bg, i) => (
              <div key={i} className={styles.gapCard}>
                <div className={styles.gapBranch}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.8"/>
                    <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="1.8"/>
                  </svg>
                  {bg.branch}
                </div>
                <div className={styles.gapPairs}>
                  {bg.pairs.map((p, j) => (
                    <span key={j} className={styles.gapPairChip}>{p}</span>
                  ))}
                </div>
                <div className={styles.gapAction}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>
                  </svg>
                  AI will auto-transfer missing SKU
                </div>
              </div>
            ))}
          </div>

          <div className={styles.sectionLabel} style={{ marginTop: 20 }}>How It Works</div>
          <div className={styles.howBox}>
            <div className={styles.howStep}>
              <div className={styles.howNum}>1</div>
              <div>
                <strong>Affinity Detection</strong> — The AI analyses transaction logs to identify
                SKU pairs purchased together in ≥ 40% of basket events.
              </div>
            </div>
            <div className={styles.howStep}>
              <div className={styles.howNum}>2</div>
              <div>
                <strong>Gap Detection</strong> — Each replenishment cycle checks whether both
                SKUs in every registered pair are in-stock at each branch.
              </div>
            </div>
            <div className={styles.howStep}>
              <div className={styles.howNum}>3</div>
              <div>
                <strong>Auto-correction</strong> — When a gap is found, the AI fires a transfer
                or purchase order to close it within the same cycle, before a customer misses a product.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
