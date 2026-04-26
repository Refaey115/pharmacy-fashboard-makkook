import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar              from '../../components/Sidebar';
import LiveAiBar            from '../../components/LiveAiBar';
import KpiPanel             from './KpiPanel';
import InventoryPanel       from './InventoryPanel';
import LogPanel             from './LogPanel';
import CashFlowPanel        from '../shared/CashFlowPanel';
import DemandForecastPanel  from '../shared/DemandForecastPanel';
import ReplenishmentPlanPanel from '../shared/ReplenishmentPlanPanel';
import PurchaseOrdersPanel  from '../shared/PurchaseOrdersPanel';
import SimpleControlCenter  from '../shared/SimpleControlCenter';

// Legacy panels kept as source — not shown in nav
// import ControlCenterPanel from '../shared/ControlCenterPanel';
// import PriceForecastPanel from '../shared/PriceForecastPanel';
// import SkuAffinityPanel   from '../shared/SkuAffinityPanel';
// import ReplenishmentPanel from '../shared/ReplenishmentPanel';
// import DemandPanel        from './DemandPanel';
// import SupplyPanel        from './SupplyPanel';
// import RoiPanel           from './RoiPanel';

export default function ClientLayout() {
  return (
    <div className="dashboard-shell">
      <Sidebar role="client" />
      <div className="main-area">
        <LiveAiBar />
        <div className="panel-scroll">
          <Routes>
            <Route index                   element={<Navigate to="kpi" replace />} />
            <Route path="kpi"              element={<KpiPanel />} />
            <Route path="demandforecast"   element={<DemandForecastPanel />} />
            <Route path="replplan"         element={<ReplenishmentPlanPanel />} />
            <Route path="purchaseorders"   element={<PurchaseOrdersPanel />} />
            <Route path="inventory"        element={<InventoryPanel />} />
            <Route path="cashflow"         element={<CashFlowPanel />} />
            <Route path="optimise"         element={<SimpleControlCenter />} />
            <Route path="log"              element={<LogPanel />} />
            <Route path="*"                element={<Navigate to="kpi" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
