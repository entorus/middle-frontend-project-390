import { Button, Card, Col, Form, Row } from 'react-bootstrap'

export default function BookingPage() {
  return (
    <>
      <h2 className="h2 mb-4 fw-bold text-black">Оформление бронирования</h2>
      <p className="fs-5 mb-4 text-black">Победа · DP1001: Москва → Санкт-Петербург</p>

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

        <Card className="mb-3">
          <Card.Body className="p-3">
            <Row className="g-3">
              <Col xs={12} md={6} lg={3}>
                <Form.Group controlId="passengerFirstName">
                  <Form.Label className="fw-semibold">Имя</Form.Label>
                  <Form.Control type="text" defaultValue="Иван" />
                </Form.Group>
              </Col>

              <Col xs={12} md={6} lg={3}>
                <Form.Group controlId="passengerLastName">
                  <Form.Label className="fw-semibold">Фамилия</Form.Label>
                  <Form.Control type="text" defaultValue="Петров" />
                </Form.Group>
              </Col>

              <Col xs={12} md={6} lg={3}>
                <Form.Group controlId="passengerBirthDate">
                  <Form.Label className="fw-semibold">Дата рождения</Form.Label>
                  <Form.Control type="date" />
                </Form.Group>
              </Col>

              <Col xs={12} md={6} lg={3}>
                <Form.Group controlId="passengerDocument">
                  <Form.Label className="fw-semibold">Документ</Form.Label>
                  <Form.Control type="text" defaultValue="4509 123456" />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <div className="d-grid d-sm-flex gap-3">
          <Button
            type="button"
            variant="light"
            className="bg-primary-subtle border-0 px-4 fw-semibold text-primary"
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
