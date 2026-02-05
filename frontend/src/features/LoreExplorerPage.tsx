import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { findMovieBySlug, movieCatalog } from '@/lib/movies'
import { parseJsonParam, setJsonParam } from '@/lib/queryState'
import { rankGenres, type TasteProfile } from '@/lib/taste'

type LoreExplorerPageProps = {
  profile: TasteProfile
  watchedMovieSlugs: string[]
}

type LoreRole = 'user' | 'guide'

type LoreChatMessage = {
  id: string
  role: LoreRole
  text: string
}

type StoredLoreMessage = {
  role: LoreRole
  text: string
}

function buildGuideAnswer(question: string, movieTitle: string, communityNow: string[]) {
  const normalizedQuestion = question.toLowerCase()

  if (normalizedQuestion.includes('what if')) {
    return `${movieTitle} fans usually branch this into timeline alternatives. A common approach is to preserve one key canon beat and change only one relationship decision.`
  }

  if (normalizedQuestion.includes('ending')) {
    return `Most current reads of ${movieTitle} treat the ending as intentional ambiguity. The strongest thread argues that the final image resolves emotion, not plot mechanics.`
  }

  if (normalizedQuestion.includes('theory')) {
    return `Top theory pattern right now: viewers connect character motive shifts to world rules introduced in earlier scenes. That lens explains why some actions look contradictory at first.`
  }

  return `Current community pulse: ${communityNow[0]} Use that as your anchor, then test your own theory against one conflicting interpretation.`
}

function buildScenario(movieTitle: string, seed: string, topGenres: string[]) {
  const genreText = topGenres.length > 0 ? topGenres.join(', ') : 'character-driven'
  return `Scenario: In an alternate ${movieTitle} cut, ${seed}. Tone leans ${genreText}, forcing every major character to re-negotiate loyalty by the midpoint.`
}

function isStoredLoreMessage(value: unknown): value is StoredLoreMessage {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>
  return (candidate.role === 'user' || candidate.role === 'guide') && typeof candidate.text === 'string'
}

function parseLoreMessages(value: string | null): LoreChatMessage[] {
  const parsed = parseJsonParam<unknown>(value, [])
  if (!Array.isArray(parsed)) {
    return []
  }

  return parsed
    .filter((entry) => isStoredLoreMessage(entry))
    .slice(-12)
    .map((entry, index) => ({
      id: `${entry.role}-${index}-${entry.text.slice(0, 24)}`,
      role: entry.role,
      text: entry.text
    }))
}

function parseScenarioDrafts(value: string | null): string[] {
  const parsed = parseJsonParam<unknown>(value, [])
  if (!Array.isArray(parsed)) {
    return []
  }

  return parsed.filter((entry) => typeof entry === 'string').slice(0, 4)
}

function toStoredLoreMessages(messages: LoreChatMessage[]): StoredLoreMessage[] {
  return messages.map((message) => ({ role: message.role, text: message.text }))
}

