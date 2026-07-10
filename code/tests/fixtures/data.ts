import type { BookingData, City, Flight } from '../../src/api/types'

export const cities: City[] = [
  { code: 'MOW', name: 'Москва', country: 'Россия' },
  { code: 'LED', name: 'Санкт-Петербург', country: 'Россия' },
  { code: 'AER', name: 'Сочи', country: 'Россия' },
]

export const flights: Flight[] = [
  {
    id: 'fl_1',
    flightNumber: 'SU1234',
    airline: { code: 'SU', name: 'Аэрофлот' },
    origin: cities[0],
    destination: cities[1],
    departureAt: '2026-07-10T08:00:00Z',
    arrivalAt: '2026-07-10T09:25:00Z',
    durationMinutes: 85,
    price: { amount: 5400, currency: 'RUB' },
    seatsAvailable: 42,
  },
  {
    id: 'fl_2',
    flightNumber: 'DP202',
    airline: { code: 'DP', name: 'Победа' },
    origin: cities[0],
    destination: cities[1],
    departureAt: '2026-07-10T13:30:00Z',
    arrivalAt: '2026-07-10T15:00:00Z',
    durationMinutes: 90,
    price: { amount: 3200, currency: 'RUB' },
    seatsAvailable: 18,
  },
]

export const booking: BookingData = {
  code: 'E7H8FC',
  status: 'confirmed',
  flight: flights[0],
  passengers: [
    {
      firstName: 'Пётр',
      lastName: 'Пупкин',
      dateOfBirth: '1990-05-20',
      documentNumber: '4509 123456',
    },
  ],
  contact: {
    email: 'petr@example.com',
    phone: '+79991234567',
  },
  totalPrice: { amount: 5400, currency: 'RUB' },
  createdAt: '2026-07-10T07:00:00Z',
}
