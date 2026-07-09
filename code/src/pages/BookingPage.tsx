import { useEffect, useState } from 'react'

import { useParams } from 'react-router-dom'
import { type FormikHelpers } from 'formik'
import BookingForm, { type BookingFormValues } from '../components/BookingForm'
import BookingSuccess from '../components/BookingSuccess'
import { BookingApiError, createBooking, defaultBookingErrorMessage } from '../api/bookings'
import { getFlightById } from '../api/flights'
import { type BookingData, type CreateBookingData, type Flight } from '../api/types'

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
        const flight = await getFlightById(flightId)
        if (! flight || flight.id !== flightId) {
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
      const booking = await createBooking(data)
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
