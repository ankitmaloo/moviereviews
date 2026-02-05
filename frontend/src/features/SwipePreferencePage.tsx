import { useEffect, useMemo, useState } from 'react'

import { analyzeSwipePreferences, type SwipeAnalysis } from '@/lib/api'

type SwipeMovie = {
  id: number
  title: string
  year: number
  genres: string[]
  runtime: number
  mood: string
  setup: string
}

type Direction = 'left' | 'right'

type GenrePreference = {
  genre: string
  score: number
}

type SwipePreferencePageProps = {
  onProfileUpdate: (profile: SwipeAnalysis | null) => void
  preferenceText: string
}

const swipeQueue: SwipeMovie[] = [
  {
    id: 1,
    title: 'Neon Atlas',
    year: 2024,
    genres: ['Sci-Fi', 'Thriller'],
    runtime: 118,
    mood: 'Intense',
    setup: 'A memory hacker uncovers a city-wide simulation glitch minutes before a national election.'
  },
  {
    id: 2,
    title: 'Juniper Street',
    year: 2023,
    genres: ['Romance', 'Drama'],
    runtime: 105,
    mood: 'Warm',
    setup: 'Two former classmates reconnect during a summer blackout and revisit a decade of missed timing.'
  },
  {
    id: 3,
    title: 'Iron Tide',
    year: 2025,
    genres: ['Action', 'Adventure'],
    runtime: 129,
    mood: 'Adrenaline',
    setup: 'A salvage crew races mercenaries to retrieve a reactor core from a storm-locked cargo fleet.'
  },
  {
    id: 4,
    title: 'Quiet Orchard',
    year: 2022,
    genres: ['Drama', 'Family'],
    runtime: 97,
    mood: 'Reflective',
    setup: 'Three siblings return home to decide the fate of their parents orchard before winter closes in.'
  },
  {
    id: 5,
    title: 'Signal at Dusk',
    year: 2021,
    genres: ['Mystery', 'Crime'],
    runtime: 111,
    mood: 'Suspenseful',
    setup: 'A radio host receives coded calls that predict local crimes before they happen.'
  },
  {
    id: 6,
    title: 'Skyline Waltz',
    year: 2024,
    genres: ['Comedy', 'Romance'],
    runtime: 101,
    mood: 'Playful',
    setup: 'A wedding band bassist and a city planner keep colliding while trying to save an old theater.'
  }
]

function computeGenrePreferences(liked: SwipeMovie[], disliked: SwipeMovie[]) {
  const totals = new Map<string, number>()

  liked.forEach((movie) => {
    movie.genres.forEach((genre) => {
      const nextValue = (totals.get(genre) ?? 0) + 2
      totals.set(genre, nextValue)
    })
  })

  disliked.forEach((movie) => {
    movie.genres.forEach((genre) => {
      const nextValue = (totals.get(genre) ?? 0) - 1
      totals.set(genre, nextValue)
    })
  })

  return Array.from(totals.entries())
    .map(([genre, score]) => ({ genre, score }))
    .sort((a, b) => b.score - a.score)
}

function userTasteSummary(preferences: GenrePreference[]) {
  const positive = preferences.filter((preference) => preference.score > 0).slice(0, 3)

  if (positive.length === 0) {
    return 'Your choices are mixed so far. Swipe a few more movies to reveal stronger patterns.'
  }

  return `You currently lean toward ${positive.map((item) => item.genre).join(', ')} stories.`
}

