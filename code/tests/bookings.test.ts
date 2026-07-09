import { afterEach, beforeEach, expect, test } from 'vitest'
import { chromium, type Browser, type Page } from '@playwright/test'

const appUrl = process.env.APP_URL || 'http://localhost:5173'

const booking = {
  code: 'E7H8FC',
  status: 'confirmed',
  flight: {
    id: 'fl_1',
    flightNumber: 'SU1234',
    airline: { code: 'SU', name: 'Аэрофлот' },
    origin: { code: 'MOW', name: 'Москва', country: 'Россия' },
    destination: { code: 'LED', name: 'Санкт-Петербург', country: 'Россия' },
    departureAt: '2026-07-01T08:00:00Z',
    arrivalAt: '2026-07-01T09:25:00Z',
    durationMinutes: 85,
    price: { amount: 5400, currency: 'RUB' },
    seatsAvailable: 42,
  },
  passengers: [
    {
      firstName: 'Petr',
      lastName: 'Pupkin',
      dateOfBirth: '1990-05-20',
      documentNumber: '4509 123456',
    },
  ],
  contact: {
    email: 'petr@example.com',
    phone: '+79991234567',
  },
  totalPrice: { amount: 5400, currency: 'RUB' },
  createdAt: '2026-07-01T07:00:00Z',
}

let browser: Browser | undefined
let page: Page

beforeEach(async () => {
  browser = await chromium.launch()
  page = await browser.newPage()
})

afterEach(async () => {
  await browser?.close()
  browser = undefined
})

async function openBookingsPage() {
  await page.goto(`${appUrl}/my-bookings`)
  await page.waitForSelector('[data-testid="booking-lookup-form"]')
}

async function fillBookingSearchForm() {
  await page.getByTestId('lookup-code').fill('E7H8FC')
  await page.getByTestId('lookup-lastName').fill('Pupkin')
  await page.getByTestId('lookup-submit').click()
}

test('shows link to bookings page in navigation', async () => {
  await page.goto(appUrl)

  const bookingsLink = page.getByTestId('nav-lookup')

  expect(await bookingsLink.isVisible()).toBe(true)
  expect(await bookingsLink.getAttribute('href')).toBe('/my-bookings')
})

test('searches booking by code and last name', async () => {
  let requestedMethod = ''
  let requestedCode = ''
  let requestedLastName: string | null = null

  await page.route('**/api/bookings/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    requestedMethod = request.method()
    requestedCode = url.pathname.split('/').at(-1) ?? ''
    requestedLastName = url.searchParams.get('lastName')

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(booking),
    })
  })

  await openBookingsPage()
  await fillBookingSearchForm()
  await page.waitForSelector('[data-testid="booking-details"]')

  const cardText = await page.getByTestId('booking-details').textContent()
  expect(requestedMethod).toBe('GET')
  expect(requestedCode).toBe('E7H8FC')
  expect(requestedLastName).toBe('Pupkin')
  expect(await page.getByTestId('booking-code').textContent()).toBe('E7H8FC')
  expect(cardText).toContain('Аэрофлот')
  expect(cardText).toContain('Petr Pupkin')
  expect(cardText).toContain('5400')
  expect(await page.getByTestId('booking-status').getAttribute('data-status')).toBe('confirmed')
})

test('shows error when booking is not found', async () => {
  await page.route('**/api/bookings/**', async (route) => {
    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Not found' }),
    })
  })

  await openBookingsPage()
  await fillBookingSearchForm()
  await page.waitForSelector('[data-testid="booking-not-found"]')

  expect(await page.getByTestId('booking-not-found').textContent()).toContain('Бронь не найдена')
  expect(await page.getByTestId('booking-details').count()).toBe(0)
})

test('cancels active booking and updates status', async () => {
  let cancelMethod = ''
  let cancelLastName: string | null = null

  await page.route('**/api/bookings/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())

    if (request.method() === 'DELETE') {
      cancelMethod = request.method()
      cancelLastName = url.searchParams.get('lastName')

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...booking, status: 'cancelled' }),
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(booking),
    })
  })

  await openBookingsPage()
  await fillBookingSearchForm()
  await page.waitForSelector('[data-testid="cancel-booking"]')

  await page.getByTestId('cancel-booking').click()
  await page.waitForFunction(() => document.querySelector('[data-testid="booking-status"]')?.getAttribute('data-status') === 'cancelled')

  expect(cancelMethod).toBe('DELETE')
  expect(cancelLastName).toBe('Pupkin')
  expect(await page.getByTestId('booking-status').getAttribute('data-status')).toBe('cancelled')
  expect(await page.getByTestId('cancel-booking').count()).toBe(0)
})
