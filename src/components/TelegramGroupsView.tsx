import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  ShoppingBag,
  Package,
  ShieldCheck,
  ShieldAlert,
  Bot,
  User,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  HelpCircle,
  Search,
  PlusCircle,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { TelegramGroupMessage, TelegramAdmin, OrderStatus, Product } from '../types';

interface TelegramGroupsViewProps {
  products: Product[];
  onOrderUpdated?: () => void;
}

export const TelegramGroupsView: React.FC<TelegramGroupsViewProps> = ({ products, onOrderUpdated }) => {
  const [activeGroup, setActiveGroup] = useState<'product' | 'order'>('order');
  const [messages, setMessages] = useState<TelegramGroupMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Identity simulation for Telegram User Authorization
  const [currentAdmin, setCurrentAdmin] = useState<{ id: string; name: string; isAuthorized: boolean }>({
    id: '184920491',
    name: 'রাশেদ খান (Shop Owner)',
    isAuthorized: true,
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  const productGroupId = '-1002489102381';
  const orderGroupId = '-1002938102947';
  const currentGroupId = activeGroup === 'product' ? productGroupId : orderGroupId;

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 4000);
    return () => clearInterval(interval);
  }, [activeGroup]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const loadMessages = async () => {
    try {
      const res = await fetch(`/api/telegram/messages?group_id=${currentGroupId}`);
      if (res.ok) {
        const data: TelegramGroupMessage[] = await res.json();
        // Backend returns in reverse (latest first), reverse for chronological display
        setMessages(data.slice().reverse());
      }
    } catch (err) {
      console.error('Failed to load telegram messages:', err);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/telegram/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group_id: currentGroupId,
          user_id: currentAdmin.id,
          user_name: currentAdmin.name,
          text: text,
        }),
      });
      await res.json();
      await loadMessages();
      if (onOrderUpdated) onOrderUpdated();
    } catch (err) {
      console.error('Telegram send error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCallbackQuery = async (callbackData: string) => {
    setIsLoading(true);
    setActionFeedback(null);
    try {
      const res = await fetch('/api/telegram/callback-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_data: callbackData,
          user_id: currentAdmin.id,
          user_name: currentAdmin.name,
        }),
      });
      const data = await res.json();
      setActionFeedback(data.message);
      await loadMessages();
      if (onOrderUpdated) onOrderUpdated();
    } catch (err) {
      console.error('Callback error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'bg-amber-100', text: 'text-amber-800' },
    confirmed: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
    processing: { bg: 'bg-blue-100', text: 'text-blue-800' },
    packed: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    shipped: { bg: 'bg-purple-100', text: 'text-purple-800' },
    delivered: { bg: 'bg-green-100', text: 'text-green-800' },
    cancelled: { bg: 'bg-rose-100', text: 'text-rose-800' },
  };

  return (
    <div className="space-y-6">
      {/* Header & Group Switcher */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Telegram Bot API 7.0 Group Runner
              </span>
              <span className="text-xs text-slate-400 font-mono">BatikSalesAgentBot</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">টেলিগ্রাম টু-গ্রুপ অটোমেশন সিস্টেম</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              PRD অনুযায়ী সিস্টেমটিতে দুটি আলাদা টেলিগ্রাম গ্রুপ রয়েছে — একটি প্রোডাক্ট পরিচালনার জন্য এবং অপরটি কনফার্ম হওয়া অর্ডারের জন্য।
            </p>
          </div>

          {/* User Identity Switcher (To test Authorization) */}
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between gap-3 text-xs mb-1.5">
              <span className="text-slate-400 font-medium">সিমুলেটেড ইউজার রোল:</span>
              {currentAdmin.isAuthorized ? (
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Authorized Admin</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-rose-400 font-semibold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Unauthorized Member</span>
                </span>
              )}
            </div>
            <select
              value={currentAdmin.id}
              onChange={(e) => {
                if (e.target.value === '184920491') {
                  setCurrentAdmin({ id: '184920491', name: 'রাশেদ খান (Shop Owner)', isAuthorized: true });
                } else if (e.target.value === '928174012') {
                  setCurrentAdmin({ id: '928174012', name: 'তানভীর আহমেদ (Product Ops)', isAuthorized: true });
                } else {
                  setCurrentAdmin({ id: '777888999', name: 'অপরিচিত মেম্বার (Unauthorized)', isAuthorized: false });
                }
              }}
              className="w-full bg-slate-950 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500"
            >
              <option value="184920491">রাশেদ খান (Super Admin — ID: 184920491)</option>
              <option value="928174012">তানভীর আহমেদ (Product Ops Admin — ID: 928174012)</option>
              <option value="777888999">অপরিচিত ইউজার (Guest / Unauthorized — ID: 777888999)</option>
            </select>
          </div>
        </div>

        {/* Group Tab Switcher */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveGroup('order')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
              activeGroup === 'order'
                ? 'bg-sky-500 text-slate-950 shadow-md scale-[1.01]'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Group 2: Order Notification Group</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-900/30 font-bold">
              Confirmed Orders
            </span>
          </button>

          <button
            onClick={() => setActiveGroup('product')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
              activeGroup === 'product'
                ? 'bg-sky-500 text-slate-950 shadow-md scale-[1.01]'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Group 1: Product Management Group</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-900/30 font-bold">
              Admin Commands
            </span>
          </button>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-emerald-700 hover:text-emerald-950 text-xs font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Telegram Chat Container */}
      <div className="bg-slate-100 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[700px] overflow-hidden">
        {/* Telegram Chat Header */}
        <div className="bg-slate-800 px-4 py-3 text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sky-500 flex items-center justify-center font-bold text-slate-950">
              {activeGroup === 'order' ? <Package className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">
                  {activeGroup === 'order'
                    ? 'Batik Shopping — Order Notification Group'
                    : 'Batik Shopping — Product Management Group'}
                </h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-700 text-slate-300 font-mono">
                  {currentGroupId}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {activeGroup === 'order'
                  ? 'স্বয়ংক্রিয় অর্ডার কার্ড ও সরাসরি স্ট্যাটাস পরিবর্তন'
                  : 'প্রোডাক্ট অ্যাড, স্টক ও মূল্য পরিচালনা'}
              </p>
            </div>
          </div>

          <button
            onClick={loadMessages}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            title="Refresh group messages"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Telegram Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0f172a]/5">
          {messages.map((msg) => {
            const isBot = msg.sender_id === 'SYSTEM_BOT';

            return (
              <div key={msg.id} className="flex flex-col space-y-1">
                {/* Sender Name */}
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 px-1">
                  <span>{msg.sender_name}</span>
                  {msg.is_admin && (
                    <span className="text-[9px] px-1 bg-sky-100 text-sky-800 rounded font-normal">
                      Admin
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 ml-auto">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Message Body */}
                <div className="bg-white rounded-2xl rounded-tl-xs p-4 shadow-xs border border-slate-200/80 max-w-[90%] sm:max-w-[80%] text-sm">
                  {/* If this is an Order Notification Card */}
                  {msg.order_card && (
                    <div className="space-y-3">
                      {/* Product Image */}
                      {msg.order_card.items[0]?.image_url && (
                        <div className="rounded-xl overflow-hidden border border-slate-200 max-h-56 bg-slate-100">
                          <img
                            src={msg.order_card.items[0].image_url}
                            alt="Order Product"
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      )}

                      {/* Status Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="font-bold text-indigo-700 font-mono text-sm">
                          Order ID: {msg.order_card.order_code}
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                            statusColors[msg.order_card.status]?.bg || 'bg-slate-100'
                          } ${statusColors[msg.order_card.status]?.text || 'text-slate-800'}`}
                        >
                          {msg.order_card.status}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Formatted Text */}
                  <div className="whitespace-pre-line text-slate-800 mt-2 font-mono text-xs leading-relaxed">
                    {msg.text}
                  </div>

                  {/* Interactive Telegram Inline Buttons (PRD Section 16) */}
                  {msg.buttons && msg.buttons.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="text-[11px] font-semibold text-slate-500 mb-2">
                        Telegram Inline Action Buttons:
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {msg.buttons.map((btn, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleCallbackQuery(btn.callback_data)}
                            disabled={isLoading}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all text-center disabled:opacity-50"
                          >
                            {btn.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Admin Action Chips */}
        <div className="p-2.5 bg-slate-200/70 border-t border-slate-200 overflow-x-auto flex gap-2">
          {activeGroup === 'product' ? (
            <>
              <button
                onClick={() => handleSendMessage('/products')}
                className="px-3 py-1 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-800 rounded-lg text-xs font-mono font-medium border border-slate-300"
              >
                /products
              </button>
              <button
                onClick={() => handleSendMessage('/stock BATIK-101 40')}
                className="px-3 py-1 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-800 rounded-lg text-xs font-mono font-medium border border-slate-300"
              >
                /stock BATIK-101 40
              </button>
              <button
                onClick={() => handleSendMessage('/price BATIK-101 1300 1150')}
                className="px-3 py-1 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-800 rounded-lg text-xs font-mono font-medium border border-slate-300"
              >
                /price BATIK-101 1300 1150
              </button>
              <button
                onClick={() => handleSendMessage('/search সুতি')}
                className="px-3 py-1 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-800 rounded-lg text-xs font-mono font-medium border border-slate-300"
              >
                /search সুতি
              </button>
              <button
                onClick={() =>
                  handleSendMessage(
                    '/addproduct কাশ্মীরি বাটিক সিল্ক ড্রেস | 1950 | 1750 | রয়্যাল ব্লু, মেরুন | 25 | পিওর কাশ্মীরি সিল্ক | প্রিমিয়াম কোয়ালিটি'
                  )
                }
                className="px-3 py-1 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-800 rounded-lg text-xs font-mono font-medium border border-slate-300"
              >
                /addproduct (Sample)
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleSendMessage('/help')}
                className="px-3 py-1 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-800 rounded-lg text-xs font-mono font-medium border border-slate-300"
              >
                /help
              </button>
              <span className="text-xs text-slate-500 py-1 px-2">
                টিপস: নতুন অর্ডার আসলে নিচে অটোমেটিক নোটিফিকেশন আসবে। স্ট্যাটাস বাটন চাপলে লাইভ ডাটাবেজ আপডেট হবে।
              </span>
            </>
          )}
        </div>

        {/* Telegram Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              activeGroup === 'product'
                ? 'কমান্ড লিখুন (যেমন: /products, /stock BATIK-101 20, /addproduct)...'
                : 'অর্ডার গ্রুপে অ্যাডমিন নোট বা মেসেজ লিখুন...'
            }
            className="flex-1 px-4 py-2.5 text-xs font-mono bg-slate-100 border border-transparent focus:border-sky-500 focus:bg-white rounded-xl outline-hidden transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold rounded-xl text-xs shadow-xs disabled:opacity-40 transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>পাঠান</span>
          </button>
        </form>
      </div>
    </div>
  );
};
