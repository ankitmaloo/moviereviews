import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { findMovieBySlug, movieCatalog, normalizeTitle, type MovieRecord } from '@/lib/movies'
import { rankGenres, type TasteProfile } from '@/lib/taste'

type PersonalizedReviewPageProps = {
  profile: TasteProfile
  watchedMovieSlugs: string[]
  onMarkWatched: (movieSlug: string) => void
}

function ratingLabel(rating: number) {
  return `${rating}/5`
}

function personalizedHeadline(movie: MovieRecord, topGenres: string[], votes: number) {
  const affinity = movie.genres.reduce((total, genre) => total + (topGenres.includes(genre) ? 2 : 0), 0)

  if (votes < 3) {
    return 'Your profile is still learning. Vote in X vs Y for sharper personalization.'
  }

  if (affinity >= 4) {
    return `High match for your current taste profile in ${topGenres.join(', ')}.`
  }

  if (affinity >= 2) {
    return `Partial match: this aligns with some of your strongest signals, but not all of them.`
  }

  return 'Lower match for your current profile, but useful if you want to break your usual pattern.'
}

export function PersonalizedReviewPage({ profile, watchedMovieSlugs, onMarkWatched }: PersonalizedReviewPageProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedSlugParam = searchParams.get('movie')
  const queryParam = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(queryParam)

  const selectedMovie = useMemo(
    () => findMovieBySlug(selectedSlugParam ?? '') ?? movieCatalog[0],
    [selectedSlugParam]
  )

  const searchableTitles = useMemo(() => movieCatalog.map((movie) => movie.title), [])
  const topGenres = useMemo(() => rankGenres(profile.genreScores).slice(0, 3).map((entry) => entry.genre), [profile])

  useEffect(() => {
    setQuery(queryParam)
  }, [queryParam])

  useEffect(() => {
    if (selectedSlugParam) {
      return
    }

    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('movie', movieCatalog[0].slug)
    if (queryParam) {
      nextParams.set('q', queryParam)
    }
    setSearchParams(nextParams, { replace: true })
  }, [queryParam, searchParams, selectedSlugParam, setSearchParams])

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedQuery = normalizeTitle(query)
    const trimmedQuery = query.trim()
    const nextParams = new URLSearchParams(searchParams)

    if (!normalizedQuery) {
      nextParams.delete('q')
      nextParams.set('movie', selectedMovie.slug)
      setSearchParams(nextParams)
      return
    }

    const exactMatch = movieCatalog.find((movie) => normalizeTitle(movie.title) === normalizedQuery)
    if (exactMatch) {
      nextParams.set('movie', exactMatch.slug)
      nextParams.set('q', trimmedQuery)
      setSearchParams(nextParams)
      return
    }

    const partialMatch = movieCatalog.find((movie) => normalizeTitle(movie.title).includes(normalizedQuery))
    if (partialMatch) {
      nextParams.set('movie', partialMatch.slug)
      nextParams.set('q', trimmedQuery)
      setSearchParams(nextParams)
      return
    }

    nextParams.set('movie', selectedMovie.slug)
    nextParams.set('q', trimmedQuery)
    setSearchParams(nextParams)
  }

  const noMatchFound =
    normalizeTitle(queryParam).length > 0 &&
    !movieCatalog.some((movie) => normalizeTitle(movie.title).includes(normalizeTitle(queryParam)))

  const watched = watchedMovieSlugs.includes(selectedMovie.slug)

  return (
    <section className="page review-route">
      <header className="page-header">
        <p className="eyebrow">Scenario 1</p>
        <h2 className="section-title">Search a movie and get a personalized review lens</h2>
        <p className="section-copy">
          Search a title, then use your vote-derived taste profile to understand fit, risks, and why the movie might land.
        </p>
      </header>

      <form className="surface search-panel" onSubmit={handleSearch}>
        <label className="input-label" htmlFor="movie-title-search">
          Movie name
        </label>
        <div className="row-field">
          <input
            id="movie-title-search"
            className="text-input"
            type="text"
            placeholder="Try: Dune, Past Lives, Spider-Verse..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button className="action-btn primary" type="submit">
            Find Review
          </button>
        </div>
        <p className="inline-note">Catalog: {searchableTitles.join(' • ')}</p>
      </form>

      {noMatchFound ? <p className="status-line warning">No match for "{queryParam}" in this demo catalog.</p> : null}

      <article className="surface review-surface">
        <div className="review-topline">
          <div>
            <h3 className="card-title">{selectedMovie.title}</h3>
            <p className="card-meta">
              {selectedMovie.year} • {selectedMovie.genres.join(' • ')} • {selectedMovie.runtime} min
            </p>
          </div>
          <p className="score-pill">Critic {selectedMovie.criticScore}</p>
        </div>

        <div className="personalized-panel">
          <p className="panel-label">Personalized fit</p>
          <p className="panel-copy">{personalizedHeadline(selectedMovie, topGenres, profile.votes)}</p>
          <p className="panel-copy">
            Strongest taste signals: {topGenres.length > 0 ? topGenres.join(' • ') : 'No stable signal yet'}
          </p>
        </div>

        <div className="review-grid">
          <section className="content-block">
            <h4 className="block-title">Quick Summary</h4>
            <p className="body-copy">{selectedMovie.summary}</p>
          </section>
          <section className="content-block">
            <h4 className="block-title">Should You Watch?</h4>
            <p className="body-copy">{selectedMovie.verdict}</p>
          </section>
        </div>

        <div className="cta-row">
          <button className={watched ? 'action-btn subtle is-selected' : 'action-btn subtle'} onClick={() => onMarkWatched(selectedMovie.slug)}>
            {watched ? 'Watched Added' : 'Mark as Watched'}
          </button>
          <p className="inline-note">Marked watched movies unlock more relevant context in Lore & Theories.</p>
        </div>

        <section className="content-block">
          <h4 className="block-title">User Reactions</h4>
          <ul className="stack-list">
            {selectedMovie.userReviews.map((review) => (
              <li className="list-card" key={review.id}>
                <div className="list-head">
                  <p className="list-title">{review.author}</p>
                  <p className="list-meta">{ratingLabel(review.rating)}</p>
                </div>
                <p className="list-meta">{review.postedAt}</p>
                <p className="body-copy">{review.text}</p>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </section>
  )
}
