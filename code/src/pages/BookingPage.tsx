import { useEffect, useState } from 'react'

import { useParams } from 'react-router-dom'
import { type FormikHelpers } from 'formik'
import BookingForm, { type BookingFormValues } from '../components/BookingForm'
import BookingSuccess from '../components/BookingSuccess'


interface Airline {
  code: string;
  name: string;
}


interface LocationInfo {
  code: string;
  name: string;
  country: string;
}


interface FlightPrice {
  amount: number;
  currency: string;
}

interface Contact {
  email: string;
  phone: string;
}

export interface Flight {
  id: string;
  flightNumber: string;
  airline: Airline;
  origin: LocationInfo;
  destination: LocationInfo;
  departureAt: string;
  arrivalAt: string;
  durationMinutes: number;
  price: FlightPrice;
  seatsAvailable: number;
}

export interface Passenger {
  id: string,
  firstName: string
  lastName: string,
  dateOfBirth: string,
  documentNumber: string
}

interface BookingPassenger {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  documentNumber: string;
}

interface BookingErrorResponse {
  code: string;
  message: string;
}

export interface BookingData {
  code: string;
  status: 'confirmed' | 'cancelled';
  flight: Flight;
  passengers: BookingPassenger[];
  contact: Contact;
  totalPrice: FlightPrice;
  createdAt: string;
}

interface CreateBookingData {
  flightId: string;
  contact: Contact;
  passengers: BookingPassenger[]
}

const defaultBookingErrorMessage = 'Не удалось оформить бронирование. Попробуйте ещё раз.'

class BookingApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BookingApiError'
  }
}

export default function BookingPage() {
  const { flightId } = useParams()
  const [flightData, setFlightData] = useState<Flight | null>(null)
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [flightNotFound, setFlightNotFound] = useState(false)
  

  useEffect(() => {
    async function loadFlightData() {
      if (! flightId) {
        setFlightNotFound(true)
        return
      }

      try {
        setFlightNotFound(false)
        const response = await fetch(`http://127.0.0.1:8080/api/flights/${flightId}`)

        if (! response.ok) {
          setFlightNotFound(true)
          return
        }

        const flight: Flight = await response.json()
        if (flight.id !== flightId) {
          setFlightNotFound(true)
          return
        }

        setFlightData(flight)
      } catch {
        setFlightNotFound(true)
      }
    }

    loadFlightData()
  }, [flightId])

  if (flightNotFound) {
    return (
      <div data-testid="flight-not-found">
        Рейс не найден
      </div>
    )
  }

  if (! flightData || ! flightId) 
    return null

  const parseBookingError = async (response: Response): Promise<string> => {
    const errorData: Partial<BookingErrorResponse> = await response.json().catch(() => ({}))

    return errorData.message ?? defaultBookingErrorMessage
  }

  const bookingRequest = async (data: CreateBookingData): Promise<BookingData> => {
    const response = await fetch('http://127.0.0.1:8080/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (! response.ok) {
      throw new BookingApiError(await parseBookingError(response))
    }

    const result: BookingData = await response.json()

    return result
  }

  const handleSubmit = async ({ email, phone, passengers }: BookingFormValues, actions: FormikHelpers<BookingFormValues>) => {
    const bookingPassengers = passengers.map(({ firstName, lastName, dateOfBirth, documentNumber }) => ({
      firstName,
      lastName,
      dateOfBirth,
      documentNumber
    }))
    const data: CreateBookingData = {
      flightId,
      contact: {
        email, 
        phone
      },
      passengers: bookingPassengers
    }

    try {
      setBookingError(null)
      const booking = await bookingRequest(data)
      setBookingData(booking)
      actions.resetForm()
    } catch (error) {
      setBookingError(error instanceof BookingApiError ? error.message : defaultBookingErrorMessage)
    } finally {
      actions.setSubmitting(false)
    }
  }

  if (bookingData) {
    return (<BookingSuccess bookingData={bookingData} />)
  }

  return (
    <BookingForm
      bookingError={bookingError}
      flightData={flightData}
      onBookingSubmit={handleSubmit}
    />
  )
}
