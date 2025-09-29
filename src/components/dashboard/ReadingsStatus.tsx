
import { Badge } from '@/components/ui/badge';
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';

export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'normal':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Normal</Badge>;
    case 'attention':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Atenção</Badge>;
    case 'critical':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Crítico</Badge>;
    default:
      return <Badge variant="secondary">-</Badge>;
  }
};

export const getAnomalyIcon = (hasAnomaly: boolean) => {
  if (hasAnomaly) {
    return <XCircleIcon className="h-4 w-4 text-red-500" />;
  }
  return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
};
