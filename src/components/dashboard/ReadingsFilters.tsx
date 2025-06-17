
interface ReadingsFiltersProps {
  city: string;
  river: string;
  points: string[];
  parameter: string; // This is now the parameter CODE
  startDate?: Date;
  endDate?: Date;
}

const ReadingsFilters = ({ city, river, points, parameter, startDate, endDate }: ReadingsFiltersProps) => {
  const getDateRangeText = () => {
    if (startDate && endDate) {
      return `${startDate.toLocaleDateString('pt-BR')} - ${endDate.toLocaleDateString('pt-BR')}`;
    } else if (startDate) {
      return startDate.toLocaleDateString('pt-BR');
    }
    return 'Dados recentes';
  };

  const getParameterText = () => {
    if (!parameter) return 'Todos os parâmetros';
    // Display the parameter code since we now receive the code instead of description
    return parameter;
  };

  return (
    <p className="text-sm text-gray-600">
      {city} → {river} → {points.join(', ')} | {getDateRangeText()} | {getParameterText()}
    </p>
  );
};

export default ReadingsFilters;
