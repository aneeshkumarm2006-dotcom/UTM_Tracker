import { useState } from 'react';
import { useConversions } from '@/hooks/useConversions';
import ConversionRow from '@/components/ConversionRow';
import PageTitle from '@/components/PageTitle';
import { Download, ChevronLeft, ChevronRight, Search, Inbox, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function Overview() {
  const [page, setPage] = useState(1);
  const [source, setSource] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [exporting, setExporting] = useState(false);

  const filters = {
    page,
    limit: 50,
    ...(source && { source }),
    ...(fromDate && { from: fromDate }),
    ...(toDate && { to: toDate }),
  };

  const { data, isLoading, isError } = useConversions(filters);

  const conversions = data?.conversions || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 50) || 1;

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const params = {};
      if (source) params.source = source;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      const response = await api.get('/api/dashboard/conversions/export', {
        params,
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `conversions-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported successfully');
    } catch {
      toast.error('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const handleFilterReset = () => {
    setSource('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const hasActiveFilters = source || fromDate || toDate;

  return (
    <div className="space-y-6">
      <PageTitle
        title="Conversions"
        description="View and filter your UTM conversion data."
      />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Conversions
          </h2>
          {!isLoading && (
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {total} total conversion{total !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          onClick={handleExportCSV}
          disabled={total === 0 || exporting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--bg-border)] text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent-indigo)] hover:text-[var(--accent-indigo)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {exporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Export CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-3 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--bg-border)]">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
            Source
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={source}
              onChange={(e) => {
                setSource(e.target.value);
                setPage(1);
              }}
              placeholder="e.g. google"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--bg-border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-indigo)] focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="min-w-[160px]">
          <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
            From
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--bg-border)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-indigo)] focus:border-transparent transition-all [color-scheme:dark]"
          />
        </div>

        <div className="min-w-[160px]">
          <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
            To
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-lg bg-[var(--bg-base)] border border-[var(--bg-border)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-indigo)] focus:border-transparent transition-all [color-scheme:dark]"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleFilterReset}
            className="px-3 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)] transition-all"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table / Card View */}
      <div className="rounded-xl border border-[var(--bg-border)] overflow-hidden bg-[var(--bg-surface)]/30">
        {isLoading ? (
          /* ── Loading Skeletons ── */
          <div className="p-4 space-y-3">
            {/* Skeleton table header */}
            <div className="hidden sm:flex items-center gap-4 px-4 py-3 border-b border-[var(--bg-border)]">
              {[120, 80, 80, 140, 100].map((w, i) => (
                <div
                  key={i}
                  className="h-3 rounded bg-[var(--bg-border)] animate-pulse"
                  style={{ width: w, animationDelay: `${i * 60}ms` }}
                />
              ))}
            </div>
            {/* Skeleton rows */}
            {[...Array(6)].map((_, i) => (
              <div key={i}>
                {/* Desktop skeleton row */}
                <div className="hidden sm:flex items-center gap-4 px-4 py-4">
                  <div className="h-4 w-20 rounded bg-[var(--bg-surface)] animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
                  <div className="h-6 w-16 rounded-full bg-[var(--bg-surface)] animate-pulse" style={{ animationDelay: `${i * 80 + 30}ms` }} />
                  <div className="h-4 w-12 rounded bg-[var(--bg-surface)] animate-pulse" style={{ animationDelay: `${i * 80 + 60}ms` }} />
                  <div className="h-4 w-28 rounded bg-[var(--bg-surface)] animate-pulse" style={{ animationDelay: `${i * 80 + 90}ms` }} />
                  <div className="h-4 w-24 rounded bg-[var(--bg-surface)] animate-pulse" style={{ animationDelay: `${i * 80 + 120}ms` }} />
                </div>
                {/* Mobile skeleton card */}
                <div className="sm:hidden p-4 rounded-lg bg-[var(--bg-surface)] animate-pulse space-y-3" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-16 rounded-full bg-[var(--bg-border)]" />
                    <div className="h-3 w-14 rounded bg-[var(--bg-border)]" />
                  </div>
                  <div className="h-3 w-32 rounded bg-[var(--bg-border)]" />
                  <div className="h-3 w-24 rounded bg-[var(--bg-border)]" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 text-center">
            <p className="text-[var(--text-muted)]">Failed to load conversions. Please try again.</p>
          </div>
        ) : conversions.length === 0 ? (
          /* Empty State */
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-[var(--bg-surface)] border border-[var(--bg-border)] flex items-center justify-center mb-5">
              <Inbox className="w-10 h-10 text-[var(--text-muted)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              No conversions yet
            </h3>
            <p className="text-sm text-[var(--text-muted)] max-w-sm">
              Paste your snippet into your website to start tracking UTM conversions. They'll appear here in real time.
            </p>
          </div>
        ) : (
          <>
            {/* ── Desktop Table ── */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--bg-border)] bg-[var(--bg-surface)]/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      Medium
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      Captured
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {conversions.map((conv) => (
                    <ConversionRow key={conv._id} conversion={conv} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Card View (<sm / <480px-ish) ── */}
            <div className="sm:hidden divide-y divide-[var(--bg-border)]">
              {conversions.map((conv) => (
                <MobileConversionCard key={conv._id} conversion={conv} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--bg-border)]">
                <span className="text-sm text-[var(--text-muted)]">
                  Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ── Mobile Conversion Card ── */
import UtmBadge from '@/components/UtmBadge';
import { ChevronDown } from 'lucide-react';

function formatTimestamp(ts) {
  if (!ts) return '—';
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function MobileConversionCard({ conversion }) {
  const [expanded, setExpanded] = useState(false);
  const captured = conversion.captured || {};
  const capturedKeys = Object.keys(captured);

  return (
    <div
      className="p-4 cursor-pointer hover:bg-[var(--bg-surface)]/50 transition-colors"
      onClick={() => setExpanded((e) => !e)}
    >
      {/* Top row: badge + timestamp */}
      <div className="flex items-center justify-between mb-2">
        <UtmBadge source={conversion.utm_source} />
        <span className="text-xs text-[var(--text-muted)]">
          {formatTimestamp(conversion.timestamp)}
        </span>
      </div>

      {/* Campaign + Medium */}
      <div className="space-y-1 mb-2">
        {conversion.utm_campaign && (
          <p className="text-sm text-[var(--text-primary)] truncate">
            {conversion.utm_campaign}
          </p>
        )}
        {conversion.utm_medium && (
          <p className="text-xs text-[var(--text-muted)]">
            {conversion.utm_medium}
          </p>
        )}
      </div>

      {/* Captured toggle */}
      {capturedKeys.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
          <span>{capturedKeys.length} captured field{capturedKeys.length !== 1 ? 's' : ''}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      )}

      {/* Expanded captured fields */}
      {expanded && capturedKeys.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {capturedKeys.map((key) => (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-base)] border border-[var(--bg-border)] text-xs"
            >
              <span className="text-[var(--text-muted)] font-medium">{key}:</span>
              <span className="text-[var(--text-primary)]">{captured[key]}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
