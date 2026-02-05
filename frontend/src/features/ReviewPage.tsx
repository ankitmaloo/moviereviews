import type { GeneratedReview, ProgressUpdate } from '@/lib/backendApi'

type ReviewState =
  | {
      status: 'idle'
      movieTitle: ''
      data: null
      error: ''
      progress: []
    }
  | {
      status: 'loading'
      movieTitle: string
      data: null
      error: ''
      progress: ProgressUpdate[]
    }
  | {
      status: 'success'
      movieTitle: string
      data: GeneratedReview
      error: ''
      progress: ProgressUpdate[]
    }
  | {
      status: 'error'
      movieTitle: string
      data: null
      error: string
      progress: ProgressUpdate[]
    }

type ReviewPageProps = {
  state: ReviewState
}

function ratingText(rating: number) {
  return `${rating.toFixed(1)}/10`
}

function ProgressPanel({ steps }: { steps: ProgressUpdate[] }) {
  if (steps.length === 0) {
    return null
  }

  return (
    <section className="surface review-progress">
      <h3 className="section-heading">Live progress</h3>
      <ol className="progress-list">
        {steps.map((step, index) => (
          <li className="progress-item" key={`${index}-${step.message}-${step.detail}`}>
            <p className="progress-summary">{step.message}</p>
            {step.detail ? <pre className="progress-detail">{step.detail}</pre> : null}
          </li>
        ))}
      </ol>
    </section>
  )
}

export function ReviewPage({ state }: ReviewPageProps) {
  if (state.status === 'idle') {
    return (
      <section className="page page-review">
        <header className="page-header">
          <p className="eyebrow">Review</p>
          <h2 className="page-title">No review yet</h2>
          <p className="page-copy">Go to Search and enter a movie title first.</p>
        </header>
      </section>
    )
  }

  if (state.status === 'loading') {
    return (
      <section className="page page-review">
        <header className="page-header">
          <p className="eyebrow">Review</p>
          <h2 className="page-title">Building your review for {state.movieTitle}</h2>
          <p className="page-copy">Codex is streaming progress events as it searches and synthesizes.</p>
        </header>

        <ProgressPanel steps={state.progress} />
      </section>
    )
  }

  if (state.status === 'error') {
    return (
      <section className="page page-review">
        <header className="page-header">
          <p className="eyebrow">Review</p>
          <h2 className="page-title">Could not generate review for {state.movieTitle}</h2>
          <p className="page-copy">{state.error}</p>
        </header>

        <ProgressPanel steps={state.progress} />
      </section>
    )
  }

  const review = state.data

  return (
    <section className="page page-review">
      <header className="page-header">
        <p className="eyebrow">Review</p>
        <h2 className="page-title">{review.title}</h2>
        <p className="page-copy">
          {review.year} • {review.genres.join(' • ')} • {review.runtime} min
        </p>
      </header>

      <ProgressPanel steps={state.progress} />

      <article className="surface review-card">
        <p className="rating-pill">Rating: {ratingText(review.rating)}</p>
        <section className="review-block">
          <h3 className="section-heading">Cast</h3>
          <p className="body-text">{review.cast.join(' • ')}</p>
        </section>
        <section className="review-block">
          <h3 className="section-heading">Short plot summary</h3>
          <p className="body-text">{review.shortPlot}</p>
        </section>
        <section className="review-block">
          <h3 className="section-heading">Review</h3>
          <p className="body-text">{review.summary}</p>
          <p className="body-text">{review.verdict}</p>
        </section>

        <section className="review-block">
          <h3 className="section-heading">What people like you are saying</h3>
          <ul className="statement-list">
            {review.peopleLikeYou.map((entry) => (
              <li className="statement-item" key={entry}>
                {entry}
              </li>
            ))}
          </ul>
        </section>

        {review.sources.length > 0 ? (
          <section className="review-block">
            <h3 className="section-heading">Sources used</h3>
            <ul className="source-list">
              {review.sources.map((source) => (
                <li className="source-item" key={`${source.source}-${source.url}`}>
                  <p className="source-name">{source.source}</p>
                  <a className="source-link" href={source.url} target="_blank" rel="noreferrer">
                    {source.url}
                  </a>
                  <p className="source-note">{source.note}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
    </section>
  )
}
