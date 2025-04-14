import { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';
import { useQuery } from '@apollo/client';
import { ADMIN_DASHBOARD_BOOTSTRAP } from '../lib/graphql/queries/admin';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
interface Zone {
  identifier: string;
  title: string;
  // any other fields
}
interface OperationalZone {
  fallBackCoordinates: {
    latitude: number;
    longitude: number;
  };
  // ...any other properties
}

interface ZonesContextType {
  operationalZones: OperationalZone[];
  isLoading: boolean;
  error: Error | null;
  refetchZones: () => Promise<void>;
  zoneDetails: Zone[];
  setZoneDetails: Dispatch<SetStateAction<Zone[]>>;
}




const ZonesContext = createContext<ZonesContextType | null>(null);

export function ZonesProvider({ children }: { children: ReactNode }) {
  const [operationalZones, setOperationalZones] = useState<OperationalZone[]>([]);
  const [zoneDetails, setZoneDetails] = useState<Zone[]>([])
  const { isAuthenticated } = useAuth();
  const { data, loading, error, refetch } = useQuery(ADMIN_DASHBOARD_BOOTSTRAP, {
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network',
    onError: (error) => {
      console.error('Failed to fetch operational zones:', error);
    }
  });

  useEffect(() => {
    if (data?.adminDashboardBootstrap?.operationalZones) {
      setOperationalZones(data.adminDashboardBootstrap.operationalZones);
    }
    if (data?.adminDashboardBootstrap?.zonesDetails) {
      setZoneDetails(data.adminDashboardBootstrap.zonesDetails);
    }
  }, [data]);

  const refetchZones = async () => {
    try {
      const { data } = await refetch();
      if (data?.adminDashboardBootstrap?.operationalZones) {
        setOperationalZones(data.adminDashboardBootstrap.operationalZones);
      }
      if (data?.adminDashboardBootstrap?.zoneDetails) {
        setZoneDetails(data.adminDashboardBootstrap.zoneDetails);
      }
    } catch (error) {
      console.error('Failed to refetch zones:', error);
      toast.error('Failed to refresh operational zones');
    }
  };

  return (
    <ZonesContext.Provider value={{
      operationalZones,
      isLoading: loading,
      error: error ? error as Error : null,
      refetchZones,
      zoneDetails, setZoneDetails
    }}>
      {children}
    </ZonesContext.Provider>
  );
}

export function useZones() {
  const context = useContext(ZonesContext);
  if (!context) {
    throw new Error('useZones must be used within a ZonesProvider');
  }
  return context;
}