import { FormEvent, useMemo, useState } from 'react'

type UserReview = {
  id: number
  author: string
  postedAt: string
  rating: number
  text: string
}

type MovieReview = {
  slug: string
  title: string
  year: number
  genres: string[]
  runtime: number
  criticScore: number
  summary: string
  verdict: string
  userReviews: UserReview[]
}

const movieLibrary: MovieReview[] = [
  {
    slug: 'dune-part-two',
    title: 'Dune: Part Two',
    year: 2024,
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    runtime: 166,
    criticScore: 91,
    summary:
      'The sequel expands the political stakes with stronger character focus, sharper pacing, and high-impact worldbuilding.',
    verdict:
      'Best when you want large-scale spectacle with dense mythology. The emotional arc lands hardest in the final third.',
    userReviews: [
      {
        id: 1,
        author: 'Jared M.',
        postedAt: 'March 8, 2024',
        rating: 5,
        text: 'Huge visuals, but the best part was how personal the story stayed. Worth watching in a big theater.'
      },
      {
        id: 2,
        author: 'Lina P.',
        postedAt: 'March 12, 2024',
        rating: 4,
        text: 'Great follow-up and much faster than part one. A little long, but I was never bored.'
      },
      {
        id: 3,
        author: 'Kofi R.',
        postedAt: 'March 15, 2024',
        rating: 5,
        text: 'The score and cinematography are insane. The ending makes you want the next chapter immediately.'
      }
    ]
  },
  {
    slug: 'barbie',
    title: 'Barbie',
    year: 2023,
    genres: ['Comedy', 'Fantasy'],
    runtime: 114,
    criticScore: 88,
    summary:
      'A colorful satire that pivots from playful humor to pointed commentary without losing momentum.',
    verdict:
      'Works best if you are in the mood for a self-aware comedy with layered social themes and quick dialogue.',
    userReviews: [
      {
        id: 4,
        author: 'Nadia V.',
        postedAt: 'July 23, 2023',
        rating: 5,
        text: 'Fun, funny, and way smarter than I expected. The audience energy made it even better.'
      },
      {
        id: 5,
        author: 'Trevor H.',
        postedAt: 'July 28, 2023',
        rating: 4,
        text: 'Excellent production design and jokes that mostly land. Some speeches are heavy-handed but still effective.'
      },
      {
        id: 6,
        author: 'Mina A.',
        postedAt: 'August 2, 2023',
        rating: 5,
        text: 'I laughed the entire first half and teared up at the end. Great cast chemistry.'
      }
    ]
  },
  {
    slug: 'spider-man-across-the-spider-verse',
    title: 'Spider-Man: Across the Spider-Verse',
    year: 2023,
    genres: ['Animation', 'Action', 'Adventure'],
    runtime: 140,
    criticScore: 95,
    summary:
      'An animation benchmark with inventive visual styles and emotional stakes that scale with the multiverse premise.',
    verdict:
      'Ideal if you want high-energy action and an emotionally grounded hero arc. Ends on a major cliffhanger.',
    userReviews: [
      {
        id: 7,
        author: 'Carlos D.',
        postedAt: 'June 3, 2023',
        rating: 5,
        text: 'Visual creativity is off the charts. Every scene feels like it belongs in an art gallery.'
      },
      {
        id: 8,
        author: 'Priya S.',
        postedAt: 'June 5, 2023',
        rating: 5,
        text: 'Fast, emotional, and funny. My favorite superhero movie in years.'
      },
      {
        id: 9,
        author: 'Ethan L.',
        postedAt: 'June 11, 2023',
        rating: 4,
        text: 'Loved it, but be ready for a part-one ending. Still absolutely worth it.'
      }
    ]
  },
  {
    slug: 'oppenheimer',
    title: 'Oppenheimer',
    year: 2023,
    genres: ['Drama', 'History', 'Thriller'],
    runtime: 180,
    criticScore: 93,
    summary:
      'A dense historical drama built around ethical conflict, institutional pressure, and a highly subjective perspective.',
    verdict:
      'Best when you want intense dialogue-driven storytelling and can commit to a long runtime.',
    userReviews: [
      {
        id: 10,
        author: 'Tasha G.',
        postedAt: 'July 22, 2023',
        rating: 5,
        text: 'Masterfully edited and acted. Feels like a legal thriller and character study at the same time.'
      },
      {
        id: 11,
        author: 'Ryan C.',
        postedAt: 'July 30, 2023',
        rating: 4,
        text: 'Very strong film but packed with dialogue. Definitely one to watch when you can focus.'
      },
      {
        id: 12,
        author: 'Sana K.',
        postedAt: 'August 7, 2023',
        rating: 5,
        text: 'The sound design alone is worth the ticket. Heavy subject matter, but unforgettable.'
      }
    ]
  }
]

function normalize(text: string) {
  return text.trim().toLowerCase()
}

function ratingLabel(rating: number) {
  return `${rating}/5`
}

export function MovieReviewPage() {
  const [query, setQuery] = useState('')
  const [selectedMovie, setSelectedMovie] = useState<MovieReview | null>(movieLibrary[0])
  const [searchAttempt, setSearchAttempt] = useState('')

  const searchableTitles = useMemo(() => movieLibrary.map((movie) => movie.title), [])

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedQuery = normalize(query)
    setSearchAttempt(query)

    if (!normalizedQuery) {
      setSelectedMovie(null)
      return
    }

    const exactMatch = movieLibrary.find((movie) => normalize(movie.title) === normalizedQuery)

    if (exactMatch) {
      setSelectedMovie(exactMatch)
      return
    }

    const partialMatch = movieLibrary.find((movie) => normalize(movie.title).includes(normalizedQuery))

    if (partialMatch) {
      setSelectedMovie(partialMatch)
      return
    }

    setSelectedMovie(null)
  }

  const noMatchFound =
    normalize(searchAttempt).length > 0 &&
    !movieLibrary.some((movie) => normalize(movie.title).includes(normalize(searchAttempt)))

  return (
    <section className="review-page">
      <header className="page-header">
        <p className="eyebrow">Step 2: Review Lookup</p>
        <h2 className="section-title">Search any movie and get an instant review brief</h2>
        <p className="section-copy">
          This page is frontend-only: type a title and we show a curated critic summary plus real-style user reactions.
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
            placeholder="Try: Dune, Oppenheimer, Barbie..."
          />
          <button className="btn btn-right" type="submit">
            Get Review
          </button>
        </div>
        <p className="search-hint">Available in this demo: {searchableTitles.join(' • ')}</p>
      </form>

      {noMatchFound ? (
        <p className="no-match">No review found for "{searchAttempt}". Try one of the suggested titles.</p>
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
              {selectedMovie.userReviews.map((review) => (
                <li className="user-review-item" key={review.id}>
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
