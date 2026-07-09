export interface City {
  code: string;
  name: string;
  country: string;
}

export interface Airline {
  code: string;
  name: string;
}

export interface LocationInfo {
  code: string;
  name: string;
  country: string;
}

export interface FlightPrice {
  amount: number;
  currency: string;
}

export interface Flight {
  id: string;
  flightNumber: string;
  airline: Airline;
  origin: LocationInfo;
  destination: LocationInfo;
  departureAt: string;
  arrivalAt: string;
  durationMinutes: number;
  price: FlightPrice;
  seatsAvailable: number;
}

export interface Passenger {
  id: string,
  firstName: string
  lastName: string,
  dateOfBirth: string,
  documentNumber: string
}

export interface Contact {
  email: string;
  phone: string;
}

export interface BookingPassenger {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  documentNumber: string;
}

export interface BookingData {
  code: string;
  status: 'confirmed' | 'cancelled';
  flight: Flight;
  passengers: BookingPassenger[];
  contact: Contact;
  totalPrice: FlightPrice;
  createdAt: string;
}

export interface CreateBookingData {
  flightId: string;
  contact: Contact;
  passengers: BookingPassenger[]
}

export interface BookingSearchParams {
  code: string;
  lastName: string;
}

export interface ApiErrorResponse {
  code: string;
  message: string;
}
