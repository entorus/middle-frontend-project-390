import { Card, CloseButton, Col, Form, Row } from 'react-bootstrap'

interface PassengerFormProps {
  onRemove?: () => void
}

export default function PassengerForm({ onRemove }: PassengerFormProps) {
  return (
    <Card className="position-relative mb-3">
      {onRemove && (
        <CloseButton
          aria-label="Удалить пассажира"
          className="position-absolute top-0 end-0 m-2 p-1"
          style={{ fontSize: '0.65rem', zIndex: 1 }}
          onClick={onRemove}
        />
      )}

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
  )
}
