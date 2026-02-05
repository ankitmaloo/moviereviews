import { FormEvent, useState } from 'react'

type SearchPageProps = {
  isLoading: boolean
  onSearch: (title: string) => void
}

export function SearchPage({ isLoading, onSearch }: SearchPageProps) {
  const [title, setTitle] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed || isLoading) {
      return
    }

    onSearch(trimmed)
  }

  return (
    <section className="page page-search">
      <header className="page-header">
        <p className="eyebrow">Search</p>
        <h2 className="page-title">Find a movie</h2>
        <p className="page-copy">Search by title. We will generate the review on the next page.</p>
      </header>

      <form className="surface search-form" onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="movie-title-input">
          Movie title
        </label>
        <input
          id="movie-title-input"
          className="text-input"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Example: Dune Part Two"
          autoComplete="off"
        />
        <button className="action-button" type="submit" disabled={isLoading || !title.trim()}>
          {isLoading ? 'Generating...' : 'Get Review'}
        </button>
      </form>
    </section>
  )
}
