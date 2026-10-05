import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  MapPin,
  Calendar,
  Send,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  XCircle,
  RotateCcw,
  Printer,
  History,
  AlertCircle,
} from 'lucide-react';
import { Order, OrderStatus, OrderStatusHistory } from '../types';

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  onStatusUpdated: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  onClose,
  onStatusUpdated,
}) => {
  const [history, setHistory] = useState<OrderStatusHistory[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [note, setNote] = useState('');
  const [dispatchFeedback, setDispatchFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (order) {
      loadHistory();
    }
  }, [order]);

  if (!order) return null;

  const loadHistory = async () => {
    try {
      const res = await fetch(`/api/orders/${order.id}/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to load order history:', err);
    }
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          changed_by: 'Admin Dashboard',
          source: 'admin_dashboard',
          note: note.trim() || `Status updated to ${newStatus}`,
        }),
      });
      if (res.ok) {
        setNote('');
        await loadHistory();
        onStatusUpdated();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDispatchTelegram = async () => {
    try {
      const res = await fetch(`/api/orders/${order.id}/dispatch-telegram`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setDispatchFeedback('টেলিগ্রাম Group 2-এ অর্ডার কার্ড সফলভাবে পাঠানো হয়েছে!');
        onStatusUpdated();
        setTimeout(() => setDispatchFeedback(null), 4000);
      }
    } catch (err) {
      console.error('Telegram dispatch error:', err);
    }
  };

  const statusOptions: Array<{ id: OrderStatus; label: string; icon: any; color: string }> = [
    { id: 'confirmed', label: 'Confirmed', icon: CheckCircle2, color: 'hover:bg-emerald-50 hover:text-emerald-700' },
    { id: 'processing', label: 'Processing', icon: Clock, color: 'hover:bg-blue-50 hover:text-blue-700' },
    { id: 'packed', label: 'Packed', icon: Package, color: 'hover:bg-indigo-50 hover:text-indigo-700' },
    { id: 'shipped', label: 'Shipped', icon: Truck, color: 'hover:bg-purple-50 hover:text-purple-700' },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle2, color: 'hover:bg-green-50 hover:text-green-700' },
    { id: 'cancelled', label: 'Cancel', icon: XCircle, color: 'hover:bg-rose-50 hover:text-rose-700' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 overflow-hidden border border-slate-200 animate-scaleUp">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-amber-400">
                {order.order_code}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-white">
                {order.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-light mt-0.5">
              অর্ডারের সময়: {new Date(order.created_at).toLocaleString('bn-BD')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              title="Print Order Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {dispatchFeedback && (
          <div className="bg-emerald-50 text-emerald-800 px-6 py-2.5 text-xs font-semibold flex items-center gap-2 border-b border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{dispatchFeedback}</span>
          </div>
        )}

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-sm">
          {/* Quick Status Bar Switcher */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700 block mb-2">
              স্ট্যাটাস পরিবর্তন করুন (Telegram Group 2 ও Database সিঙ্ক হবে):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5">
              {statusOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleStatusChange(opt.id)}
                  disabled={isUpdating || order.status === opt.id}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center flex items-center justify-center gap-1 ${
                    order.status === opt.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : `bg-white border-slate-200 text-slate-700 ${opt.color}`
                  } disabled:opacity-50`}
                >
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-2.5 flex items-center gap-2">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="স্ট্যাটাস পরিবর্তনের নোট (ঐচ্ছিক)..."
                className="flex-1 text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleDispatchTelegram}
                className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>টেলিগ্রামে পাঠান</span>
              </button>
            </div>
          </div>

          {/* Customer & Address Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                কাস্টমার তথ্য
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="font-semibold text-sm text-slate-900">{order.customer_name}</div>
                <div className="flex items-center gap-1.5 text-indigo-600 font-mono font-medium">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`tel:${order.customer_phone}`} className="hover:underline">
                    {order.customer_phone}
                  </a>
                </div>
                {order.alt_phone && (
                  <div className="text-slate-500">বিকল্প নম্বর: {order.alt_phone}</div>
                )}
                {order.delivery_note && (
                  <div className="p-2 bg-amber-50 rounded text-amber-900 border border-amber-200 mt-2">
                    <strong>নোট:</strong> {order.delivery_note}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                ডেলিভারি ঠিকানা
              </div>
              <div className="space-y-1 text-xs text-slate-700">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                  <span className="font-medium text-slate-900">{order.full_address}</span>
                </div>
                <div className="text-slate-500 pl-5">
                  এলাকা: {order.area} • থানা: {order.thana}
                </div>
                <div className="text-slate-600 pl-5 font-semibold">
                  জেলা: {order.district}
                </div>
              </div>
            </div>
          </div>

          {/* Ordered Items Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              অর্ডারকৃত প্রোডাক্ট আইটেমসমূহ
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">প্রোডাক্ট</th>
                    <th className="py-2.5 px-3">কালার</th>
                    <th className="py-2.5 px-3">পরিমাণ</th>
                    <th className="py-2.5 px-3">একক মূল্য</th>
                    <th className="py-2.5 px-3 text-right">মোট</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.product_name}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                            />
                          )}
                          <span className="font-semibold text-slate-900">{item.product_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">{item.color}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{item.quantity} পিস</td>
                      <td className="py-3 px-3 text-slate-600">৳{item.unit_price}</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">৳{item.total_price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Financial Calculation */}
              <div className="bg-slate-50 p-4 border-t border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>সাবটোটাল (Subtotal):</span>
                  <span>৳{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>ডেলিভারি চার্জ:</span>
                  <span>৳{order.delivery_charge}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>ডিসকাউন্ট:</span>
                    <span>-৳{order.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>সর্বমোট প্রদেয় (Cash on Delivery):</span>
                  <span className="text-indigo-700 text-base">৳{order.total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline & Audit History */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              <History className="w-3.5 h-3.5" />
              <span>অর্ডার স্ট্যাটাস হিস্ট্রি ও ট্র্যাকিং</span>
            </div>

            <div className="space-y-2">
              {history.map((h) => (
                <div key={h.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 capitalize">
                        {h.previous_status} → {h.new_status}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 text-slate-700 font-mono">
                        {h.source}
                      </span>
                    </div>
                    {h.note && <div className="text-slate-500 mt-0.5 text-[11px]">{h.note}</div>}
                    <div className="text-slate-400 text-[10px] mt-0.5">পরিবর্তনকারী: {h.changed_by}</div>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
