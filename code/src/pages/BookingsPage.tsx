import { useState } from 'react'
import { Alert, Badge, Button, Card, Col, Row } from 'react-bootstrap'
import { ErrorMessage, Field, Form, Formik } from 'formik'
import * as yup from 'yup'
import { cancelBooking as cancelBookingRequest, getBookingByCode } from '../api/bookings'
import { ApiError } from '../api/errors'
import { type BookingData, type BookingSearchParams } from '../api/types'

type BookingSearchValues = BookingSearchParams
type BookingError = {
  message: string
  testId: 'booking-not-found' | 'booking-lookup-error' | 'booking-cancel-error'
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
  const [foundBooking, setFoundBooking] = useState<BookingData | null>(null)
  const [bookingError, setBookingError] = useState<BookingError | null>(null)
  const [foundBookingParams, setFoundBookingParams] = useState<BookingSearchValues | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  const searchBooking = async (values: BookingSearchValues) => {
    if (isCancelling) {
      return
    }

    const searchParams = normalizeBookingSearchValues(values)

    try {
      setBookingError(null)
      setFoundBooking(null)
      setFoundBookingParams(null)

      const result = await getBookingByCode(searchParams)

      setFoundBooking(result)
      setFoundBookingParams(searchParams)
    } catch (error) {
      const isNotFound = error instanceof ApiError && error.status === 404
      setBookingError({
        message: isNotFound ? notFoundMessage : lookupErrorMessage,
        testId: isNotFound ? 'booking-not-found' : 'booking-lookup-error',
      })
    }
  }

  const cancelBooking = async () => {
    if (! foundBookingParams) {
      return
    }

    try {
      setBookingError(null)
      setIsCancelling(true)
      const result = await cancelBookingRequest(foundBookingParams)

      setFoundBooking(result)
    } catch {
      setBookingError({ message: cancelErrorMessage, testId: 'booking-cancel-error' })
    } finally {
      setIsCancelling(false)
    }
  }

  return (<div>
    <h2 className="h2 mb-4 fw-bold text-black">Моя бронь</h2>
    <Formik<BookingSearchValues>
      initialValues={initialValues}
      onSubmit={searchBooking}
      validationSchema={bookingSearchSchema}
    >
      {({ touched, errors, isSubmitting }) => (
        <Form data-testid="booking-lookup-form" aria-busy={isCancelling}>
          <Row className="g-3 mb-4 align-items-start">
            <Col xs={12} md={6} lg={3}>
              <div>
                <label className="form-label fw-semibold" htmlFor="code">Код брони</label>
                <Field 
                  id="code" 
                  name="code" 
                  data-testid="lookup-code"
                  disabled={isCancelling}
                  className={`form-control ${
                    errors['code'] && touched['code'] ? 'is-invalid' : ''
                  }`}
                />
                <ErrorMessage
                  component="div"
                  name="code"
                  className="invalid-feedback"
                />
              </div>
            </Col>

            <Col xs={12} md={6} lg={3}>
              <div>
                <label className="form-label fw-semibold" htmlFor="lastName">Фамилия</label>
                <Field 
                  id="lastName"
                  name="lastName"
                  data-testid="lookup-lastName"
                  disabled={isCancelling}
                  className={`form-control ${
                    errors['lastName'] && touched['lastName'] ? 'is-invalid' : ''
                  }`}
                />
                <ErrorMessage
                  component="div"
                  name="lastName"
                  className="invalid-feedback"
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
          <p>Итого: {foundBooking.totalPrice.amount} ₽</p>
          {(foundBooking.status === 'confirmed') && <Button data-testid="cancel-booking" onClick={cancelBooking} className="w-100" variant='danger' disabled={isCancelling}>Отменить бронирование</Button>}
        </Card.Body>
      </Card>
    )}
  </div>)
}
