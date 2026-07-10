import { useEffect, useRef, useState } from 'react'
import { Alert, Spinner } from 'react-bootstrap'
import { useLocation, useParams } from 'react-router-dom'
import { type FormikHelpers } from 'formik'
import BookingForm, { type BookingFormValues } from '../components/BookingForm'
import BookingSuccess from '../components/BookingSuccess'
import { createBooking, defaultBookingErrorMessage } from '../api/bookings'
import { ApiError, isAbortError } from '../api/errors'
import { getFlightById } from '../api/flights'
import { type BookingData, type Flight } from '../api/types'
import { MAX_PASSENGERS, MIN_PASSENGERS } from '../constants/booking'
import createBookingData from '../utils/createBookingData'

type FlightLoadStatus = 'loading' | 'ready' | 'not-found' | 'error'
type FlightState = {
  data: Flight | null
  flightId: string | null
  status: FlightLoadStatus
}
type BookingState =
  | { status: 'idle' }
  | { status: 'success', data: BookingData }
  | { status: 'error', message: string }

const getRequestedPassengerCount = (state: unknown): number => {
  if (typeof state !== 'object' || state === null || !('passengerCount' in state)) {
    return MIN_PASSENGERS
  }

  const passengerCount = Number(state.passengerCount)

  return Number.isInteger(passengerCount)
    ? Math.min(MAX_PASSENGERS, Math.max(MIN_PASSENGERS, passengerCount))
    : MIN_PASSENGERS
}

export default function BookingPage() {
  const { flightId } = useParams()
  const location = useLocation()
  const bookingRequestRef = useRef<AbortController | null>(null)
  const [flightState, setFlightState] = useState<FlightState>({
    data: null,
    flightId: null,
    status: 'loading',
  })
  const [bookingState, setBookingState] = useState<BookingState>({ status: 'idle' })

  useEffect(() => {
    const controller = new AbortController()
    const requestedFlightId = flightId ?? null

    async function loadFlightData() {
      bookingRequestRef.current?.abort()
      bookingRequestRef.current = null
      setBookingState({ status: 'idle' })

      if (! flightId) {
        setFlightState({ data: null, flightId: requestedFlightId, status: 'not-found' })
        return
      }

      setFlightState({ data: null, flightId: requestedFlightId, status: 'loading' })

      try {
        const flight = await getFlightById(flightId, controller.signal)

        if (controller.signal.aborted) {
          return
        }
        setFlightState({ data: flight, flightId: requestedFlightId, status: 'ready' })
      } catch (error) {
        if (controller.signal.aborted || isAbortError(error)) {
          return
        }

        const status = error instanceof ApiError && error.status === 404 ? 'not-found' : 'error'
        setFlightState({ data: null, flightId: requestedFlightId, status })
      }
    }

    loadFlightData()

    return () => {
      controller.abort()
      bookingRequestRef.current?.abort()
      bookingRequestRef.current = null
    }
  }, [flightId])

  const requestedFlightId = flightId ?? null
  const isCurrentFlight = flightState.flightId === requestedFlightId

  if (!isCurrentFlight || flightState.status === 'loading') {
    return (
      <div className="py-5 text-center" data-testid="flight-loading" role="status">
        <Spinner animation="border" className="me-2" />
        Загружаем рейс
      </div>
    )
  }

  if (flightState.status === 'not-found') {
    return <Alert data-testid="flight-not-found" variant="warning">Рейс не найден.</Alert>
  }

  if (flightState.status === 'error') {
    return <Alert data-testid="flight-load-error" variant="danger">Не удалось загрузить рейс. Попробуйте обновить страницу.</Alert>
  }

  const flightData = flightState.data

  if (!flightData || !flightId) {
    return <Alert data-testid="flight-load-error" variant="danger">Не удалось загрузить рейс. Попробуйте обновить страницу.</Alert>
  }

  const handleSubmit = async (values: BookingFormValues, actions: FormikHelpers<BookingFormValues>) => {
    bookingRequestRef.current?.abort()
    const controller = new AbortController()
    bookingRequestRef.current = controller
    const data = createBookingData(flightId, values)

    try {
      setBookingState({ status: 'idle' })
      const booking = await createBooking(data, controller.signal)

      if (bookingRequestRef.current !== controller || controller.signal.aborted) {
        return
      }

      setBookingState({ status: 'success', data: booking })
    } catch (error) {
      if (bookingRequestRef.current !== controller || isAbortError(error)) {
        return
      }

      const message = error instanceof ApiError && error.status === 400
        ? error.message
        : defaultBookingErrorMessage
      setBookingState({ status: 'error', message })
    } finally {
      if (bookingRequestRef.current === controller) {
        bookingRequestRef.current = null
        actions.setSubmitting(false)
      }
    }
  }

  if (bookingState.status === 'success') {
    return (<BookingSuccess bookingData={bookingState.data} />)
  }

  if (flightData.seatsAvailable < MIN_PASSENGERS) {
    return <Alert data-testid="flight-sold-out" variant="warning">На рейсе нет свободных мест.</Alert>
  }

  const maxPassengers = Math.min(MAX_PASSENGERS, flightData.seatsAvailable)
  const initialPassengerCount = Math.min(
    getRequestedPassengerCount(location.state),
    maxPassengers,
  )

  return (
    <BookingForm
      key={`${flightId}-${initialPassengerCount}`}
      bookingError={bookingState.status === 'error' ? bookingState.message : null}
      flightData={flightData}
      initialPassengerCount={initialPassengerCount}
      maxPassengers={maxPassengers}
      onBookingSubmit={handleSubmit}
    />
  )
}
