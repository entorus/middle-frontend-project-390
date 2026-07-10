import { type BookingPassenger, type CreateBookingData } from '../api/types'

interface BookingFormData {
  email: string
  phone: string
  passengers: BookingPassenger[]
}

export const normalizePhoneNumber = (phone: string): string => phone.replace(/[\s().-]/g, '')

export default function createBookingData(
  flightId: string,
  { email, phone, passengers }: BookingFormData,
): CreateBookingData {
  return {
    flightId,
    contact: {
      email: email.trim(),
      phone: normalizePhoneNumber(phone),
    },
    passengers: passengers.map(({ firstName, lastName, dateOfBirth, documentNumber }) => ({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth,
      documentNumber: documentNumber.trim(),
    })),
  }
}
