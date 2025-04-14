import { useQuery } from '@apollo/client';
import { PLATFORM_STATISTICS } from '../lib/graphql/queries/statistics';
import { ADMIN_DASHBOARD_BOOTSTRAP } from '../lib/graphql/queries/admin';
import { motion, AnimatePresence, Variants, LayoutGroup } from 'framer-motion'; 
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Users, Store, Building2, Shield, Settings, Database, UserCog, ScrollText, Store as StoreIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
const DEFAULT_STATS = {
  activeUsersCount: 0,
  activeRestaurantsCount: 0,
  activeVendorsCount: 0,
};
interface PlatformStatistics {
  activeUsersCount: number;
  activeRestaurantsCount: number;
  activeVendorsCount: number;
}
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2
    }
  }
};
const errorVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};
export default function Home() {
  const [retryCount, setRetryCount] = useState<number>(0);
  const MAX_RETRIES = 3;
  const { t } = useTranslation();
  // Guidelines data using translation keys
  const guidelines = [
    {
      icon: Shield,
      title: t('homepage.systemsecurity'),
      description: t('homepage.systemsecuritydescription')
    },
    {
      icon: Database,
      title: t('homepage.datamanagement'),
      description: t('homepage.datamanagementdescription')
    },
    {
      icon: UserCog,
      title: t('homepage.useradministration'),
      description: t('homepage.useradministrationdescription')
    },
    {
      icon: ScrollText,
      title: t('homepage.contentcontrol'),
      description: t('homepage.contentcontroldescription')
    },
    {
      icon: StoreIcon,
      title: t('homepage.restaurantoversight'),
      description: t('homepage.restaurantoversightdescription')
    },
    {
      icon: Settings,
      title: t('homepage.platformconfiguration'),
      description: t('homepage.platformconfigurationdescription')
    }
  ];
  // Fetch currency config
  useQuery(ADMIN_DASHBOARD_BOOTSTRAP, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.adminDashboardBootstrap?.currencyConfig) {
        localStorage.setItem('kebab_currency_config', JSON.stringify(data.adminDashboardBootstrap.currencyConfig));
      }
    },
    onError: (error) => {
      console.error('Failed to fetch currency config:', error);
    }
  });
  const { data, loading, error, refetch } = useQuery<{ platformStatistics: PlatformStatistics }>(
    PLATFORM_STATISTICS,
    {
      fetchPolicy: 'cache-first',
      notifyOnNetworkStatusChange: true,
      errorPolicy: 'all',
      onError: () => {
        toast.error(t('homepage.statisticserror'));
        // Retry after 5 seconds
        setTimeout(() => refetch(), 5000);
      }
    }
  );
  // Polling setup on first mount
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      const interval = setInterval(() => {
        refetch();
      }, 300000); // 5 minutes
      return () => clearInterval(interval);
    }
  }, [refetch]);
  const formatValue = (value: number) => {
    return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString();
  };
  const platformStats = data?.platformStatistics || DEFAULT_STATS;
  // Prepare chart data (only items with non-zero values)
  const chartData = [
    { name: t('homepage.activeusers'), value: platformStats.activeUsersCount, color: '#0088FE' },
    { name: t('homepage.activerestaurants'), value: platformStats.activeRestaurantsCount, color: '#00C49F' },
    { name: t('homepage.activevendors'), value: platformStats.activeVendorsCount, color: '#FFBB28' }
  ].filter(item => item.value > 0);
  const stats = [
    {
      label: t('homepage.activeusers'),
      value: error ? '—' : loading ? null : formatValue(platformStats.activeUsersCount),
      icon: Users,
      gradient: 'from-blue-500/10 to-blue-600/5',
      iconColor: 'text-blue-500',
      accentColor: 'bg-blue-500/10',
    },
    {
      label: t('homepage.activerestaurants'),
      value: error ? '—' : loading ? null : formatValue(platformStats.activeRestaurantsCount),
      icon: Store,
      gradient: 'from-green-500/10 to-green-600/5',
      iconColor: 'text-green-500',
      accentColor: 'bg-green-500/10',
    },
    {
      label: t('homepage.activevendors'),
      value: error ? '—' : loading ? null : formatValue(platformStats.activeVendorsCount),
      icon: Building2,
      gradient: 'from-purple-500/10 to-purple-600/5',
      iconColor: 'text-purple-500',
      accentColor: 'bg-purple-500/10',
    },
  ];
  return (
    <div>
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-900 mb-6"
      >
        {t('homepage.welcomeback')}
      </motion.h1>
      <LayoutGroup>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <AnimatePresence key={stat.label} mode="wait">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={cardVariants}
                  className={`rounded-2xl bg-gradient-to-br ${stat.gradient} backdrop-blur-sm p-8 relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-white/10 focus:outline-none`}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0 bg-grid-pattern" />
                  </div>
                  
                  <div className="relative flex flex-col space-y-4">
                    <div className={`rounded-xl ${stat.accentColor} p-4 w-fit`}>
                      <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-base font-medium text-gray-800">{stat.label}</p>
                      {error ? (
                        <motion.div
                          variants={errorVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          className="flex items-baseline space-x-2"
                        >
                          <span className="text-4xl font-bold text-gray-400">—</span>
                          <button
                            onClick={() => refetch()}
                            className="text-sm text-brand-primary font-medium hover:underline"
                          >
                            {t('homepage.retry')}
                          </button>
                        </motion.div>
                      ) : loading && !data?.platformStatistics ? (
                        <div className="space-y-2">
                          <div className="h-8 w-24 bg-black/5 rounded-lg animate-pulse" />
                          <div className="h-2 w-16 bg-black/5 rounded animate-pulse" />
                        </div>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-baseline space-x-2"
                        >
                          <span className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            {stat.value}
                          </span>
                          <span className="text-sm text-gray-500 font-medium">{t('homepage.count')}</span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            );
          })}
        </div>
        
        {chartData.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('homepage.platformdistribution')}</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="value" name={t('homepage.count')} fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-6">{t('homepage.platformguideline')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {guidelines.map((guideline, index) => {
              const Icon = guideline.icon;
              return (
                <motion.div
                  key={guideline.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + (index * 0.1) }}
                  className="p-4 rounded-lg bg-gray-50 border border-gray-200 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="rounded-full bg-brand-accent w-10 h-10 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-black" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">{guideline.title}</h3>
                  <p className="text-sm text-gray-600">{guideline.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </LayoutGroup>
    </div>
  );
}