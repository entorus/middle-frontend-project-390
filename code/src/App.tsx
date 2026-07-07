import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Col, Container, Row } from 'react-bootstrap'
import Header from './partials/Header'

import BookingPage from './pages/BookingPage'
import BookingsPage from './pages/BookingsPage'
import SearchFlightsPage from './pages/SearchFlightsPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <Container fluid className="px-0 py-4">
      <Row className="justify-content-center">
        <Col xs={12} xxl={10}>
          <Header />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<SearchFlightsPage/> } />
              <Route path="my-bookings" element={<BookingsPage />} />
              <Route path="booking/:flightId" element={<BookingPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </Col>
      </Row>
    </Container>
  )
}

export default App
