
interface ConamaLegendProps {
  conamaMin?: number | null;
  conamaMax?: number | null;
}

const ConamaLegend = ({ conamaMin, conamaMax }: ConamaLegendProps) => {
  // Only show legend if at least one CONAMA value exists
  if ((conamaMin === undefined || conamaMin === null) && 
      (conamaMax === undefined || conamaMax === null)) {
    return null;
  }

  return (
    <div className="mb-4 flex flex-wrap gap-6 justify-start text-sm border-b border-gray-200 pb-3">
      <span className="text-gray-600 font-medium">Referências CONAMA:</span>
      {conamaMin !== undefined && conamaMin !== null && (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Min: {conamaMin}</span>
        </div>
      )}
      {conamaMax !== undefined && conamaMax !== null && (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span>Max: {conamaMax}</span>
        </div>
      )}
    </div>
  );
};

export default ConamaLegend;
