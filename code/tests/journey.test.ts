import { expect, test } from '@playwright/test'

test('полный путь от выбора рейса до отмены брони', async ({ page }) => {
  await page.goto('/')
  const selectedFlight = page.getByTestId('flight-result-item').first()
  await expect(selectedFlight).toBeVisible()
  const selectedFlightNumber = (await selectedFlight.locator('h2').textContent())?.trim()

  await selectedFlight.getByTestId('book-flight').click()
  await expect(page.getByTestId('booking-form')).toBeVisible()
  await expect(page.getByTestId('booking-flight')).toContainText(selectedFlightNumber ?? '')

  await page.getByTestId('contact-email').fill('journey@example.com')
  await page.getByTestId('contact-phone').fill('+79991234567')
  await page.getByTestId('passenger-0-firstName').fill('Иван')
  await page.getByTestId('passenger-0-lastName').fill('Сидоров')
  await page.getByTestId('passenger-0-dob').fill('1990-05-20')
  await page.getByTestId('passenger-0-document').fill('4509 123456')
  await page.getByTestId('booking-submit').click()

  await expect(page.getByTestId('booking-success')).toBeVisible()
  const bookingCode = (await page.getByTestId('booking-code').textContent())?.trim() ?? ''
  expect(bookingCode).toMatch(/^[A-Z0-9]{6}$/)

  await page.goto('/lookup')
  await page.getByTestId('lookup-code').fill(bookingCode)
  await page.getByTestId('lookup-lastName').fill('Сидоров')
  await page.getByTestId('lookup-submit').click()

  await expect(page.getByTestId('booking-details')).toBeVisible()
  await expect(page.getByTestId('booking-status')).toHaveAttribute('data-status', 'confirmed')
  await page.getByTestId('cancel-booking').click()

  await expect(page.getByTestId('booking-status')).toHaveAttribute('data-status', 'cancelled')
  await expect(page.getByTestId('cancel-booking')).toHaveCount(0)
})
