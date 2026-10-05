import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  RefreshCcw,
  ShoppingBag,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertCircle,
  Eye,
  ChevronDown,
  UserCheck,
} from 'lucide-react';
import { ChatMessage, Conversation, Product } from '../types';

interface MessengerViewProps {
  products: Product[];
  onOrderCreated?: () => void;
}

export const MessengerView: React.FC<MessengerViewProps> = ({ products, onOrderCreated }) => {
  const [conversationId, setConversationId] = useState<string>(() => {
    return localStorage.getItem('batik_demo_conv_id') || `CONV-DEMO-${Date.now().toString(36)}`;
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHumanHandoff, setIsHumanHandoff] = useState(false);
  const [showToolsDrawer, setShowToolsDrawer] = useState(false);
  const [lastToolCalls, setLastToolCalls] = useState<any[]>([]);
  const [orderDraft, setOrderDraft] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('batik_demo_conv_id', conversationId);
    loadConversation();
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const loadConversation = async () => {
    try {
      const res = await fetch(`/api/chat/conversation/${conversationId}`);
      if (res.ok) {
        const data: Conversation = await res.json();
        setMessages(data.messages || []);
        setIsHumanHandoff(data.is_human_handoff);
        setOrderDraft(data.draft_order || null);

        // If conversation is empty, send initial greeting from AI
        if (!data.messages || data.messages.length === 0) {
          sendInitialGreeting();
        }
      }
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  };

  const sendInitialGreeting = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          text: 'আসসালামু আলাইকুম',
          customer_name: 'কাস্টমার',
        }),
      });
      const data = await res.json();
      if (data.conversation) {
        setMessages(data.conversation.messages || []);
        if (data.agentResult?.toolCallsList) {
          setLastToolCalls(data.agentResult.toolCallsList);
        }
      }
    } catch (err) {
      console.error('Greeting error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || isLoading) return;

    if (!customText) setInputText('');

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      sender: 'customer',
      text: textToSend,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          text: textToSend,
        }),
      });
      const data = await res.json();
      if (data.conversation) {
        setMessages(data.conversation.messages || []);
        setIsHumanHandoff(data.conversation.is_human_handoff);
        setOrderDraft(data.conversation.draft_order || null);

        if (data.agentResult?.toolCallsList) {
          setLastToolCalls(data.agentResult.toolCallsList);
        }

        // Check if an order was created
        if (data.agentResult?.orderSummary?.order_code || data.agentResult?.toolCallsList?.some((t: any) => t.name === 'create_order')) {
          if (onOrderCreated) onOrderCreated();
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleHandoff = async () => {
    try {
      const newStatus = !isHumanHandoff;
      const res = await fetch('/api/chat/handoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          is_human_handoff: newStatus,
          reason: newStatus ? 'Admin manual toggle' : 'Switched back to AI mode',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsHumanHandoff(newStatus);
        loadConversation();
      }
    } catch (err) {
      console.error('Handoff error:', err);
    }
  };

  const handleResetChat = () => {
    const newId = `CONV-DEMO-${Date.now().toString(36)}`;
    setConversationId(newId);
    setMessages([]);
    setOrderDraft(null);
    setLastToolCalls([]);
  };

  const quickPrompts = [
    { label: '💰 দাম ও কালার জিজ্ঞেস করুন', text: 'এই কাপড়ের দাম কত? কোন কোন কালার আছে?' },
    { label: '👗 চুন্দ্রি বাটিক অর্ডার করতে চাই', text: 'আমি প্রিমিয়াম চুন্দ্রি বাটিক থ্রি-পিস অর্ডার করতে চাই, কালার রয়েল ব্লু।' },
    { label: '📍 সাভারের ঠিকানা প্রদান', text: 'নাম: ফাতেমা আক্তার, মোবাইল: 01812345678, জেলা: ঢাকা, থানা: সাভার, এলাকা: আশুলিয়া, সম্পূর্ণ ঠিকানা: বাসা # ৪২, রোড # ৩, আশুলিয়া, সাভার।' },
    { label: '✅ হ্যাঁ, কনফার্ম করুন', text: 'জি, ঠিক আছে। আমার অর্ডারটি কনফার্ম করুন।' },
    { label: '👤 মানুষের সাথে কথা বলব', text: 'আমি একজন মানুষের সাথে কথা বলতে চাই, কাস্টমার কেয়ার প্রতিনিধির সাথে কথা বলিয়ে দিন।' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Messenger Chat Screen */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[750px] overflow-hidden">
        {/* Facebook Page Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/20 p-1 flex items-center justify-center font-bold text-white border-2 border-white/40">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-bold text-sm tracking-tight">Batik Shopping — ঘরোয়া কালেকশন</h2>
                <ShieldCheck className="w-4 h-4 text-sky-200 fill-sky-300" />
              </div>
              <p className="text-[11px] text-blue-100 flex items-center gap-1">
                <span>Facebook Page Messenger Inbox</span>
                <span>•</span>
                <span className="font-semibold text-emerald-300">
                  {isHumanHandoff ? '👤 Human Support Mode' : '🤖 AI Sales Agent Active'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowToolsDrawer(!showToolsDrawer)}
              className="px-2.5 py-1 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-1 transition-colors border border-white/20"
              title="Show controlled tools executed by Gemini"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Brain Inspector</span>
            </button>
            <button
              onClick={handleResetChat}
              className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              title="Start a fresh test conversation"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Human Handoff Banner */}
        {isHumanHandoff && (
          <div className="bg-amber-50 border-b border-amber-200 p-2.5 px-4 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>হিউম্যান সাপোর্ট মোড সক্রিয়:</strong> কাস্টমার মানুষের সহায়তা চেয়েছেন। AI স্বয়ংক্রিয় উত্তর সাময়িকভাবে বন্ধ রয়েছে।
              </span>
            </div>
            <button
              onClick={handleToggleHandoff}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md transition-colors"
            >
              AI মোডে ফিরুন
            </button>
          </div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
          {messages.map((msg) => {
            const isCustomer = msg.sender === 'customer';
            const isSystem = msg.sender === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="bg-slate-200/80 text-slate-700 text-xs px-3 py-1.5 rounded-full font-medium max-w-md text-center">
                    {msg.text}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isCustomer ? 'justify-end' : 'justify-start'}`}
              >
                {!isCustomer && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs mt-1">
                    AI
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-xs ${
                    isCustomer
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                  }`}
                >
                  {/* Attached Product Photo */}
                  {msg.media_url && (
                    <div className="mb-2.5 rounded-xl overflow-hidden border border-slate-200 max-h-48 bg-slate-100">
                      <img
                        src={msg.media_url}
                        alt="Batik Product"
                        className="w-full h-48 object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  )}

                  {/* Message Text with newlines */}
                  <div className="whitespace-pre-line font-normal">{msg.text}</div>

                  {/* If this message contains an order card */}
                  {msg.order_summary && msg.order_summary.order_code && (
                    <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>কনফার্মড অর্ডার: {msg.order_summary.order_code}</span>
                      </div>
                      <div>মোট পরিশোধ: ৳{msg.order_summary.total} (ক্যাশ অন ডেলিভারি)</div>
                      <div className="text-[11px] text-emerald-700 mt-1">
                        স্বয়ংক্রিয়ভাবে টেলিগ্রাম Order Notification Group-এ পাঠানো হয়েছে!
                      </div>
                    </div>
                  )}

                  <div
                    className={`text-[10px] mt-1 text-right ${
                      isCustomer ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {isCustomer && (
                  <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-semibold shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                AI
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-xs text-xs text-slate-500 flex items-center gap-2">
                <span className="flex space-x-1">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></span>
                </span>
                <span>AI সেলস এজেন্ট প্রোডাক্ট ডাটাবেজ যাচাই করে উত্তর তৈরি করছে...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Test Prompt Chips */}
        <div className="p-2.5 bg-slate-100 border-t border-slate-200 overflow-x-auto scrollbar-none flex gap-2">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.text)}
              disabled={isLoading}
              className="px-3 py-1.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 rounded-lg text-xs font-medium whitespace-nowrap transition-all shadow-2xs disabled:opacity-50"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Message Input Box */}
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
              isHumanHandoff
                ? 'হিউম্যান সাপোর্ট মোড চলছে — বার্তা লিখুন...'
                : 'বাংলায় লিখুন (যেমন: এই কাপড়ের দাম কত? বা অর্ডার করতে চাই)...'
            }
            className="flex-1 px-4 py-2.5 text-sm bg-slate-100 border border-transparent focus:border-blue-500 focus:bg-white rounded-xl outline-hidden transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs disabled:opacity-40 transition-colors flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Right 1 Col: AI Brain & Controlled Tools Inspector */}
      <div className="space-y-4">
        {/* Strict PRD Rules Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>PRD Strict AI Sales Rules Enforced</span>
          </div>
          <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-500 font-bold">✓</span>
              <span><strong>No Fabrications:</strong> কখনোই নিজের থেকে দাম, ডিসকাউন্ট, স্টক বা সাইজ বানিয়ে বলে না।</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-500 font-bold">✓</span>
              <span><strong>Controlled Tools Only:</strong> প্রোডাক্ট ডাটাবেজ ছাড়া কোনো তথ্য শেয়ার করে না।</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-500 font-bold">✓</span>
              <span><strong>10-Step Order Rule:</strong> নাম, ফোন, কালার, কোয়ান্টিটি, জেলা, থানা, ফুল এড্রেস এবং সামারি দেখিয়ে কাস্টমারের explicit confirmation ছাড়া অর্ডার কনফার্ম করে না।</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-500 font-bold">✓</span>
              <span><strong>Dual Telegram Dispatch:</strong> অর্ডার কনফার্ম হলেই সাথে সাথে ছবিসহ Group 2-এ পাঠায়।</span>
            </li>
          </ul>
        </div>

        {/* Current Order Draft in Memory */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-slate-900">কাস্টমার কনভারসেশন মেমোরি</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
              {orderDraft ? orderDraft.step : 'idle'}
            </span>
          </div>

          {orderDraft ? (
            <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">প্রোডাক্ট:</span>
                <span className="font-medium text-slate-800">{orderDraft.items?.[0]?.product_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">কালার:</span>
                <span className="font-medium text-slate-800">{orderDraft.items?.[0]?.color || 'Pending'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">পরিমাণ:</span>
                <span className="font-medium text-slate-800">{orderDraft.items?.[0]?.quantity} পিস</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">কাস্টমার:</span>
                <span className="font-medium text-slate-800">{orderDraft.customer_name || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">মোবাইল:</span>
                <span className="font-mono text-slate-800">{orderDraft.phone || 'Pending'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ঠিকানা:</span>
                <span className="font-medium text-slate-800 line-clamp-1">{orderDraft.full_address || 'Pending'}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                <span>সর্বমোট:</span>
                <span>৳{orderDraft.total}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-3 text-center">
              কোনো সক্রিয় অর্ডার ড্রাফট তৈরি হয়নি। কাস্টমার অর্ডার করতে চাইলে AI প্রয়োজনীয় তথ্য ধাপে ধাপে সংগ্রহ করবে।
            </p>
          )}
        </div>

        {/* Controlled Tools Inspector */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-sky-400 font-bold text-sm">
              <Bot className="w-4 h-4" />
              <span>Controlled Tools Invocations</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Backend Gemini SDK</span>
          </div>

          <p className="text-[11px] text-slate-400 mb-3">
            AI শুধুমাত্র নিচের অনুমোদিত টুলগুলো কল করতে পারে:
          </p>

          <div className="space-y-1.5 text-xs font-mono">
            {[
              'search_products()',
              'get_product_details()',
              'check_stock()',
              'calculate_order()',
              'get_customer()',
              'create_order()',
              'send_order_to_telegram_group()',
              'handoff_to_human()',
            ].map((t, idx) => (
              <div key={idx} className="p-1.5 bg-slate-800/80 rounded-md text-slate-300 flex items-center justify-between">
                <span>{t}</span>
                <span className="text-emerald-400 text-[10px]">Controlled</span>
              </div>
            ))}
          </div>

          {lastToolCalls.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-800">
              <div className="text-[11px] font-bold text-amber-400 mb-1">সর্বশেষ এক্সিকিউটেড টুল:</div>
              <pre className="text-[10px] bg-slate-950 p-2.5 rounded-lg overflow-x-auto text-emerald-300 font-mono max-h-36">
                {JSON.stringify(lastToolCalls, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
