import React, { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { usePortfolioStore } from '../store/portfolioStore';
import { Portfolio } from '../types/portfolio';

export function PortfolioImportExport() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { portfolios, importPortfolios } = usePortfolioStore();

  const handleExport = () => {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      portfolios,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        // Validate the imported data structure
        if (!data.portfolios || !Array.isArray(data.portfolios)) {
          throw new Error('Invalid portfolio data format');
        }

        // Validate each portfolio
        data.portfolios.forEach((portfolio: Portfolio) => {
          if (!portfolio.id || !portfolio.name || !Array.isArray(portfolio.assets)) {
            throw new Error('Invalid portfolio structure');
          }
        });

        importPortfolios(data.portfolios);
        alert('Portfolios imported successfully!');
      } catch (error) {
        alert('Error importing portfolios: ' + (error instanceof Error ? error.message : 'Invalid file format'));
      }
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        accept=".json"
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        title="Import Portfolios"
      >
        <Upload className="h-4 w-4" />
        <span>Import</span>
      </button>
      <button
        onClick={handleExport}
        className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        title="Export Portfolios"
      >
        <Download className="h-4 w-4" />
        <span>Export</span>
      </button>
    </div>
  );
}