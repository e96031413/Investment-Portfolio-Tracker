import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export function RefreshButton() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Invalidate all queries to trigger refetching
      await queryClient.invalidateQueries({
        predicate: (query) => {
          // We can target specific queries if needed
          return query.queryKey[0] === 'portfolio-quotes' || 
                 query.queryKey[0] === 'portfolio-history' ||
                 query.queryKey[0] === 'quote';
        }
      });
      
      // Show success message or notification if needed
    } catch (error) {
      console.error('Error refreshing data:', error);
      // Show error message if needed
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      disabled={isRefreshing}
      title="Refresh all data"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      <span>Refresh All</span>
    </button>
  );
}
