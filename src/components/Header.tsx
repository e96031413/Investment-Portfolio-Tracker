import React, { useState } from 'react';
import { LineChart, Wallet, X } from 'lucide-react';
import { usePortfolioStore } from '../store/portfolioStore';
import { PortfolioImportExport } from './PortfolioImportExport';

export function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [portfolioName, setPortfolioName] = useState('');
  const addPortfolio = usePortfolioStore((state) => state.addPortfolio);

  const handleCreatePortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioName.trim()) return;

    const newPortfolio = {
      id: crypto.randomUUID(),
      name: portfolioName.trim(),
      assets: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addPortfolio(newPortfolio);
    setPortfolioName('');
    setIsModalOpen(false);
  };

  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <LineChart className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Investment Portfolio Tracker
              </h1>
            </div>
            <nav className="flex items-center space-x-4">
              <PortfolioImportExport />
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <Wallet className="h-5 w-5" />
                <span>New Portfolio</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* New Portfolio Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Create New Portfolio
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePortfolio}>
              <div className="mb-4">
                <label
                  htmlFor="portfolioName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Portfolio Name
                </label>
                <input
                  type="text"
                  id="portfolioName"
                  value={portfolioName}
                  onChange={(e) => setPortfolioName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter portfolio name"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Portfolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}