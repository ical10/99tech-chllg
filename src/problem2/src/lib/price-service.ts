interface TokenPrice {
  currency: string
  date: string
  price: number
}

let priceCache: Map<string, number> | null = null

async function fetchPrices(): Promise<Map<string, number>> {
  if (priceCache) {
    return priceCache
  }

  try {
    const response = await fetch('https://interview.switcheo.com/prices.json')
    const data: TokenPrice[] = await response.json()
    
    const priceMap = new Map<string, number>()
    
    data.forEach((item) => {
      if (!priceMap.has(item.currency) || 
          (priceMap.get(item.currency) ?? 0) < item.price) {
        priceMap.set(item.currency, item.price)
      }
    })
    
    priceCache = priceMap
    return priceMap
  } catch (error) {
    console.error('Failed to fetch prices:', error)
    return new Map()
  }
}

export async function convertTokenAmount(
  fromToken: string,
  toToken: string,
  amount: string
): Promise<string> {
  const numAmount = Number(amount)
  
  if (isNaN(numAmount) || numAmount <= 0) {
    return ""
  }

  if (fromToken === toToken) {
    return amount
  }

  const prices = await fetchPrices()
  
  const fromPrice = prices.get(fromToken)
  const toPrice = prices.get(toToken)
  
  if (!fromPrice || !toPrice) {
    return amount
  }
  
  const convertedAmount = (numAmount * fromPrice) / toPrice
  
  return convertedAmount.toFixed(6)
}
