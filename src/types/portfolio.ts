export interface Asset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  costBasis: number;
  purchaseDate: string;
  currency: string;
  type: 'stock' | 'crypto';  // New field to distinguish between asset types
}

export interface Portfolio {
  id: string;
  name: string;
  assets: Asset[];
  createdAt: string;
  updatedAt: string;
}

export interface AssetPrice {
  symbol: string;
  price: number;
  currency: string;
  timestamp: string;
}

export interface PerformanceMetrics {
  totalReturn: number;
  annualizedReturn: number;
}