import { useEffect, useState } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import PassengerForm from '../components/PassengerForm'
import { useParams } from 'react-router-dom'

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

export default function BookingPage() {
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
      <Form>
        <Row className="g-3 mb-4">
          <Col xs={12} md={6}>
            <Form.Group controlId="bookingEmail">
              <Form.Label className="fw-semibold">Email</Form.Label>
              <Form.Control type="email" defaultValue="ivan@example.com" />
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group controlId="bookingPhone">
              <Form.Label className="fw-semibold">Телефон</Form.Label>
              <Form.Control type="tel" defaultValue="+7 999 000-11-22" />
            </Form.Group>
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
    </>
  )
}
