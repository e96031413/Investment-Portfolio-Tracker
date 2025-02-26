import axios from 'axios';
import { AssetPrice } from '../types/portfolio';

const COINBASE_API = 'https://api.coinbase.com/v2';

export async function getCryptoQuote(symbol: string): Promise<AssetPrice> {
  if (!symbol || symbol.trim().length === 0) {
    throw new Error('Symbol is required');
  }

  try {
    // Convert symbol to USD pair (e.g., BTC -> BTC-USD)
    const formattedSymbol = `${symbol.toUpperCase().trim()}-USD`;
    
    const response = await axios.get(`${COINBASE_API}/prices/${formattedSymbol}/spot`);
    const data = response.data;

    if (!data.data?.amount) {
      throw new Error(`No data found for crypto: ${symbol}`);
    }

    return {
      symbol: symbol.toUpperCase().trim(),
      price: parseFloat(data.data.amount),
      currency: 'USD',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error(`Cryptocurrency ${symbol} not found`);
      }
      console.error(`Network error fetching crypto quote for ${symbol}:`, error.message);
      throw new Error(`Failed to fetch quote for ${symbol}. Please try again later.`);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch quote for ${symbol}`);
  }
}