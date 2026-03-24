import { Toaster } from 'sonner';

/**
 * Global Toaster component — mount once in App.jsx.
 * Styled to match the dark theme from DESIGN.md.
 */
export default function Toast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'var(--bg-surface)',
          border: '1px solid var(--bg-border)',
          color: 'var(--text-primary)',
          fontFamily: "'Space Grotesk Variable', sans-serif",
          fontSize: '0.875rem',
        },
        className: 'utm-toast',
      }}
      closeButton
      richColors
      duration={3000}
    />
  );
}
