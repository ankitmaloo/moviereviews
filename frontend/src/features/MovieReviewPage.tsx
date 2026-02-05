import { FormEvent, useState } from 'react'

import { codexAgentSdk, type GeneratedMovieReview, type SwipeAnalysis } from '@/lib/codexAgentSdk'

type MovieReviewPageProps = {
  swipeContext: SwipeAnalysis | null
}

function ratingLabel(rating: number) {
  return `${Math.max(1, Math.min(5, Math.round(rating)))}/5`
}

export function MovieReviewPage({ swipeContext }: MovieReviewPageProps) {
  const [query, setQuery] = useState('')
  const [selectedMovie, setSelectedMovie] = useState<GeneratedMovieReview | null>(null)
  const [searchAttempt, setSearchAttempt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const title = query.trim()
    setSearchAttempt(title)
    setErrorMessage('')

    if (!title) {
      setSelectedMovie(null)
      return
    }

    try {
      setIsLoading(true)
      const review = await codexAgentSdk.generateMovieReview({
        title,
        swipeContext
      })
      setSelectedMovie(review)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Could not generate review from frontend SDK runtime.'
      setErrorMessage(message)
      setSelectedMovie(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="review-page">
      <header className="page-header">
        <p className="eyebrow">Step 2: Review Lookup</p>
        <h2 className="section-title">Search any movie and get an instant review brief</h2>
        <p className="section-copy">
          This page runs entirely in frontend and uses Codex-style SDK logic with local skill files loaded into prompt
          context.
        </p>
      </header>

      <form className="review-search" onSubmit={handleSearch}>
        <label className="input-label" htmlFor="movie-name">
          Movie name
        </label>
        <div className="search-row">
          <input
            id="movie-name"
            className="movie-input"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Type any movie title..."
          />
          <button className="btn btn-right" type="submit" disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Get Review'}
          </button>
        </div>
        <p className="search-hint">
          {swipeContext
            ? `Personalized using profile: ${swipeContext.personaLabel}`
            : 'Run Step 1 first for personalized review generation.'}
        </p>
      </form>

      {errorMessage ? <p className="no-match">{errorMessage}</p> : null}
      {!errorMessage && searchAttempt && !selectedMovie && !isLoading ? (
        <p className="no-match">No review generated for "{searchAttempt}". Try another title.</p>
      ) : null}

      {selectedMovie ? (
        <article className="review-card">
          <div className="review-head">
            <div>
              <h3 className="card-title">{selectedMovie.title}</h3>
              <p className="card-subtitle">
                {selectedMovie.year} • {selectedMovie.genres.join(' • ')} • {selectedMovie.runtime} min
              </p>
            </div>
            <p className="critic-score">Critic Score: {selectedMovie.criticScore}</p>
          </div>

          <div className="review-sections">
            <section>
              <h4 className="review-label">Quick Summary</h4>
              <p className="card-copy">{selectedMovie.summary}</p>
            </section>
            <section>
              <h4 className="review-label">Should You Watch?</h4>
              <p className="card-copy">{selectedMovie.verdict}</p>
            </section>
          </div>

          <section className="user-review-thread">
            <h4 className="review-label">Real User Reviews</h4>
            <ul className="user-review-list">
              {selectedMovie.userReviews.map((review, index) => (
                <li className="user-review-item" key={`${review.author}-${index}`}>
                  <div className="user-review-head">
                    <p className="user-name">{review.author}</p>
                    <p className="user-rating">{ratingLabel(review.rating)}</p>
                  </div>
                  <p className="user-date">{review.postedAt}</p>
                  <p className="user-text">{review.text}</p>
                </li>
              ))}
            </ul>
          </section>
        </article>
      ) : null}
    </section>
  )
}
