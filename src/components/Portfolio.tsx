import React, { useState } from 'react';
import { usePortfolioStore } from '../store/portfolioStore';
import { AssetList } from './AssetList';
import { PortfolioMetrics } from './PortfolioMetrics';
import { Edit2, Trash2, X, Check } from 'lucide-react';

export function Portfolio() {
  const { portfolios, selectedPortfolio, selectPortfolio, updatePortfolio, deletePortfolio } = usePortfolioStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');

  if (portfolios.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-700">
          Click "New Portfolio" to create your first portfolio
        </h2>
      </div>
    );
  }

  if (!selectedPortfolio) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-700">Select a Portfolio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolios.map((portfolio) => (
            <div
              key={portfolio.id}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow relative group"
            >
              <button
                onClick={() => selectPortfolio(portfolio.id)}
                className="w-full text-left"
              >
                <h3 className="text-lg font-medium text-gray-900">{portfolio.name}</h3>
                <p className="text-sm text-gray-500 mt-2">
                  {portfolio.assets.length} assets
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Created: {new Date(portfolio.createdAt).toLocaleDateString()}
                </p>
              </button>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Are you sure you want to delete this portfolio?')) {
                      deletePortfolio(portfolio.id);
                    }
                  }}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete Portfolio"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const handleStartEditing = () => {
    setIsEditing(true);
    setEditedName(selectedPortfolio.name);
  };

  const handleSave = () => {
    if (editedName.trim()) {
      updatePortfolio(selectedPortfolio.id, { name: editedName.trim() });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedName(selectedPortfolio.name);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this portfolio? This action cannot be undone.')) {
      deletePortfolio(selectedPortfolio.id);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="text-2xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none bg-transparent"
                autoFocus
              />
              <button
                onClick={handleSave}
                className="p-1 text-green-500 hover:text-green-600"
                title="Save"
              >
                <Check className="h-5 w-5" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1 text-gray-400 hover:text-gray-500"
                title="Cancel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900">{selectedPortfolio.name}</h1>
              <button
                onClick={handleStartEditing}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Rename Portfolio"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleDelete}
            className="text-sm text-red-500 hover:text-red-600 transition-colors flex items-center space-x-1"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Portfolio</span>
          </button>
          <button
            onClick={() => selectPortfolio('')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Switch Portfolio
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-8">
        <PortfolioMetrics />
        <AssetList />
      </div>
    </div>
  );
}