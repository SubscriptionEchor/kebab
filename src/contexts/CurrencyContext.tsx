import { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@apollo/client';
import { ADMIN_DASHBOARD_BOOTSTRAP } from '../lib/graphql/queries/admin';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

interface CurrencyConfig {
  currency: string;
  currencySymbol: string;
}

interface CurrencyContextType {
  currencySymbol: string;
  isLoading: boolean;
  error: Error | null;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

const CURRENCY_CONFIG_KEY = 'kebab_currency_config';

// Helper functions for localStorage operations
const getCurrencySymbol = (): string => {
  try {
    const savedConfig = localStorage.getItem(CURRENCY_CONFIG_KEY);
    if (savedConfig) {
      const config = JSON.parse(savedConfig) as CurrencyConfig;
      if (config.currencySymbol && typeof config.currencySymbol === 'string') {
        return config.currencySymbol;
      }
    }
  } catch (error) {
    console.error('Error reading currency config:', error);
    localStorage.removeItem(CURRENCY_CONFIG_KEY);
  }
  return '€'; // Default symbol
};

const setCurrencyConfig = (config: CurrencyConfig): void => {
  try {
    // Ensure we have a valid config object
    if (!config || typeof config !== 'object') {
      throw new Error('Invalid currency config');
    }

    // Validate required fields
    if (!config.currency || !config.currencySymbol) {
      throw new Error('Missing required currency config fields');
    }

    // Store in localStorage
    localStorage.setItem(CURRENCY_CONFIG_KEY, JSON.stringify({
      currency: config.currency,
      currencySymbol: config.currencySymbol
    }));

    // Log success in development
    if (import.meta.env.DEV) {
      console.log('Currency config saved:', config);
    }
  } catch (error) {
    console.error('Error saving currency config:', error);
  }
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  // Query to fetch and update currency config
  const { loading, error } = useQuery(ADMIN_DASHBOARD_BOOTSTRAP, {
    skip: !isAuthenticated,
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.adminDashboardBootstrap?.currencyConfig) {
        try {
          const config = data.adminDashboardBootstrap.currencyConfig;
          if (!config.currencySymbol) {
            throw new Error('No currency symbol in API response');
          }
          
          // Save to localStorage
          setCurrencyConfig(config);

          if (import.meta.env.DEV) {
            console.log('Currency config updated from API:', config);
          }
        } catch (error) {
          console.error('Error processing currency config:', error);
        }
      } else {
        console.warn('No currency config received from API');
      }
    },
    onError: (error) => {
      console.error('Failed to fetch currency config:', error);
    }
  });

  // Always read directly from localStorage
  const value = {
    currencySymbol: getCurrencySymbol(),
    isLoading: loading,
    error: error || null
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}