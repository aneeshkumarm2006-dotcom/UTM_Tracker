import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import ConfirmModal from '@/components/ConfirmModal';
import { Eye, EyeOff, Copy, Check, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function maskKey(key) {
  if (!key || key.length < 12) return key || '';
  return key.slice(0, 8) + '...' + key.slice(-4);
}

export default function ApiKey() {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const queryClient = useQueryClient();
  const setApiKey = useAuthStore((s) => s.setApiKey);

  const { data, isLoading } = useQuery({
    queryKey: ['apikey'],
    queryFn: async () => {
      const { data } = await api.get('/api/dashboard/apikey');
      return data;
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/api/dashboard/apikey/regenerate');
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['apikey'] });
      queryClient.invalidateQueries({ queryKey: ['snippet'] });
      setApiKey(data.apiKey);
      toast.success('API key regenerated. Update your snippet!');
      setConfirmOpen(false);
    },
    onError: () => {
      toast.error('Failed to regenerate API key');
    },
  });

  const apiKey = data?.apiKey || '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent fail
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-[var(--bg-surface)] rounded-lg animate-pulse" />
        <div className="h-24 bg-[var(--bg-surface)] rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          API Key
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Your key is embedded in your snippet automatically. Keep this private.
        </p>
      </div>

      {/* Key Display */}
      <div className="rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface)] p-5 space-y-4">
        <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
          Your API Key
        </label>

        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--bg-base)] border border-[var(--bg-border)] font-mono text-sm">
            <span className="text-[var(--text-primary)] select-all flex-1 overflow-hidden">
              {revealed ? apiKey : maskKey(apiKey)}
            </span>
          </div>

          {/* Eye toggle */}
          <button
            onClick={() => setRevealed((r) => !r)}
            className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--bg-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-indigo)] transition-all"
            aria-label={revealed ? 'Hide key' : 'Reveal key'}
          >
            {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--bg-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-indigo)] transition-all"
            aria-label="Copy key"
          >
            {copied ? (
              <Check className="w-4 h-4 text-[var(--success)]" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Regenerate */}
      <div className="rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface)] p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Regenerate API Key
          </h3>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            This will invalidate your current key immediately. Any snippet using the old key will stop tracking.
          </p>
        </div>

        <button
          onClick={() => setConfirmOpen(true)}
          disabled={regenerateMutation.isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {regenerateMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Regenerate Key
        </button>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Regenerate API Key?"
        description="This will break any existing snippets using the old key. You will need to update your snippet with the new key."
        onConfirm={() => regenerateMutation.mutate()}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
