import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig, useSaveConfig } from '@/hooks/useConfig';
import FieldRow from '@/components/FieldRow';
import PageTitle from '@/components/PageTitle';
import { Plus, Save, AlertTriangle, Loader2, Check, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Configure() {
  const navigate = useNavigate();

  const { data: config, isLoading: configLoading } = useConfig();
  const saveConfig = useSaveConfig({
    onSuccess: () => {
      toast.success('Configuration saved ✓ — Redirecting to your snippet…');
      // Navigate to the snippet page with the template fields after save
      setTimeout(() => navigate('/dashboard/snippet'), 800);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error || 'Failed to save configuration');
    },
  });

  const [triggerPage, setTriggerPage] = useState('');
  const [buttonId, setButtonId] = useState('');
  const [fields, setFields] = useState([{ key: '', id: '' }]);
  const [initialized, setInitialized] = useState(false);

  // Pre-fill from existing config
  useEffect(() => {
    if (config && !initialized) {
      if (config.triggerPage) setTriggerPage(config.triggerPage);
      if (config.buttonId) setButtonId(config.buttonId);
      if (config.fields && config.fields.length > 0) {
        setFields(config.fields.map((f) => ({ key: f.key, id: f.id })));
      }
      setInitialized(true);
    }
  }, [config, initialized]);

  const handleFieldChange = (index, key, value) => {
    setFields((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  const handleAddField = () => {
    setFields((prev) => [...prev, { key: '', id: '' }]);
  };

  const handleRemoveField = (index) => {
    if (fields.length <= 1) return;
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Warn if any field is empty
    const hasEmpty = fields.some((f) => !f.key.trim() || !f.id.trim());
    if (hasEmpty) {
      toast.warning('Some fields are empty — they will be saved as-is.');
    }

    saveConfig.mutate({
      triggerPage: triggerPage.trim(),
      buttonId: buttonId.trim(),
      fields: fields.map((f) => ({ key: f.key.trim(), id: f.id.trim() })),
    });
  };

  if (configLoading) {
    return (
      <div className="space-y-6">
        <PageTitle title="Configure" />
        <div className="h-8 w-48 bg-[var(--bg-surface)] rounded-lg animate-pulse" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 bg-[var(--bg-surface)] rounded-lg animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <PageTitle
        title="Configure"
        description="Set your conversion page, button ID and field mappings."
      />

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Configuration
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Define the page where your form lives, the submit button ID, and the form fields to capture. UTM parameters are stored in session cookies automatically.
        </p>
      </div>

      {/* How it works info */}
      <div className="p-4 rounded-xl bg-[var(--accent-indigo)]/5 border border-[var(--accent-indigo)]/15">
        <h3 className="text-sm font-semibold text-[var(--accent-indigo)] mb-2">How it works</h3>
        <ol className="space-y-1.5 text-sm text-[var(--text-muted)]">
          <li className="flex items-start gap-2">
            <span className="shrink-0 w-5 h-5 rounded-full bg-[var(--accent-indigo)]/10 flex items-center justify-center text-xs font-bold text-[var(--accent-indigo)]">1</span>
            <span>Visitor lands on <strong className="text-[var(--text-primary)]">any page</strong> with UTM params → stored in session cookies</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 w-5 h-5 rounded-full bg-[var(--accent-indigo)]/10 flex items-center justify-center text-xs font-bold text-[var(--accent-indigo)]">2</span>
            <span>Visitor navigates to the <strong className="text-[var(--text-primary)]">trigger page</strong> and fills out the form</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="shrink-0 w-5 h-5 rounded-full bg-[var(--accent-indigo)]/10 flex items-center justify-center text-xs font-bold text-[var(--accent-indigo)]">3</span>
            <span>On <strong className="text-[var(--text-primary)]">button click</strong>: form fields + UTM data are sent to your dashboard</span>
          </li>
        </ol>
      </div>

      {/* Config Form */}
      <div className="space-y-6">
        {/* Trigger Page */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Trigger Page Pathname
          </label>
          <input
            type="text"
            value={triggerPage}
            onChange={(e) => setTriggerPage(e.target.value)}
            placeholder="/get-a-quote/"
            className="w-full px-4 py-3 rounded-xl bg-[var(--bg-base)] border border-[var(--bg-border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-indigo)] focus:border-transparent transition-all"
          />
          <p className="text-xs text-[var(--text-muted)] mt-1.5">
            The page where your conversion form lives, e.g. <code className="text-[var(--code-text)]">/get-a-quote/</code>
          </p>
        </div>

        {/* Button DOM ID */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Submit Button DOM ID
          </label>
          <input
            type="text"
            value={buttonId}
            onChange={(e) => setButtonId(e.target.value)}
            placeholder="wpforms-submit-7209"
            className="w-full px-4 py-3 rounded-xl bg-[var(--bg-base)] border border-[var(--bg-border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-indigo)] focus:border-transparent transition-all"
          />
          <p className="text-xs text-[var(--text-muted)] mt-1.5">
            The HTML <code className="text-[var(--code-text)]">id</code> attribute of the submit/conversion button on your form.
          </p>
        </div>

        {/* Field Mappings */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Field Mappings
          </label>
          <p className="text-xs text-[var(--text-muted)] mb-4">
            Map each form field to a label. The "Key" is what you'll see in your dashboard. The "DOM Element ID" is the HTML <code className="text-[var(--code-text)]">id</code> of the form input.
          </p>

          {/* Header — hidden on very small screens, fields stack instead */}
          <div className="hidden sm:flex items-center gap-3 mb-3 px-1">
            <div className="flex-1 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
              Key (your label)
            </div>
            <div className="flex-1 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
              DOM Element ID
            </div>
            <div className="w-10" />
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <FieldRow
                key={index}
                field={field}
                index={index}
                onChange={handleFieldChange}
                onRemove={handleRemoveField}
                canRemove={fields.length > 1}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddField}
            className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--accent-indigo)] hover:bg-[var(--accent-indigo)]/10 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Field
          </button>
        </div>
      </div>

      {/* Empty field warning */}
      {fields.some((f) => !f.key.trim() || !f.id.trim()) && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--warn)]/10 border border-[var(--warn)]/20">
          <AlertTriangle className="w-5 h-5 text-[var(--warn)] shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--warn)]">
            Some field mappings are empty. Fill them in before saving to ensure your snippet works correctly.
          </p>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saveConfig.isPending || !triggerPage.trim() || !buttonId.trim()}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent-indigo)] hover:bg-[var(--accent-hover)] text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saveConfig.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : saveConfig.isSuccess ? (
          <>
            <Check className="w-4 h-4" />
          </>
        ) : (
          <Save className="w-4 h-4" />
        )}
        {saveConfig.isPending
          ? 'Saving...'
          : saveConfig.isSuccess
            ? 'Saved — Going to Snippet…'
            : 'Save & Get Snippet'}
        {!saveConfig.isPending && !saveConfig.isSuccess && (
          <ArrowRight className="w-4 h-4 ml-1" />
        )}
      </button>
    </div>
  );
}
