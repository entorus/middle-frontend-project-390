import { type City, type Flight } from './types'

interface SearchFlightsParams {
  origin: string;
  destination: string;
  date: string;
  passengers: string;
}

export const getCities = async (): Promise<City[]> => {
  const response = await fetch('/api/cities')

  if (! response.ok) {
    throw new Error('Failed to load cities')
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
    throw new Error('Search failed')
  }

  return await response.json() as Flight[]
}

export const getFlightById = async (flightId: string): Promise<Flight | null> => {
  const response = await fetch(`/api/flights/${encodeURIComponent(flightId)}`)

  if (! response.ok) {
    return null
  }

  return await response.json() as Flight
}
