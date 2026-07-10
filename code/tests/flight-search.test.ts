import { afterEach, beforeEach, expect, test } from 'vitest'
import { chromium, type Browser, type Page } from '@playwright/test'
import getLocalDateValue from '../src/utils/getLocalDateValue'

const appUrl = process.env.APP_URL || 'http://localhost:5173'

const cities = [
  { code: 'MOW', name: 'Москва', country: 'Россия' },
  { code: 'LED', name: 'Санкт-Петербург', country: 'Россия' },
  { code: 'AER', name: 'Сочи', country: 'Россия' },
]

const flights = [
  {
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
  {
    id: 'fl_2',
    flightNumber: 'DP202',
    airline: { code: 'DP', name: 'Победа' },
    origin: { code: 'MOW', name: 'Москва', country: 'Россия' },
    destination: { code: 'LED', name: 'Санкт-Петербург', country: 'Россия' },
    departureAt: '2026-07-01T13:30:00Z',
    arrivalAt: '2026-07-01T15:00:00Z',
    durationMinutes: 90,
    price: { amount: 3200, currency: 'RUB' },
    seatsAvailable: 18,
  },
]

let browser: Browser
let page: Page

beforeEach(async () => {
  browser = await chromium.launch()
  page = await browser.newPage()

  await page.route('**/api/cities', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(cities),
    })
  })

  await page.goto(appUrl)
  await page.waitForSelector('[data-testid="search-origin"] option[value="MOW"]', { state: 'attached' })
})

afterEach(async () => {
  await browser.close()
})

async function submitSearch() {
  const searchDate = await page.getByTestId('search-date').inputValue()

  await page.getByTestId('search-origin').selectOption('MOW')
  await page.getByTestId('search-destination').selectOption('LED')
  await page.getByTestId('search-date').fill(searchDate)
  await page.getByTestId('search-passengers').fill('2')
  await page.getByTestId('search-submit').click()

  return searchDate
}

test('loads cities into search selects', async () => {
  expect(await page.getByTestId('flight-search-form').isVisible()).toBe(true)
  expect(await page.getByTestId('search-origin').locator('option').allTextContents()).toEqual([
    'Откуда',
    'Москва',
    'Санкт-Петербург',
    'Сочи',
  ])
  expect(await page.getByTestId('search-destination').locator('option').allTextContents()).toEqual([
    'Куда',
    'Москва',
    'Санкт-Петербург',
    'Сочи',
  ])
})

test('sets today as default and minimum search date', async () => {
  const today = getLocalDateValue()

  expect(await page.getByTestId('search-date').inputValue()).toBe(today)
  expect(await page.getByTestId('search-date').getAttribute('min')).toBe(today)
})

test('shows found flights', async () => {
  let searchUrl: URL | undefined

  await page.route('**/api/flights**', async (route) => {
    searchUrl = new URL(route.request().url())
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(flights),
    })
  })

  const searchDate = await submitSearch()
  await page.waitForSelector('[data-testid="flight-result-item"]')

  expect(searchUrl?.searchParams.get('origin')).toBe('MOW')
  expect(searchUrl?.searchParams.get('destination')).toBe('LED')
  expect(searchUrl?.searchParams.get('date')).toBe(searchDate)
  expect(searchUrl?.searchParams.get('passengers')).toBe('2')
  expect(await page.getByTestId('flight-results').isVisible()).toBe(true)
  expect(await page.getByTestId('flight-result-item').count()).toBe(2)
  expect(await page.getByTestId('book-flight').count()).toBe(2)
  expect(await page.getByTestId('flights-empty').isVisible()).toBe(false)
  expect(await page.getByTestId('flights-error').isVisible()).toBe(false)
})

test('does not search flights for past dates', async () => {
  let searchRequested = false

  await page.route('**/api/flights**', async (route) => {
    searchRequested = true
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  })

  await page.getByTestId('search-origin').selectOption('MOW')
  await page.getByTestId('search-destination').selectOption('LED')
  await page.getByTestId('search-date').fill('2000-01-01')
  await page.getByTestId('search-passengers').fill('2')
  await page.getByTestId('search-submit').click()
  await page.waitForTimeout(100)

  const isRangeUnderflow = await page.getByTestId('search-date').evaluate((element) => (
    (element as HTMLInputElement).validity.rangeUnderflow
  ))

  expect(isRangeUnderflow).toBe(true)
  expect(searchRequested).toBe(false)
})

test('shows empty state when flights are not found', async () => {
  await page.route('**/api/flights**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  })

  await submitSearch()
  await page.waitForSelector('[data-testid="flights-empty"]')

  expect(await page.getByTestId('flight-result-item').count()).toBe(0)
  expect(await page.getByTestId('flights-empty').isVisible()).toBe(true)
  expect(await page.getByTestId('flights-error').isVisible()).toBe(false)
})

test('shows search error', async () => {
  await page.route('**/api/flights**', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Search failed' }),
    })
  })

  await submitSearch()
  await page.waitForSelector('[data-testid="flights-error"]')

  expect(await page.getByTestId('flight-result-item').count()).toBe(0)
  expect(await page.getByTestId('flights-empty').isVisible()).toBe(false)
  expect(await page.getByTestId('flights-error').isVisible()).toBe(true)
})
