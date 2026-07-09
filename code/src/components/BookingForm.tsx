import { useState } from 'react'
import { Alert, Button, Col, Row } from 'react-bootstrap'
import { ErrorMessage, Field, FieldArray, Form, Formik, type FormikHelpers } from 'formik'
import * as yup from 'yup'
import PassengerForm from '../components/PassengerForm'
import { type Passenger, type Flight } from '../pages/BookingPage'

export interface BookingFormValues {
  email: string,
  phone: string,
  passengers: Passenger[]
}

interface BookingFormProps {
  bookingError: string | null,
  flightData: Flight,
  onBookingSubmit: (
    values: BookingFormValues,
    actions: FormikHelpers<BookingFormValues>,
  ) => void | Promise<void>
}

const createPassenger = (): Passenger => ({
  id: crypto.randomUUID(),
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  documentNumber: ''
})

export default function BookingForm({ bookingError, flightData, onBookingSubmit }: BookingFormProps) {

  const [initialValues] = useState<BookingFormValues>(() => ({
    email: '',
    phone: '',
    passengers: [createPassenger()]
  }))

  const normalizePhoneNumber = (phone: string): string => phone.replace(/[\s().-]/g, '')
  const phoneRegExp = /^(?:\+7|8|7)[0-9]{10}$/

  const passengerSchema = yup.object({
    firstName: yup.string().trim().required('Обязательное поле'),
    lastName: yup.string().trim().required('Обязательное поле'),
    dateOfBirth: yup.string().required('Обязательное поле'),
    documentNumber: yup.string().trim().required('Обязательное поле'),
  })

  const bookingSchema = yup.object().shape({
    email: yup.string().email().required('Обязательное поле'),
    phone: yup.string()
      .transform((value) => normalizePhoneNumber(value ?? ''))
      .matches(phoneRegExp, {
        message: 'Некорректный формат номера телефона',
        excludeEmptyString: true,
      })
      .required('Обязательное поле'),
    passengers: yup.array().of(passengerSchema).min(1, 'Добавьте пассажира').required()
  })

  

  return (
    <>
      <h2 className="h2 mb-4 fw-bold text-black">Оформление бронирования</h2>
      <p className="fs-5 mb-4 text-black">{flightData.airline.name} · {flightData.flightNumber}: {flightData.origin.name} → {flightData.destination.name}</p>
      {bookingError && (
        <Alert data-testid="booking-error" variant="danger">
          {bookingError}
        </Alert>
      )}
      <Formik
        validationSchema={bookingSchema}
        onSubmit={onBookingSubmit}
        initialValues={initialValues}
      >
        {({ touched, errors, values, isSubmitting }) => (
          <Form>
            <Row className="g-3 mb-4">
              <Col xs={12} md={6}>
                <div>
                  <label className="form-label fw-semibold" htmlFor="email">Email</label>
                  <Field 
                    id="email" 
                    className={`form-control ${
                      errors.email && touched.email ? 'is-invalid' : ''
                    }`}
                    name="email" 
                  />
                  <ErrorMessage
                    component="div"
                    name="email"
                    className="invalid-feedback"
                  />
                </div>
              </Col>

              <Col xs={12} md={6}>
                <div>
                  <label className="form-label fw-semibold" htmlFor="phone">Телефон</label>
                  <Field 
                    id="phone" 
                    className={`form-control ${
                      errors.phone && touched.phone ? 'is-invalid' : ''
                    }`}
                    name="phone" 
                  />
                  <ErrorMessage
                    component="div"
                    name="phone"
                    className="invalid-feedback"
                  />
                </div>
              </Col>
            </Row>

            <Row className="align-items-center mb-4">
              <Col>
                <hr className="my-0" />
              </Col>
              <Col xs="auto" className="small text-secondary">
                Пассажиры
              </Col>
              <Col>
                <hr className="my-0" />
              </Col>
            </Row>

            <FieldArray name="passengers">
              {({ push, remove }) => (
                <>
                  {values.passengers.map((passenger, index) => (
                    <PassengerForm
                      key={passenger.id}
                      index={index}
                      passengerId={passenger.id}
                      onRemove={index === 0 ? undefined : () => remove(index)}
                    />
                  ))}

                  <div className="d-grid d-sm-flex gap-3">
                    <Button
                      type="button"
                      variant="light"
                      className="bg-primary-subtle border-0 px-4 fw-semibold text-primary"
                      onClick={() => push(createPassenger())}
                    >
                      Добавить пассажира
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="px-4 fw-semibold"
                      disabled={isSubmitting}
                    >
                      Забронировать
                    </Button>
                  </div>
                </>
              )}
            </FieldArray>
          </Form>
        )}
      </Formik>
    </>
  )
}
