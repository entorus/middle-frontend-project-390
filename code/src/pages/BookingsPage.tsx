import { useState } from 'react'
import { Badge, Button, Card, Col, Row } from 'react-bootstrap'
import { ErrorMessage, Field, Form, Formik } from 'formik'
import * as yup from 'yup'
import { type BookingData } from './BookingPage'

interface BookingSearchValues {
  code: string;
  lastName: string;
}

export default function BookingsPage() {
  const [foundBooking, setFoundBooking] = useState<BookingData | null>(null)
  const initialValues: BookingSearchValues = {
    code: '',
    lastName: ''
  }
  const bookingSearchSchema = yup.object().shape({
    code: yup.string().required('Обязательное поле'),
    lastName: yup.string().required('Обязательное поле'),
  })

  const searchBooking = async ({ code, lastName }: BookingSearchValues) => {
    const response = await fetch(`http://127.0.0.1:8080/api/bookings/${code}?lastName=${lastName}`, {
      method: 'GET'
    })
    
    const result = await response.json()
    
    setFoundBooking(result)
  }
  return (<div>
    <h2 className="h2 mb-4 fw-bold text-black">Моя бронь</h2>
    <Formik<BookingSearchValues>
      initialValues={initialValues}
      onSubmit={searchBooking}
      validationSchema={bookingSearchSchema}
    >
      {({ touched, errors, isSubmitting }) => (
        <Form data-testid="booking-form">
          <Row className="g-3 mb-4 align-items-start">
            <Col xs={12} md={6} lg={3}>
              <div>
                <label className="form-label fw-semibold" htmlFor="code">Код брони</label>
                <Field 
                  id="code" 
                  name="code" 
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
                data-testid="booking-submit"
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
    {foundBooking && (
      <Card data-testid="flight-result-item">
        <Card.Body className="p-3">
          <p><b>{foundBooking.code}</b> <Badge pill bg="success">{foundBooking.status}</Badge></p>
          <p>{foundBooking.flight.airline.name} · {foundBooking.flight.flightNumber}: {foundBooking.flight.origin.name} → {foundBooking.flight.destination.name}</p>
          <p>Пассажиры: {foundBooking.passengers.map((pass) => {
            return `${pass.firstName} ${pass.lastName}${foundBooking.passengers.length > 1 ? ',' : ''}`
          })}</p>
          <p>Итого: {foundBooking.totalPrice.amount} ₽</p>
          <Button className="w-100" variant='danger'>Отменить бронирование</Button>
        </Card.Body>
      </Card>
    )}
  </div>)
}
