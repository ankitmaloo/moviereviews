export type GeneratedReview = {
  title: string
  year: number
  genres: string[]
  runtime: number
  rating: number
  cast: string[]
  shortPlot: string
  summary: string
  verdict: string
  peopleLikeYou: string[]
  sources: {
    source: string
    url: string
    note: string
  }[]
  isGeneric: boolean
}

type StreamEventName = 'progress' | 'result' | 'error' | 'done'

export type ProgressUpdate = {
  message: string
  detail: string
}

function cleanErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== 'object') {
    return fallback
  }

  const maybeError = (payload as { error?: unknown }).error
  if (typeof maybeError === 'string' && maybeError.trim()) {
    return maybeError
  }

  return fallback
}

function parseSseChunk(chunk: string) {
  const lines = chunk
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  let event: StreamEventName = 'progress'
  let data = ''

  for (const line of lines) {
    if (line.startsWith('event:')) {
      const nextEvent = line.slice('event:'.length).trim() as StreamEventName
      event = nextEvent
    }

    if (line.startsWith('data:')) {
      data += line.slice('data:'.length).trim()
    }
  }

  if (!data) {
    return null
  }

  return {
    event,
    data: JSON.parse(data) as unknown
  }
}

async function readStreamEvents(
  response: Response,
  onProgress: (progress: ProgressUpdate) => void
): Promise<GeneratedReview> {
  if (!response.body) {
    throw new Error('Streaming response body was not available.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let review: GeneratedReview | null = null

  while (true) {
    const { value, done } = await reader.read()

    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })

    let boundaryIndex = buffer.indexOf('\n\n')
    while (boundaryIndex >= 0) {
      const chunk = buffer.slice(0, boundaryIndex)
      buffer = buffer.slice(boundaryIndex + 2)

      const parsed = parseSseChunk(chunk)
      if (parsed) {
        if (parsed.event === 'progress') {
          const message = (parsed.data as { message?: unknown }).message
          const detail = (parsed.data as { detail?: unknown }).detail
          if (typeof message === 'string' && message.trim()) {
            onProgress({
              message,
              detail: typeof detail === 'string' ? detail : ''
            })
          }
        }

        if (parsed.event === 'error') {
          const message = (parsed.data as { message?: unknown }).message
          throw new Error(typeof message === 'string' ? message : 'Streaming review request failed.')
        }

        if (parsed.event === 'result') {
          review = parsed.data as GeneratedReview
        }
      }

      boundaryIndex = buffer.indexOf('\n\n')
    }
  }

  if (!review) {
    throw new Error('No review result was received from streaming endpoint.')
  }

  return review
}

export async function generateMovieReview(payload: {
  title: string
  preferenceText: string
  onProgress: (progress: ProgressUpdate) => void
}): Promise<GeneratedReview> {
  const response = await fetch('/api/review/generate/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: payload.title,
      settings: {
        preferenceText: payload.preferenceText
      }
    })
  })

  if (!response.ok) {
    const body = (await response.json()) as unknown
    throw new Error(cleanErrorMessage(body, 'Failed to generate movie review.'))
  }

  return readStreamEvents(response, payload.onProgress)
}
