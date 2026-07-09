import { useState } from 'react'
import { Alert, Badge, Button, Card, Col, Row } from 'react-bootstrap'
import { ErrorMessage, Field, Form, Formik } from 'formik'
import * as yup from 'yup'
import { cancelBooking as cancelBookingRequest, getBookingByCode } from '../api/bookings'
import { type BookingData, type BookingSearchParams } from '../api/types'

type BookingSearchValues = BookingSearchParams

const bookingStatusLabels: Record<BookingData['status'], string> = {
  confirmed: 'подтверждена',
  cancelled: 'отменена'
}

const notFoundMessage = 'Бронь не найдена. Проверьте код бронирования и фамилию.'
const cancelErrorMessage = 'Не удалось отменить бронирование. Попробуйте ещё раз.'

const normalizeBookingSearchValues = ({ code, lastName }: BookingSearchValues): BookingSearchValues => ({
  code: code.trim(),
  lastName: lastName.trim()
})

export default function BookingsPage() {
  const [foundBooking, setFoundBooking] = useState<BookingData | null>(null)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [foundBookingParams, setFoundBookingParams] = useState<BookingSearchValues | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const initialValues: BookingSearchValues = {
    code: '',
    lastName: ''
  }
  const bookingSearchSchema = yup.object().shape({
    code: yup.string().trim().required('Обязательное поле'),
    lastName: yup.string().trim().required('Обязательное поле'),
  })

  const searchBooking = async (values: BookingSearchValues) => {
    const searchParams = normalizeBookingSearchValues(values)

    try {
      setBookingError(null)
      setFoundBooking(null)
      setFoundBookingParams(null)

      const result = await getBookingByCode(searchParams)

      setFoundBooking(result)
      setFoundBookingParams(searchParams)
    } catch {
      setBookingError(notFoundMessage)
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
      setBookingError(cancelErrorMessage)
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
        <Form data-testid="booking-lookup-form">
          <Row className="g-3 mb-4 align-items-start">
            <Col xs={12} md={6} lg={3}>
              <div>
                <label className="form-label fw-semibold" htmlFor="code">Код брони</label>
                <Field 
                  id="code" 
                  name="code" 
                  data-testid="lookup-code"
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
                disabled={isSubmitting}
              >
                Найти
              </Button>
            </Col>
          </Row>
        </Form>
      )}
    </Formik>
    {bookingError && (
      <Alert data-testid="booking-not-found" variant="danger">
        {bookingError}
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
