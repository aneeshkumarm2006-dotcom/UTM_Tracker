import { useState } from 'react';
import { useConversions } from '@/hooks/useConversions';
import ConversionRow from '@/components/ConversionRow';
import { Download, ChevronLeft, ChevronRight, Search, Inbox } from 'lucide-react';
import api from '@/lib/api';

export default function Overview() {
  const [page, setPage] = useState(1);
  const [source, setSource] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

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
    } catch {
      // silent fail
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
          disabled={total === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--bg-border)] text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent-indigo)] hover:text-[var(--accent-indigo)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
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

      {/* Table */}
      <div className="rounded-xl border border-[var(--bg-border)] overflow-hidden bg-[var(--bg-surface)]/30">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-12 rounded-lg bg-[var(--bg-surface)] animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
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
            <div className="overflow-x-auto">
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
