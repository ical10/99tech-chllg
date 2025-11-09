import { useQuery } from '@tanstack/react-query'

interface TokenPrice {
  currency: string
  date: string
  price: number
}

async function fetchPrices(): Promise<Map<string, number>> {
  const response = await fetch('https://interview.switcheo.com/prices.json')
  const data: TokenPrice[] = await response.json()
  
  const priceMap = new Map<string, number>()
  
  data.forEach((item) => {
    if (!priceMap.has(item.currency) || 
        (priceMap.get(item.currency) ?? 0) < item.price) {
      priceMap.set(item.currency, item.price)
    }
  })
  
  return priceMap
}

export function usePrices() {
  return useQuery({
    queryKey: ['token-prices'],
    queryFn: fetchPrices,
    staleTime: 1000 * 60 * 5,
  })
}

export function convertTokenAmount(
  prices: Map<string, number> | undefined,
  fromToken: string,
  toToken: string,
  amount: string
): string {
  const numAmount = Number(amount)
  
  if (isNaN(numAmount) || numAmount <= 0) {
    return ""
  }

  if (fromToken === toToken) {
    return amount
  }

  if (!prices) {
    return amount
  }
  
  const fromPrice = prices.get(fromToken)
  const toPrice = prices.get(toToken)
  
  if (!fromPrice || !toPrice) {
    return amount
  }
  
  const convertedAmount = (numAmount * fromPrice) / toPrice
  
  return convertedAmount.toFixed(6)
}