export function SwipePreferencePage({ onProfileUpdate, preferenceText }: SwipePreferencePageProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likedMovies, setLikedMovies] = useState<SwipeMovie[]>([])
  const [dislikedMovies, setDislikedMovies] = useState<SwipeMovie[]>([])
  const [agentProfile, setAgentProfile] = useState<SwipeAnalysis | null>(null)
  const [agentError, setAgentError] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const activeMovie = swipeQueue[currentIndex]
  const swipeCount = likedMovies.length + dislikedMovies.length
  const workflowComplete = swipeCount === swipeQueue.length

  const genrePreferences = useMemo(
    () => computeGenrePreferences(likedMovies, dislikedMovies),
    [likedMovies, dislikedMovies]
  )

  const recommendation = useMemo(() => {
    if (genrePreferences.length === 0) {
      return 'Swipe right on anything that looks fun. We will build your profile as you go.'
    }

    const topGenre = genrePreferences[0]?.genre

    if (!topGenre || (genrePreferences[0]?.score ?? 0) <= 0) {
      return 'Try rating one or two more movies you truly enjoy so recommendations can sharpen.'
    }

    return `Start with a ${topGenre} movie tonight, then pair it with a lighter backup option.`
  }, [genrePreferences])

  const tasteLine = userTasteSummary(genrePreferences)

  useEffect(() => {
    if (!workflowComplete || isAnalyzing || agentProfile) {
      return
    }

    let cancelled = false
    setIsAnalyzing(true)
    setAgentError('')

    analyzeSwipePreferences({
      likes: likedMovies.map((movie) => ({
        title: movie.title,
        year: movie.year,
        genres: movie.genres,
        runtime: movie.runtime,
        mood: movie.mood,
        setup: movie.setup
      })),
      dislikes: dislikedMovies.map((movie) => ({
        title: movie.title,
        year: movie.year,
        genres: movie.genres,
        runtime: movie.runtime,
        mood: movie.mood,
        setup: movie.setup
      })),
      settings: {
        preferenceText
      }
    })
      .then((profile) => {
        if (cancelled) {
          return
        }
        setAgentProfile(profile)
        onProfileUpdate(profile)
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return
        }
        const message = error instanceof Error ? error.message : 'Could not generate profile from agent runtime.'
        setAgentError(message)
        onProfileUpdate(null)
      })
      .finally(() => {
        if (!cancelled) {
          setIsAnalyzing(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [workflowComplete, likedMovies, dislikedMovies, isAnalyzing, agentProfile, onProfileUpdate, preferenceText])

  function handleSwipe(direction: Direction) {
    if (!activeMovie) {
      return
    }

    if (direction === 'right') {
      setLikedMovies((current) => [...current, activeMovie])
    } else {
      setDislikedMovies((current) => [...current, activeMovie])
    }

    setCurrentIndex((index) => index + 1)
  }

  function resetWorkflow() {
    setCurrentIndex(0)
    setLikedMovies([])
    setDislikedMovies([])
    setAgentProfile(null)
    setAgentError('')
    onProfileUpdate(null)
  }

  return (
    <section className="swipe-page">
      <header className="page-header">
        <p className="eyebrow">Step 1: Preference Discovery</p>
        <h2 className="section-title">Swipe left or right to train your movie taste profile</h2>
        <p className="section-copy">
          This workflow uses your swipe behavior to estimate favorite genres, runtime comfort, and mood alignment.
        </p>
      </header>

      <div className="workflow-panel">
        <div className="workflow-head">
          <p className="workflow-title">Taste calibration progress</p>
          <p className="workflow-count">
            {swipeCount} of {swipeQueue.length} movies rated
          </p>
        </div>
        <progress className="workflow-progress" value={swipeCount} max={swipeQueue.length} />
      </div>

      <div className="swipe-layout">
        <article className="swipe-card" aria-live="polite">
          {workflowComplete ? (
            <div className="swipe-finished">
              <h3 className="card-title">
                {agentProfile ? 'Agent profile ready' : isAnalyzing ? 'Building agent profile' : 'Preference profile ready'}
              </h3>
              <p className="card-copy">{agentProfile?.tasteThesis || tasteLine}</p>
              <p className="recommendation">Recommendation: {agentProfile?.recommendation || recommendation}</p>
              {isAnalyzing ? <p className="status-line">Codex Agent SDK is analyzing your swipes...</p> : null}
              {agentError ? <p className="error-line">{agentError}</p> : null}
              <button className="btn btn-secondary" onClick={resetWorkflow}>
                Run Again
              </button>
            </div>
          ) : (
            <>
              <div className="swipe-chip-row">
                <span className="chip">{activeMovie.mood}</span>
                <span className="chip">{activeMovie.runtime} min</span>
              </div>
              <h3 className="card-title">{activeMovie.title}</h3>
              <p className="card-subtitle">{activeMovie.year}</p>
              <p className="card-genres">{activeMovie.genres.join(' • ')}</p>
              <p className="card-copy">{activeMovie.setup}</p>

              <div className="swipe-actions">
                <button className="btn btn-left" onClick={() => handleSwipe('left')}>
                  Swipe Left
                </button>
                <button className="btn btn-right" onClick={() => handleSwipe('right')}>
                  Swipe Right
                </button>
              </div>
            </>
          )}
        </article>

        <aside className="preference-panel">
          <h3 className="panel-title">{agentProfile ? agentProfile.personaLabel : 'Live preference signals'}</h3>
          <p className="panel-copy">{agentProfile?.tasteThesis || tasteLine}</p>
          <ul className="preference-list">
            {agentProfile ? (
              agentProfile.greenFlags.map((item) => (
                <li className="preference-item" key={item}>
                  <span>{item}</span>
                </li>
              ))
            ) : genrePreferences.length === 0 ? (
              <li className="preference-item muted">No genre signal yet</li>
            ) : (
              genrePreferences.slice(0, 5).map((item) => (
                <li className="preference-item" key={item.genre}>
                  <span>{item.genre}</span>
                  <span>{item.score > 0 ? `+${item.score}` : item.score}</span>
                </li>
              ))
            )}
          </ul>

          {agentProfile ? (
            <div className="agent-block">
              <p className="agent-label">Usually avoid</p>
              <p className="agent-copy">{agentProfile.usuallyAvoid.join(' • ')}</p>
              <p className="agent-label">Depends on</p>
              <p className="agent-copy">{agentProfile.dependsOn.join(' • ')}</p>
            </div>
          ) : null}

          <div className="swipe-stat-grid">
            <div className="stat-card">
              <p className="stat-label">Liked</p>
              <p className="stat-value">{likedMovies.length}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Disliked</p>
              <p className="stat-value">{dislikedMovies.length}</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
