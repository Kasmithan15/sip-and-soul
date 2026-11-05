/** Error from the server, with per-field messages when a form failed validation. */
export class ApiError extends Error {
  readonly status: number
  readonly fields: Record<string, string>
  constructor(message: string, status: number, fields: Record<string, string> = {}) {
    super(message)
    this.status = status
    this.fields = fields
  }
}

const BASE = '/api'

export async function api<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = init
  let res: Response
  try {
    res = await fetch(BASE + path, {
      credentials: 'include',
      ...rest,
      headers: { ...(json !== undefined && { 'Content-Type': 'application/json' }), ...headers },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    })
  } catch {
    throw new ApiError('Cannot reach the café server. Check your internet connection and try again.', 0)
  }
  if (res.status === 204) return undefined as T
  const type = res.headers.get('content-type') ?? ''
  const data = type.includes('application/json') ? await res.json() : null
  if (!res.ok) {
    if (!data) throw new ApiError('Online ordering is not available on this version of the site.', res.status)
    const fields: Record<string, string> = data.fields ?? (data.field ? { [data.field]: data.message } : {})
    const message = Array.isArray(data.message) ? data.message[0] : data.message
    throw new ApiError(message || 'Something went wrong. Please try again.', res.status, fields)
  }
  return data as T
}
