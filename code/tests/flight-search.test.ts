import { expect, test, type Page } from '@playwright/test'
import { fulfillJson, mockCities, mockFlightSearch, type ApiResponse } from './fixtures/api'
import { cities, flights } from './fixtures/data'

const today = '2026-07-10'

const openSearchPage = async (
  page: Page,
  responses: ApiResponse[] = [{ body: flights }],
) => {
  await page.clock.setFixedTime(new Date(`${today}T12:00:00Z`))
  await mockCities(page)
  const requests = await mockFlightSearch(page, responses)

  await page.goto('/')
  await expect(page.getByTestId('flight-result-item')).toHaveCount(2)

  return requests
}

const submitSearch = async (page: Page) => {
  await page.getByTestId('search-origin').selectOption('MOW')
  await page.getByTestId('search-destination').selectOption('LED')
  await page.getByTestId('search-passengers').fill('2')
  await page.getByTestId('search-submit').click()
}

test('загружает города в поля поиска', async ({ page }) => {
  await openSearchPage(page)

  await expect(page.getByTestId('flight-search-form')).toBeVisible()
  await expect(page.getByTestId('search-origin').locator('option')).toHaveText([
    'Откуда',
    'Москва',
    'Санкт-Петербург',
    'Сочи',
  ])
  await expect(page.getByTestId('search-destination').locator('option')).toHaveText([
    'Куда',
    'Москва',
    'Санкт-Петербург',
    'Сочи',
  ])
})

test('устанавливает сегодняшнюю дату и не работает с прошлыми датами', async ({ page }) => {
  await openSearchPage(page)

  await expect(page.getByTestId('search-date')).toHaveValue(today)
  await expect(page.getByTestId('search-date')).toHaveAttribute('min', today)
})

test('блокирует форму, пока загружаются города', async ({ page }) => {
  let finishCitiesRequest: (() => void) | undefined

  await page.clock.setFixedTime(new Date(`${today}T12:00:00Z`))
  await page.route('**/api/cities', async (route) => {
    await new Promise<void>((resolve) => {
      finishCitiesRequest = resolve
    })
    await fulfillJson(route, { body: cities })
  })
  await mockFlightSearch(page)
  await page.goto('/')

  await expect(page.getByTestId('search-date')).toBeDisabled()
  await expect(page.getByTestId('search-passengers')).toBeDisabled()
  expect(finishCitiesRequest).toBeDefined()
  finishCitiesRequest?.()

  await expect(page.getByTestId('search-date')).toBeEnabled()
  await expect(page.getByTestId('search-passengers')).toBeEnabled()
})

test('сразу показывает рейсы с значениями по умолчанию', async ({ page }) => {
  const requests = await openSearchPage(page)
  const initialRequest = requests[0]

  expect(initialRequest.searchParams.get('origin')).toBe('MOW')
  expect(initialRequest.searchParams.get('destination')).toBe('LED')
  expect(initialRequest.searchParams.get('date')).toBe(today)
  expect(initialRequest.searchParams.get('passengers')).toBe('1')
  await expect(page.getByTestId('search-origin')).toHaveValue('MOW')
  await expect(page.getByTestId('search-destination')).toHaveValue('LED')
})

test('не выполняет поиск для прошедшей даты', async ({ page }) => {
  const requests = await openSearchPage(page)
  const dateInput = page.getByTestId('search-date')

  await dateInput.fill('2000-01-01')
  await page.getByTestId('search-submit').click()

  expect(await dateInput.evaluate((element: HTMLInputElement) => element.validity.rangeUnderflow)).toBe(true)
  expect(requests).toHaveLength(1)
})

test('не выполняет поиск для одинаковых городов', async ({ page }) => {
  const requests = await openSearchPage(page)

  await page.getByTestId('search-origin').selectOption('MOW')
  await page.getByTestId('search-destination').selectOption('MOW')
  await page.getByTestId('search-submit').click()

  await expect(page.getByTestId('flights-error')).toContainText('должны отличаться')
  expect(requests).toHaveLength(1)
})

test('ограничивает количество пассажиров', async ({ page }) => {
  await openSearchPage(page)

  await expect(page.getByTestId('search-passengers')).toHaveAttribute('max', '9')
  await expect(page.getByTestId('search-passengers')).toHaveAttribute('required', '')
})

test('показывает пустое состояние, когда рейсов нет', async ({ page }) => {
  await openSearchPage(page, [{ body: flights }, { body: [] }])

  await submitSearch(page)

  await expect(page.getByTestId('flights-empty')).toBeVisible()
  await expect(page.getByTestId('flight-result-item')).toHaveCount(0)
  await expect(page.getByTestId('flights-error')).toHaveCount(0)
})

test('показывает ошибку поиска', async ({ page }) => {
  await openSearchPage(page, [
    { body: flights },
    { status: 500, body: { message: 'Search failed' } },
  ])

  await submitSearch(page)

  await expect(page.getByTestId('flights-error')).toBeVisible()
  await expect(page.getByTestId('flight-result-item')).toHaveCount(0)
  await expect(page.getByTestId('flights-empty')).toHaveCount(0)
})
