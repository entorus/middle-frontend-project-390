import { Nav } from 'react-bootstrap'

export default function Header() {
  return (
    <>
      <h1 className="mb-3 fw-bold text-black">Бронирование авиабилетов</h1>

      <Nav className="gap-3 mb-4">
        <Nav.Link href="/" className="p-0">
          Поиск рейсов
        </Nav.Link>
        <Nav.Link href="/my-bookings" className="p-0" data-testid="nav-lookup">
          Мои брони
        </Nav.Link>
      </Nav>
    </>
  )
}
