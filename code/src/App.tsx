import { Button, Card, Col, Container, Form, Nav, Row, Stack } from 'react-bootstrap'

const flights = [
  {
    id: 'DP1001',
    airline: 'Победа',
    route: 'Москва → Санкт-Петербург',
    schedule: '26.06.2026, 11:30 — 26.06.2026, 12:59 · 89 мин',
    price: '6 000 ₽',
  },
  {
    id: 'S71002',
    airline: 'S7 Airlines',
    route: 'Москва → Санкт-Петербург',
    schedule: '26.06.2026, 16:30 — 26.06.2026, 20:49 · 259 мин',
    price: '5 000 ₽',
  },
]

function App() {
  return (
    <Container fluid className="px-0 py-4">
      <Row className="justify-content-center">
        <Col xs={12} xxl={10}>
          <h1 className="mb-3 fw-bold text-black">Бронирование авиабилетов</h1>

          <Nav className="gap-3 mb-4">
            <Nav.Link href="#" className="p-0">
              Поиск рейсов
            </Nav.Link>
            <Nav.Link href="#" className="p-0">
              Мои брони
            </Nav.Link>
          </Nav>

          <Form className="mb-3">
            <Row className="g-3 align-items-end">
              <Col xs={12} md={6} lg>
                <Form.Group controlId="fromInput">
                  <Form.Label className="fw-semibold">Откуда</Form.Label>
                  <Form.Select defaultValue="Москва">
                    <option>Москва</option>
                    <option>Санкт-Петербург</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs={12} md={6} lg>
                <Form.Group controlId="toInput">
                  <Form.Label className="fw-semibold">Куда</Form.Label>
                  <Form.Select defaultValue="Санкт-Петербург">
                    <option>Санкт-Петербург</option>
                    <option>Москва</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs={12} md={6} lg>
                <Form.Group controlId="dateInput">
                  <Form.Label className="fw-semibold">Дата</Form.Label>
                  <Form.Control type="date" defaultValue="2026-06-26" />
                </Form.Group>
              </Col>

              <Col xs={12} md={6} lg>
                <Form.Group controlId="passengersInput">
                  <Form.Label className="fw-semibold">Пассажиры</Form.Label>
                  <Form.Control type="number" min="1" defaultValue="1" />
                </Form.Group>
              </Col>

              <Col xs={12} lg>
                <Button type="submit" variant="primary" className="w-100 fw-semibold">
                  Найти
                </Button>
              </Col>
            </Row>
          </Form>

          <Stack gap={3}>
            {flights.map((flight) => (
              <Card key={flight.id}>
                <Card.Body className="p-3">
                  <Row className="g-3 align-items-center">
                    <Col>
                      <Card.Title as="h2" className="h5 mb-1 fw-bold text-black">
                        {flight.airline} · {flight.id}
                      </Card.Title>
                      <Card.Text className="mb-1 text-black">{flight.route}</Card.Text>
                      <Card.Text className="mb-0 text-secondary">
                        {flight.schedule}
                      </Card.Text>
                    </Col>

                    <Col xs={12} md="auto">
                      <Stack
                        direction="horizontal"
                        gap={3}
                        className="justify-content-between justify-content-md-end"
                      >
                        <div className="fs-5 fw-bold text-nowrap text-black">
                          {flight.price}
                        </div>
                        <Button
                          type="button"
                          variant="light"
                          className="bg-primary-subtle border-0 px-4 fw-semibold text-primary"
                        >
                          Забронировать
                        </Button>
                      </Stack>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
          </Stack>
        </Col>
      </Row>
    </Container>
  )
}

export default App
