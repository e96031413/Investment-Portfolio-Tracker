import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Portfolio } from './components/Portfolio';
import { Header } from './components/Header';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Portfolio />
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;