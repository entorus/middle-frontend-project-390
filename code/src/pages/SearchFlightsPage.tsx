import formatDate from '../utils/formatDate'
import formatPrice from '../utils/formatPrice'
import getLocalDateValue from '../utils/getLocalDateValue'
import { Alert, Button, Card, Col, Form, Row, Spinner, Stack } from 'react-bootstrap'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCities, searchFlights as searchFlightsRequest, type SearchFlightsParams } from '../api/flights'
import { type City, type Flight } from '../api/types'
import { isAbortError } from '../api/errors'
import { MAX_PASSENGERS, MIN_PASSENGERS } from '../constants/booking'

type Status = 'submitting' | 'success' | 'error'
type CitiesStatus = 'loading' | 'ready' | 'error'
type SearchValues = SearchFlightsParams
type SearchState = {
  error: string | null
  flights: Flight[]
  params: SearchValues | null
  status: Status
}

export default function SearchFlightsPage () {
  const [citiesList, setCitiesList] = useState<City[]>([])
  const [citiesStatus, setCitiesStatus] = useState<CitiesStatus>('loading')
  const [searchState, setSearchState] = useState<SearchState>({
    error: null,
    flights: [],
    params: null,
    status: 'submitting',
  })
  const [todayDate, setTodayDate] = useState(() => getLocalDateValue())
  const [searchValues, setSearchValues] = useState<SearchValues>(() => ({
    origin: '',
    destination: '',
    date: todayDate,
    passengers: String(MIN_PASSENGERS),
  }))
  const flightsRequestRef = useRef<AbortController | null>(null)

  const loadFlights = useCallback(async (params: SearchValues) => {
    flightsRequestRef.current?.abort()
    const controller = new AbortController()
    flightsRequestRef.current = controller
    setSearchState({ error: null, flights: [], params, status: 'submitting' })

    try {
      const flights = await searchFlightsRequest(params, controller.signal)

      if (flightsRequestRef.current !== controller || controller.signal.aborted) {
        return
      }

      setSearchState({ error: null, flights, params, status: 'success' })
    } catch (error) {
      if (flightsRequestRef.current !== controller || isAbortError(error)) {
        return
      }

      setSearchState({
        error: 'Не удалось загрузить рейсы. Попробуйте ещё раз.',
        flights: [],
        params,
        status: 'error',
      })
    } finally {
      if (flightsRequestRef.current === controller) {
        flightsRequestRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function loadInitialFlights() {
      try {
        const cities = await getCities(controller.signal)

        if (controller.signal.aborted) {
          return
        }

        const origin = cities[0]?.code ?? ''
        const destination = cities.find((city) => city.code !== origin)?.code ?? ''
        const currentDate = getLocalDateValue()
        const initialSearchValues = {
          origin,
          destination,
          date: currentDate,
          passengers: String(MIN_PASSENGERS),
        }

        setTodayDate(currentDate)
        setCitiesList(cities)
        setCitiesStatus('ready')
        setSearchValues(initialSearchValues)

        if (!origin || !destination) {
          setSearchState({ error: null, flights: [], params: initialSearchValues, status: 'success' })
          return
        }

        await loadFlights(initialSearchValues)
      } catch (error) {
        if (!controller.signal.aborted && !isAbortError(error)) {
          setCitiesStatus('error')
          setSearchState({
            error: 'Не удалось загрузить города. Попробуйте обновить страницу.',
            flights: [],
            params: null,
            status: 'error',
          })
        }
      }
    }

    loadInitialFlights()

    return () => {
      controller.abort()
      flightsRequestRef.current?.abort()
      flightsRequestRef.current = null
    }
  }, [loadFlights])

  useEffect(() => {
    const updateCurrentDate = () => {
      const currentDate = getLocalDateValue()
      setTodayDate(currentDate)
      setSearchValues((values) => (
        values.date < currentDate ? { ...values, date: currentDate } : values
      ))
    }
    const now = new Date()
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const timer = window.setTimeout(updateCurrentDate, tomorrow.getTime() - now.getTime() + 1_000)

    window.addEventListener('focus', updateCurrentDate)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('focus', updateCurrentDate)
    }
  }, [todayDate])

  const searchFlights = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const currentDate = getLocalDateValue()

    if (searchValues.date < currentDate) {
      setTodayDate(currentDate)
      setSearchValues((values) => ({ ...values, date: currentDate }))
      setSearchState({
        error: 'Нельзя искать билеты на прошедшую дату.',
        flights: [],
        params: null,
        status: 'error',
      })
      return
    }

    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    if (searchValues.origin === searchValues.destination) {
      setSearchState({
        error: 'Города отправления и назначения должны отличаться.',
        flights: [],
        params: null,
        status: 'error',
      })
      return
    }

    await loadFlights(searchValues)
  }

  const isFormDisabled = citiesStatus !== 'ready' || searchState.status === 'submitting'
  const resultPassengerCount = Number(searchState.params?.passengers ?? MIN_PASSENGERS)

  return (
    <>
      <Form 
        onSubmit={searchFlights}
        data-testid="flight-search-form" 
        className="mb-3"
        aria-busy={isFormDisabled}
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
                disabled={isFormDisabled}
                required
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
                disabled={isFormDisabled}
                required
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
                disabled={isFormDisabled}
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
                min={MIN_PASSENGERS}
                max={MAX_PASSENGERS}
                value={searchValues.passengers}
                onChange={(event) => setSearchValues((values) => ({ ...values, passengers: event.target.value }))}
                disabled={isFormDisabled}
                required
              />
            </Form.Group>
          </Col>

          <Col xs={12} lg>
            <Button data-testid="search-submit" type="submit" variant="primary" className="w-100 fw-semibold" disabled={isFormDisabled}>
              Найти
            </Button>
          </Col>
        </Row>
      </Form>

      {searchState.status === 'submitting' ? (
        <div className="py-4 text-center" data-testid="flights-loading" role="status">
          <Spinner animation="border" className="me-2" />
          Ищем рейсы
        </div>
      ) : (
        <Stack data-testid="flight-results" gap={3}>
          {searchState.flights.map((flight) => (
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
                        {formatPrice(flight.price)}
                      </div>
                      <Link
                        to={`/booking/${flight.id}`}
                        state={{ passengerCount: resultPassengerCount }}
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
          {(searchState.status === 'success' && searchState.flights.length === 0) && (
            <Alert data-testid="flights-empty" variant="warning">
              Рейсов не найдено
            </Alert>
          )}
          {searchState.status === 'error' && (
            <Alert data-testid="flights-error" variant="danger">
              {searchState.error}
            </Alert>
          )}
        </Stack>
      )}
    </>
  )
}
