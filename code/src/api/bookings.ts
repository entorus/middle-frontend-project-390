import {
  type ApiErrorResponse,
  type BookingData,
  type BookingSearchParams,
  type CreateBookingData,
} from './types'

export const defaultBookingErrorMessage = 'Не удалось оформить бронирование. Попробуйте ещё раз.'

export class BookingApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BookingApiError'
  }
}

const getBookingPath = ({ code, lastName }: BookingSearchParams) => {
  const params = new URLSearchParams({ lastName })

  return `/api/bookings/${encodeURIComponent(code)}?${params}`
}

const parseBookingError = async (response: Response): Promise<string> => {
  const errorData: Partial<ApiErrorResponse> = await response.json().catch(() => ({}))

  return errorData.message ?? defaultBookingErrorMessage
}

export const createBooking = async (data: CreateBookingData): Promise<BookingData> => {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  if (! response.ok) {
    throw new BookingApiError(await parseBookingError(response))
  }

  return await response.json() as BookingData
}

export const getBookingByCode = async (params: BookingSearchParams): Promise<BookingData> => {
  const response = await fetch(getBookingPath(params), {
    method: 'GET'
  })

  if (! response.ok) {
    throw new BookingApiError(await parseBookingError(response))
  }

  return await response.json() as BookingData
}

export const cancelBooking = async (params: BookingSearchParams): Promise<BookingData> => {
  const response = await fetch(getBookingPath(params), {
    method: 'DELETE'
  })

  if (! response.ok) {
    throw new BookingApiError(await parseBookingError(response))
  }

  return await response.json() as BookingData
}
