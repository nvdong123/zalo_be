import './styles/index.less';
// import './mock'; // DISABLED: Using real API instead of mock data

import ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import AppSimple from './AppSimple';

// Create QueryClient for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 0,
    },
  },
});

// Clear any existing cache to prevent 404 errors from cached data
queryClient.clear();

ReactDOM.render(
  <QueryClientProvider client={queryClient}>
    <AppSimple />
  </QueryClientProvider>, 
  document.getElementById('root')
);
