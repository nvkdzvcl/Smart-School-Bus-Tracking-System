// Standardized HTTP client for Driver App
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function authHeaders() {
  const token = localStorage.getItem('access_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function mergeHeaders(...parts: Array<HeadersInit | undefined>): Headers {
  const h = new Headers()
  for (const p of parts) {
    if (!p) continue
    new Headers(p).forEach((v, k) => h.set(k, v))
  }
  return h
}

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = mergeHeaders(
    { 'Content-Type': 'application/json', ...(authHeaders() as Record<string, string>) },
    init?.headers
  )
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })
  const text = await res.text()
  if (!res.ok) {
    console.error('API error:', res.status, path, text)
    throw new Error(text || `HTTP ${res.status} ${path}`)
  }
  try { return JSON.parse(text) as T } catch { return text as unknown as T }
}
