import { useState, useCallback } from 'react';
import { DISRUPTION_SCENARIOS } from '../../data/disruptionScenarios';
import type { DisruptionScenario } from '../../data/disruptionScenarios';
import SpeakerHint from '../../components/SpeakerHint';
import styles from './DisruptionPanel.module.css';

interface HumanEntry {
  id: string;
  timestamp: string;
  category: string;
  severity: string;
  region: string;
  branch: string;
  impact: string;
  actions: string;
}

const SEED_ENTRIES: HumanEntry[] = [
  { id: 'HE-001', timestamp: '09:14:22', category: 'Regulatory', severity: 'High', region: 'Greater Cairo', branch: 'Branch-Zamalek-01', impact: 'MOH inspector visit — documentation review for controlled substances', actions: 'Compliance officer notified. Records retrieved and verified. Inspector satisfied.' },
  { id: 'HE-002', timestamp: '11:47:08', category: 'Infrastructure', severity: 'Medium', region: 'Alexandria', branch: 'Branch-Smouha-08', impact: 'AC unit failure in storage room — ambient temperature rising', actions: 'Maintenance dispatched. Sensitive SKUs moved to adjacent refrigerator. ETA repair 3 hours.' },
  { id: 'HE-003', timestamp: '14:22:55', category: 'Staff', severity: 'Low', region: 'Delta', branch: 'Branch-Mansoura-06', impact: 'Senior pharmacist sick leave — branch understaffed for afternoon shift', actions: 'Manager contacted relief pharmacist from Branch-Mansoura-03. Cover arranged.' },
];

