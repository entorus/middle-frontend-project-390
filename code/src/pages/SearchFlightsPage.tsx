import formatDate from '../utils/formatDate'
import { Alert, Button, Card, Col, Form, Row, Stack } from 'react-bootstrap'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'


type City = {
  code: string;
  name: string;
  country: string;
}

type Status = 'idle' | 'submitting' | 'success' | 'error'

interface Airline {
  code: string;
  name: string;
}

interface LocationInfo {
  code: string;
  name: string;
  country: string;
}

interface PriceInfo {
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
  price: PriceInfo;
  seatsAvailable: number;
}

export default function SearchFlightsPage () {
  const [citiesList, setCitiesList] = useState<City[]>([])
  const [flightsList, setFlightsList] = useState<Flight[]>([])
  const [searchStatus, setSearchStatus] = useState<Status>('idle')

  useEffect(() => {
    async function loadCities() {
      const response = await fetch('http://127.0.0.1:4010/api/cities')
      const cities: City[] = await response.json()
      setCitiesList(cities)
    }

    loadCities()
  }, [])

  const searchFlights = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const params = new URLSearchParams({
      origin: String(formData.get('search-origin') ?? ''),
      destination: String(formData.get('search-destination') ?? ''),
      date: String(formData.get('search-date') ?? ''),
      passengers: String(formData.get('search-passengers') ?? '1'),
    })

    try {
      const response = await fetch(`http://127.0.0.1:4010/api/flights?${params}`)

      if (! response.ok) {
        setSearchStatus('error')
        throw new Error('Search failed')
      }

      const flights: Flight[] = await response.json()
      setFlightsList(flights)
      setSearchStatus('success')
    } catch {
      setSearchStatus('error')
    }
  }

  return (
    <>
      <Form 
        onSubmit={searchFlights}
        data-testid="flight-search-form" 
        className="mb-3"
      >
        <Row className="g-3 align-items-end">
          <Col xs={12} md={6} lg>
            <Form.Group controlId="fromInput">
              <Form.Label className="fw-semibold">Откуда</Form.Label>
              <Form.Select data-testid="search-origin" name='search-origin'>
                <option value="">Откуда</option>
                {citiesList.map(city => (<option key={city.code} value={city.code}>{city.name}</option>))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col xs={12} md={6} lg>
            <Form.Group controlId="toInput">
              <Form.Label className="fw-semibold">Куда</Form.Label>
              <Form.Select data-testid="search-destination" name='search-destination'>
                <option value="">Куда</option>
                {citiesList.map(city => (<option key={city.code} value={city.code}>{city.name}</option>))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col xs={12} md={6} lg>
            <Form.Group controlId="dateInput">
              <Form.Label className="fw-semibold">Дата</Form.Label>
              <Form.Control name="search-date" data-testid="search-date" type="date" defaultValue="2026-06-26" />
            </Form.Group>
          </Col>

          <Col xs={12} md={6} lg>
            <Form.Group controlId="passengersInput">
              <Form.Label className="fw-semibold">Пассажиры</Form.Label>
              <Form.Control name="search-passengers" data-testid="search-passengers" type="number" min="1" defaultValue="1" />
            </Form.Group>
          </Col>

          <Col xs={12} lg>
            <Button data-testid="search-submit" type="submit" variant="primary" className="w-100 fw-semibold" disabled={searchStatus === 'submitting'}>
              Найти
            </Button>
          </Col>
        </Row>
      </Form>

      <Stack data-testid="flight-results" gap={3}>
        {flightsList.map((flight) => (
          <Card data-testid="flight-result-item" key={flight.id}>
            <Card.Body className="p-3">
              <Row className="g-3 align-items-center">
                <Col>
                  <Card.Title as="h2" className="h5 mb-1 fw-bold text-black">
                    {flight.airline.name} · {flight.flightNumber}
                  </Card.Title>
                  <Card.Text className="mb-1 text-black">{flight.origin.name} → {flight.destination.name}</Card.Text>
                  <Card.Text className="mb-0 text-secondary">
                    {formatDate(flight.departureAt)} — {formatDate(flight.arrivalAt)} {flight.durationMinutes} мин
                  </Card.Text>
                </Col>

                <Col xs={12} md="auto">
                  <Stack
                    direction="horizontal"
                    gap={3}
                    className="justify-content-between justify-content-md-end"
                  >
                    <div className="fs-5 fw-bold text-nowrap text-black">
                      {flight.price.amount} ₽
                    </div>
                    <Link
                      to={`booking/${flight.id}`}
                      data-testid="book-flight"
                      className="bg-primary-subtle border-0 px-4 fw-semibold text-primary btn btn-light"
                    >
                      Забронировать
                    </Link>
                  </Stack>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ))}
        {(searchStatus === 'success' && flightsList.length === 0) && (
          <Alert data-testid="flights-empty" variant="warning">
            Рейсов не найдено
          </Alert>
        )}
        {searchStatus === 'error' && (
          <Alert data-testid="flights-error" variant="danger">
            Ошибка поиска
          </Alert>
        )}
      </Stack>
    </>
  )
}