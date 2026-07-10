import { type FlightPrice } from '../api/types'

const priceFormatterByCurrency = new Map<string, Intl.NumberFormat>()

export default function formatPrice({ amount, currency }: FlightPrice): string {
  let formatter = priceFormatterByCurrency.get(currency)

  if (!formatter) {
    formatter = new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency,
      useGrouping: false,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
    priceFormatterByCurrency.set(currency, formatter)
  }

  return formatter.format(amount)
}
