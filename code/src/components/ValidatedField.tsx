import { ErrorMessage, useField } from 'formik'

interface ValidatedFieldProps {
  disabled?: boolean
  id: string
  label: string
  name: string
  testId?: string
  type?: string
}

export default function ValidatedField({
  disabled = false,
  id,
  label,
  name,
  testId,
  type = 'text',
}: ValidatedFieldProps) {
  const [field, meta] = useField(name)
  const isInvalid = meta.touched && Boolean(meta.error)

  return (
    <div>
      <label className="form-label fw-semibold" htmlFor={id}>{label}</label>
      <input
        {...field}
        id={id}
        type={type}
        disabled={disabled}
        data-testid={testId}
        className={`form-control ${isInvalid ? 'is-invalid' : ''}`}
      />
      <ErrorMessage
        component="div"
        name={name}
        className="invalid-feedback"
      />
    </div>
  )
}
