
const ChartLegend = () => {
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
    </div>
  );
};

export default ChartLegend;
