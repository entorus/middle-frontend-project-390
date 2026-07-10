import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Col, Container, Row } from 'react-bootstrap'
import Header from './partials/Header'

import BookingPage from './pages/BookingPage'
import BookingsPage from './pages/BookingsPage'
import SearchFlightsPage from './pages/SearchFlightsPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <BrowserRouter>
      <Container fluid className="px-0 py-4">
        <Row className="justify-content-center">
          <Col xs={12} xxl={10}>
            <Header />
            <Routes>
              <Route path="/" element={<SearchFlightsPage/> } />
              <Route path="lookup" element={<BookingsPage />} />
              <Route path="my-bookings" element={<BookingsPage />} />
              <Route path="booking/:flightId" element={<BookingPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Col>
        </Row>
      </Container>
    </BrowserRouter>
  )
}

export default App
