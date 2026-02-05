type SettingsPageProps = {
  preferenceText: string
  onPreferenceTextChange: (nextValue: string) => void
}

export function SettingsPage({ preferenceText, onPreferenceTextChange }: SettingsPageProps) {
  return (
    <section className="page page-settings">
      <header className="page-header">
        <p className="eyebrow">Settings</p>
        <h2 className="page-title">System instructions and preferences</h2>
        <p className="page-copy">
          This text is injected directly into the Codex review prompt. Edit it to change how reviews are generated.
        </p>
      </header>

      <article className="surface settings-card">
        <label className="field-label" htmlFor="preference-text-input">
          Reviewer instruction block
        </label>
        <textarea
          id="preference-text-input"
          className="text-input text-area"
          value={preferenceText}
          onChange={(event) => onPreferenceTextChange(event.target.value)}
          placeholder="Set reviewer constraints, pacing rules, tone, and scoring requirements."
        />
      </article>
    </section>
  )
}
