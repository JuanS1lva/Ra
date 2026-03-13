import { useContextStore } from '../stores/context'

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const ctx = useContextStore()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(ctx.tenantId ? { 'x-tenant-id': ctx.tenantId } : {}),
    ...(ctx.userId ? { 'x-user-id': ctx.userId } : {}),
    ...(init.headers as Record<string, string>),
  }

  const res = await fetch(`${BASE}${path}`, { ...init, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body?.message ?? `HTTP ${res.status}`)
  }

  return res.json()
}
