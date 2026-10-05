import React, { useState } from 'react';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Edit2,
  Trash2,
  Package,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Tag,
} from 'lucide-react';
import { Product } from '../types';
import { AddProductModal } from './AddProductModal';

interface ProductsViewProps {
  products: Product[];
  onRefresh: () => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({ products, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Inline stock adjustment feedback
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredProducts = products.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.product_name.toLowerCase().includes(q) ||
        p.product_id.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.colors.some((c) => c.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleUpdateStock = async (productId: string, newStock: number) => {
    setUpdatingId(productId);
    try {
      await fetch(`/api/products/${productId}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: Math.max(0, newStock) }),
      });
      onRefresh();
    } catch (err) {
      console.error('Failed to update stock:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm(`আপনি কি সত্যিই ${productId} প্রোডাক্টটি মুছে ফেলতে চান?`)) return;

    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">বাটিক প্রোডাক্ট ইনভেন্টরি</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            মোট {products.length}টি প্রোডাক্ট • AI সেলস এজেন্ট এই ক্যাটালগ থেকেই তথ্য দিয়ে কাস্টমারের অর্ডার নেয়
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন প্রোডাক্ট যোগ করুন</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="প্রোডাক্টের নাম, কালার বা ফেব্রিক দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 shadow-2xs"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'সকল প্রোডাক্ট' },
            { id: 'active', label: '🟢 ইন স্টক (Active)' },
            { id: 'out_of_stock', label: '🔴 স্টক শেষ' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
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

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((p) => {
          const isLowStock = p.stock <= 10 && p.stock > 0;
          const isOut = p.stock === 0 || p.status === 'out_of_stock';

          return (
            <div
              key={p.product_id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col hover:border-indigo-300 transition-all group"
            >
              {/* Product Image */}
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img
                  src={p.images[0]}
                  alt={p.product_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                    {p.product_id}
                  </span>
                </div>
                <div className="absolute top-2.5 right-2.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs ${
                      isOut
                        ? 'bg-rose-600 text-white'
                        : isLowStock
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {isOut ? 'স্টক শেষ' : `${p.stock} পিস স্টক`}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">
                    {p.product_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-base font-bold text-indigo-700">
                      ৳{p.discount_price || p.price}
                    </span>
                    {p.discount_price && (
                      <span className="text-xs text-slate-400 line-through">৳{p.price}</span>
                    )}
                    <span className="text-[11px] text-slate-500 font-medium ml-auto">
                      {p.fabric}
                    </span>
                  </div>

                  {/* Colors */}
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">কালারসমূহ:</span>
                    <div className="flex flex-wrap gap-1">
                      {p.colors.map((c, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="mt-3 text-[11px] text-slate-500 space-y-0.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>📏 কামিজ: {p.kameez_length}</div>
                    <div>👗 সেলোয়ার: {p.salwar_length}</div>
                    <div>🧣 ওড়না: {p.orna_length}</div>
                  </div>
                </div>

                {/* Stock Quick Adjustment & Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500 font-medium">স্টক:</span>
                    <button
                      onClick={() => handleUpdateStock(p.product_id, p.stock - 1)}
                      disabled={p.stock <= 0 || updatingId === p.product_id}
                      className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="w-7 text-center font-bold text-xs text-slate-800 font-mono">
                      {p.stock}
                    </span>
                    <button
                      onClick={() => handleUpdateStock(p.product_id, p.stock + 1)}
                      disabled={updatingId === p.product_id}
                      className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingProduct(p);
                        setIsAddModalOpen(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.product_id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">কোনো প্রোডাক্ট খুঁজে পাওয়া যায়নি</p>
          <p className="text-xs text-slate-400 mt-1">অনুসন্ধান ফিল্টার পরিবর্তন করুন অথবা নতুন প্রোডাক্ট যুক্ত করুন।</p>
        </div>
      )}

      {/* Add / Edit Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        editProduct={editingProduct}
        onProductAdded={() => {
          onRefresh();
          setIsAddModalOpen(false);
        }}
      />
    </div>
  );
};
