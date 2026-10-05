import React from 'react';
import {
  LayoutDashboard,
  MessageCircle,
  Send,
  ShoppingBag,
  Package,
  Users,
  Settings,
  Sparkles,
  RefreshCw,
  Download,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onResetDemo: () => void;
  isResetting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onResetDemo,
  isResetting,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard, badge: null },
    { id: 'messenger', label: 'মেসেঞ্জার AI এজেন্ট', icon: MessageCircle, badge: 'Live AI' },
    { id: 'telegram', label: 'টেলিগ্রাম গ্রুপ হাব', icon: Send, badge: '2 Groups' },
    { id: 'orders', label: 'অর্ডারসমূহ', icon: Package, badge: null },
    { id: 'products', label: 'প্রোডাক্টস', icon: ShoppingBag, badge: null },
    { id: 'customers', label: 'কাস্টমার্স', icon: Users, badge: null },
    { id: 'settings', label: 'সেটিংস ও ইন্টিগ্রেশন', icon: Settings, badge: null },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-blue-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">Batik Shopping</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  ঘড়ের শপিং AI
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Facebook Messenger + Telegram Groups Automated Sales Agent
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <a
              href="/api/download-zip"
              download="batik-shopping-ai.zip"
              title="Download entire project source code as ZIP"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>সোর্স কোড (ZIP)</span>
            </a>
            <button
              onClick={onResetDemo}
              disabled={isResetting}
              title="Delete all demo data and start fresh"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">সব ডেমো মুছুন</span>
            </button>
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Gemini 3.8 Flash Active</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto pb-1.5 pt-1 scrollbar-none border-t border-slate-100">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-md uppercase tracking-wider ${
                      isActive ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
