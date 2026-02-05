export function parseJsonParam<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export function setJsonParam(params: URLSearchParams, key: string, value: unknown) {
  params.set(key, JSON.stringify(value))
}
