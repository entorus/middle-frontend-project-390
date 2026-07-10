import { useEffect, useRef, useState } from 'react'
import { Alert, Badge, Button, Card, Col, Row } from 'react-bootstrap'
import { Form, Formik } from 'formik'
import * as yup from 'yup'
import { cancelBooking as cancelBookingRequest, getBookingByCode } from '../api/bookings'
import { ApiError, isAbortError } from '../api/errors'
import { type BookingData, type BookingSearchParams } from '../api/types'
import ValidatedField from '../components/ValidatedField'
import formatPrice from '../utils/formatPrice'

type BookingSearchValues = BookingSearchParams
type BookingError = {
  message: string
  testId: 'booking-not-found' | 'booking-lookup-error' | 'booking-cancel-error'
}
type LookupResult = {
  booking: BookingData
  params: BookingSearchValues
}

const bookingStatusLabels: Record<BookingData['status'], string> = {
  confirmed: 'подтверждена',
  cancelled: 'отменена'
}

const notFoundMessage = 'Бронь не найдена. Проверьте код бронирования и фамилию.'
const lookupErrorMessage = 'Не удалось загрузить бронь. Попробуйте ещё раз.'
const cancelErrorMessage = 'Не удалось отменить бронирование. Попробуйте ещё раз.'
const initialValues: BookingSearchValues = { code: '', lastName: '' }
const bookingSearchSchema = yup.object({
  code: yup.string().trim().required('Обязательное поле'),
  lastName: yup.string().trim().required('Обязательное поле'),
})

const normalizeBookingSearchValues = ({ code, lastName }: BookingSearchValues): BookingSearchValues => ({
  code: code.trim(),
  lastName: lastName.trim()
})

export default function BookingsPage() {
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null)
  const [bookingError, setBookingError] = useState<BookingError | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const lookupRequestRef = useRef<AbortController | null>(null)
  const cancellationRequestRef = useRef<AbortController | null>(null)

  useEffect(() => () => {
    lookupRequestRef.current?.abort()
    cancellationRequestRef.current?.abort()
    lookupRequestRef.current = null
    cancellationRequestRef.current = null
  }, [])

  const searchBooking = async (values: BookingSearchValues) => {
    if (isCancelling) {
      return
    }

    const searchParams = normalizeBookingSearchValues(values)
    lookupRequestRef.current?.abort()
    const controller = new AbortController()
    lookupRequestRef.current = controller

    try {
      setBookingError(null)
      setLookupResult(null)

      const result = await getBookingByCode(searchParams, controller.signal)

      if (lookupRequestRef.current !== controller || controller.signal.aborted) {
        return
      }

      setLookupResult({ booking: result, params: searchParams })
    } catch (error) {
      if (lookupRequestRef.current !== controller || isAbortError(error)) {
        return
      }

      const isNotFound = error instanceof ApiError && error.status === 404
      setBookingError({
        message: isNotFound ? notFoundMessage : lookupErrorMessage,
        testId: isNotFound ? 'booking-not-found' : 'booking-lookup-error',
      })
    } finally {
      if (lookupRequestRef.current === controller) {
        lookupRequestRef.current = null
      }
    }
  }

  const cancelBooking = async () => {
    if (!lookupResult) {
      return
    }

    cancellationRequestRef.current?.abort()
    const controller = new AbortController()
    cancellationRequestRef.current = controller

    try {
      setBookingError(null)
      setIsCancelling(true)
      const result = await cancelBookingRequest(lookupResult.params, controller.signal)

      if (cancellationRequestRef.current !== controller || controller.signal.aborted) {
        return
      }

      setLookupResult((current) => current ? { ...current, booking: result } : current)
    } catch (error) {
      if (cancellationRequestRef.current !== controller || isAbortError(error)) {
        return
      }

      setBookingError({ message: cancelErrorMessage, testId: 'booking-cancel-error' })
    } finally {
      if (cancellationRequestRef.current === controller) {
        cancellationRequestRef.current = null
        setIsCancelling(false)
      }
    }
  }

  const foundBooking = lookupResult?.booking ?? null

  return (<div>
    <h2 className="h2 mb-4 fw-bold text-black">Моя бронь</h2>
    <Formik<BookingSearchValues>
      initialValues={initialValues}
      onSubmit={searchBooking}
      validationSchema={bookingSearchSchema}
    >
      {({ isSubmitting }) => (
        <Form data-testid="booking-lookup-form" aria-busy={isSubmitting || isCancelling}>
          <Row className="g-3 mb-4 align-items-start">
            <Col xs={12} md={6} lg={3}>
              <div>
                <ValidatedField
                  id="code"
                  label="Код брони"
                  name="code"
                  testId="lookup-code"
                  disabled={isSubmitting || isCancelling}
                />
              </div>
            </Col>

            <Col xs={12} md={6} lg={3}>
              <div>
                <ValidatedField
                  id="lastName"
                  label="Фамилия"
                  name="lastName"
                  testId="lookup-lastName"
                  disabled={isSubmitting || isCancelling}
                />
              </div>
            </Col>
            <Col xs={12} md={6} lg={3}>
              <div className="form-label fw-semibold invisible d-none d-lg-block" aria-hidden="true">
                Найти
              </div>
              <Button
                type="submit"
                data-testid="lookup-submit"
                variant="primary"
                className="fw-semibold"
                disabled={isSubmitting || isCancelling}
              >
                Найти
              </Button>
            </Col>
          </Row>
        </Form>
      )}
    </Formik>
    {bookingError && (
      <Alert data-testid={bookingError.testId} variant="danger">
        {bookingError.message}
      </Alert>
    )}
    {foundBooking && (
      <Card data-testid="booking-details">
        <Card.Body className="p-3">
          <p><b data-testid="booking-code">{foundBooking.code}</b> <Badge pill bg={(foundBooking.status === 'confirmed') ? 'success' : 'secondary'} data-testid="booking-status" data-status={foundBooking.status}>{bookingStatusLabels[foundBooking.status]}</Badge></p>
          <p>{foundBooking.flight.airline.name} · {foundBooking.flight.flightNumber}: {foundBooking.flight.origin.name} → {foundBooking.flight.destination.name}</p>
          <p>Пассажиры: {foundBooking.passengers.map((pass) => `${pass.firstName} ${pass.lastName}`).join(', ')}</p>
          <p>Итого: {formatPrice(foundBooking.totalPrice)}</p>
          {(foundBooking.status === 'confirmed') && <Button data-testid="cancel-booking" onClick={cancelBooking} className="w-100" variant='danger' disabled={isCancelling}>Отменить бронирование</Button>}
        </Card.Body>
      </Card>
    )}
  </div>)
}
