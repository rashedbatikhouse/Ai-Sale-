import React, { useState } from 'react';
import { Users, Phone, MapPin, Search, ShoppingBag, Calendar, CheckCircle2 } from 'lucide-react';
import { Customer } from '../types';

interface CustomersViewProps {
  customers: Customer[];
}

export const CustomersView: React.FC<CustomersViewProps> = ({ customers }) => {
  const [search, setSearch] = useState('');

  const filtered = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.district.toLowerCase().includes(q) ||
      c.full_address.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">কাস্টমার ডিরেক্টরি (Customer Directory)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            মেসেঞ্জারে অর্ডারকারী কাস্টমারদের প্রোফাইল, অর্ডার সংখ্যা ও ক্রয় সংক্রান্ত বিবরণ
          </p>
        </div>

        <div className="text-xs text-slate-600 font-semibold bg-slate-100 px-3 py-1.5 rounded-xl">
          মোট কাস্টমার: {customers.length} জন
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="কাস্টমারের নাম, মোবাইল নম্বর বা জেলা দিয়ে খুঁজুন..."
          className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 shadow-2xs"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">কাস্টমার আইডি ও নাম</th>
                <th className="py-3 px-4">মোবাইল নম্বর</th>
                <th className="py-3 px-4">ঠিকানা ও জেলা</th>
                <th className="py-3 px-4 text-center">মোট অর্ডার</th>
                <th className="py-3 px-4 text-right">সর্বমোট কেনাকাটা</th>
                <th className="py-3 px-4 text-right">সর্বশেষ অর্ডারের সময়</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 text-sm">{c.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{c.id}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-indigo-700 font-mono font-medium">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <a href={`tel:${c.phone}`} className="hover:underline">
                        {c.phone}
                      </a>
                    </div>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="font-medium text-slate-800 line-clamp-1">{c.district}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{c.full_address}</div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                      {c.total_orders}টি
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 text-sm">
                    ৳{c.total_spent?.toLocaleString() ?? 0}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500 text-[11px]">
                    {c.last_order_at ? new Date(c.last_order_at).toLocaleDateString('bn-BD') : 'নেই'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">কোনো কাস্টমার পাওয়া যায়নি</p>
          </div>
        )}
      </div>
    </div>
  );
};
