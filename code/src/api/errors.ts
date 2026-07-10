import type { ApiErrorResponse } from './types'

export class ApiError extends Error {
  public readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const isAbortError = (error: unknown): boolean => (
  error instanceof DOMException && error.name === 'AbortError'
)

export const throwApiError = async (response: Response, fallbackMessage: string): Promise<never> => {
  const data: Partial<ApiErrorResponse> = await response.json().catch(() => ({}))
  const message = typeof data.message === 'string' ? data.message : fallbackMessage

  throw new ApiError(response.status, message)
}
