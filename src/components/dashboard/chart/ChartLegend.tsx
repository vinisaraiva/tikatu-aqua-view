
interface ChartLegendProps {
  conamaMin?: number | null;
  conamaMax?: number | null;
}

const ChartLegend = ({ conamaMin, conamaMax }: ChartLegendProps) => {
  return (
    <div className="mt-4 flex flex-wrap gap-6 justify-center text-sm">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-green-500 rounded"></div>
        <span>Normal</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
        <span>Atenção</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-red-500 rounded"></div>
        <span>Crítico</span>
      </div>
      {conamaMin !== undefined && conamaMin !== null && (
        <div className="flex items-center gap-2">
          <div className="w-10 h-0 border-t-2 border-green-500 border-dashed"></div>
          <span>Min CONAMA: {conamaMin}</span>
        </div>
      )}
      {conamaMax !== undefined && conamaMax !== null && (
        <div className="flex items-center gap-2">
          <div className="w-10 h-0 border-t-2 border-orange-500 border-dashed"></div>
          <span>Max CONAMA: {conamaMax}</span>
        </div>
      )}
    </div>
  );
};

export default ChartLegend;
