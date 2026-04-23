import FlowCard from '../../components/FlowCard';
import MiniStat from '../../components/MiniStat';
import { FLOW_DATA, SUPPLY_MINI_STATS } from '../../data/mockData';

export default function SupplyPanel() {
  return (
    <div>
      <div className="section-title">Supply Chain Flows</div>
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {FLOW_DATA.map((item, i) => (
          <FlowCard key={i} item={item} />
        ))}
      </div>
      <div className="section-title">Network Summary</div>
      <div className="grid-3">
        {SUPPLY_MINI_STATS.map(s => (
          <MiniStat key={s.label} label={s.label} value={s.value} sub={s.sub} />
        ))}
      </div>
    </div>
  );
}
