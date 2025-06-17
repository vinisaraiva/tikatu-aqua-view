
import { ReferenceLine } from 'recharts';

interface ConamaReferenceLinesProps {
  conamaMin?: number | null;
  conamaMax?: number | null;
}

const ConamaReferenceLines = ({ conamaMin, conamaMax }: ConamaReferenceLinesProps) => {
  console.log('ConamaReferenceLines - Rendering with values:', { conamaMin, conamaMax });
  
  return (
    <>
      {conamaMin !== undefined && conamaMin !== null && (
        <ReferenceLine 
          y={conamaMin} 
          stroke="#22c55e" 
          strokeWidth={3} 
          strokeDasharray="8 4" 
          ifOverflow="extendDomain"
          label={{ 
            value: `Min CONAMA: ${conamaMin}`, 
            position: "topLeft", 
            fill: '#22c55e',
            fontSize: 12,
            fontWeight: 'bold',
            offset: 10
          }}
        />
      )}
      {conamaMax !== undefined && conamaMax !== null && (
        <ReferenceLine 
          y={conamaMax} 
          stroke="#f97316" 
          strokeWidth={3} 
          strokeDasharray="8 4" 
          ifOverflow="extendDomain"
          label={{ 
            value: `Max CONAMA: ${conamaMax}`, 
            position: "topLeft", 
            fill: '#f97316',
            fontSize: 12, 
            fontWeight: 'bold',
            offset: 10
          }}
        />
      )}
    </>
  );
};

export default ConamaReferenceLines;
