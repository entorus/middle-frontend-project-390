import type { Page, Route } from '@playwright/test'
import { cities, flights } from './data'

export interface ApiResponse {
  body: unknown
  status?: number
}

export const fulfillJson = async (route: Route, { body, status = 200 }: ApiResponse) => {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

export const mockCities = async (page: Page) => {
  await page.route('**/api/cities', async (route) => {
    await fulfillJson(route, { body: cities })
  })
}

export const mockFlightSearch = async (
  page: Page,
  responses: ApiResponse[] = [{ body: flights }],
) => {
  const requests: URL[] = []
  let responseIndex = 0

  await page.route(/\/api\/flights\?/, async (route) => {
    requests.push(new URL(route.request().url()))

    const response = responses[Math.min(responseIndex, responses.length - 1)]
    responseIndex += 1
    await fulfillJson(route, response)
  })

  return requests
}

export const mockFlightById = async (
  page: Page,
  flightId = flights[0].id,
  response: ApiResponse = { body: flights[0] },
) => {
  await page.route(`**/api/flights/${flightId}`, async (route) => {
    await fulfillJson(route, response)
  })
}
