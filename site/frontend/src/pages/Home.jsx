import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Key,
  Sliders,
  Code2,
  FormInput,
  Target,
  Database,
  FileDown,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

/* ────────────────────────── sample snippet for hero ────────────────────────── */
const SAMPLE_SNIPPET = `<script>
(function(){
  const API_KEY = 'usr_demo_4fa3b1c9d2e8...';
  const TRACK_URL = 'https://api.trackutm.app/api/track';
  const CONFIG = {
    triggerPage: '/get-a-quote/',
    buttonId: 'wpforms-submit-7209',
    fields: [
      { key: 'name',  id: 'wpforms-7209-field_1' },
      { key: 'email', id: 'wpforms-7209-field_2' },
      { key: 'phone', id: 'wpforms-7209-field_3' }
    ]
  };

  // Save UTMs to sessionStorage
  function saveUTMs() {
    const params = new URLSearchParams(location.search);
    ['source','medium','campaign','content','term']
      .forEach(k => {
        const v = params.get('utm_' + k);
        if (v) sessionStorage.setItem('utm_' + k, v);
      });
  }

  saveUTMs();
})();
</script>`;

/* ───────────────────────── simple syntax highlighter ──────────────────────── */
function highlightSyntax(code) {
  // Escape HTML first
  let html = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Strings (single-quoted and double-quoted) — teal
  html = html.replace(
    /(&quot;|&#39;|'|")(.*?)(\1)/g,
    '<span class="text-[#A5F3FC]">$1$2$3</span>'
  );
  // Template literals / backtick strings
  html = html.replace(
    /`([^`]*)`/g,
    '<span class="text-[#A5F3FC]">`$1`</span>'
  );

  // Keywords — purple
  const keywords = ['const', 'let', 'var', 'function', 'if', 'return', 'new', 'forEach', 'true', 'false'];
  keywords.forEach((kw) => {
    const re = new RegExp(`\\b(${kw})\\b`, 'g');
    html = html.replace(re, '<span class="text-[#A78BFA]">$1</span>');
  });

  // Comments — muted
  html = html.replace(
    /(\/\/.*)/g,
    '<span class="text-[#64748B]">$1</span>'
  );

  return html;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━ NAVBAR ━━━━━━━━━━━━━━━━━━━━━━━━ */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [pricingTooltip, setPricingTooltip] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      id="nav-main"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[var(--bg-surface)]/90 backdrop-blur-xl border-b border-[var(--bg-border)] shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1 group" id="nav-logo">
          <span className="text-xl font-bold tracking-tight text-[var(--text-primary)] group-hover:text-white transition-colors">
            track
          </span>
          <span className="text-xl font-bold tracking-tight text-[var(--accent-indigo)]">UTM</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-indigo)] ml-0.5 mb-3 group-hover:scale-125 transition-transform" />
        </Link>

        {/* Links */}
        <div className="flex items-center gap-2">
          <a
            href="#features"
            className="hidden sm:inline-flex px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            Docs
          </a>

          <div className="relative hidden sm:block">
            <button
              className="px-3 py-2 text-sm text-[var(--text-muted)]/50 cursor-default"
              onMouseEnter={() => setPricingTooltip(true)}
              onMouseLeave={() => setPricingTooltip(false)}
            >
              Pricing
            </button>
            {pricingTooltip && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg text-xs text-[var(--text-muted)] whitespace-nowrap shadow-xl animate-in fade-in zoom-in-95 duration-200">
                Coming soon
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--bg-surface)] border-l border-t border-[var(--bg-border)] rotate-45" />
              </div>
            )}
          </div>

          <Link
            to="/login"
            className="px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            Login
          </Link>

          <Link
            to="/register"
            id="nav-get-started"
            className="ml-1 px-5 py-2 text-sm font-semibold rounded-full bg-[var(--accent-indigo)] text-white hover:bg-[var(--accent-hover)] transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.97]"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function HeroCodeBlock() {
  const [displayedCode, setDisplayedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [doneTyping, setDoneTyping] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      indexRef.current += 1;
      if (indexRef.current >= SAMPLE_SNIPPET.length) {
        clearInterval(id);
        setDoneTyping(true);
        setDisplayedCode(SAMPLE_SNIPPET);
        return;
      }
      setDisplayedCode(SAMPLE_SNIPPET.slice(0, indexRef.current));
    }, 18);
    return () => clearInterval(id);
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(SAMPLE_SNIPPET).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  return (
    <div className="relative group w-full max-w-2xl mx-auto" id="hero-code-block">
      {/* Glow effect */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/10 to-cyan-500/20 blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

      <div className="relative rounded-xl border border-[var(--bg-border)] bg-[var(--code-bg)] overflow-hidden shadow-2xl shadow-black/40">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--bg-border)]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#EF4444]/80" />
            <span className="w-3 h-3 rounded-full bg-[#F59E0B]/80" />
            <span className="w-3 h-3 rounded-full bg-[#22C55E]/80" />
          </div>
          <span className="text-xs text-[var(--text-muted)] font-mono">snippet.js</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all duration-200"
            id="hero-copy-btn"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[var(--success)]" />
                <span className="text-[var(--success)]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        </div>

        {/* Code content */}
        <pre className="p-5 overflow-x-auto text-[13px] leading-relaxed font-mono">
          <code
            dangerouslySetInnerHTML={{
              __html: doneTyping
                ? highlightSyntax(displayedCode)
                : highlightSyntax(displayedCode) + '<span class="animate-pulse text-[var(--accent-indigo)]">▌</span>',
            }}
          />
        </pre>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section
      id="hero"
      className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-6 overflow-hidden"
    >
      {/* Background gradient orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/[0.08] via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-32 right-0 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/[0.05] via-transparent to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-[var(--bg-border)] bg-[var(--bg-surface)]/60 text-xs text-[var(--text-muted)] backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
          Open-source UTM tracking for WordPress
        </div>

        {/* H1 */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--text-primary)] max-w-[680px] mx-auto leading-[1.1]">
          Know exactly which ad{' '}
          <span className="bg-gradient-to-r from-[var(--accent-indigo)] to-[#818CF8] bg-clip-text text-transparent">
            drove your leads
          </span>
        </h1>

        {/* Subtext */}
        <p className="mt-6 text-lg text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
          Paste one snippet. Track UTM-to-form conversions across any WordPress
          site. No GA4, no GTM, no complex setup.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
          <Link
            to="/register"
            id="hero-cta-start"
            className="group inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[var(--accent-indigo)] text-white font-semibold text-sm hover:bg-[var(--accent-hover)] transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.97]"
          >
            Start Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a
            href="#how-it-works"
            id="hero-cta-docs"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-[var(--bg-border)] text-[var(--text-muted)] font-semibold text-sm hover:text-[var(--text-primary)] hover:border-[var(--text-muted)]/40 transition-all duration-200"
          >
            View Docs
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Animated code block */}
        <div className="mt-16 hidden sm:block">
          <HeroCodeBlock />
        </div>
      </div>
    </section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━ HOW IT WORKS ━━━━━━━━━━━━━━━━━━━━━ */
const STEPS = [
  {
    num: '01',
    title: 'Register + get key',
    desc: 'Create an account and receive your unique API key in seconds.',
    icon: Key,
  },
  {
    num: '02',
    title: 'Configure fields',
    desc: 'Set your trigger page, submit button, and map custom form fields.',
    icon: Sliders,
  },
  {
    num: '03',
    title: 'Paste + track',
    desc: 'Copy the auto-generated snippet into WordPress. Conversions start flowing.',
    icon: Code2,
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
            How It Works
          </h2>
          <p className="text-[var(--text-muted)] max-w-md mx-auto">
            Go from sign-up to live tracking in under 5 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                id={`step-${step.num}`}
                className="group relative rounded-2xl border border-[var(--bg-border)] bg-[var(--bg-surface)] p-8 hover:border-[var(--accent-indigo)]/30 transition-all duration-300 overflow-hidden"
              >
                {/* Watermark */}
                <span className="absolute top-4 right-6 text-7xl font-extrabold text-[var(--text-muted)]/[0.06] select-none pointer-events-none leading-none">
                  {step.num}
                </span>

                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Content */}
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent-indigo)]/10 border border-[var(--accent-indigo)]/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-5 h-5 text-[var(--accent-indigo)]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━ FEATURES GRID ━━━━━━━━━━━━━━━━━━━━━ */
const FEATURES = [
  {
    title: 'Any Form Fields',
    desc: 'Map DOM element IDs to keys. Name, email, phone, custom — your schema.',
    icon: FormInput,
  },
  {
    title: 'UTM Attribution',
    desc: 'Source, medium, campaign, content, term — all 5 params captured automatically.',
    icon: Target,
  },
  {
    title: 'Session-Safe Tracking',
    desc: 'UTMs saved to sessionStorage — survives multi-page navigation.',
    icon: Database,
  },
  {
    title: 'CSV Export',
    desc: 'Download all conversions with one click. No lock-in, your data is yours.',
    icon: FileDown,
  },
];

function FeaturesGrid() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
            Built for developers, loved by marketers
          </h2>
          <p className="text-[var(--text-muted)] max-w-md mx-auto">
            Everything you need to close the loop between ad spend and form submissions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                id={`feature-${feat.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="group rounded-2xl border border-[var(--bg-border)] bg-[var(--bg-surface)] p-7 hover:border-[var(--accent-indigo)]/20 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--accent-indigo)]/10 border border-[var(--accent-indigo)]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-5 h-5 text-[var(--accent-indigo)]" />
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1.5">
                  {feat.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━ CTA BANNER ━━━━━━━━━━━━━━━━━━━━━━━━ */
function CtaBanner() {
  return (
    <section id="cta-banner" className="py-24 px-6">
      <div className="max-w-4xl mx-auto relative">
        {/* Glow */}
        <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-indigo-500/10 blur-2xl pointer-events-none" />

        <div className="relative rounded-2xl border border-[var(--bg-border)] bg-[var(--bg-surface)] py-16 px-8 text-center overflow-hidden">
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(var(--text-muted) 1px, transparent 1px), linear-gradient(90deg, var(--text-muted) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Start tracking in 5 minutes.
            </h2>
            <p className="text-[var(--text-muted)] mb-8 max-w-md mx-auto">
              Free forever for small teams. No credit card required.
            </p>
            <Link
              to="/register"
              id="cta-create-account"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[var(--accent-indigo)] text-white font-semibold text-sm hover:bg-[var(--accent-hover)] transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.97]"
            >
              Create Free Account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━ FOOTER ━━━━━━━━━━━━━━━━━━━━━━━━━ */
function Footer() {
  return (
    <footer
      id="footer"
      className="border-t border-[var(--bg-border)] py-6 px-6"
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-[var(--text-muted)]">
          © 2026 Nexorel
        </p>
        <div className="flex items-center gap-6 text-sm text-[var(--text-muted)]">
          <a
            href="#features"
            className="hover:text-[var(--text-primary)] transition-colors"
          >
            Docs
          </a>
          <a
            href="#"
            className="hover:text-[var(--text-primary)] transition-colors"
          >
            Privacy
          </a>
          <a
            href="mailto:hi@nexorel.co"
            className="hover:text-[var(--text-primary)] transition-colors"
          >
            hi@nexorel.co
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━ HOME PAGE ━━━━━━━━━━━━━━━━━━━━━━━ */
export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Navbar />
      <Hero />
      <HowItWorks />
      <FeaturesGrid />
      <CtaBanner />
      <Footer />
    </div>
  );
}
