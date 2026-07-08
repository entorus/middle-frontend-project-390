import { useEffect, useState } from 'react'
import { Button, Col, Row } from 'react-bootstrap'
import { ErrorMessage, Formik, Form, Field } from 'formik'
import * as yup from 'yup'
import { useParams } from 'react-router-dom'
import PassengerForm from '../components/PassengerForm'

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

interface Flight {
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

interface Passenger {
  id: string,
  name: string
  lastName: string,
  birthday: string,
  document: 'passport'
}

const createPassenger = (id: string): Passenger => ({
  id,
  name: '',
  lastName: '',
  birthday: '',
  document: 'passport'
})

const normalizePhoneNumber = (phone: string): string => phone.replace(/[\s().-]/g, '')

export default function BookingPage() {

  const phoneRegExp = /^(?:\+7|8|7)[0-9]{10}$/
  const schema = yup.object().shape({
    email: yup.string().email().required('Обязательное поле'),
    phone: yup.string()
      .transform((value) => normalizePhoneNumber(value ?? ''))
      .matches(phoneRegExp, {
        message: 'Некорректный формат номера телефона',
        excludeEmptyString: true,
      })
      .required('Обязательное поле'),
  })

  const { flightId } = useParams()
  const [flightData, setFlightData] = useState<Flight | null>(null)
  const [passengers, setPassengers] = useState<Passenger[]>(() => [createPassenger(crypto.randomUUID())])

  const addPassenger = () => {
    setPassengers((currentPassengers) => {
      const nextPassengerId = crypto.randomUUID()

      return [...currentPassengers, createPassenger(nextPassengerId)]
    })
  }

  const removePassenger = (passengerId: string) => {
    setPassengers((currentPassengers) => currentPassengers.filter(({ id }) => id !== passengerId))
  }

  useEffect(() => {
    async function loadFlightData() {
      const response = await fetch(`http://127.0.0.1:4010/api/flights/${flightId}`)
      const flight: Flight = await response.json()
      setFlightData(flight)
    }

    loadFlightData()
  }, [flightId])

  if (! flightData) 
    return

  return (
    <>
      <h2 className="h2 mb-4 fw-bold text-black">Оформление бронирования</h2>
      <p className="fs-5 mb-4 text-black">{flightData.airline.name} · {flightData.flightNumber}: {flightData.origin.name} → {flightData.destination.name}</p>
      <Formik
        validationSchema={schema}
        onSubmit={values => {
          console.log(values)
        }}
        initialValues={{
          email: '',
          phone: ''
        }}
      >
        {({ touched, errors }) => (
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

            {passengers.map((passenger, index) => (
              <PassengerForm
                key={passenger.id}
                onRemove={index === 0 ? undefined : () => removePassenger(passenger.id)}
              />
            ))}

            <div className="d-grid d-sm-flex gap-3">
              <Button
                type="button"
                variant="light"
                className="bg-primary-subtle border-0 px-4 fw-semibold text-primary"
                onClick={addPassenger}
              >
                Добавить пассажира
              </Button>
              <Button type="submit" variant="primary" className="px-4 fw-semibold">
                Забронировать
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </>
  )
}