export default function DisruptionPanel() {
  const [activeScenario, setActiveScenario] = useState<DisruptionScenario | null>(null);
  const [revealedActions, setRevealedActions] = useState(0);
  const [humanLog, setHumanLog] = useState<HumanEntry[]>(SEED_ENTRIES);

  const [formCategory, setFormCategory] = useState('');
  const [formSeverity, setFormSeverity] = useState('');
  const [formRegion, setFormRegion] = useState('');
  const [formBranch, setFormBranch] = useState('');
  const [formImpact, setFormImpact] = useState('');
  const [formActions, setFormActions] = useState('');

  const handleSimulate = useCallback((scenario: DisruptionScenario) => {
    setActiveScenario(scenario);
    setRevealedActions(0);
    scenario.responseActions.forEach((_, i) => {
      setTimeout(() => setRevealedActions(i + 1), 600 + i * 500);
    });
  }, []);

  const handleHumanSubmit = useCallback(() => {
    if (!formCategory || !formRegion || !formBranch || !formImpact) return;
    const now = new Date();
    const ts = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const entry: HumanEntry = {
      id: `HE-${String(humanLog.length + 4).padStart(3, '0')}`,
      timestamp: ts,
      category: formCategory,
      severity: formSeverity || 'Medium',
      region: formRegion,
      branch: formBranch,
      impact: formImpact,
      actions: formActions,
    };
    setHumanLog(prev => [entry, ...prev]);
    setFormCategory('');
    setFormSeverity('');
    setFormRegion('');
    setFormBranch('');
    setFormImpact('');
    setFormActions('');
  }, [formCategory, formSeverity, formRegion, formBranch, formImpact, formActions, humanLog.length]);

  return (
    <div className={styles.panel}>
      {/* Trigger scenarios grid */}
      <SpeakerHint text="Click any scenario. This shows the DIOS response in real time — detection to resolution in under 2 seconds. Pause on the recovery timeline.">
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Disruption Scenarios — Simulate DIOS Response</div>
          <div className={styles.triggerGrid}>
            {DISRUPTION_SCENARIOS.map(scenario => (
              <div key={scenario.id} className={`${styles.triggerCard} ${activeScenario?.id === scenario.id ? styles.triggerActive : ''}`}>
                <div className={styles.triggerTop}>
                  <div className={styles.triggerTitle}>{scenario.title}</div>
                  <span
                    className={styles.severityBadge}
                    style={{
                      background: scenario.severity === 'critical' ? 'rgba(248,113,113,0.12)' : 'rgba(245,158,11,0.12)',
                      color: scenario.severity === 'critical' ? 'var(--err)' : 'var(--warn)',
                    }}
                  >
                    {scenario.severity.toUpperCase()}
                  </span>
                </div>
                <div className={styles.triggerDesc}>{scenario.description}</div>
                <button
                  className={styles.simulateBtn}
                  onClick={() => handleSimulate(scenario)}
                >
                  Simulate
                </button>
              </div>
            ))}
          </div>
        </div>
      </SpeakerHint>

      {/* Active response */}
      {activeScenario && (
        <div className={styles.responsePanel}>
          <div className={styles.responseHeader}>
            <div>
              <div className={styles.responseTitle}>{activeScenario.title}</div>
              <div className={styles.responseSource}>{activeScenario.source}</div>
            </div>
            <button className={styles.closeBtn} onClick={() => setActiveScenario(null)}>Close</button>
          </div>

          <div className={styles.responseGrid}>
            {/* Detected */}
            <div className={styles.responseCol}>
              <div className={styles.colTitle}>Detected</div>
              <div className={styles.detectedText}>{activeScenario.source}</div>
            </div>

            {/* DIOS Response */}
            <div className={styles.responseCol}>
              <div className={styles.colTitle}>DIOS Response</div>
              <div className={styles.actionList}>
                {activeScenario.responseActions.slice(0, revealedActions).map((action, i) => (
                  <div key={i} className={styles.actionItem}>
                    <span className={styles.checkmark}>&#10003;</span>
                    <span>{action}</span>
                  </div>
                ))}
                {revealedActions < activeScenario.responseActions.length && (
                  <div className={styles.actionPending}>Processing...</div>
                )}
              </div>
            </div>

            {/* Impact Avoided */}
            <div className={styles.responseCol}>
              <div className={styles.colTitle}>Impact Avoided</div>
              {activeScenario.impactAvoided.map(item => (
                <div key={item.label} className={styles.impactRow}>
                  <span className={styles.impactLabel}>{item.label}</span>
                  <span className={`${styles.mono} ${styles.impactValue}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recovery timeline */}
          <div className={styles.timeline}>
            <div className={styles.timelineTitle}>Recovery Timeline</div>
            <div className={styles.timelineTrack}>
              {activeScenario.recoveryMilestones.map((ms, i) => (
                <div key={ms.label} className={styles.milestone}>
                  <div className={`${styles.milestoneCircle} ${i < 3 ? styles.milestoneDone : ''}`}>
                    {i < 3 ? '\u2713' : i + 1}
                  </div>
                  <div className={styles.milestoneLabel}>{ms.label}</div>
                  <div className={`${styles.mono} ${styles.milestoneTime}`}>{ms.time}</div>
                  {i < activeScenario.recoveryMilestones.length - 1 && (
                    <div className={styles.milestoneLine} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Human emergency log */}
      <div className={styles.humanLogSection}>
        <div className={styles.humanLogBanner}>
          Human-managed records only. AI does not auto-respond to entries here. These records are for compliance, audit, and human coordination only.
        </div>

        <div className={styles.humanForm}>
          <div className={styles.formTitle}>Log Emergency Event</div>
          <div className={styles.formGrid}>
            <select
              className={styles.formInput}
              value={formCategory}
              onChange={e => setFormCategory(e.target.value)}
            >
              <option value="">Category...</option>
              <option>Regulatory</option>
              <option>Infrastructure</option>
              <option>Staff</option>
              <option>Security</option>
              <option>Other</option>
            </select>
            <select
              className={styles.formInput}
              value={formSeverity}
              onChange={e => setFormSeverity(e.target.value)}
            >
              <option value="">Severity...</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
            <input
              className={styles.formInput}
              placeholder="Region"
              value={formRegion}
              onChange={e => setFormRegion(e.target.value)}
            />
            <input
              className={styles.formInput}
              placeholder="Branch"
              value={formBranch}
              onChange={e => setFormBranch(e.target.value)}
            />
          </div>
          <textarea
            className={styles.formTextarea}
            placeholder="Impact description"
            value={formImpact}
            onChange={e => setFormImpact(e.target.value)}
            rows={2}
          />
          <textarea
            className={styles.formTextarea}
            placeholder="Actions taken"
            value={formActions}
            onChange={e => setFormActions(e.target.value)}
            rows={2}
          />
          <button className={styles.submitBtn} onClick={handleHumanSubmit}>
            Log Event
          </button>
        </div>

        <div className={styles.humanLogList}>
          {humanLog.map(entry => (
            <div key={entry.id} className={styles.humanEntry}>
              <div className={styles.humanEntryHeader}>
                <span className={`${styles.mono} ${styles.humanEntryId}`}>{entry.id}</span>
                <span className={`${styles.mono} ${styles.humanEntryTs}`}>{entry.timestamp}</span>
                <span className={styles.humanEntryCategory}>{entry.category}</span>
                <span
                  className={styles.humanEntrySeverity}
                  style={{
                    color: entry.severity === 'High' || entry.severity === 'Critical' ? 'var(--warn)' : 'var(--text-3)'
                  }}
                >
                  {entry.severity}
                </span>
                <span className={styles.humanEntryBranch}>{entry.region} — {entry.branch}</span>
              </div>
              <div className={styles.humanEntryImpact}>{entry.impact}</div>
              {entry.actions && (
                <div className={styles.humanEntryActions}>{entry.actions}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
