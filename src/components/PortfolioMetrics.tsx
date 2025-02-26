import React from 'react';
import { usePortfolioStore } from '../store/portfolioStore';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getQuote } from '../services/stockService';
import { getCryptoQuote } from '../services/cryptoService';
import { Asset } from '../types/portfolio';
import { differenceInDays } from 'date-fns';

function calculateMetrics(assets: Asset[], currentPrices: Map<string, number>) {
  let totalValue = 0;
  let totalCost = 0;
  let oldestPurchaseDate = new Date();

  assets.forEach(asset => {
    const currentPrice = currentPrices.get(asset.symbol);
    if (currentPrice) {
      const currentValue = currentPrice * asset.quantity;
      const cost = asset.costBasis * asset.quantity;
      totalValue += currentValue;
      totalCost += cost;
      
      const purchaseDate = new Date(asset.purchaseDate);
      if (purchaseDate < oldestPurchaseDate) {
        oldestPurchaseDate = purchaseDate;
      }
    }
  });

  const totalReturn = totalCost > 0 ? (totalValue - totalCost) / totalCost : 0;
  
  const daysHeld = differenceInDays(new Date(), oldestPurchaseDate) || 1;
  const yearsHeld = daysHeld / 365;
  const annualizedReturn = Math.pow(1 + totalReturn, 1 / yearsHeld) - 1;

  return {
    totalValue,
    totalCost,
    totalReturn,
    annualizedReturn,
  };
}

export function PortfolioMetrics() {
  const selectedPortfolio = usePortfolioStore((state) => state.selectedPortfolio);

  const { data: quotes, isLoading, refetch } = useQuery({
    queryKey: ['portfolio-quotes', selectedPortfolio?.assets.map(a => ({ symbol: a.symbol, type: a.type }))],
    queryFn: async () => {
      if (!selectedPortfolio?.assets.length) return new Map();
      
      const quotes = await Promise.all(
        selectedPortfolio.assets.map(async (asset) => {
          try {
            const quote = asset.type === 'stock' 
              ? await getQuote(asset.symbol)
              : await getCryptoQuote(asset.symbol);
            return [asset.symbol, quote.price] as [string, number];
          } catch (error) {
            console.error(`Error fetching quote for ${asset.symbol}:`, error);
            return [asset.symbol, 0] as [string, number];
          }
        })
      );
      
      return new Map(quotes);
    },
    enabled: !!selectedPortfolio?.assets.length,
    refetchInterval: 60000, // Refresh every minute
  });

  if (!selectedPortfolio || !quotes) {
    return null;
  }

  const metrics = calculateMetrics(selectedPortfolio.assets, quotes);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Portfolio Summary
        </h2>
        <button 
          onClick={() => refetch()} 
          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          disabled={isLoading}
          title="Refresh prices"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="py-4 text-sm text-gray-500">Current Value</td>
              <td className="py-4 text-right font-medium text-gray-900">
                ${metrics.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
            <tr>
              <td className="py-4 text-sm text-gray-500">Total Cost</td>
              <td className="py-4 text-right font-medium text-gray-900">
                ${metrics.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
            <tr>
              <td className="py-4 text-sm text-gray-500">Total Return</td>
              <td className={`py-4 text-right font-medium ${metrics.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(metrics.totalReturn * 100).toFixed(2)}%
              </td>
            </tr>
            <tr>
              <td className="py-4 text-sm text-gray-500">Annualized Return</td>
              <td className={`py-4 text-right font-medium ${metrics.annualizedReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(metrics.annualizedReturn * 100).toFixed(2)}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}