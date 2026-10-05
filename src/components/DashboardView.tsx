import React from 'react';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Users,
  ArrowRight,
  Send,
  MessageCircle,
  AlertTriangle,
} from 'lucide-react';
import { DashboardStats, Order, Product } from '../types';

interface DashboardViewProps {
  stats: DashboardStats | null;
  orders: Order[];
  products: Product[];
  onNavigate: (tab: string) => void;
  onSelectOrder: (order: Order) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  orders,
  products,
  onNavigate,
  onSelectOrder,
}) => {
  const lowStockProducts = products.filter((p) => p.stock <= 12);
  const recentOrders = orders.slice(0, 5);

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
      {/* Welcome Banner & System Status */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ● Live Sales System Active
              </span>
              <span className="text-xs text-indigo-200">Batik Shopping — ঘরোয়া শপিং AI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              বাটিক শপিং সেলস ও অর্ডার কন্ট্রোল সেন্টার
            </h1>
            <p className="text-sm text-indigo-100/90 mt-1 max-w-2xl font-light">
              ফেসবুক মেসেঞ্জারে মানুষের মতো স্বাভাবিকভাবে কাস্টমারের সাথে কথা বলে, সুনির্দিষ্ট ১০-ধাপের ভেরিফিকেশন শেষে অর্ডার কনফার্ম করে সরাসরি টেলিগ্রাম গ্রুপে পাঠিয়ে দেয়।
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('messenger')}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-md transition-all hover:scale-[1.02]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>মেসেঞ্জারে চ্যাট টেস্ট</span>
            </button>
            <button
              onClick={() => onNavigate('telegram')}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all hover:scale-[1.02]"
            >
              <Send className="w-4 h-4 text-sky-400" />
              <span>টেলিগ্রাম গ্রুপ লাইভ</span>
            </button>
          </div>
        </div>

        {/* PRD Main Architectural Flow Indicator */}
        <div className="mt-6 pt-5 border-t border-white/10 hidden lg:block">
          <div className="flex items-center justify-between text-xs text-indigo-200">
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>1. Facebook Messenger Inbox</span>
            </div>
            <span className="text-indigo-400">→</span>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>2. Gemini Sales Agent (Bangla)</span>
            </div>
            <span className="text-indigo-400">→</span>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              <span>3. Product & Stock DB Verification</span>
            </div>
            <span className="text-indigo-400">→</span>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <span className="w-2 h-2 rounded-full bg-pink-400"></span>
              <span>4. Final Summary & Explicit Confirm</span>
            </div>
            <span className="text-indigo-400">→</span>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>5. Telegram Order Notification Group</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">মোট অর্ডার</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{stats?.total_orders ?? 0}</span>
            <span className="text-xs text-emerald-600 font-medium ml-2">আজকে: {stats?.today_orders ?? 0}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">সব চ্যানেলের অর্ডার</p>
        </div>

        {/* Confirmed Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">কনফার্মড অর্ডার</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{stats?.confirmed_orders ?? 0}</span>
            <span className="text-xs text-slate-500 font-medium ml-2">ডেলিভারড: {stats?.delivered_orders ?? 0}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">কাস্টমার কনফার্মেশন সম্পন্ন</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">মোট বিক্রয় (টাকা)</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">৳{stats?.total_revenue?.toLocaleString() ?? 0}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">ক্যাশ অন ডেলিভারি ও প্রি-পেমেন্ট</p>
        </div>

        {/* Active Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">প্রোডাক্ট ও স্টক</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{stats?.active_products ?? 0}</span>
            <span className="text-xs text-slate-500 font-medium ml-2">মোট: {stats?.total_products ?? 0}টি</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">সক্রিয় বাটিক আইটেম</p>
        </div>
      </div>

      {/* Two Column Layout: Recent Orders & Stock Alerts / Telegram Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">সর্বশেষ কনফার্মড অর্ডারসমূহ</h2>
              <p className="text-xs text-slate-500">মেসেঞ্জার AI দ্বারা কনফার্ম হওয়া এবং টেলিগ্রামে নোটিফাই হওয়া অর্ডার</p>
            </div>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>সকল অর্ডার দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">অর্ডার আইডি</th>
                  <th className="py-2.5 px-3">কাস্টমার</th>
                  <th className="py-2.5 px-3">প্রোডাক্ট</th>
                  <th className="py-2.5 px-3">মোট টাকা</th>
                  <th className="py-2.5 px-3">স্ট্যাটাস</th>
                  <th className="py-2.5 px-3 rounded-r-lg text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => {
                  const badge = statusBadges[order.status] || {
                    bg: 'bg-slate-100',
                    text: 'text-slate-800',
                    label: order.status,
                  };
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-semibold text-indigo-600 font-mono text-xs">
                        {order.order_code}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-900">{order.customer_name}</div>
                        <div className="text-xs text-slate-400">{order.customer_phone}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-xs text-slate-800 line-clamp-1">
                          {order.items[0]?.product_name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {order.items[0]?.color} • {order.items[0]?.quantity} পিস
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        ৳{order.total}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onSelectOrder(order)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-slate-200"
                        >
                          বিস্তারিত
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Telegram Hub & Stock Alerts (1 Column) */}
        <div className="space-y-6">
          {/* Telegram Dual Group System Status */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-xs border border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Send className="w-5 h-5 text-sky-400" />
              <h3 className="font-bold text-sm">টেলিগ্রাম গ্রুপ ইন্টিগ্রেশন</h3>
            </div>
            <p className="text-xs text-slate-300 mb-4">
              সিস্টেমে দুটি আলাদা টেলিগ্রাম গ্রুপ সম্পূর্ণ সংযুক্ত রয়েছে:
            </p>

            <div className="space-y-3">
              {/* Group 1 */}
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-sky-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-sky-300">Group 1: Product Management</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md">Active</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  অ্যাডমিনরা <code className="text-amber-300 font-mono">/addproduct</code>, <code className="text-amber-300 font-mono">/stock</code>, <code className="text-amber-300 font-mono">/price</code> কমান্ড দিয়ে প্রোডাক্ট আপডেট করতে পারে।
                </p>
              </div>

              {/* Group 2 */}
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-emerald-500/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-300">Group 2: Order Notification</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md">Active</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  কনফার্মড অর্ডার স্বয়ংক্রিয়ভাবে ছবি ও ইন্টারেক্টিভ স্ট্যাটাস বাটন সহ পোস্ট হয়।
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('telegram')}
              className="mt-4 w-full py-2 bg-sky-500 hover:bg-sky-400 text-slate-900 rounded-xl text-xs font-bold transition-all text-center"
            >
              টেলিগ্রাম গ্রুপ সিমুলেটর খুলুন
            </button>
          </div>

          {/* Low Stock Warning */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900">স্টক সতর্কতা (Low Stock)</h3>
              </div>
              <span className="text-xs text-slate-400">{lowStockProducts.length}টি আইটেম</span>
            </div>

            <div className="space-y-2.5">
              {lowStockProducts.map((p) => (
                <div key={p.product_id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <img src={p.images[0]} alt={p.product_name} className="w-8 h-8 rounded-md object-cover" />
                    <div>
                      <div className="text-xs font-semibold text-slate-800 line-clamp-1">{p.product_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{p.product_id}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    {p.stock} পিস
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
