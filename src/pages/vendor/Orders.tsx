import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Filter, ShoppingBag, Clock, CreditCard, ChevronDown, Eye } from 'lucide-react';
import { toast } from 'sonner';
import Pagination from '../../components/Pagination';
import OrderDetailsModal from '../../components/OrderDetailsModal';
import { getCurrencySymbol } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { useQuery } from '@apollo/client';
import { REST_ORDERS } from '../../lib/graphql/queries/orders';

// Mock data for orders
const generateMockOrders = (count = 50) => {
  const statuses = ['Pending', 'Accepted', 'In Progress', 'Delivered', 'Cancelled'];
  const dishes = [
    'Margherita Pizza', 'Pepperoni Pizza', 'Vegetable Pizza', 'Hawaiian Pizza',
    'Chicken Burger', 'Beef Burger', 'Veggie Burger', 'Cheese Burger',
    'Caesar Salad', 'Greek Salad', 'Pasta Carbonara', 'Spaghetti Bolognese',
    'Chicken Wings', 'French Fries', 'Onion Rings', 'Mozzarella Sticks',
    'Chocolate Cake', 'Cheesecake', 'Ice Cream', 'Apple Pie'
  ];

  const orders = [];
  const currencySymbol = getCurrencySymbol();

  for (let i = 1; i <= count; i++) {
    const numItems = Math.floor(Math.random() * 5) + 1;
    const items = [];
    let subtotal = 0;

    for (let j = 0; j < numItems; j++) {
      const dishName = dishes[Math.floor(Math.random() * dishes.length)];
      const price = parseFloat((Math.random() * 15 + 5).toFixed(2));
      const quantity = Math.floor(Math.random() * 3) + 1;

      items.push({
        id: `item-${i}-${j}`,
        name: dishName,
        price: price,
        quantity: quantity
      });

      subtotal += price * quantity;
    }

    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));

    orders.push({
      id: `ORD-${10000 + i}`,
      items: items,
      itemsDisplay: items.map(item => `${item.name} (${item.quantity})`).join(', '),
      paymentMethod: 'COD',
      status: status,
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
      subtotal: subtotal,
      tax: tax,
      total: total,
      customerName: `Customer ${i}`,
      customerAddress: `${Math.floor(Math.random() * 1000) + 1} Main St, City`,
      customerPhone: `+1 ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
    });
  }

  return orders.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

export default function VendorOrders() {
  const { restaurantId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const rowsPerPage = 10;
  const currencySymbol = getCurrencySymbol();
  const { data, error, loading } = useQuery(REST_ORDERS, {
    variables: {
      "restaurant": restaurantId,
      "page": 1,
      "rows": 10,
      "search": null
    }
  })

  // Generate mock orders
  const mockOrders = useMemo(() => generateMockOrders(), []);

  // Filter orders based on search query and status filter
  const filteredOrders = useMemo(() => {
    return data?.ordersByRestId.filter(order => {
      const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
      return matchesStatus;
    });
  }, [data?.ordersByRestId, statusFilter]);

  // Paginate orders
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredOrders.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800 ring-1 ring-green-600/20';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 ring-1 ring-red-600/20';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 ring-1 ring-blue-600/20';
      case 'Accepted':
        return 'bg-purple-100 text-purple-800 ring-1 ring-purple-600/20';
      default:
        return 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-600/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
        <div className="flex items-center space-x-4">
          {/* Status Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowStatusFilter(!showStatusFilter)}
              className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-4 w-4 mr-2" />
              <span>
                {statusFilter === 'all' ? 'All Status' : statusFilter}
              </span>
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>

            {showStatusFilter && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setShowStatusFilter(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50"
                >
                  All Status
                </button>
                <button
                  onClick={() => {
                    setStatusFilter('Pending');
                    setShowStatusFilter(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50"
                >
                  Pending
                </button>
                <button
                  onClick={() => {
                    setStatusFilter('Accepted');
                    setShowStatusFilter(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50"
                >
                  Accepted
                </button>
                <button
                  onClick={() => {
                    setStatusFilter('In Progress');
                    setShowStatusFilter(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50"
                >
                  In Progress
                </button>
                <button
                  onClick={() => {
                    setStatusFilter('Delivered');
                    setShowStatusFilter(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50"
                >
                  Delivered
                </button>
                <button
                  onClick={() => {
                    setStatusFilter('Cancelled');
                    setShowStatusFilter(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50"
                >
                  Cancelled
                </button>
              </div>
            )}
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated At
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleViewOrder(order)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <ShoppingBag className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{order.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {order.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <CreditCard className="h-4 w-4 mr-1 text-gray-400" />
                      {order.paymentMethod}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      {formatDate(order.updatedAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewOrder(order);
                      }}
                      className="text-brand-primary hover:text-brand-primary/80 flex items-center justify-end"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? "Try adjusting your search or filter criteria"
                : "When customers place orders, they will appear here"}
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className="px-4 py-3 bg-white border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={showOrderDetails}
        onClose={() => setShowOrderDetails(false)}
        order={selectedOrder}
      />

      {/* Click outside handler for status filter */}
      {showStatusFilter && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowStatusFilter(false)}
        />
      )}
    </div>
  );
}