import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { codeToHtml } from 'shiki';

export default function CodeBlock({ code, language = 'javascript' }) {
  const [copied, setCopied] = useState(false);
  const [highlightedHtml, setHighlightedHtml] = useState('');

  useEffect(() => {
    if (!code) return;

    let cancelled = false;

    codeToHtml(code, {
      lang: language,
      theme: 'vitesse-dark',
    })
      .then((html) => {
        if (!cancelled) setHighlightedHtml(html);
      })
      .catch(() => {
        // Fallback: plain text
        if (!cancelled) setHighlightedHtml('');
      });

    return () => {
      cancelled = true;
    };
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent fail
    }
  };

  return (
    <div className="relative group rounded-xl overflow-hidden border border-[var(--bg-border)]">
      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--bg-border)] text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-indigo)] transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="Copy code"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-[var(--success)]" />
            <span className="text-[var(--success)]">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>Copy</span>
          </>
        )}
      </button>

      {/* Code Content */}
      {highlightedHtml ? (
        <div
          className="codeblock-shiki overflow-x-auto bg-[var(--code-bg)] p-5 text-sm font-mono leading-relaxed"
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      ) : (
        <pre className="overflow-x-auto bg-[var(--code-bg)] p-5 text-sm font-mono leading-relaxed text-[var(--code-text)]">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
