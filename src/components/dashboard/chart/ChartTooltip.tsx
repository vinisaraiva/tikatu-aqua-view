import { formatFullDateTime } from './chartLabels';

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  unit: string;
}

const ChartTooltip = ({ active, payload, label, unit }: ChartTooltipProps) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      {data.point && <p className="font-medium">{data.point}</p>}
      <p className="text-sm text-gray-600">
        {data.datetime ? formatFullDateTime(data.datetime) : label}
      </p>
      <p className="text-blue-600">{`Valor: ${data.value} ${unit}`}</p>
      {data.conamaMin !== undefined && data.conamaMin !== null && (
        <p className="text-green-600 text-sm">{`Min CONAMA: ${data.conamaMin} ${unit}`}</p>
      )}
      {data.conamaMax !== undefined && data.conamaMax !== null && (
        <p className="text-orange-600 text-sm">{`Max CONAMA: ${data.conamaMax} ${unit}`}</p>
      )}
      <p className={`text-sm font-medium ${
        data.status === 'normal' ? 'text-green-600' : 
        data.status === 'attention' ? 'text-yellow-600' : 'text-red-600'
      }`}>
        Status: {data.status === 'normal' ? 'Normal' : data.status === 'attention' ? 'Atenção' : 'Crítico'}
      </p>
    </div>
  );
};

export default ChartTooltip;
