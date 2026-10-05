import React, { useState } from 'react';
import {
  Search,
  Filter,
  Package,
  Send,
  CheckCircle2,
  Clock,
  Truck,
  Eye,
  Phone,
  ArrowUpDown,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { OrderDetailsModal } from './OrderDetailsModal';

interface OrdersViewProps {
  orders: Order[];
  onRefresh: () => void;
  selectedOrder: Order | null;
  onSelectOrder: (order: Order | null) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onRefresh,
  selectedOrder,
  onSelectOrder,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.order_code.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.toLowerCase().includes(q) ||
        o.district.toLowerCase().includes(q) ||
        o.items.some((i) => i.product_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const statusBadges: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Pending' },
    confirmed: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Confirmed' },
    processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Processing' },
    packed: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Packed' },
    shipped: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Shipped' },
    delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Delivered' },
    cancelled: { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Cancelled' },
    returned: { bg: 'bg-slate-100', text: 'text-slate-800', label: 'Returned' },
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">অর্ডার ব্যবস্থাপনা (Order Management)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            মেসেঞ্জারে AI দ্বারা কনফার্ম হওয়া এবং টেলিগ্রাম গ্রুপ ২-এ প্রেরিত সকল অর্ডারের তালিকা
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-500 font-medium">মোট অর্ডার: {orders.length}টি</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="অর্ডার আইডি (GS-000...), কাস্টমারের নাম, ফোন বা জেলা দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 shadow-2xs"
          />
        </div>

        {/* Status Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'সকল' },
            { id: 'confirmed', label: '🟢 Confirmed' },
            { id: 'processing', label: '⏳ Processing' },
            { id: 'packed', label: '📦 Packed' },
            { id: 'shipped', label: '🚚 Shipped' },
            { id: 'delivered', label: '✅ Delivered' },
            { id: 'cancelled', label: '❌ Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">অর্ডার আইডি</th>
                <th className="py-3 px-4">কাস্টমার ও মোবাইল</th>
                <th className="py-3 px-4">প্রোডাক্ট ও বিবরণ</th>
                <th className="py-3 px-4">ডেলিভারি এলাকা</th>
                <th className="py-3 px-4">মোট টাকা</th>
                <th className="py-3 px-4">টেলিগ্রাম</th>
                <th className="py-3 px-4">স্ট্যাটাস</th>
                <th className="py-3 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => {
                const badge = statusBadges[order.status] || {
                  bg: 'bg-slate-100',
                  text: 'text-slate-800',
                  label: order.status,
                };
                return (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Order ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                      {order.order_code}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 text-sm">{order.customer_name}</div>
                      <div className="flex items-center gap-1 text-slate-400 font-mono mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{order.customer_phone}</span>
                      </div>
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-medium text-slate-800 line-clamp-1">
                        {order.items[0]?.product_name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {order.items[0]?.color} • {order.items[0]?.quantity} পিস
                        {order.items.length > 1 && ` (+${order.items.length - 1}টি)`}
                      </div>
                    </td>

                    {/* Address */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-medium text-slate-800 line-clamp-1">
                        {order.thana || order.district}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{order.full_address}</div>
                    </td>

                    {/* Total */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 text-sm">৳{order.total}</span>
                      <div className="text-[10px] text-slate-400">ডেলিভারি ৳{order.delivery_charge}</div>
                    </td>

                    {/* Telegram Dispatched */}
                    <td className="py-3.5 px-4">
                      {order.telegram_dispatched ? (
                        <span className="flex items-center gap-1 text-sky-600 font-medium text-[11px]">
                          <Send className="w-3 h-3" />
                          <span>Group 2 Sent</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Not dispatched</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${badge.bg} ${badge.text}`}
                      >
                        {badge.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectOrder(order)}
                        className="px-3 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>ভিউ</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">কোনো অর্ডার পাওয়া যায়নি</p>
            <p className="text-xs text-slate-400 mt-1">
              মেসেঞ্জার টেস্টারে গিয়ে কাস্টমারের মতো কথা বলে অর্ডার কনফার্ম করে দেখুন!
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => onSelectOrder(null)}
          onStatusUpdated={() => {
            onRefresh();
            onSelectOrder(null);
          }}
        />
      )}
    </div>
  );
};
