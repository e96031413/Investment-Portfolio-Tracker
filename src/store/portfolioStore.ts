import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Asset, Portfolio } from '../types/portfolio';

interface PortfolioState {
  portfolios: Portfolio[];
  selectedPortfolio: Portfolio | null;
  addPortfolio: (portfolio: Portfolio) => void;
  updatePortfolio: (id: string, updates: Partial<Portfolio>) => void;
  deletePortfolio: (id: string) => void;
  selectPortfolio: (id: string) => void;
  addAsset: (portfolioId: string, asset: Asset) => void;
  removeAsset: (portfolioId: string, assetId: string) => void;
  updateAsset: (portfolioId: string, asset: Asset) => void;
  importPortfolios: (portfolios: Portfolio[]) => void;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      portfolios: [],
      selectedPortfolio: null,
      addPortfolio: (portfolio) =>
        set((state) => {
          const portfolios = [...state.portfolios, portfolio];
          return {
            portfolios,
            selectedPortfolio: portfolio, // Auto-select the new portfolio
          };
        }),
      updatePortfolio: (id, updates) =>
        set((state) => {
          const portfolios = state.portfolios.map((p) =>
            p.id === id
              ? {
                  ...p,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : p
          );
          return {
            portfolios,
            selectedPortfolio: portfolios.find((p) => p.id === id) || null,
          };
        }),
      deletePortfolio: (id) =>
        set((state) => {
          const portfolios = state.portfolios.filter((p) => p.id !== id);
          return {
            portfolios,
            selectedPortfolio: null,
          };
        }),
      selectPortfolio: (id) =>
        set((state) => ({
          selectedPortfolio: state.portfolios.find((p) => p.id === id) || null,
        })),
      addAsset: (portfolioId, asset) =>
        set((state) => {
          const portfolios = state.portfolios.map((p) =>
            p.id === portfolioId
              ? {
                  ...p,
                  assets: [...p.assets, asset],
                  updatedAt: new Date().toISOString(),
                }
              : p
          );
          return {
            portfolios,
            selectedPortfolio: portfolios.find((p) => p.id === portfolioId) || null,
          };
        }),
      removeAsset: (portfolioId, assetId) =>
        set((state) => {
          const portfolios = state.portfolios.map((p) =>
            p.id === portfolioId
              ? {
                  ...p,
                  assets: p.assets.filter((a) => a.id !== assetId),
                  updatedAt: new Date().toISOString(),
                }
              : p
          );
          return {
            portfolios,
            selectedPortfolio: portfolios.find((p) => p.id === portfolioId) || null,
          };
        }),
      updateAsset: (portfolioId, asset) =>
        set((state) => {
          const portfolios = state.portfolios.map((p) =>
            p.id === portfolioId
              ? {
                  ...p,
                  assets: p.assets.map((a) => (a.id === asset.id ? asset : a)),
                  updatedAt: new Date().toISOString(),
                }
              : p
          );
          return {
            portfolios,
            selectedPortfolio: portfolios.find((p) => p.id === portfolioId) || null,
          };
        }),
      importPortfolios: (portfolios) =>
        set((state) => ({
          portfolios: [...state.portfolios, ...portfolios],
          selectedPortfolio: state.selectedPortfolio,
        })),
    }),
    {
      name: 'portfolio-storage',
      skipHydration: false,
    }
  )
);