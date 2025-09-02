import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Download, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ApiKeyDisplayDialogProps {
  open: boolean;
  onClose: () => void;
  volunteer: {
    code: string;
    nome?: string;
    api_key: string;
    probe_model?: string;
    probe_serial?: string;
  };
}

export const ApiKeyDisplayDialog = ({ open, onClose, volunteer }: ApiKeyDisplayDialogProps) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();

  const copyApiKey = () => {
    navigator.clipboard.writeText(volunteer.api_key);
    toast({
      title: 'Copiado!',
      description: 'API key copiada para a área de transferência.',
    });
  };

  const downloadConfig = () => {
    const config = {
      volunteer_code: volunteer.code,
      volunteer_name: volunteer.nome,
      api_key: volunteer.api_key,
      probe_model: volunteer.probe_model,
      probe_serial: volunteer.probe_serial,
      endpoint: `${window.location.origin}/functions/v1/probe-data`,
      instructions: {
        usage: 'Use esta API key no cabeçalho Authorization: Bearer {api_key}',
        method: 'POST',
        content_type: 'application/json'
      }
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sonda-${volunteer.code}-config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Download iniciado',
      description: 'Arquivo de configuração baixado com sucesso.',
    });
  };

  const maskedApiKey = volunteer.api_key.substring(0, 8) + '...' + volunteer.api_key.substring(volunteer.api_key.length - 8);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">🔑 API Key da Sonda</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800 font-medium">
              ⚠️ Importante: Esta é a única vez que a API key será mostrada!
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Salve-a em local seguro ou baixe o arquivo de configuração.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Código da Sonda:</label>
              <p className="text-lg font-mono bg-gray-50 p-2 rounded border">{volunteer.code}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">API Key:</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-50 p-2 rounded border font-mono text-sm">
                  {showApiKey ? volunteer.api_key : maskedApiKey}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyApiKey}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={downloadConfig}
              className="flex-1"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar Configuração
            </Button>
            <Button 
              onClick={onClose}
              className="flex-1"
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};