const SOURCE_COLORS = {
  google: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  meta: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
  facebook: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
  chatgpt: 'bg-teal-500/15 text-teal-400 border-teal-500/20',
  bing: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  twitter: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
  linkedin: 'bg-blue-600/15 text-blue-300 border-blue-600/20',
};

const DEFAULT_COLOR = 'bg-gray-500/15 text-gray-400 border-gray-500/20';

export default function UtmBadge({ source }) {
  const label = (source || '—').toLowerCase();
  const colorClass = SOURCE_COLORS[label] || DEFAULT_COLOR;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass} whitespace-nowrap`}
    >
      {label}
    </span>
  );
}
