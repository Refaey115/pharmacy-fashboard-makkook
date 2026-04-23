import { useState } from 'react';
import KpiCard from './KpiCard';
import { KPI_DATA } from '../data/mockData';
import type { KpiDef } from '../data/mockData';

interface Props {
  editable?: boolean;
}

export default function KpiRow({ editable = false }: Props) {
  const [kpis, setKpis] = useState<KpiDef[]>(KPI_DATA);

  const handleChange = (id: string, val: string) => {
    setKpis(prev =>
      prev.map(k => k.id === id ? { ...k, value: val, numericValue: parseFloat(val) || k.numericValue } : k)
    );
  };

  return (
    <div className="grid-3" style={{ marginBottom: 24 }}>
      {kpis.map(kpi => (
        <KpiCard
          key={kpi.id}
          kpi={kpi}
          editable={editable}
          onValueChange={handleChange}
        />
      ))}
    </div>
  );
}
