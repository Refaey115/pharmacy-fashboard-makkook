import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar            from '../../components/Sidebar';
import LiveAiBar          from '../../components/LiveAiBar';
import KpiPanel           from './KpiPanel';
import DemandPanel        from './DemandPanel';
import SupplyPanel        from './SupplyPanel';
import InventoryPanel     from './InventoryPanel';
import RoiPanel           from './RoiPanel';
import LogPanel           from './LogPanel';
import ControlCenterPanel from '../shared/ControlCenterPanel';
import PriceForecastPanel from '../shared/PriceForecastPanel';
import SkuAffinityPanel   from '../shared/SkuAffinityPanel';
import ReplenishmentPanel from '../shared/ReplenishmentPanel';
import CashFlowPanel      from '../shared/CashFlowPanel';

export default function AdminLayout() {
  return (
    <div className="dashboard-shell">
      <Sidebar role="admin" />
      <div className="main-area">
        <LiveAiBar />
        <div className="panel-scroll">
          <Routes>
            <Route index                  element={<Navigate to="kpi" replace />} />
            <Route path="kpi"             element={<KpiPanel />} />
            <Route path="demand"          element={<DemandPanel />} />
            <Route path="supply"          element={<SupplyPanel />} />
            <Route path="inventory"       element={<InventoryPanel />} />
            <Route path="roi"             element={<RoiPanel />} />
            <Route path="log"             element={<LogPanel />} />
            <Route path="control"         element={<ControlCenterPanel />} />
            <Route path="forecast"        element={<PriceForecastPanel />} />
            <Route path="affinity"        element={<SkuAffinityPanel />} />
            <Route path="replenishment"   element={<ReplenishmentPanel />} />
            <Route path="cashflow"        element={<CashFlowPanel />} />
            <Route path="*"               element={<Navigate to="kpi" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
