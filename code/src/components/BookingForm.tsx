import { useId, useMemo, useRef } from 'react'
import { Alert, Button, Col, Row } from 'react-bootstrap'
import { FieldArray, Form, Formik, type FormikHelpers } from 'formik'
import * as yup from 'yup'
import PassengerForm from '../components/PassengerForm'
import ValidatedField from './ValidatedField'
import { type BookingPassenger, type Flight } from '../api/types'
import { normalizePhoneNumber } from '../utils/createBookingData'

export interface PassengerFormValues extends BookingPassenger {
  id: string
}

export interface BookingFormValues {
  email: string,
  phone: string,
  passengers: PassengerFormValues[]
}

interface BookingFormProps {
  bookingError: string | null,
  flightData: Flight,
  initialPassengerCount: number,
  maxPassengers: number,
  onBookingSubmit: (
    values: BookingFormValues,
    actions: FormikHelpers<BookingFormValues>,
  ) => void | Promise<void>
}

const createPassenger = (id: string): PassengerFormValues => ({
  id,
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  documentNumber: ''
})

const phoneRegExp = /^(?:\+7|8|7)[0-9]{10}$/

const passengerSchema = yup.object({
  firstName: yup.string().trim().required('Обязательное поле'),
  lastName: yup.string().trim().required('Обязательное поле'),
  dateOfBirth: yup.string().required('Обязательное поле'),
  documentNumber: yup.string().trim().required('Обязательное поле'),
})

const bookingSchema = yup.object().shape({
  email: yup.string().trim().email('Некорректный формат email').required('Обязательное поле'),
  phone: yup.string()
    .transform((value) => normalizePhoneNumber(value ?? ''))
    .matches(phoneRegExp, {
      message: 'Некорректный формат номера телефона',
      excludeEmptyString: true,
    })
    .required('Обязательное поле'),
  passengers: yup.array().of(passengerSchema).min(1, 'Добавьте пассажира').required()
})

export default function BookingForm({
  bookingError,
  flightData,
  initialPassengerCount,
  maxPassengers,
  onBookingSubmit,
}: BookingFormProps) {
  const formId = useId()
  const nextPassengerIdRef = useRef(initialPassengerCount)
  const initialValues = useMemo<BookingFormValues>(() => ({
    email: '',
    phone: '',
    passengers: Array.from(
      { length: initialPassengerCount },
      (_, index) => createPassenger(`${formId}-${index}`),
    ),
  }), [formId, initialPassengerCount])

  const createNextPassenger = () => {
    const passenger = createPassenger(`${formId}-${nextPassengerIdRef.current}`)
    nextPassengerIdRef.current += 1

    return passenger
  }

  

  return (
    <>
      <h2 className="h2 mb-4 fw-bold text-black">Оформление бронирования</h2>
      <p data-testid="booking-flight" className="fs-5 mb-4 text-black">{flightData.airline.name} · {flightData.flightNumber}: {flightData.origin.name} → {flightData.destination.name}</p>
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
        {({ values, isSubmitting }) => (
          <Form data-testid="booking-form">
            <Row className="g-3 mb-4">
              <Col xs={12} md={6}>
                <div>
                  <ValidatedField
                    id="email"
                    label="Email"
                    name="email"
                    testId="contact-email"
                  />
                </div>
              </Col>

              <Col xs={12} md={6}>
                <div>
                  <ValidatedField
                    id="phone"
                    label="Телефон"
                    name="phone"
                    testId="contact-phone"
                    type="tel"
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
                      data-testid="add-passenger"
                      variant="light"
                      className="bg-primary-subtle border-0 px-4 fw-semibold text-primary"
                      onClick={() => {
                        if (values.passengers.length < maxPassengers) {
                          push(createNextPassenger())
                        }
                      }}
                      disabled={values.passengers.length >= maxPassengers}
                    >
                      Добавить пассажира
                    </Button>
                    <Button
                      type="submit"
                      data-testid="booking-submit"
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
