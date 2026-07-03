import { test, expect } from 'vitest'
import { chromium } from '@playwright/test'

test('app opens', async () => {
  const appUrl = process.env.APP_URL || 'http://localhost:5173'
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto(appUrl)
  const heading = page.locator('h1')

  const isVisible = await heading.isVisible()
  expect(isVisible).toBe(true)
  
  // Проверяем, что текст в h1 не пустой
  const text = await heading.textContent()
  expect(text?.trim().length).toBeGreaterThan(0)

  // Закрываем браузер
  await browser.close()
})