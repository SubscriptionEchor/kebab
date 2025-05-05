import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, DollarSign, ShoppingBag, Filter, X } from 'lucide-react';
import { toast } from 'sonner';
import moment from 'moment';
import { getCurrencySymbol } from '../../utils/currency';
import { useQuery } from '@apollo/client';
import { DASHBOARD } from '../../lib/graphql/queries/dashboard';

// Mock data for the dashboard
const generateMockData = (days = 30) => {
  const data = [];
  const today = moment();
  const currencySymbol = getCurrencySymbol();

  for (let i = 0; i < days; i++) {
    const date = moment(today).subtract(i, 'days');
    const orders = Math.floor(Math.random() * 50) + 10;
    const sales = (Math.random() * 1000 + 500).toFixed(2);

    data.push({
      date: date.format('YYYY-MM-DD'),
      displayDate: date.format('MMM DD'),
      orders,
      sales: parseFloat(sales),
    });
  }

  return data.reverse();
};

export default function VendorDashboardPage() {
  const { restaurantId } = useParams();
  const [dateRange, setDateRange] = useState<' ' | 'all' | 'today' | 'week' | 'month' | 'year' | 'custom'>(' ');
  const [startDate, setStartDate] = useState<string>(moment().subtract(30, 'days').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState<string>(moment().format('YYYY-MM-DD'));
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<string>(startDate);
  const [customEndDate, setCustomEndDate] = useState<string>(endDate);
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const currencySymbol = getCurrencySymbol();
  const modalRef = useRef<HTMLDivElement>(null);
  const { data, error, loading } = useQuery(DASHBOARD, {
    variables: {
      restaurant: restaurantId,
      startingDate: startDate,
      endingDate: endDate
    }
  })

  // Calculate total orders and sales
  const totalOrders = chartData.reduce((sum, item) => sum + item.orders, 0);
  const totalSales = chartData.reduce((sum, item) => sum + item.sales, 0);

  // Update date range based on selection
  useEffect(() => {
    const today = moment();

    switch (dateRange) {
      case 'today':
        setStartDate(today.format('YYYY-MM-DD'));
        setEndDate(today.format('YYYY-MM-DD'));
        break;
      case 'week':
        setStartDate(today.clone().subtract(7, 'days').format('YYYY-MM-DD'));
        setEndDate(today.format('YYYY-MM-DD'));
        break;
      case 'month':
        setStartDate(today.clone().subtract(30, 'days').format('YYYY-MM-DD'));
        setEndDate(today.format('YYYY-MM-DD'));
        break;
      case 'year':
        setStartDate(today.clone().subtract(365, 'days').format('YYYY-MM-DD'));
        setEndDate(today.format('YYYY-MM-DD'));
        break;
      case 'custom':
        // Don't change dates, just show the modal
        setShowCustomDateModal(true);
        break;
      default:
        setStartDate(today.clone().subtract(30, 'days').format('YYYY-MM-DD'));
        setEndDate(today.format('YYYY-MM-DD'));
    }
  }, [dateRange]);

  // Fetch data when date range changes
  useEffect(() => {
    if (dateRange !== 'custom' || !showCustomDateModal) {
      fetchData();
    }
  }, [startDate, endDate]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowCustomDateModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchData = () => {
    setIsLoading(true);

    // Simulate API call with setTimeout
    setTimeout(() => {
      // Generate mock data based on date range
      const start = moment(startDate);
      const end = moment(endDate);
      const daysDiff = end.diff(start, 'days') + 1;

      setChartData(generateMockData(daysDiff));
      setIsLoading(false);
    }, 800);
  };

  const handleCustomDateSubmit = () => {
    // Validate dates
    if (!customStartDate || !customEndDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    const start = moment(customStartDate);
    const end = moment(customEndDate);

    if (end.isBefore(start)) {
      toast.error('End date must be after start date');
      return;
    }

    // Update actual dates and close modal
    setStartDate(customStartDate);
    setEndDate(customEndDate);
    setShowCustomDateModal(false);
  };

  const formatCurrency = (value: number) => {
    return `${currencySymbol}${value?.toFixed(2)||0}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex">
            {/* <button
              onClick={() => setDateRange('today')}
              className={`px-3 py-2 text-sm font-medium ${dateRange === 'today'
                ? 'bg-brand-primary text-black'
                : 'text-gray-700 hover:bg-gray-50'
                } transition-colors rounded-l-lg`}
            >
              Today
            </button> */}
            {/* <button
              onClick={() => setDateRange('week')}
              className={`px-3 py-2 text-sm font-medium ${dateRange === 'week'
                ? 'bg-brand-primary text-black'
                : 'text-gray-700 hover:bg-gray-50'
                } transition-colors`}
            >
              Week
            </button> */}
            {/* <button
              onClick={() => setDateRange('month')}
              className={`px-3 py-2 text-sm font-medium ${dateRange === 'month'
                ? 'bg-brand-primary text-black'
                : 'text-gray-700 hover:bg-gray-50'
                } transition-colors`}
            >
              Month
            </button> */}
            {/* <button
              onClick={() => setDateRange('year')}
              className={`px-3 py-2 text-sm font-medium ${dateRange === 'year'
                ? 'bg-brand-primary text-black'
                : 'text-gray-700 hover:bg-gray-50'
                } transition-colors`}
            >
              Year
            </button> */}
            <button
              onClick={() => setDateRange('custom')}
              className={`px-3 py-2 text-sm font-medium ${dateRange === 'custom'
                ? 'bg-brand-primary text-black'
                : 'text-gray-700 hover:bg-gray-50'
                } transition-colors rounded-r-lg flex items-center`}
            >
              <Filter className="h-4 w-4 mr-1" />
              Custom
            </button>
          </div>
        </div>
      </div>

      {/* Date Range Display */}
      <div className="flex items-center text-sm text-gray-500">
        <Calendar className="h-4 w-4 mr-2" />
        <span>
          {moment(startDate).format('MMM DD, YYYY')} - {moment(endDate).format('MMM DD, YYYY')}
        </span>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Orders</p>
              <h3 className="text-3xl font-bold text-gray-900">
                {isLoading ? (
                  <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  data?.getDashboardTotal?.totalOrders
                )}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Sales</p>
              <h3 className="text-3xl font-bold text-gray-900">
                {isLoading ? (
                  <div className="h-8 w-32 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  formatCurrency(data?.getDashboardTotal?.totalSales)
                )}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
        <div className="h-[400px]">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="displayDate"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 12 }}
                />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === 'sales') return [formatCurrency(value as number), 'Sales'];
                    return [value, 'Orders'];
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="orders" name="Orders" fill="#8884d8" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="sales" name="Sales" fill="#82ca9d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div> 

      {/* Custom Date Range Modal */}
      {showCustomDateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Custom Date Range</h2>
              <button
                onClick={() => setShowCustomDateModal(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setShowCustomDateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomDateSubmit}
                className="px-4 py-2 text-sm font-medium text-black bg-brand-primary rounded-md hover:bg-brand-primary/90 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}