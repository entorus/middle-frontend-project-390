import {
  type BookingData,
  type BookingSearchParams,
  type CreateBookingData,
} from './types'
import { throwApiError } from './errors'

export const defaultBookingErrorMessage = 'Не удалось оформить бронирование. Попробуйте ещё раз.'

const getBookingPath = ({ code, lastName }: BookingSearchParams) => {
  const params = new URLSearchParams({ lastName })

  return `/api/bookings/${encodeURIComponent(code)}?${params}`
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
    return throwApiError(response, defaultBookingErrorMessage)
  }

  return await response.json() as BookingData
}

export const getBookingByCode = async (params: BookingSearchParams): Promise<BookingData> => {
  const response = await fetch(getBookingPath(params), {
    method: 'GET'
  })

  if (! response.ok) {
    return throwApiError(response, 'Не удалось загрузить бронь.')
  }

  return await response.json() as BookingData
}

export const cancelBooking = async (params: BookingSearchParams): Promise<BookingData> => {
  const response = await fetch(getBookingPath(params), {
    method: 'DELETE'
  })

  if (! response.ok) {
    return throwApiError(response, 'Не удалось отменить бронирование.')
  }

  return await response.json() as BookingData
}
