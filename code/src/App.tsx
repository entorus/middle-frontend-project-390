import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Col, Container, Row } from 'react-bootstrap'
import Header from './partials/Header'

// import BookingPage from './pages/BookingPage'
import SearchFlightsPage from './pages/SearchFlightsPage'

function App() {
  
  
  return (
    <Container fluid className="px-0 py-4">
      <Row className="justify-content-center">
        <Col xs={12} xxl={10}>
          <Header />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<SearchFlightsPage/> } />
              {/* <Route path="my-bookings" element={<BookingPage />} />
              <Route path="*" element={<NotFoundPage />} /> */}
            </Routes>
          </BrowserRouter>
        </Col>
      </Row>
    </Container>
  )
}

export default App
