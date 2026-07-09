import { Card, CloseButton, Col, Row } from 'react-bootstrap'
import { ErrorMessage, Field, useField } from 'formik'

type PassengerFieldKey = 'firstName' | 'lastName' | 'dateOfBirth' | 'documentNumber'

interface PassengerFieldConfig {
  key: PassengerFieldKey
  label: string
  type?: string
}

const passengerFields: PassengerFieldConfig[] = [
  { key: 'firstName', label: 'Имя' },
  { key: 'lastName', label: 'Фамилия' },
  { key: 'dateOfBirth', label: 'Дата рождения', type: 'date' },
  { key: 'documentNumber', label: 'Документ' },
]

interface PassengerFormProps {
  index: number
  passengerId: string
  onRemove?: () => void
}

interface PassengerFieldProps {
  fieldKey: PassengerFieldKey
  index: number
  label: string
  passengerId: string
  type?: string
}

const getPassengerFieldName = (index: number, fieldKey: PassengerFieldKey): string => `passengers.${index}.${fieldKey}`

const getPassengerFieldId = (passengerId: string, fieldKey: PassengerFieldKey): string => `passenger-${passengerId}-${fieldKey}`

function PassengerField({ fieldKey, index, label, passengerId, type = 'text' }: PassengerFieldProps) {
  const name = getPassengerFieldName(index, fieldKey)
  const fieldId = getPassengerFieldId(passengerId, fieldKey)
  const [, meta] = useField(name)
  const isInvalid = meta.touched && Boolean(meta.error)

  return (
    <Col xs={12} md={6} lg={3}>
      <div>
        <label className="form-label fw-semibold" htmlFor={fieldId}>{label}</label>
        <Field
          id={fieldId}
          className={`form-control ${isInvalid ? 'is-invalid' : ''}`}
          name={name}
          type={type}
        />
        <ErrorMessage
          component="div"
          name={name}
          className="invalid-feedback"
        />
      </div>
    </Col>
  )
}

export default function PassengerForm({ index, onRemove, passengerId }: PassengerFormProps) {
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
          {passengerFields.map((field) => (
            <PassengerField
              key={field.key}
              fieldKey={field.key}
              index={index}
              label={field.label}
              passengerId={passengerId}
              type={field.type}
            />
          ))}
        </Row>
      </Card.Body>
    </Card>
  )
}
