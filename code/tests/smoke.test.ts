import { expect, test } from '@playwright/test'

test('приложение и API доступны', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Бронирование авиабилетов')
  await expect(page.getByTestId('flight-result-item').first()).toBeVisible()
})
