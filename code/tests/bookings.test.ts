import { expect, test, type Page } from '@playwright/test'
import { fulfillJson, mockCities, mockFlightSearch } from './fixtures/api'
import { booking } from './fixtures/data'

const bookingApiPattern = /\/api\/bookings\/[^?]+/

const openBookingsPage = async (page: Page) => {
  await page.goto('/lookup')
  await expect(page.getByTestId('booking-lookup-form')).toBeVisible()
}

const fillBookingSearchForm = async (
  page: Page,
  code = booking.code,
  lastName = booking.passengers[0].lastName,
) => {
  await page.getByTestId('lookup-code').fill(code)
  await page.getByTestId('lookup-lastName').fill(lastName)
  await page.getByTestId('lookup-submit').click()
}

test('ссылка навигации открывает страницу поиска брони', async ({ page }) => {
  await mockCities(page)
  await mockFlightSearch(page)
  await page.goto('/')

  const lookupLink = page.getByTestId('nav-lookup')
  await expect(lookupLink).toHaveAttribute('href', '/lookup')
  await lookupLink.click()

  await expect(page).toHaveURL(/\/lookup$/)
  await expect(page.getByTestId('booking-lookup-form')).toBeVisible()
})

test('ищет бронь по коду и фамилии', async ({ page }) => {
  await page.route(bookingApiPattern, async (route) => {
    await fulfillJson(route, { body: booking })
  })
  await openBookingsPage(page)
  const requestPromise = page.waitForRequest(bookingApiPattern)

  await fillBookingSearchForm(page)
  const request = await requestPromise
  const requestUrl = new URL(request.url())

  expect(request.method()).toBe('GET')
  expect(requestUrl.pathname.split('/').at(-1)).toBe(booking.code)
  expect(requestUrl.searchParams.get('lastName')).toBe(booking.passengers[0].lastName)
  await expect(page.getByTestId('booking-code')).toHaveText(booking.code)
  await expect(page.getByTestId('booking-details')).toContainText(booking.flight.airline.name)
  await expect(page.getByTestId('booking-details')).toContainText('Пётр Пупкин')
  await expect(page.getByTestId('booking-details')).toContainText('5400')
  await expect(page.getByTestId('booking-status')).toHaveAttribute('data-status', 'confirmed')
})

test('показывает понятное сообщение для неверных данных', async ({ page }) => {
  await page.route(bookingApiPattern, async (route) => {
    await fulfillJson(route, { status: 404, body: { message: 'Not found' } })
  })
  await openBookingsPage(page)

  await fillBookingSearchForm(page, 'ZZZZZZ', 'Петров')

  await expect(page.getByTestId('booking-not-found')).toContainText('Бронь не найдена')
  await expect(page.getByTestId('booking-details')).toHaveCount(0)
})

test('показывает отдельную ошибку при сбое lookup-сервиса', async ({ page }) => {
  await page.route(bookingApiPattern, async (route) => {
    await fulfillJson(route, { status: 500, body: { message: 'Server error' } })
  })
  await openBookingsPage(page)

  await fillBookingSearchForm(page)

  await expect(page.getByTestId('booking-lookup-error')).toContainText('Не удалось загрузить бронь')
  await expect(page.getByTestId('booking-not-found')).toHaveCount(0)
})

test('отменяет найденную бронь и обновляет статус', async ({ page }) => {
  await page.route(bookingApiPattern, async (route) => {
    const response = route.request().method() === 'DELETE'
      ? { ...booking, status: 'cancelled' as const }
      : booking

    await fulfillJson(route, { body: response })
  })
  await openBookingsPage(page)
  await fillBookingSearchForm(page)
  await expect(page.getByTestId('cancel-booking')).toBeVisible()
  const deleteRequestPromise = page.waitForRequest((request) => (
    bookingApiPattern.test(request.url()) && request.method() === 'DELETE'
  ))

  await page.getByTestId('cancel-booking').click()
  const deleteRequest = await deleteRequestPromise

  expect(new URL(deleteRequest.url()).searchParams.get('lastName')).toBe(booking.passengers[0].lastName)
  await expect(page.getByTestId('booking-status')).toHaveAttribute('data-status', 'cancelled')
  await expect(page.getByTestId('cancel-booking')).toHaveCount(0)
})

test('блокирует lookup-форму во время отмены', async ({ page }) => {
  let finishCancellation: (() => void) | undefined

  await page.route(bookingApiPattern, async (route) => {
    if (route.request().method() !== 'DELETE') {
      await fulfillJson(route, { body: booking })
      return
    }

    await new Promise<void>((resolve) => {
      finishCancellation = resolve
    })
    await fulfillJson(route, { body: { ...booking, status: 'cancelled' } })
  })
  await openBookingsPage(page)
  await fillBookingSearchForm(page)
  await expect(page.getByTestId('cancel-booking')).toBeVisible()

  await page.getByTestId('cancel-booking').click()

  await expect(page.getByTestId('lookup-code')).toBeDisabled()
  await expect(page.getByTestId('lookup-lastName')).toBeDisabled()
  await expect(page.getByTestId('lookup-submit')).toBeDisabled()
  expect(finishCancellation).toBeDefined()
  finishCancellation?.()

  await expect(page.getByTestId('booking-status')).toHaveAttribute('data-status', 'cancelled')
})
