import { afterEach, beforeEach, expect, test } from 'vitest'
import { chromium, type Browser, type Page } from '@playwright/test'

const appUrl = process.env.APP_URL || 'http://localhost:5173'
const flightId = 'fl_1'

interface SubmittedBooking {
  flightId: string
  contact: {
    email: string
    phone: string
  }
  passengers: Array<{
    firstName: string
    lastName: string
    dateOfBirth: string
    documentNumber: string
  }>
}

let browser: Browser
let page: Page

beforeEach(async () => {
  browser = await chromium.launch()
  page = await browser.newPage()
})

afterEach(async () => {
  await browser.close()
})

async function openBookingPage() {
  await page.goto(`${appUrl}/booking/${flightId}`)
  await page.waitForSelector('[data-testid="booking-form"]')
}

async function fillBookingForm() {
  await page.getByTestId('contact-email').fill('ivan@example.com')
  await page.getByTestId('contact-phone').fill('+79991234567')
  await page.getByTestId('passenger-0-firstName').fill('Иван')
  await page.getByTestId('passenger-0-lastName').fill('Петров')
  await page.getByTestId('passenger-0-dob').fill('1990-05-20')
  await page.getByTestId('passenger-0-document').fill('4509 123456')
}

test('shows booking form for selected flight', async () => {
  await openBookingPage()

  expect(await page.getByTestId('booking-form').isVisible()).toBe(true)
  expect(await page.getByTestId('booking-flight').textContent()).toContain('SU1234')
  expect(await page.getByTestId('contact-email').isVisible()).toBe(true)
  expect(await page.getByTestId('contact-phone').isVisible()).toBe(true)
  expect(await page.getByTestId('passenger-0-firstName').isVisible()).toBe(true)
  expect(await page.getByTestId('passenger-0-lastName').isVisible()).toBe(true)
  expect(await page.getByTestId('passenger-0-dob').isVisible()).toBe(true)
  expect(await page.getByTestId('passenger-0-document').isVisible()).toBe(true)
  expect(await page.getByTestId('booking-submit').isVisible()).toBe(true)
})

test('adds passenger fields', async () => {
  await openBookingPage()

  await page.getByTestId('add-passenger').click()

  expect(await page.getByTestId('passenger-1-firstName').isVisible()).toBe(true)
  expect(await page.getByTestId('passenger-1-lastName').isVisible()).toBe(true)
  expect(await page.getByTestId('passenger-1-dob').isVisible()).toBe(true)
  expect(await page.getByTestId('passenger-1-document').isVisible()).toBe(true)
})

test('does not submit empty booking form', async () => {
  let bookingRequestsCount = 0

  page.on('request', (request) => {
    if (request.url().endsWith('/api/bookings')) {
      bookingRequestsCount += 1
    }
  })
  await openBookingPage()

  await page.getByTestId('booking-submit').click()
  await page.waitForSelector('.invalid-feedback')

  expect(bookingRequestsCount).toBe(0)
})

test('creates booking and shows success panel', async () => {
  let submittedBooking: SubmittedBooking | undefined

  page.on('request', (request) => {
    if (request.url().endsWith('/api/bookings')) {
      submittedBooking = request.postDataJSON() as SubmittedBooking
    }
  })
  await openBookingPage()

  await fillBookingForm()
  await page.getByTestId('booking-submit').click()
  await page.waitForSelector('[data-testid="booking-success"]')

  expect(submittedBooking).toEqual({
    flightId,
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
  expect(await page.getByTestId('booking-success').isVisible()).toBe(true)
  expect((await page.getByTestId('booking-code').textContent())?.trim().length).toBeGreaterThan(0)
})

test('shows booking error', async () => {
  await openBookingPage()

  await fillBookingForm()
  await page.context().setOffline(true)
  await page.getByTestId('booking-submit').click()
  await page.waitForSelector('[data-testid="booking-error"]')
  await page.context().setOffline(false)

  expect(await page.getByTestId('booking-error').isVisible()).toBe(true)
})

test('shows flight not found', async () => {
  await page.goto(`${appUrl}/booking/unknown-flight-id`)
  await page.waitForSelector('[data-testid="flight-not-found"]')

  expect(await page.getByTestId('flight-not-found').isVisible()).toBe(true)
})
