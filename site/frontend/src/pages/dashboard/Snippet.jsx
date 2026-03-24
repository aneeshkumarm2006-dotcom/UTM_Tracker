import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import CodeBlock from '@/components/CodeBlock';
import PageTitle from '@/components/PageTitle';
import { AlertTriangle, Copy, Check, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function Snippet() {
  const [copied, setCopied] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['snippet'],
    queryFn: async () => {
      const { data } = await api.get('/api/dashboard/snippet');
      return data;
    },
    retry: false,
  });

  const snippet = data?.snippet || '';
  const configNotSaved =
    isError && error?.response?.status === 400;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
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
        <div className="h-64 bg-[var(--bg-surface)] rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <PageTitle
        title="Snippet"
        description="Copy your auto-generated tracking snippet and paste it into your website."
      />

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Your Snippet
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Copy this script and paste it into your website's header.
        </p>
      </div>

      {/* Warning if config not saved */}
      {configNotSaved && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--warn)]/10 border border-[var(--warn)]/20">
          <AlertTriangle className="w-5 h-5 text-[var(--warn)] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[var(--warn)]">
              Configuration required
            </p>
            <p className="text-sm text-[var(--warn)]/80 mt-0.5">
              Save your configuration first before generating a snippet. Go to the Configure page to set up your trigger page, button ID, and field mappings.
            </p>
          </div>
        </div>
      )}

      {/* Snippet Code Block */}
      {snippet && (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Generated Script
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--accent-indigo)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied! ✓
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Snippet
                  </>
                )}
              </button>
            </div>
            <CodeBlock code={snippet} language="html" />
          </div>

          {/* How to Install */}
          <div className="rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface)] p-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              How to install
            </h3>
            <ol className="space-y-4">
              {[
                {
                  step: 1,
                  title: 'Install WPCode plugin',
                  desc: 'Install the free WPCode plugin (formerly "Insert Headers and Footers") in your WordPress dashboard.',
                },
                {
                  step: 2,
                  title: 'Add Snippet',
                  desc: 'Go to WPCode → Add Snippet → choose "Add Your Custom Code" → paste the code above.',
                },
                {
                  step: 3,
                  title: 'Set Location',
                  desc: 'Under "Insertion", set the location to "Site Wide Header".',
                },
                {
                  step: 4,
                  title: 'Activate',
                  desc: 'Toggle the snippet to Active and click Save. That\'s it!',
                },
              ].map((item) => (
                <li key={item.step} className="flex gap-4">
                  <span className="shrink-0 w-8 h-8 rounded-lg bg-[var(--accent-indigo)]/10 border border-[var(--accent-indigo)]/20 flex items-center justify-center text-sm font-bold text-[var(--accent-indigo)]">
                    {item.step}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {item.title}
                    </p>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}

      {/* Error state (non-config error) */}
      {isError && !configNotSaved && (
        <div className="p-8 text-center rounded-xl border border-[var(--bg-border)] bg-[var(--bg-surface)]">
          <p className="text-[var(--text-muted)]">Failed to load snippet. Please try again.</p>
        </div>
      )}
    </div>
  );
}
