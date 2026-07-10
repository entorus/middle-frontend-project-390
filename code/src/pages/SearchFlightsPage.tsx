import formatDate from '../utils/formatDate'
import getLocalDateValue from '../utils/getLocalDateValue'
import { Alert, Button, Card, Col, Form, Row, Stack } from 'react-bootstrap'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCities, searchFlights as searchFlightsRequest } from '../api/flights'
import { type City, type Flight } from '../api/types'

type Status = 'idle' | 'submitting' | 'success' | 'error'
type SearchValues = {
  origin: string
  destination: string
  date: string
  passengers: string
}

export default function SearchFlightsPage () {
  const [citiesList, setCitiesList] = useState<City[]>([])
  const [flightsList, setFlightsList] = useState<Flight[]>([])
  const [searchStatus, setSearchStatus] = useState<Status>('idle')
  const [todayDate] = useState(() => getLocalDateValue())
  const [searchValues, setSearchValues] = useState<SearchValues>(() => ({
    origin: '',
    destination: '',
    date: todayDate,
    passengers: '1',
  }))

  const loadFlights = useCallback(async (params: SearchValues) => {
    setSearchStatus('submitting')

    try {
      const flights = await searchFlightsRequest(params)
      setFlightsList(flights)
      setSearchStatus('success')
    } catch {
      setFlightsList([])
      setSearchStatus('error')
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadInitialFlights() {
      try {
        const cities = await getCities()

        if (cancelled) {
          return
        }

        const origin = cities[0]?.code ?? ''
        const destination = cities.find((city) => city.code !== origin)?.code ?? ''
        const initialSearchValues = {
          origin,
          destination,
          date: todayDate,
          passengers: '1',
        }

        setCitiesList(cities)
        setSearchValues(initialSearchValues)

        if (!origin || !destination) {
          setSearchStatus('success')
          return
        }

        await loadFlights(initialSearchValues)
      } catch {
        if (!cancelled) {
          setSearchStatus('error')
        }
      }
    }

    loadInitialFlights()

    return () => {
      cancelled = true
    }
  }, [loadFlights, todayDate])

  const searchFlights = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget

    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    await loadFlights(searchValues)
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
              <Form.Select
                data-testid="search-origin"
                name="search-origin"
                value={searchValues.origin}
                onChange={(event) => setSearchValues((values) => ({ ...values, origin: event.target.value }))}
              >
                <option value="">Откуда</option>
                {citiesList.map(city => (<option key={city.code} value={city.code}>{city.name}</option>))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col xs={12} md={6} lg>
            <Form.Group controlId="toInput">
              <Form.Label className="fw-semibold">Куда</Form.Label>
              <Form.Select
                data-testid="search-destination"
                name="search-destination"
                value={searchValues.destination}
                onChange={(event) => setSearchValues((values) => ({ ...values, destination: event.target.value }))}
              >
                <option value="">Куда</option>
                {citiesList.map(city => (<option key={city.code} value={city.code}>{city.name}</option>))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col xs={12} md={6} lg>
            <Form.Group controlId="dateInput">
              <Form.Label className="fw-semibold">Дата</Form.Label>
              <Form.Control
                name="search-date"
                data-testid="search-date"
                type="date"
                value={searchValues.date}
                onChange={(event) => setSearchValues((values) => ({ ...values, date: event.target.value }))}
                min={todayDate}
                required
              />
            </Form.Group>
          </Col>

          <Col xs={12} md={6} lg>
            <Form.Group controlId="passengersInput">
              <Form.Label className="fw-semibold">Пассажиры</Form.Label>
              <Form.Control
                name="search-passengers"
                data-testid="search-passengers"
                type="number"
                min="1"
                value={searchValues.passengers}
                onChange={(event) => setSearchValues((values) => ({ ...values, passengers: event.target.value }))}
              />
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
