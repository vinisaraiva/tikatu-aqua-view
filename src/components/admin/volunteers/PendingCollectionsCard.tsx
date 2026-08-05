import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BellRing, CalendarClock, Loader2 } from 'lucide-react';
import { useCollectionCompliance, ComplianceStatus } from '@/hooks/admin/useCollectionCompliance';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const STATUS_LABEL: Record<ComplianceStatus, string> = {
  on_time: 'Em dia',
  off_window: 'Fora do horário',
  missed: 'Pendente',
};

const STATUS_VARIANT: Record<ComplianceStatus, 'default' | 'secondary' | 'destructive'> = {
  on_time: 'default',
  off_window: 'secondary',
  missed: 'destructive',
};

export function PendingCollectionsCard() {
  const [days, setDays] = useState('7');
  const [statusFilter, setStatusFilter] = useState<'all' | ComplianceStatus>('missed');
  const [sendingId, setSendingId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: items, isLoading, refetch } = useCollectionCompliance(Number(days));

  const filtered = useMemo(() => {
    if (!items) return [];
    return statusFilter === 'all' ? items : items.filter((i) => i.status === statusFilter);
  }, [items, statusFilter]);

  const missedCount = items?.filter((i) => i.status === 'missed').length ?? 0;

  const handleSendReminder = async (scheduleId: string) => {
    setSendingId(scheduleId);
    try {
      const { data, error } = await supabase.functions.invoke('volunteer-collection-reminders', {
        body: { schedule_id: scheduleId },
      });

      if (error) throw error;

      const sent = (data as any)?.sent ?? 0;
      toast({
        title: sent > 0 ? 'Lembrete enviado' : 'Nenhum dispositivo',
        description:
          sent > 0
            ? 'A notificação foi enviada ao voluntário.'
            : 'O voluntário ainda não registrou um dispositivo para notificações.',
        variant: sent > 0 ? 'default' : 'destructive',
      });
      refetch();
    } catch (error) {
      console.error('Erro ao enviar lembrete:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o lembrete.',
        variant: 'destructive',
      });
    } finally {
      setSendingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5" />
              Coletas pendentes
              {missedCount > 0 && <Badge variant="destructive">{missedCount}</Badge>}
            </CardTitle>
            <CardDescription>
              Comparação entre a agenda dos voluntários e as coletas registradas.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="15">Últimos 15 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="missed">Pendentes</SelectItem>
                <SelectItem value="off_window">Fora do horário</SelectItem>
                <SelectItem value="on_time">Em dia</SelectItem>
                <SelectItem value="all">Todas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando agenda...
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma ocorrência encontrada para este filtro.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Voluntário</TableHead>
                  <TableHead>Ponto</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Previsto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 100).map((item) => (
                  <TableRow key={item.key}>
                    <TableCell>
                      <div className="font-medium">{item.volunteer_name}</div>
                      <div className="text-xs text-muted-foreground">{item.volunteer_code}</div>
                    </TableCell>
                    <TableCell>{item.point_name}</TableCell>
                    <TableCell>{new Date(`${item.date}T12:00:00`).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{item.scheduled_time}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={STATUS_VARIANT[item.status]} className="w-fit">
                          {STATUS_LABEL[item.status]}
                        </Badge>
                        {item.collected_time && (
                          <span className="text-xs text-muted-foreground">
                            enviado {item.collected_time}
                          </span>
                        )}
                        {item.status === 'missed' && !item.has_push && (
                          <span className="text-xs text-muted-foreground">sem push</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.status === 'missed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={sendingId === item.schedule_id || !item.has_push}
                          onClick={() => handleSendReminder(item.schedule_id)}
                        >
                          {sendingId === item.schedule_id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <BellRing className="h-4 w-4" />
                          )}
                          <span className="ml-1 hidden sm:inline">Lembrar</span>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
