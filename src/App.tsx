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

  useEffect(() => {
    fetchAllData();
    // Poll data periodically so status updates across Telegram and Messenger stay synchronized
    const interval = setInterval(fetchAllData, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      const [statsRes, ordersRes, productsRes, custRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/orders'),
        fetch('/api/products'),
        fetch('/api/customers'),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());
      if (custRes.ok) setCustomers(await custRes.json());
    } catch (err) {
      console.error('Error fetching application state:', err);
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
