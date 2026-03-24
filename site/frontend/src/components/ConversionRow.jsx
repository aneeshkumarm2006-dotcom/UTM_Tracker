import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import UtmBadge from './UtmBadge';

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

export default function ConversionRow({ conversion }) {
  const [expanded, setExpanded] = useState(false);
  const captured = conversion.captured || {};
  const capturedKeys = Object.keys(captured);

  return (
    <>
      <tr
        onClick={() => setExpanded((e) => !e)}
        className="group cursor-pointer border-b border-[var(--bg-border)] hover:bg-[var(--bg-surface)] transition-colors"
      >
        <td className="px-4 py-3 text-sm text-[var(--text-muted)] whitespace-nowrap">
          {formatTimestamp(conversion.timestamp)}
        </td>
        <td className="px-4 py-3">
          <UtmBadge source={conversion.utm_source} />
        </td>
        <td className="px-4 py-3 text-sm text-[var(--text-muted)] whitespace-nowrap">
          {conversion.utm_medium || '—'}
        </td>
        <td className="px-4 py-3 text-sm text-[var(--text-primary)] whitespace-nowrap max-w-[200px] truncate">
          {conversion.utm_campaign || '—'}
        </td>
        <td className="px-4 py-3 text-sm text-[var(--text-muted)] whitespace-nowrap">
          <span className="flex items-center gap-1.5">
            {capturedKeys.length > 0
              ? capturedKeys.join(', ')
              : '—'}
            <ChevronRight
              className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ${
                expanded ? 'rotate-90' : ''
              }`}
            />
          </span>
        </td>
      </tr>

      {/* Expanded sub-row */}
      {expanded && capturedKeys.length > 0 && (
        <tr className="bg-[var(--bg-surface)]/50 border-b border-[var(--bg-border)]">
          <td colSpan={5} className="px-4 py-3">
            <div className="flex flex-wrap gap-2 pl-2">
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
          </td>
        </tr>
      )}
    </>
  );
}
