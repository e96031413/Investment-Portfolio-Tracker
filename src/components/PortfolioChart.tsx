import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { usePortfolioStore } from '../store/portfolioStore';
import { useQuery } from '@tanstack/react-query';
import { getHistoricalData } from '../services/stockService';
import { format, subMonths, subYears, startOfDay } from 'date-fns';
import { RefreshCw } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const timeRanges = {
  '1M': { months: 1 },
  '3M': { months: 3 },
  '6M': { months: 6 },
  '1Y': { years: 1 },
  'ALL': { years: 5 },
};

export function PortfolioChart() {
  const [timeRange, setTimeRange] = useState<keyof typeof timeRanges>('6M');
  const [error, setError] = useState<string | null>(null);
  const selectedPortfolio = usePortfolioStore((state) => state.selectedPortfolio);

  const fromDate = startOfDay(
    timeRanges[timeRange].months
      ? subMonths(new Date(), timeRanges[timeRange].months)
      : subYears(new Date(), timeRanges[timeRange].years!)
  );

  const { data: historicalData, isLoading, refetch } = useQuery({
    queryKey: ['portfolio-history', selectedPortfolio?.assets.map(a => a.symbol), timeRange],
    queryFn: async () => {
      if (!selectedPortfolio?.assets.length) return null;
      setError(null);

      try {
        const assetHistories = await Promise.all(
          selectedPortfolio.assets.map(async (asset) => {
            try {
              const history = await getHistoricalData(asset.symbol, fromDate);
              return history.map(point => ({
                ...point,
                value: point.close * asset.quantity,
                cost: asset.costBasis * asset.quantity,
              }));
            } catch (error) {
              console.error(`Error fetching history for ${asset.symbol}:`, error);
              return [];
            }
          })
        );

        // Combine all asset histories
        const dateMap = new Map();
        assetHistories.forEach(assetHistory => {
          assetHistory.forEach(point => {
            const date = format(point.date, 'yyyy-MM-dd');
            const existing = dateMap.get(date) || { value: 0, cost: 0 };
            dateMap.set(date, {
              value: existing.value + point.value,
              cost: existing.cost + point.cost,
            });
          });
        });

        // Convert to array and sort by date
        const combinedData = Array.from(dateMap.entries())
          .map(([date, { value, cost }]) => ({
            date,
            value,
            cost,
            return: cost > 0 ? ((value - cost) / cost) * 100 : 0,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));

        if (combinedData.length === 0) {
          setError('No historical data available for the selected time range');
          return null;
        }

        return combinedData;
      } catch (error) {
        setError('Failed to fetch historical data. Please try again later.');
        return null;
      }
    },
    enabled: !!selectedPortfolio?.assets.length,
    retry: 2,
    staleTime: 300000, // 5 minutes
  });

  if (!selectedPortfolio) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Portfolio Performance</h2>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => refetch()} 
            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mr-4"
            disabled={isLoading}
            title="Refresh data"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <div className="flex space-x-1 bg-gray-100 rounded-md p-1">
            <select
              className="block w-32 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as keyof typeof timeRanges)}
            >
              <option value="1M">1M</option>
              <option value="3M">3M</option>
              <option value="6M">6M</option>
              <option value="1Y">1Y</option>
              <option value="ALL">All</option>
            </select>
          </div>
        </div>
      </div>
      <div className="h-[400px]">
        {error ? (
          <div className="h-full flex items-center justify-center text-red-500">
            {error}
          </div>
        ) : (
          <Line options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top' as const,
              },
              tooltip: {
                callbacks: {
                  label: (context: any) => `Return: ${context.raw.toFixed(2)}%`,
                },
              },
            },
            scales: {
              y: {
                beginAtZero: false,
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)',
                },
                ticks: {
                  callback: (value: number) => `${value.toFixed(1)}%`,
                },
              },
              x: {
                grid: {
                  display: false,
                },
              },
            },
          }} data={{
            labels: historicalData.map(point => point.date),
            datasets: [
              {
                label: 'Portfolio Return (%)',
                data: historicalData.map(point => point.return),
                fill: true,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
              },
            ],
          }} />
        )}
      </div>
    </div>
  );
}