export function LoreExplorerPage({ profile, watchedMovieSlugs }: LoreExplorerPageProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [question, setQuestion] = useState('')
  const [scenarioPrompt, setScenarioPrompt] = useState('')

  const fallbackSlug = watchedMovieSlugs[0] ?? movieCatalog[0].slug
  const selectedSlugParam = searchParams.get('movie')
  const selectedMovie = useMemo(() => {
    const selectedByParam = findMovieBySlug(selectedSlugParam ?? '')
    if (selectedByParam) {
      return selectedByParam
    }

    return findMovieBySlug(fallbackSlug) ?? movieCatalog[0]
  }, [fallbackSlug, selectedSlugParam])

  const searchParamString = searchParams.toString()
  const chatMessages = useMemo(() => parseLoreMessages(searchParams.get('chat')), [searchParamString])
  const scenarioDrafts = useMemo(() => parseScenarioDrafts(searchParams.get('drafts')), [searchParamString])
  const topGenres = useMemo(() => rankGenres(profile.genreScores).slice(0, 2).map((entry) => entry.genre), [profile])

  useEffect(() => {
    const currentSelection = findMovieBySlug(selectedSlugParam ?? '')
    if (currentSelection) {
      return
    }

    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('movie', fallbackSlug)
    nextParams.delete('chat')
    nextParams.delete('drafts')
    setSearchParams(nextParams, { replace: true })
  }, [fallbackSlug, searchParams, selectedSlugParam, setSearchParams])

  function handleMovieChange(nextSlug: string) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('movie', nextSlug)
    nextParams.delete('chat')
    nextParams.delete('drafts')
    setSearchParams(nextParams)
  }

  function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedQuestion = question.trim()
    if (!trimmedQuestion) {
      return
    }

    const answer = buildGuideAnswer(trimmedQuestion, selectedMovie.title, selectedMovie.communityNow)
    const nextMessages = [
      ...toStoredLoreMessages(chatMessages),
      { role: 'user' as const, text: trimmedQuestion },
      { role: 'guide' as const, text: answer }
    ].slice(-12)

    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('movie', selectedMovie.slug)
    setJsonParam(nextParams, 'chat', nextMessages)
    setSearchParams(nextParams)
    setQuestion('')
  }

  function submitScenario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedPrompt = scenarioPrompt.trim()
    if (!trimmedPrompt) {
      return
    }

    const nextScenario = buildScenario(selectedMovie.title, trimmedPrompt, topGenres)
    const nextDrafts = [nextScenario, ...scenarioDrafts].slice(0, 4)

    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('movie', selectedMovie.slug)
    setJsonParam(nextParams, 'drafts', nextDrafts)
    setSearchParams(nextParams)
    setScenarioPrompt('')
  }

  return (
    <section className="page lore-route">
      <header className="page-header">
        <p className="eyebrow">Scenario 2</p>
        <h2 className="section-title">Interactive lore feed for movies you have watched</h2>
        <p className="section-copy">
          View what people talked about earlier, what they are talking about now, and build your own theory branches.
        </p>
      </header>

      <div className="surface lore-select-panel">
        <label className="input-label" htmlFor="lore-movie-picker">
          Pick a watched movie
        </label>
        <div className="row-field">
          <select
            id="lore-movie-picker"
            className="text-input select-input"
            value={selectedMovie.slug}
            onChange={(event) => handleMovieChange(event.target.value)}
          >
            {movieCatalog.map((movie) => (
              <option key={movie.slug} value={movie.slug}>
                {movie.title}
                {watchedMovieSlugs.includes(movie.slug) ? ' (Watched)' : ''}
              </option>
            ))}
          </select>
        </div>
        <p className="inline-note">
          {watchedMovieSlugs.length > 0
            ? `Watched memory loaded: ${watchedMovieSlugs.length} movie(s)`
            : 'No watched movies marked yet. Use Personalized Review to tag one.'}
        </p>
      </div>

      <div className="lore-grid">
        <article className="surface">
          <h3 className="card-title">{selectedMovie.title}</h3>
          <p className="card-meta">Community timeline</p>
          <section className="content-block">
            <h4 className="block-title">Then</h4>
            <ul className="stack-list compact">
              {selectedMovie.communityThen.map((entry) => (
                <li className="list-card" key={entry}>
                  <p className="body-copy">{entry}</p>
                </li>
              ))}
            </ul>
          </section>
          <section className="content-block">
            <h4 className="block-title">Now</h4>
            <ul className="stack-list compact">
              {selectedMovie.communityNow.map((entry) => (
                <li className="list-card" key={entry}>
                  <p className="body-copy">{entry}</p>
                </li>
              ))}
            </ul>
          </section>
          <section className="content-block">
            <h4 className="block-title">Theory Starters</h4>
            <ul className="stack-list compact">
              {selectedMovie.theories.map((entry) => (
                <li className="list-card" key={entry}>
                  <p className="body-copy">{entry}</p>
                </li>
              ))}
            </ul>
          </section>
        </article>

        <article className="surface">
          <section className="content-block">
            <h4 className="block-title">Ask, Discuss, Challenge</h4>
            <form className="stack-form" onSubmit={submitQuestion}>
              <textarea
                className="text-input text-area"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask about ending logic, alternate choices, unresolved plot points..."
              />
              <button className="action-btn primary" type="submit">
                Ask Lore Guide
              </button>
            </form>
          </section>

          <section className="content-block">
            <h4 className="block-title">Conversation</h4>
            {chatMessages.length === 0 ? (
              <p className="inline-note">No messages yet. Start by asking for a theory breakdown.</p>
            ) : (
              <ul className="stack-list">
                {chatMessages.map((message) => (
                  <li className={message.role === 'guide' ? 'list-card chat guide' : 'list-card chat user'} key={message.id}>
                    <p className="list-title">{message.role === 'guide' ? 'Lore Guide' : 'You'}</p>
                    <p className="body-copy">{message.text}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="content-block">
            <h4 className="block-title">Create Scenario</h4>
            <form className="stack-form" onSubmit={submitScenario}>
              <input
                className="text-input"
                value={scenarioPrompt}
                onChange={(event) => setScenarioPrompt(event.target.value)}
                placeholder={selectedMovie.scenarioSeeds[0]}
              />
              <button className="action-btn secondary" type="submit">
                Build What-If Scenario
              </button>
            </form>
            {scenarioDrafts.length > 0 ? (
              <ul className="stack-list">
                {scenarioDrafts.map((draft) => (
                  <li className="list-card scenario" key={draft}>
                    <p className="body-copy">{draft}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="inline-note">Create scenario branches to compare fan interpretations.</p>
            )}
          </section>
        </article>
      </div>
    </section>
  )
}
