type SettingsPageProps = {
  preferenceText: string
  onPreferenceTextChange: (nextValue: string) => void
  loadedSkills: string[]
}

export function SettingsPage({ preferenceText, onPreferenceTextChange, loadedSkills }: SettingsPageProps) {
  return (
    <section className="settings-page">
      <header className="page-header">
        <p className="eyebrow">Step 3: Settings</p>
        <h2 className="section-title">Set preference notes for Codex prompts</h2>
        <p className="section-copy">
          Add natural-language guidance about your taste, pacing, tone, spoilers, or any review preferences. This text is
          injected into swipe and review Codex prompts.
        </p>
      </header>

      <article className="settings-card">
        <label className="input-label" htmlFor="preference-text">
          Preference text
        </label>
        <textarea
          id="preference-text"
          className="settings-input"
          value={preferenceText}
          onChange={(event) => onPreferenceTextChange(event.target.value)}
          placeholder="Example: Keep reviews spoiler-light, prioritize pacing + character depth, and avoid overly technical language."
        />
        <p className="settings-hint">
          Prompt behavior includes: accurate, fact-aware movie reviews written in a human-friendly voice.
        </p>
      </article>

      <article className="settings-card">
        <h3 className="panel-title">Loaded skill bundles</h3>
        <ul className="settings-skill-list">
          {loadedSkills.map((skill) => (
            <li className="settings-skill-item" key={skill}>
              {skill}
            </li>
          ))}
        </ul>
      </article>
    </section>
  )
}
