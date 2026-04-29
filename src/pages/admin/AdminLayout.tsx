import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import CommandBridgePanel from '../shared/CommandBridgePanel';
import ReplenishmentPanel from '../shared/ReplenishmentPanel';
import NetworkPanel from '../shared/NetworkPanel';
import MarginEnginePanel from '../shared/MarginEnginePanel';
import DisruptionPanel from '../shared/DisruptionPanel';
import LedgerPanel from '../shared/LedgerPanel';
import StrategyPanel from '../shared/StrategyPanel';

export default function AdminLayout() {
  return (
    <div className="dashboard-shell">
      <Sidebar role="admin" />
      <div className="main-area">
        <div className="panel-scroll">
          <Routes>
            <Route index element={<Navigate to="command" replace />} />
            <Route path="command" element={<CommandBridgePanel />} />
            <Route path="replenishment" element={<ReplenishmentPanel />} />
            <Route path="network" element={<NetworkPanel />} />
            <Route path="margin" element={<MarginEnginePanel />} />
            <Route path="disruption" element={<DisruptionPanel />} />
            <Route path="ledger" element={<LedgerPanel />} />
            <Route path="strategy" element={<StrategyPanel />} />
            <Route path="*" element={<Navigate to="command" replace />} />
          </Routes>
        </div>
        <div className="makkook-footer">Powered by Makkook — Intelligence that Commands.</div>
      </div>
    </div>
  );
}
