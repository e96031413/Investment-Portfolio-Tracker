import axios from 'axios';
import { AssetPrice } from '../types/portfolio';

const FINNHUB_API = 'https://finnhub.io/api/v1';
const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY || process.env.FINNHUB_API_KEY;

export async function getQuote(symbol: string): Promise<AssetPrice> {
  if (!symbol || symbol.trim().length === 0) {
    throw new Error('Symbol is required');
  }

  try {
    const response = await axios.get(`${FINNHUB_API}/quote`, {
      params: {
        symbol: symbol.toUpperCase().trim(),
        token: FINNHUB_API_KEY,
      },
    });

    const data = response.data;
    
    // Validate quote data
    if (data.c === null || data.c === undefined || isNaN(data.c)) {
      throw new Error(`No data found for symbol: ${symbol}`);
    }

    return {
      symbol: symbol.toUpperCase().trim(),
      price: data.c,
      currency: 'USD', // Finnhub returns prices in USD
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        throw new Error('API authentication failed. Please try again later.');
      }
      if (error.response?.status === 429) {
        throw new Error('API rate limit exceeded. Please try again in a minute.');
      }
      console.error(`Network error fetching quote for ${symbol}:`, error.message);
      throw new Error(`Failed to fetch quote for ${symbol}. Please try again later.`);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch quote for ${symbol}`);
  }
}

export async function getHistoricalData(
  symbol: string,
  from: Date,
  to: Date = new Date()
) {
  if (!symbol || symbol.trim().length === 0) {
    throw new Error('Symbol is required');
  }

  try {
    const response = await axios.get(`${FINNHUB_API}/stock/candle`, {
      params: {
        symbol: symbol.toUpperCase().trim(),
        resolution: 'D',
        from: Math.floor(from.getTime() / 1000),
        to: Math.floor(to.getTime() / 1000),
        token: FINNHUB_API_KEY,
      },
      timeout: 10000, // 10 second timeout
    });

    const data = response.data;

    // Check for no data response
    if (data.s === 'no_data') {
      throw new Error(`No historical data available for ${symbol}`);
    }
    
    // Validate response structure
    if (!data || data.s !== 'ok' || !Array.isArray(data.t) || data.t.length === 0) {
      throw new Error(`Invalid data received for ${symbol}`);
    }

    // Validate all required arrays exist and have the same length
    const arrays = ['t', 'o', 'h', 'l', 'c', 'v'];
    const length = data.t.length;
    const isValid = arrays.every(key => 
      Array.isArray(data[key]) && data[key].length === length
    );

    if (!isValid) {
      throw new Error(`Incomplete data received for ${symbol}`);
    }

    const historicalData = data.t.map((timestamp: number, index: number) => {
      // Validate each data point
      const point = {
        date: new Date(timestamp * 1000),
        open: Number(data.o[index]),
        high: Number(data.h[index]),
        low: Number(data.l[index]),
        close: Number(data.c[index]),
        volume: Number(data.v[index]),
      };

      // Check if any value is NaN
      if (Object.values(point).some(val => 
        val instanceof Date ? isNaN(val.getTime()) : isNaN(val)
      )) {
        return null;
      }

      return point;
    })
    .filter((point): point is NonNullable<typeof point> => point !== null)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (historicalData.length === 0) {
      throw new Error(`No valid historical data found for ${symbol}`);
    }

    return historicalData;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        throw new Error('API authentication failed. Please try again later.');
      }
      if (error.response?.status === 429) {
        throw new Error('API rate limit exceeded. Please try again in a minute.');
      }
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please try again.');
      }
      console.error(`Network error fetching historical data for ${symbol}:`, error.message);
      throw new Error(`Failed to fetch historical data for ${symbol}. Please try again later.`);
    }
    // If it's our custom error, throw it as is
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch historical data for ${symbol}`);
  }
}