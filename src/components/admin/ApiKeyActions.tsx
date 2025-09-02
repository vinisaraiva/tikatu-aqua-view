import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Key, RotateCcw, Eye } from 'lucide-react';
import { ApiKeyDisplayDialog } from './ApiKeyDisplayDialog';
import { ConfirmDialog } from './ConfirmDialog';
import { useViewApiKey, useRegenerateApiKey } from '@/hooks/admin/useApiKey';

interface ApiKeyActionsProps {
  volunteer: {
    id: number;
    code: string;
    nome?: string;
    type: string;
    probe_model?: string;
    probe_serial?: string;
  };
}

export const ApiKeyActions = ({ volunteer }: ApiKeyActionsProps) => {
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [newApiKeyData, setNewApiKeyData] = useState<any>(null);

  const { data: apiKeyData, refetch } = useViewApiKey(volunteer.id);
  const regenerateApiKey = useRegenerateApiKey();

  if (volunteer.type !== 'probe') {
    return null;
  }

  const handleViewApiKey = async () => {
    await refetch();
    setShowViewDialog(true);
  };

  const handleRegenerateConfirm = async () => {
    try {
      const newData = await regenerateApiKey.mutateAsync(volunteer.id);
      setNewApiKeyData(newData);
      setShowRegenerateDialog(false);
      setShowNewKeyDialog(true);
    } catch (error) {
      // Error handled in the hook
    }
  };

  return (
    <>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewApiKey}
          title="Ver API Key"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowRegenerateDialog(true)}
          title="Regenerar API Key"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* View API Key Dialog */}
      {apiKeyData && (
        <ApiKeyDisplayDialog
          open={showViewDialog}
          onClose={() => setShowViewDialog(false)}
          volunteer={apiKeyData}
          mode="view"
        />
      )}

      {/* Regenerate Confirmation Dialog */}
      <ConfirmDialog
        open={showRegenerateDialog}
        onClose={() => setShowRegenerateDialog(false)}
        onConfirm={handleRegenerateConfirm}
        title="Regenerar API Key"
        description={`Tem certeza que deseja regenerar a API key da sonda "${volunteer.code}"? A API key atual será invalidada e uma nova será gerada.`}
        loading={regenerateApiKey.isPending}
      />

      {/* New API Key Dialog */}
      {newApiKeyData && (
        <ApiKeyDisplayDialog
          open={showNewKeyDialog}
          onClose={() => {
            setShowNewKeyDialog(false);
            setNewApiKeyData(null);
          }}
          volunteer={newApiKeyData}
          mode="regenerate"
        />
      )}
    </>
  );
};