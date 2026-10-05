/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { MessengerView } from './components/MessengerView';
import { TelegramGroupsView } from './components/TelegramGroupsView';
import { ProductsView } from './components/ProductsView';
import { OrdersView } from './components/OrdersView';
import { CustomersView } from './components/CustomersView';
import { SettingsView } from './components/SettingsView';
import { DashboardStats, Order, Product, Customer } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isStaticMode, setIsStaticMode] = useState(false);

  useEffect(() => {
    fetchAllData();
    // Poll data periodically so status updates across Telegram and Messenger stay synchronized
    const interval = setInterval(fetchAllData, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      const [statsRes, ordersRes, productsRes, custRes] = await Promise.all([
        fetch('/api/stats').catch(() => null),
        fetch('/api/orders').catch(() => null),
        fetch('/api/products').catch(() => null),
        fetch('/api/customers').catch(() => null),
      ]);

      if (statsRes && statsRes.ok) {
        setStats(await statsRes.json());
        setIsStaticMode(false);
      } else {
        setIsStaticMode(true);
        setStats((prev) => prev || {
          total_products: 0,
          active_products: 0,
          total_orders: 0,
          today_orders: 0,
          pending_orders: 0,
          confirmed_orders: 0,
          delivered_orders: 0,
          cancelled_orders: 0,
          total_revenue: 0,
          total_customers: 0,
        });
      }

      if (ordersRes && ordersRes.ok) setOrders(await ordersRes.json());
      if (productsRes && productsRes.ok) setProducts(await productsRes.json());
      if (custRes && custRes.ok) setCustomers(await custRes.json());
    } catch (err) {
      console.error('Error fetching application state:', err);
      setIsStaticMode(true);
    }
  };

  const handleResetDemo = async () => {
    if (!window.confirm('আপনি কি সত্যিই সম্পূর্ণ ডেমো ডাটা প্রাথমিক অবস্থায় রিসেট করতে চান?')) return;
    setIsResetting(true);
    try {
      const res = await fetch('/api/reset-demo', { method: 'POST' });
      if (res.ok) {
        await fetchAllData();
      }
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 font-sans flex flex-col">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
      />

      {/* Static Hosting Notification Banner */}
      {isStaticMode && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-200 rounded font-bold text-[11px] text-amber-900">
                GitHub Pages Static Mode
              </span>
              <span>
                আপনি স্ট্যাটিক মোডে ফ্রন্টএন্ড UI দেখছেন। সম্পূর্ণ AI সেলস এজেন্ট ও টেলিগ্রাম বট ব্যাকএন্ড চালাতে Render বা Railway-তে হোস্ট করুন।
              </span>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="text-indigo-700 hover:text-indigo-900 font-bold underline shrink-0 text-left sm:text-right"
            >
              সেটআপ গাইড দেখুন →
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            orders={orders}
            products={products}
            onNavigate={(tab) => setActiveTab(tab)}
            onSelectOrder={(ord) => {
              setSelectedOrder(ord);
              setActiveTab('orders');
            }}
          />
        )}

        {activeTab === 'messenger' && (
          <MessengerView
            products={products}
            onOrderCreated={() => {
              fetchAllData();
            }}
          />
        )}

        {activeTab === 'telegram' && (
          <TelegramGroupsView
            products={products}
            onOrderUpdated={() => {
              fetchAllData();
            }}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersView
            orders={orders}
            onRefresh={fetchAllData}
            selectedOrder={selectedOrder}
            onSelectOrder={setSelectedOrder}
          />
        )}

        {activeTab === 'products' && (
          <ProductsView products={products} onRefresh={fetchAllData} />
        )}

        {activeTab === 'customers' && <CustomersView customers={customers} />}

        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Batik Shopping AI Sales Agent</span>
            <span>•</span>
            <span>Facebook Page Messenger & Telegram Dual-Group Automation</span>
          </div>
          <div className="text-slate-400">
            Powered by Google Gemini 3.8 Flash & Full-Stack Node.js Architecture
          </div>
        </div>
      </footer>
    </div>
  );
}
