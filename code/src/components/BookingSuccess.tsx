import { type BookingData } from '../pages/BookingPage'

interface BookingSuccessProps {
  bookingData: BookingData;
}

export default function BookingSuccess({ bookingData }: BookingSuccessProps) {
  return (
    <div data-testid="booking-success">
      <h2 className="h2 mb-4 fw-bold text-black">Бронирование оформлено</h2>
      <p>Код бронирования: <b data-testid="booking-code">{bookingData.code}</b></p>
      <p>{bookingData.flight.origin.name} → {bookingData.flight.destination.name}, {bookingData.flight.flightNumber}</p>
      <p>Пассажиров: {bookingData.passengers.length}</p>
      <p>Итого: {bookingData.totalPrice.amount} ₽</p>
    </div>
  )
}
