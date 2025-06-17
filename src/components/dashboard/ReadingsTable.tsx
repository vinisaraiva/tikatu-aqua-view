
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getStatusBadge, getAnomalyIcon } from './ReadingsStatus';

interface Reading {
  id: string;
  parameter: string;
  value: number;
  unit: string;
  datetime: string;
  conamaStatus: 'normal' | 'attention' | 'critical';
  hasAnomaly: boolean;
  point: string;
}

interface ReadingsTableProps {
  readings: Reading[];
}

const ReadingsTable = ({ readings }: ReadingsTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ponto</TableHead>
            <TableHead>Parâmetro</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Data/Hora</TableHead>
            <TableHead>Status CONAMA</TableHead>
            <TableHead>Anomalia</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {readings.map((reading) => (
            <TableRow key={reading.id}>
              <TableCell className="font-medium">
                {reading.point}
              </TableCell>
              <TableCell className="font-medium">
                {reading.parameter}
              </TableCell>
              <TableCell>
                {reading.value} {reading.unit}
              </TableCell>
              <TableCell>
                {new Date(reading.datetime).toLocaleString('pt-BR')}
              </TableCell>
              <TableCell>
                {getStatusBadge(reading.conamaStatus)}
              </TableCell>
              <TableCell>
                {getAnomalyIcon(reading.hasAnomaly)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReadingsTable;
