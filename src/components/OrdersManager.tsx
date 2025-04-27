import { useState } from 'react';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  total: number;
  createdAt: string;
}

interface OrdersManagerProps {
  orders: Order[];
  onStatusChange: (orderId: string, status: Order['status']) => void;
  onPreparationTimeChange: (orderId: string, minutes: number) => void;
}

export default function OrdersManager({ orders, onStatusChange, onPreparationTimeChange }: OrdersManagerProps) {
  const { t } = useTranslation();
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [preparationTimes, setPreparationTimes] = useState<Record<string, number>>({});

  const toggleOrderExpansion = (orderId: string) => {
    const newExpandedOrders = new Set(expandedOrders);
    if (newExpandedOrders.has(orderId)) {
      newExpandedOrders.delete(orderId);
    } else {
      newExpandedOrders.add(orderId);
    }
    setExpandedOrders(newExpandedOrders);
  };

  const handlePreparationTimeChange = (orderId: string, minutes: number) => {
    setPreparationTimes(prev => ({ ...prev, [orderId]: minutes }));
    onPreparationTimeChange(orderId, minutes);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-600/20';
      case 'preparing':
        return 'bg-blue-100 text-blue-800 ring-1 ring-blue-600/20';
      case 'ready':
        return 'bg-green-100 text-green-800 ring-1 ring-green-600/20';
      case 'completed':
        return 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20';
      case 'cancelled':
        return 'bg-red-100 text-red-800 ring-1 ring-red-600/20';
      default:
        return 'bg-gray-100 text-gray-800 ring-1 ring-gray-600/20';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('orders.noorders')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          {/* Order Header */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => toggleOrderExpansion(order.id)}
                className="text-gray-500 hover:text-gray-700"
              >
                {expandedOrders.has(order.id) ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {order.orderNumber}
                </h3>
                <p className="text-sm text-gray-500">{order.customerName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                {t(`orders.${order.status}`)}
              </span>
              <span className="text-sm font-medium text-gray-900">
                €{order.total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Order Details */}
          {expandedOrders.has(order.id) && (
            <div className="border-t border-gray-200 p-4 space-y-4">
              {/* Order Items */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  {t('orders.items')}
                </h4>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center">
                        <span className="font-medium">{item.quantity}x</span>
                        <span className="ml-2">{item.name}</span>
                      </div>
                      <span className="text-gray-500">
                        €{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  {order.status === 'preparing' && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={preparationTimes[order.id] || ''}
                        onChange={(e) => handlePreparationTimeChange(order.id, parseInt(e.target.value))}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                        placeholder={t('orders.minutes')}
                      />
                      <span className="text-sm text-gray-500">{t('orders.minutes')}</span>
                    </div>
                  )}

                  <select
                    value={order.status}
                    onChange={(e) => onStatusChange(order.id, e.target.value as Order['status'])}
                    className="text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  >
                    <option value="pending">{t('orders.pending')}</option>
                    <option value="preparing">{t('orders.preparing')}</option>
                    <option value="ready">{t('orders.ready')}</option>
                    <option value="completed">{t('orders.completed')}</option>
                    <option value="cancelled">{t('orders.cancelled')}</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 