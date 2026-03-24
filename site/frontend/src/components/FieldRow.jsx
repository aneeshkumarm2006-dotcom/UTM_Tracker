import { X } from 'lucide-react';

export default function FieldRow({ field, index, onChange, onRemove, canRemove }) {
  const handleKeyChange = (e) => {
    // Auto-lowercase, remove spaces
    const value = e.target.value.toLowerCase().replace(/\s/g, '');
    onChange(index, 'key', value);
  };

  const handleIdChange = (e) => {
    onChange(index, 'id', e.target.value);
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 group p-3 sm:p-0 rounded-lg sm:rounded-none bg-[var(--bg-surface)] sm:bg-transparent border border-[var(--bg-border)] sm:border-0">
      {/* Mobile labels */}
      <div className="sm:hidden text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
        Key
      </div>
      <div className="flex-1 min-w-0">
        <input
          type="text"
          value={field.key}
          onChange={handleKeyChange}
          placeholder="e.g. name"
          className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--bg-border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-indigo)] focus:border-transparent transition-all"
        />
      </div>

      <div className="sm:hidden text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mt-1">
        DOM Element ID
      </div>
      <div className="flex-1 min-w-0">
        <input
          type="text"
          value={field.id}
          onChange={handleIdChange}
          placeholder="e.g. wpforms-7209-field_1"
          className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--bg-border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-indigo)] focus:border-transparent transition-all"
        />
      </div>

      <button
        type="button"
        onClick={() => onRemove(index)}
        disabled={!canRemove}
        className={`shrink-0 self-end sm:self-center p-2 rounded-lg transition-all ${
          canRemove
            ? 'text-[var(--text-muted)] hover:text-red-400 hover:bg-red-400/10'
            : 'text-[var(--bg-border)] cursor-not-allowed'
        }`}
        aria-label="Remove field"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
