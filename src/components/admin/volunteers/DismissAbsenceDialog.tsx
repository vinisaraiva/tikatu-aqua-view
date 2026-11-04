import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ABSENCE_LABEL, AbsenceReason, ComplianceItem } from '@/hooks/admin/useCollectionCompliance';

interface Props {
  item: ComplianceItem | null;
  onClose: () => void;
  onSaved: () => void;
}

export function DismissAbsenceDialog({ item, onClose, onSaved }: Props) {
  const [reason, setReason] = useState<AbsenceReason>('outro');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!item) return;
    setSaving(true);
    const { error } = await supabase.from('collection_absences').insert({
      volunteer_id: item.volunteer_id,
      point_id: item.point_id,
      schedule_id: item.schedule_id,
      absence_date: item.date,
      reason,
      notes: notes.trim() || 'Dispensado pelo administrador',
    });
    setSaving(false);
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível dispensar o aviso.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Aviso dispensado', description: 'A justificativa foi registrada.' });
    setReason('outro');
    setNotes('');
    onSaved();
  };

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dispensar coleta pendente</DialogTitle>
          <DialogDescription>
            {item &&
              `${item.volunteer_name} · ${item.point_name} · ${new Date(`${item.date}T12:00:00`).toLocaleDateString('pt-BR')}`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Motivo</Label>
            <Select value={reason} onValueChange={(v) => setReason(v as AbsenceReason)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ABSENCE_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Observação (opcional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Dispensar aviso
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
