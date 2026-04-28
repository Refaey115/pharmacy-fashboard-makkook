import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import LiveAiBar from '../../components/LiveAiBar';
import CommandBridgePanel from '../shared/CommandBridgePanel';
import ReplenishmentPanel from '../shared/ReplenishmentPanel';
import NetworkPanel from '../shared/NetworkPanel';
import MarginEnginePanel from '../shared/MarginEnginePanel';
import DisruptionPanel from '../shared/DisruptionPanel';
import LedgerPanel from '../shared/LedgerPanel';

export default function ClientLayout() {
  return (
    <div className="dashboard-shell">
      <Sidebar role="client" />
      <div className="main-area">
        <LiveAiBar />
        <div className="panel-scroll">
          <Routes>
            <Route index element={<Navigate to="command" replace />} />
            <Route path="command" element={<CommandBridgePanel />} />
            <Route path="replenishment" element={<ReplenishmentPanel />} />
            <Route path="network" element={<NetworkPanel />} />
            <Route path="margin" element={<MarginEnginePanel />} />
            <Route path="disruption" element={<DisruptionPanel />} />
            <Route path="ledger" element={<LedgerPanel />} />
            <Route path="*" element={<Navigate to="command" replace />} />
          </Routes>
        </div>
        <div className="makkook-footer">Powered by Makkook — Intelligence that Commands.</div>
      </div>
    </div>
  );
}
