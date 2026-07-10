import { type City, type Flight } from './types'
import { throwApiError } from './errors'

export interface SearchFlightsParams {
  origin: string;
  destination: string;
  date: string;
  passengers: string;
}

export const getCities = async (): Promise<City[]> => {
  const response = await fetch('/api/cities')

  if (! response.ok) {
    return throwApiError(response, 'Не удалось загрузить города.')
  }

  return await response.json() as City[]
}

export const searchFlights = async (params: SearchFlightsParams): Promise<Flight[]> => {
  const searchParams = new URLSearchParams({
    origin: params.origin,
    destination: params.destination,
    date: params.date,
    passengers: params.passengers,
  })
  const response = await fetch(`/api/flights?${searchParams}`)

  if (! response.ok) {
    return throwApiError(response, 'Не удалось загрузить рейсы.')
  }

  return await response.json() as Flight[]
}

export const getFlightById = async (flightId: string, signal?: AbortSignal): Promise<Flight> => {
  const response = await fetch(`/api/flights/${encodeURIComponent(flightId)}`, { signal })

  if (! response.ok) {
    return throwApiError(response, 'Не удалось загрузить рейс.')
  }

  return await response.json() as Flight
}
