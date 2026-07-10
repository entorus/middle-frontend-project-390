import { Nav } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'

export default function Header() {
  return (
    <>
      <h1 className="mb-3 fw-bold text-black">Бронирование авиабилетов</h1>

      <Nav className="gap-3 mb-4">
        <Nav.Link as={NavLink} to="/" className="p-0">
          Поиск рейсов
        </Nav.Link>
        <Nav.Link as={NavLink} to="/lookup" className="p-0" data-testid="nav-lookup">
          Мои брони
        </Nav.Link>
      </Nav>
    </>
  )
}
