import { useEffect, useState } from 'react'
import { Alert, Spinner } from 'react-bootstrap'
import { useParams } from 'react-router-dom'
import { type FormikHelpers } from 'formik'
import BookingForm, { type BookingFormValues } from '../components/BookingForm'
import BookingSuccess from '../components/BookingSuccess'
import { createBooking, defaultBookingErrorMessage } from '../api/bookings'
import { ApiError } from '../api/errors'
import { getFlightById } from '../api/flights'
import { type BookingData, type CreateBookingData, type Flight } from '../api/types'

type FlightLoadStatus = 'loading' | 'ready' | 'not-found' | 'error'

export default function BookingPage() {
  const { flightId } = useParams()
  const [flightData, setFlightData] = useState<Flight | null>(null)
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [flightLoadStatus, setFlightLoadStatus] = useState<FlightLoadStatus>('loading')

  useEffect(() => {
    const controller = new AbortController()

    async function loadFlightData() {
      setFlightData(null)
      setBookingData(null)
      setBookingError(null)

      if (! flightId) {
        setFlightLoadStatus('not-found')
        return
      }

      setFlightLoadStatus('loading')

      try {
        const flight = await getFlightById(flightId, controller.signal)

        if (controller.signal.aborted) {
          return
        }
        setFlightData(flight)
        setFlightLoadStatus('ready')
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }

        setFlightLoadStatus(error instanceof ApiError && error.status === 404 ? 'not-found' : 'error')
      }
    }

    loadFlightData()

    return () => controller.abort()
  }, [flightId])

  const isCurrentFlight = flightData?.id === flightId

  if (flightLoadStatus === 'loading') {
    return (
      <div className="py-5 text-center" data-testid="flight-loading" role="status">
        <Spinner animation="border" className="me-2" />
        Загружаем рейс
      </div>
    )
  }

  if (flightLoadStatus === 'not-found') {
    return <Alert data-testid="flight-not-found" variant="warning">Рейс не найден.</Alert>
  }

  if (flightLoadStatus === 'error') {
    return <Alert data-testid="flight-load-error" variant="danger">Не удалось загрузить рейс. Попробуйте обновить страницу.</Alert>
  }

  if (!isCurrentFlight || !flightData || !flightId) {
    return (
      <div className="py-5 text-center" data-testid="flight-loading" role="status">
        <Spinner animation="border" className="me-2" />
        Загружаем рейс
      </div>
    )
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
      const booking = await createBooking(data)
      setBookingData(booking)
      actions.resetForm()
    } catch (error) {
      const message = error instanceof ApiError && error.status === 400
        ? error.message
        : defaultBookingErrorMessage
      setBookingError(message)
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
