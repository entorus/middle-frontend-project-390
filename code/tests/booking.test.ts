import { expect, test, type Page } from '@playwright/test'
import type { CreateBookingData } from '../src/api/types'
import { fulfillJson, mockCities, mockFlightById, mockFlightSearch } from './fixtures/api'
import { booking, flights } from './fixtures/data'

const openBookingPage = async (page: Page) => {
  await mockFlightById(page)
  await page.goto(`/booking/${flights[0].id}`)
  await expect(page.getByTestId('booking-form')).toBeVisible()
}

const fillBookingForm = async (page: Page, lastName = 'Петров') => {
  await page.getByTestId('contact-email').fill('ivan@example.com')
  await page.getByTestId('contact-phone').fill('+79991234567')
  await page.getByTestId('passenger-0-firstName').fill('Иван')
  await page.getByTestId('passenger-0-lastName').fill(lastName)
  await page.getByTestId('passenger-0-dob').fill('1990-05-20')
  await page.getByTestId('passenger-0-document').fill('4509 123456')
}

test('использует при оформлении именно выбранный рейс', async ({ page }) => {
  await mockCities(page)
  await mockFlightSearch(page)
  await mockFlightById(page)
  await page.goto('/')

  const selectedFlight = page.getByTestId('flight-result-item').filter({ hasText: flights[0].flightNumber })
  await expect(selectedFlight).toHaveCount(1)
  await selectedFlight.getByTestId('book-flight').click()

  await expect(page).toHaveURL(new RegExp(`/booking/${flights[0].id}$`))
  await expect(page.getByTestId('booking-flight')).toContainText(flights[0].flightNumber)
  await expect(page.getByTestId('booking-flight')).toContainText(flights[0].airline.name)
})

test('показывает форму без crypto.randomUUID', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window.crypto, 'randomUUID', {
      configurable: true,
      value: undefined,
    })
  })

  await openBookingPage(page)

  expect(await page.evaluate(() => typeof crypto.randomUUID)).toBe('undefined')
  await expect(page.getByTestId('booking-form')).toBeVisible()
})

test('добавляет поля пассажира', async ({ page }) => {
  await openBookingPage(page)

  await page.getByTestId('add-passenger').click()

  await expect(page.getByTestId('passenger-1-firstName')).toBeVisible()
  await expect(page.getByTestId('passenger-1-lastName')).toBeVisible()
  await expect(page.getByTestId('passenger-1-dob')).toBeVisible()
  await expect(page.getByTestId('passenger-1-document')).toBeVisible()
})

test('не отправляет пустую форму', async ({ page }) => {
  let bookingRequestsCount = 0

  await page.route('**/api/bookings', async (route) => {
    bookingRequestsCount += 1
    await fulfillJson(route, { body: booking, status: 201 })
  })
  await openBookingPage(page)

  await page.getByTestId('booking-submit').click()

  await expect(page.locator('.invalid-feedback')).toHaveCount(6)
  expect(bookingRequestsCount).toBe(0)
})

test('создаёт бронь с корректными данными и показывает код', async ({ page }) => {
  let submittedBooking: CreateBookingData | undefined

  await page.route('**/api/bookings', async (route) => {
    submittedBooking = route.request().postDataJSON() as CreateBookingData
    await fulfillJson(route, { body: booking, status: 201 })
  })
  await openBookingPage(page)
  await fillBookingForm(page)

  await page.getByTestId('booking-submit').click()

  await expect(page.getByTestId('booking-success')).toBeVisible()
  expect(submittedBooking).toEqual({
    flightId: flights[0].id,
    contact: {
      email: 'ivan@example.com',
      phone: '+79991234567',
    },
    passengers: [
      {
        firstName: 'Иван',
        lastName: 'Петров',
        dateOfBirth: '1990-05-20',
        documentNumber: '4509 123456',
      },
    ],
  })
  await expect(page.getByTestId('booking-code')).toHaveText(booking.code)
})

test('показывает ошибку при сбое создания брони', async ({ page }) => {
  await page.route('**/api/bookings', async (route) => {
    await route.abort('failed')
  })
  await openBookingPage(page)
  await fillBookingForm(page)

  await page.getByTestId('booking-submit').click()

  await expect(page.getByTestId('booking-error')).toContainText('Не удалось оформить бронирование')
})

test('показывает сообщение для неизвестного рейса', async ({ page }) => {
  await mockFlightById(page, 'unknown-flight-id', {
    status: 404,
    body: { message: 'Flight not found' },
  })

  await page.goto('/booking/unknown-flight-id')

  await expect(page.getByTestId('flight-not-found')).toBeVisible()
})
