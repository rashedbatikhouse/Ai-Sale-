import React, { useState, useEffect } from 'react';
import {
  Save,
  Sparkles,
  Store,
  Truck,
  Send,
  Facebook,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  Info,
  BookOpen,
  Key,
  HelpCircle,
  Terminal,
  Cpu,
  Download,
} from 'lucide-react';
import {
  BusinessSettings,
  DeliverySettings,
  AISettings,
  TelegramSettings,
  FacebookSettings,
} from '../types';

export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ai' | 'business' | 'delivery' | 'telegram' | 'facebook' | 'guide'>('guide');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [business, setBusiness] = useState<BusinessSettings | null>(null);
  const [delivery, setDelivery] = useState<DeliverySettings | null>(null);
  const [ai, setAi] = useState<AISettings | null>(null);
  const [telegram, setTelegram] = useState<TelegramSettings | null>(null);
  const [facebook, setFacebook] = useState<FacebookSettings | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setBusiness(data.business);
        setDelivery(data.delivery);
        setAi({
          provider: 'gemini',
          model_name: 'gemini-3.8-flash',
          ...data.ai,
        });
        setTelegram(data.telegram);
        setFacebook(data.facebook);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (section: 'business' | 'ai' | 'delivery' | 'telegram' | 'facebook') => {
    setIsSaving(true);
    setSuccessMessage(null);
    try {
      let bodyData: any = {};
      if (section === 'business') bodyData = business;
      if (section === 'ai') bodyData = ai;
      if (section === 'delivery') bodyData = delivery;
      if (section === 'telegram') bodyData = telegram;
      if (section === 'facebook') bodyData = facebook;

      const res = await fetch(`/api/settings/${section}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      if (res.ok) {
        setSuccessMessage('সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (isLoading || !business || !delivery || !ai || !telegram || !facebook) {
    return (
      <div className="p-12 text-center text-slate-500 text-sm">সেটিংস লোড হচ্ছে...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">সিস্টেম কনফিগারেশন ও ওপেন সোর্স কন্ট্রোল</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            অন্য যেকোনো ব্যক্তি বা পেজ তাদের নিজস্ব ফেসবুক পেজ, টেলিগ্রাম গ্রুপ ও পছন্দের AI মডেল দিয়ে সম্পূর্ণ সিস্টেমটি চালাতে পারবে
          </p>
        </div>

        {successMessage && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'guide', label: '📖 ওপেন সোর্স ও সেটআপ গাইড', icon: BookOpen },
          { id: 'ai', label: 'AI এজেন্ট ও মডেল নির্বাচন', icon: Sparkles },
          { id: 'telegram', label: 'টেলিগ্রাম গ্রুপস (২টি)', icon: Send },
          { id: 'facebook', label: 'ফেসবুক মেসেঞ্জার', icon: Facebook },
          { id: 'delivery', label: 'ডেলিভারি চার্জ রুলস', icon: Truck },
          { id: 'business', label: 'বিজনেস নলেজবেজ', icon: Store },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 0: Open Source & Setup Guide */}
      {activeTab === 'guide' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>ওপেন সোর্স গাইড: আপনি ও অন্যরা কীভাবে নিজেদের মতো করে চালাবেন?</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              এই পুরো প্রোজেক্টটি ওপেন সোর্স। আপনি বা যেকেউ তাদের নিজস্ব শপ নেম, নিজস্ব ফেসবুক পেজ, নিজস্ব টেলিগ্রাম গ্রুপ এবং পছন্দের AI মডেল ব্যবহার করে এটি হোস্ট করতে পারবেন।
            </p>
          </div>

          {/* Question 1: Telegram Bot Token */}
          <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-sky-950 font-bold text-sm">
              <Key className="w-4 h-4 text-sky-600" />
              <h4>১. টেলিগ্রাম বটের টোকেন কেন লাগবে? এবং এটি কী?</h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              <strong>টেলিগ্রাম বট টোকেন</strong> হলো টেলিগ্রাম প্ল্যাটফর্মে আপনার তৈরি বটের সিক্রেট চাবি বা পাসওয়ার্ড (যেমন: <code className="bg-sky-100 text-sky-900 px-1 py-0.5 rounded font-mono">7481920491:AAH8j...</code>)।
            </p>
            <div className="text-xs text-slate-700 space-y-1 bg-white p-3 rounded-lg border border-sky-100">
              <p><strong>কেন লাগবে:</strong></p>
              <ul className="list-disc pl-5 space-y-0.5 text-slate-600">
                <li>আমাদের সার্ভার যখন কোনো কাস্টমারের অর্ডার কনফার্ম করে, তখন স্বয়ংক্রিয়ভাবে আপনার টেলিগ্রাম গ্রুপে ফটো ও মেসেজ পাঠাতে টেলিগ্রাম সার্ভারের পারমিশন প্রয়োজন হয়।</li>
                <li>গ্রুপের ভেতরে অ্যাডমিনরা যখন <code className="font-mono text-indigo-600">/stock</code> বা <code className="font-mono text-indigo-600">/price</code> কমান্ড দেবে অথবা স্ট্যাটাস বাটনে ক্লিক করবে, টেলিগ্রাম এই টোকেনের মাধ্যমেই আমাদের সার্ভারকে চিনতে পারে।</li>
              </ul>
              <p className="pt-1.5 text-sky-800">
                <strong>কীভাবে পাবেন:</strong> টেলিগ্রামে <strong>@BotFather</strong> সার্চ করুন → <code className="font-mono font-bold">/newbot</code> লিখে সেন্ড করুন → বটের নাম ও ইউজারনেম দিন → BotFather আপনাকে একটি HTTP API Token প্রদান করবে।
              </p>
            </div>
          </div>

          {/* Question 2: Group ID Finding */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <h4>২. টেলিগ্রাম গ্রুপের আইডি (Group ID) কীভাবে পাবেন?</h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              টেলিগ্রাম গ্রুপের আইডি সবসময় সাধারণত <strong>-100</strong> দিয়ে শুরু হয় (যেমন: <code className="bg-emerald-100 text-emerald-900 px-1 py-0.5 rounded font-mono">-1002489102381</code>)।
            </p>
            <div className="text-xs text-slate-700 space-y-2 bg-white p-3 rounded-lg border border-emerald-100">
              <p><strong>গ্রুপ আইডি বের করার ৩টি সবচেয়ে সহজ উপায়:</strong></p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200">
                  <span className="font-bold text-emerald-900 block mb-1">পদ্ধতি ১: RawDataBot</span>
                  <p className="text-[11px] text-slate-600">
                    আপনার তৈরি টেলিগ্রাম গ্রুপে <strong>@RawDataBot</strong> অ্যাড করুন। বটটি সাথে সাথে গ্রুপের পুরো JSON ডাটা দেবে, সেখানে <code className="font-mono text-emerald-700 font-bold">"id": -100xxxxxxxxxx</code> দেখতে পাবেন। আইডি নেওয়ার পর বটটিকে রিমুভ করে দিন।
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200">
                  <span className="font-bold text-emerald-900 block mb-1">পদ্ধতি ২: Telegram Web</span>
                  <p className="text-[11px] text-slate-600">
                    কম্পিউটারে <strong>web.telegram.org</strong> এ লগইন করে আপনার গ্রুপটি ওপেন করুন। ব্রাউজারের অ্যাড্রেস বারের URL-এ লক্ষ্য করলে দেখতে পাবেন: <code className="font-mono text-emerald-700">web.telegram.org/a/#-100xxxxxxxxxx</code>। এই সংখ্যাটিই গ্রুপ আইডি।
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200">
                  <span className="font-bold text-emerald-900 block mb-1">পদ্ধতি ৩: Message Forward</span>
                  <p className="text-[11px] text-slate-600">
                    গ্রুপের যেকোনো একটি মেসেজ কপি বা ফরোয়ার্ড করে <strong>@getidsbot</strong> বা <strong>@myidbot</strong> এ সেন্ড করলে সে স্বয়ংক্রিয়ভাবে Forwarded Chat ID জানিয়ে দেয়।
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-emerald-800 font-semibold pt-1">
                ⚠️ মনে রাখবেন: গ্রুপে আপনার তৈরি করা বটটিকে <strong>Administrator</strong> হিসেবে যোগ করতে হবে যাতে সে মেসেজ পোস্ট করতে পারে।
              </p>
            </div>
          </div>

          {/* Question 3: Multi-LLM Support */}
          <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-purple-950 font-bold text-sm">
              <Cpu className="w-4 h-4 text-purple-600" />
              <h4>৩. গুগলের জেমিনাই (Gemini) ছাড়া অন্য যেকোনো AI / LLM ব্যবহার করার উপায়</h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              <strong>হ্যাঁ, শতভাগ পারবেন!</strong> এই সিস্টেমে আমরা ওপেন আর্কিটেকচার যুক্ত করেছি। আপনি চাইলে:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 bg-white border border-purple-200 rounded-lg">
                <span className="font-bold text-purple-900 block">Google Gemini</span>
                <span className="text-[11px] text-slate-500">ডিফল্ট হাই-স্পিড বাংলা মডেল (gemini-3.8-flash)</span>
              </div>
              <div className="p-2.5 bg-white border border-purple-200 rounded-lg">
                <span className="font-bold text-purple-900 block">DeepSeek-V3 / Chat</span>
                <span className="text-[11px] text-slate-500">অত্যন্ত কম খরচে অসাধারণ বাংলা বোঝে</span>
              </div>
              <div className="p-2.5 bg-white border border-purple-200 rounded-lg">
                <span className="font-bold text-purple-900 block">OpenAI GPT-4o mini</span>
                <span className="text-[11px] text-slate-500">বিশ্বমানের ফাংশন কলিং ও নির্ভরযোগ্যতা</span>
              </div>
              <div className="p-2.5 bg-white border border-purple-200 rounded-lg">
                <span className="font-bold text-purple-900 block">Groq / LLaMA 3.3</span>
                <span className="text-[11px] text-slate-500">মিলিসেকেন্ডে সুপারফাস্ট রেসপন্স</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 pt-1">
              আপনি পাশের <strong>"AI এজেন্ট ও মডেল নির্বাচন"</strong> ট্যাবে গিয়ে সরাসরি <strong>OpenAI-Compatible</strong> প্রোভাইডার নির্বাচন করে যেকোনো মডেলের API Key ও Base URL বসিয়ে ব্যবহার করতে পারবেন।
            </p>
          </div>

          {/* Question 4: Self-Hosting for Others */}
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-sky-400">
              <Terminal className="w-4 h-4" />
              <h4>৪. অন্য কেউ নিজের সার্ভারে কীভাবে এটি চালাবে? (Open Source Self-Hosting)</h4>
            </div>
            <p className="text-xs text-slate-300">
              যেকেউ এই কোডবেস ডাউনলোড করে নিজের সার্ভারে (VPS, DigitalOcean, Hetzner, cPanel বা Render/Railway) চালাতে পারেন:
            </p>
            <div className="bg-slate-950 p-3 rounded-lg text-emerald-300 font-mono text-xs space-y-1">
              <div># ১. প্যাকেজ ইনস্টল করুন</div>
              <div className="text-white">npm install</div>
              <div className="pt-1.5"># ২. প্রোডাকশন বিল্ড তৈরি করুন</div>
              <div className="text-white">npm run build</div>
              <div className="pt-1.5"># ৩. লাইভ সার্ভার রান করুন</div>
              <div className="text-white">npm start</div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800">
              <span className="text-xs text-slate-300">
                গিটহাবে পুশ করতে কোনো সমস্যা হলে সরাসরি সম্পূর্ণ প্রোজেক্টের ZIP ডাউনলোড করে নিন:
              </span>
              <a
                href="/api/download-zip"
                download="batik-shopping-ai.zip"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>সম্পূর্ণ প্রোজেক্ট ZIP ডাউনলোড করুন</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: AI Settings with Provider Switching */}
      {activeTab === 'ai' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">AI সেলস এজেন্ট ও মডেল প্রোভাইডার নির্বাচন</h3>
              <p className="text-xs text-slate-500">
                Google Gemini অথবা যেকোনো OpenAI-Compatible মডেল (DeepSeek, GPT-4o, Groq, LLaMA) নির্বাচন করুন
              </p>
            </div>
            <button
              onClick={() => handleSave('ai')}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'সংরক্ষণ...' : 'সেভ করুন'}</span>
            </button>
          </div>

          {/* Provider Selection */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <label className="block text-xs font-bold text-slate-800">
              AI ইঞ্জিন প্রোভাইডার (Select AI Provider)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  ai.provider === 'gemini'
                    ? 'bg-indigo-50/70 border-indigo-500 text-indigo-950'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="ai_provider"
                  value="gemini"
                  checked={ai.provider === 'gemini'}
                  onChange={() => setAi({ ...ai, provider: 'gemini', model_name: 'gemini-3.8-flash' })}
                  className="text-indigo-600"
                />
                <div>
                  <div className="font-bold text-xs">Google Gemini API (ডিফল্ট ও প্রস্তাবিত)</div>
                  <div className="text-[11px] text-slate-500">models/gemini-3.8-flash (সুপারফাস্ট বাংলা)</div>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  ai.provider === 'openai_compatible'
                    ? 'bg-indigo-50/70 border-indigo-500 text-indigo-950'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="ai_provider"
                  value="openai_compatible"
                  checked={ai.provider === 'openai_compatible'}
                  onChange={() => setAi({ ...ai, provider: 'openai_compatible', model_name: 'gpt-4o-mini' })}
                  className="text-indigo-600"
                />
                <div>
                  <div className="font-bold text-xs">OpenAI Compatible (DeepSeek / OpenAI / Groq)</div>
                  <div className="text-[11px] text-slate-500">যেকোনো থার্ড-পার্টি বা লোকাল LLM API</div>
                </div>
              </label>
            </div>
          </div>

          {/* Conditional inputs for OpenAI Compatible */}
          {ai.provider === 'openai_compatible' && (
            <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl space-y-4">
              <div className="text-xs font-bold text-purple-950">
                OpenAI-Compatible এন্ডপয়েন্ট ও ক্রেডেনশিয়ালস
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    API Base URL
                  </label>
                  <input
                    type="text"
                    value={ai.base_url || 'https://api.openai.com/v1'}
                    onChange={(e) => setAi({ ...ai, base_url: e.target.value })}
                    placeholder="যেমন: https://api.deepseek.com/v1 বা https://api.openai.com/v1"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    DeepSeek: https://api.deepseek.com/v1 | Groq: https://api.groq.com/openai/v1
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={ai.api_key || ''}
                    onChange={(e) => setAi({ ...ai, api_key: e.target.value })}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  মডেলের নাম (Model Name)
                </label>
                <input
                  type="text"
                  value={ai.model_name}
                  onChange={(e) => setAi({ ...ai, model_name: e.target.value })}
                  placeholder="deepseek-chat বা gpt-4o-mini বা llama-3.3-70b-versatile"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                মডেলের নাম (Current Model)
              </label>
              <input
                type="text"
                value={ai.model_name}
                disabled={ai.provider === 'gemini'}
                onChange={(e) => setAi({ ...ai, model_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                কথোপকথনের ভাষা ও টোন
              </label>
              <select
                value={ai.communication_style}
                onChange={(e) => setAi({ ...ai, communication_style: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-indigo-500 bg-white"
              >
                <option value="friendly_natural_bangla">
                  স্বাভাবিক ও অমায়িক প্রমিত বাংলা (Friendly Natural Bangla)
                </option>
                <option value="professional_bangla">মার্জিত ব্যবসায়িক বাংলা (Professional Bangla)</option>
                <option value="banglish">বাংলিশ ও বাংলা মিশ্রিত (Banglish Friendly)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              AI Sales Agent System Prompt & Rules
            </label>
            <textarea
              rows={8}
              value={ai.system_prompt}
              onChange={(e) => setAi({ ...ai, system_prompt: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Tab 2: Telegram Groups Settings */}
      {activeTab === 'telegram' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">টেলিগ্রাম টু-গ্রুপ ইন্টিগ্রেশন সেটিংস</h3>
              <p className="text-xs text-slate-500">
                PRD Section 4 & 24 অনুযায়ী দুটি আলাদা গ্রুপের আইডি ও অথোরাইজড অ্যাডমিন কনফিগারেশন
              </p>
            </div>
            <button
              onClick={() => handleSave('telegram')}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'সংরক্ষণ...' : 'সেভ করুন'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Telegram Bot Token (BotFather থেকে প্রাপ্ত)
              </label>
              <input
                type="password"
                value={telegram.bot_token}
                onChange={(e) => setTelegram({ ...telegram, bot_token: e.target.value })}
                placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                @BotFather এ /newbot লিখে টোকেনটি সংগ্রহ করুন
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Authorized Admin Telegram User IDs
              </label>
              <input
                type="text"
                value={telegram.authorized_admin_ids}
                onChange={(e) => setTelegram({ ...telegram, authorized_admin_ids: e.target.value })}
                placeholder="184920491, 928174012"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                কমা (,) দিয়ে আলাদা করুন। শুধুমাত্র এই ব্যক্তিরাই গ্রুপের কমান্ড ও বোতাম ব্যবহার করতে পারবে।
              </span>
            </div>
          </div>

          {/* Dual Group IDs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200">
              <div className="text-xs font-bold text-sky-950 mb-1">
                Group 1: Product Management Group ID
              </div>
              <input
                type="text"
                value={telegram.product_group_id}
                onChange={(e) => setTelegram({ ...telegram, product_group_id: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-sky-300 rounded-lg text-xs font-mono text-slate-800"
              />
              <p className="text-[11px] text-sky-800 mt-1.5">
                এই গ্রুপে অ্যাডমিনরা /addproduct, /stock, /price কমান্ড দিয়ে ইনভেন্টরি পরিচালনা করবে।
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <div className="text-xs font-bold text-emerald-950 mb-1">
                Group 2: Order Notification Group ID
              </div>
              <input
                type="text"
                value={telegram.order_group_id}
                onChange={(e) => setTelegram({ ...telegram, order_group_id: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-xs font-mono text-slate-800"
              />
              <p className="text-[11px] text-emerald-800 mt-1.5">
                এই গ্রুপে কনফার্মড অর্ডারের ছবি, কাস্টমার এড্রেস ও ইন্টারেক্টিভ স্ট্যাটাস বাটন স্বয়ংক্রিয়ভাবে আসবে।
              </p>
            </div>
          </div>

          {/* Webhook Endpoint Info */}
          <div className="p-4 bg-slate-900 text-white rounded-xl text-xs">
            <div className="font-bold text-sky-400 mb-1 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" />
              <span>Telegram Bot Webhook Endpoint URL</span>
            </div>
            <div className="flex items-center justify-between bg-slate-950 p-2 rounded-lg font-mono text-[11px] text-emerald-300 mt-1.5">
              <span>{`${window.location.origin}/api/webhook/telegram`}</span>
              <button
                onClick={() => copyToClipboard(`${window.location.origin}/api/webhook/telegram`, 'tg_webhook')}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] transition-colors"
              >
                {copiedKey === 'tg_webhook' ? 'কপি হয়েছে!' : 'কপি করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Facebook Messenger Settings */}
      {activeTab === 'facebook' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">ফেসবুক মেসেঞ্জার ওয়েবহুক ও গ্রাফ এপিআই</h3>
              <p className="text-xs text-slate-500">
                Meta Developer App থেকে ফেসবুক পেজের মেসেজ স্বয়ংক্রিয়ভাবে রিসিভ করার কনফিগারেশন
              </p>
            </div>
            <button
              onClick={() => handleSave('facebook')}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'সংরক্ষণ...' : 'সেভ করুন'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Facebook Page ID
              </label>
              <input
                type="text"
                value={facebook.page_id}
                onChange={(e) => setFacebook({ ...facebook, page_id: e.target.value })}
                placeholder="109876543210"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Webhook Verify Token
              </label>
              <input
                type="text"
                value={facebook.verify_token}
                onChange={(e) => setFacebook({ ...facebook, verify_token: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Page Access Token
            </label>
            <textarea
              rows={2}
              value={facebook.access_token}
              onChange={(e) => setFacebook({ ...facebook, access_token: e.target.value })}
              placeholder="EAAB..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-3">
            <div className="font-bold text-blue-950 flex items-center gap-1.5">
              <Facebook className="w-4 h-4 text-blue-600" />
              <span>Meta App Webhook Setup Details:</span>
            </div>

            <div>
              <div className="text-slate-600 mb-1">Callback URL (Meta Webhook এ পেস্ট করুন):</div>
              <div className="flex items-center justify-between bg-white border border-blue-200 p-2 rounded-lg font-mono text-[11px] text-blue-900">
                <span>{`${window.location.origin}/api/webhook/facebook`}</span>
                <button
                  onClick={() => copyToClipboard(`${window.location.origin}/api/webhook/facebook`, 'fb_webhook')}
                  className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] transition-colors"
                >
                  {copiedKey === 'fb_webhook' ? 'কপি হয়েছে!' : 'কপি করুন'}
                </button>
              </div>
            </div>

            <div>
              <div className="text-slate-600 mb-1">Verify Token:</div>
              <div className="flex items-center justify-between bg-white border border-blue-200 p-2 rounded-lg font-mono text-[11px] text-blue-900">
                <span>{facebook.verify_token}</span>
                <button
                  onClick={() => copyToClipboard(facebook.verify_token, 'fb_verify')}
                  className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] transition-colors"
                >
                  {copiedKey === 'fb_verify' ? 'কপি হয়েছে!' : 'কপি করুন'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Delivery Settings */}
      {activeTab === 'delivery' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">ডেলিভারি চার্জ ও এরিয়া রুলস</h3>
              <p className="text-xs text-slate-500">
                জেলা ও থানার ভিত্তিতে স্বয়ংক্রিয়ভাবে ডেলিভারি চার্জ নির্ধারণ হবে
              </p>
            </div>
            <button
              onClick={() => handleSave('delivery')}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'সংরক্ষণ...' : 'সেভ করুন'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ঢাকা সিটির ভেতরে (৳)
              </label>
              <input
                type="number"
                value={delivery.inside_dhaka_fee}
                onChange={(e) => setDelivery({ ...delivery, inside_dhaka_fee: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                আনুমানিক সময়: {delivery.estimated_dhaka_days}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                সাভার / গাজীপুর / শহরতলী (৳)
              </label>
              <input
                type="number"
                value={delivery.sub_dhaka_fee}
                onChange={(e) => setDelivery({ ...delivery, sub_dhaka_fee: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                সাভার, আশুলিয়া, গাজীপুর, কেরানীগঞ্জ
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ঢাকার বাইরে সারা বাংলাদেশ (৳)
              </label>
              <input
                type="number"
                value={delivery.outside_dhaka_fee}
                onChange={(e) => setDelivery({ ...delivery, outside_dhaka_fee: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                আনুমানিক সময়: {delivery.estimated_outside_days}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Business Knowledge Base */}
      {activeTab === 'business' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">বিজনেস নলেজ বেজ (Knowledge Base)</h3>
              <p className="text-xs text-slate-500">
                সাধারণ কাস্টমার প্রশ্নের উত্তর AI এখান থেকেই সংগ্রহ করবে
              </p>
            </div>
            <button
              onClick={() => handleSave('business')}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'সংরক্ষণ...' : 'সেভ করুন'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ব্যবসার নাম (Business Name)
              </label>
              <input
                type="text"
                value={business.business_name}
                onChange={(e) => setBusiness({ ...business, business_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ট্যাগলাইন (Tagline)
              </label>
              <input
                type="text"
                value={business.tagline}
                onChange={(e) => setBusiness({ ...business, tagline: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ব্যবসা পরিচিতি (About Business)
            </label>
            <textarea
              rows={3}
              value={business.about}
              onChange={(e) => setBusiness({ ...business, about: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                রিটার্ন পলিসি (Return Policy)
              </label>
              <textarea
                rows={3}
                value={business.return_policy}
                onChange={(e) => setBusiness({ ...business, return_policy: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                এক্সচেঞ্জ পলিসি (Exchange Policy)
              </label>
              <textarea
                rows={3}
                value={business.exchange_policy}
                onChange={(e) => setBusiness({ ...business, exchange_policy: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              পেমেন্ট মাধ্যম (Payment Methods)
            </label>
            <input
              type="text"
              value={business.payment_methods}
              onChange={(e) => setBusiness({ ...business, payment_methods: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
