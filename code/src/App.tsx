import { BrowserRouter, Routes, Route } from 'react-router-dom'

// import BookingPage from './pages/BookingPage'
import SearchFlightsPage from './pages/SearchFlightsPage'

function App() {
  
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SearchFlightsPage/> } />
        {/* <Route path="my-bookings" element={<BookingPage />} />
        <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
