import React, { useState } from 'react';
import { usePortfolioStore } from '../store/portfolioStore';
import { Trash2, Edit, Plus, X, Search } from 'lucide-react';
import { Asset } from '../types/portfolio';
import { getQuote } from '../services/stockService';
import { getCryptoQuote } from '../services/cryptoService';
import { useQuery } from '@tanstack/react-query';

export function AssetList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    quantity: '',
    costBasis: '',
    purchaseDate: '',
    currency: 'USD',
    type: 'stock' as 'stock' | 'crypto',
  });

  const { selectedPortfolio, addAsset, removeAsset, updateAsset } = usePortfolioStore();

  const { data: symbolQuote, isLoading: isLoadingQuote, isError, error } = useQuery({
    queryKey: ['quote', formData.symbol, formData.type],
    queryFn: () => formData.type === 'stock' 
      ? getQuote(formData.symbol)
      : getCryptoQuote(formData.symbol),
    enabled: formData.symbol.length > 1 && isModalOpen,
    retry: 1,
    staleTime: 30000,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const asset: Asset = {
      id: editingAsset?.id || crypto.randomUUID(),
      symbol: formData.symbol.toUpperCase().trim(),
      name: formData.name.trim(),
      quantity: Number(formData.quantity),
      costBasis: Number(formData.costBasis),
      purchaseDate: formData.purchaseDate,
      currency: formData.currency,
      type: formData.type,
    };

    if (editingAsset) {
      updateAsset(selectedPortfolio!.id, asset);
    } else {
      addAsset(selectedPortfolio!.id, asset);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      symbol: asset.symbol,
      name: asset.name,
      quantity: asset.quantity.toString(),
      costBasis: asset.costBasis.toString(),
      purchaseDate: asset.purchaseDate,
      currency: asset.currency,
      type: asset.type || 'stock',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (assetId: string) => {
    if (confirm('Are you sure you want to delete this asset?')) {
      removeAsset(selectedPortfolio!.id, assetId);
    }
  };

  const resetForm = () => {
    setEditingAsset(null);
    setFormData({
      symbol: '',
      name: '',
      quantity: '',
      costBasis: '',
      purchaseDate: '',
      currency: 'USD',
      type: 'stock',
    });
  };

  if (!selectedPortfolio) return null;

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Portfolio Assets</h2>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Asset</span>
          </button>
        </div>

        {selectedPortfolio.assets.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No assets in this portfolio yet. Click "Add Asset" to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost Basis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purchase Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedPortfolio.assets.map((asset) => (
                  <tr key={asset.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {asset.name}
                          </div>
                          <div className="text-sm text-gray-500">{asset.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        asset.type === 'crypto' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {asset.type === 'crypto' ? 'Crypto' : 'Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {asset.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {asset.currency} {asset.costBasis.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(asset.purchaseDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(asset)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(asset.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Asset Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingAsset ? 'Edit Asset' : 'Add New Asset'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asset Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    type: e.target.value as 'stock' | 'crypto',
                    symbol: '' // Reset symbol when changing type
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="stock">Stock</option>
                  <option value="crypto">Cryptocurrency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.type === 'crypto' ? 'Crypto Symbol' : 'Stock Symbol'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={formData.type === 'crypto' ? 'e.g., BTC' : 'e.g., AAPL'}
                    required
                    minLength={1}
                    maxLength={10}
                    pattern="[A-Z0-9.]+"
                  />
                  {isLoadingQuote && (
                    <div className="absolute right-3 top-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
                {symbolQuote && (
                  <p className="mt-1 text-sm text-gray-600">
                    Current Price: {symbolQuote.currency} {symbolQuote.price.toFixed(2)}
                  </p>
                )}
                {isError && error instanceof Error && (
                  <p className="mt-1 text-sm text-red-600">
                    {error.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={formData.type === 'crypto' ? 'e.g., Bitcoin' : 'e.g., Apple Inc'}
                  required
                  minLength={1}
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                  min="0.000001"
                  step="0.000001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost Basis
                </label>
                <input
                  type="number"
                  value={formData.costBasis}
                  onChange={(e) => setFormData({ ...formData, costBasis: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchase Date
                </label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="JPY">JPY</option>
                  <option value="TWD">TWD</option>                  
                  <option value="CNY">CNY</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {editingAsset ? 'Update Asset' : 'Add Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}