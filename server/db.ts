import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  Product,
  Order,
  Customer,
  OrderStatusHistory,
  TelegramAdmin,
  TelegramGroup,
  TelegramGroupMessage,
  BusinessSettings,
  DeliverySettings,
  AISettings,
  TelegramSettings,
  FacebookSettings,
  Conversation,
  DashboardStats,
} from '../src/types';

interface DatabaseSchema {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  order_status_history: OrderStatusHistory[];
  telegram_groups: TelegramGroup[];
  telegram_admins: TelegramAdmin[];
  telegram_messages: TelegramGroupMessage[];
  conversations: Conversation[];
  business_settings: BusinessSettings;
  delivery_settings: DeliverySettings;
  ai_settings: AISettings;
  telegram_settings: TelegramSettings;
  facebook_settings: FacebookSettings;
  order_counter: number;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

const INITIAL_PRODUCTS: Product[] = [
  {
    product_id: 'BATIK-101',
    product_name: 'প্রিমিয়াম চুন্দ্রি সুতি বাটিক থ্রি-পিস',
    price: 1250,
    discount_price: 1150,
    colors: ['রয়েল ব্লু (Royal Blue)', 'টকটকে লাল (Crimson Red)', 'কালো (Jet Black)', 'সি গ্রিন (Sea Green)'],
    stock: 28,
    size: 'আনস্টিচড ফ্রি সাইজ (Unstitched Free Size)',
    fabric: '১০০% পিওর সুতি ভয়েল (Pure Cotton Voile)',
    kameez_length: '৪৮ ইঞ্চি (বহর ২.৫ গজ)',
    salwar_length: '২.৫ গজ পিওর কটন',
    orna_length: '৫ হাত নামাজি ওড়না',
    description: 'খাঁটি মোম বাটিক ও প্রাকৃতিক পাকা রঙের নিখুঁত প্রিন্ট। গরমে অত্যন্ত আরামদায়ক ও টেকসই। ধোয়ার পরও রঙ উঠবে না বা নষ্ট হবে না।',
    delivery_info: 'ঢাকা সিটির ভেতরে ২ কার্যদিবস (৳৮০), ঢাকার বাইরে ৩-৪ দিন (৳১৫০)।',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'
    ],
    created_at: new Date('2026-09-15').toISOString(),
    updated_at: new Date('2026-09-15').toISOString(),
  },
  {
    product_id: 'BATIK-102',
    product_name: 'জয়পুরী মোম বাটিক সুতি থ্রি-পিস',
    price: 1450,
    discount_price: 1290,
    colors: ['মেরুন (Maroon)', 'গাঢ় নীল (Navy Blue)', 'হলুদ (Mustard Yellow)', 'টিয়া সবুজ (Parrot Green)'],
    stock: 19,
    size: 'আনস্টিচড ফ্রি সাইজ (Unstitched Free Size)',
    fabric: 'সুতি প্রমিলা কটন (Promila Cotton)',
    kameez_length: '৪৮ ইঞ্চি (বহর ২.৫ গজ)',
    salwar_length: '২.৫ গজ',
    orna_length: '৫ হাত বড় সুতি ওড়না',
    description: 'ঐতিহ্যবাহী জয়পুরী মোম ক্র্যাক বাটিক ডিজাইন। মার্জিত লুক ও কালারফাস্ট গ্যারান্টি।',
    delivery_info: 'সারা দেশে ক্যাশ অন ডেলিভারি সুবিধা রয়েছে।',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'
    ],
    created_at: new Date('2026-09-18').toISOString(),
    updated_at: new Date('2026-09-18').toISOString(),
  },
  {
    product_id: 'BATIK-103',
    product_name: 'সুপুরি বাটিক ডাবল কালার থ্রি-পিস',
    price: 1350,
    discount_price: 1199,
    colors: ['নেভি ব্লু & মাস্টার্ড', 'কালো & লাল', 'অলিভ & কফি'],
    stock: 15,
    size: 'আনস্টিচড ফ্রি সাইজ',
    fabric: 'প্রিমিয়াম প্রাইড সুতি কটন',
    kameez_length: '৪৭ ইঞ্চি (২.৫ গজ)',
    salwar_length: '২.৫ গজ',
    orna_length: '৫ হাত ডাবল শেড ওড়না',
    description: 'সুপুরি বাটিকের ক্লাসিক ডিজাইন যা যেকোনো বয়সীর পরার উপযোগী। অফিস বা ঘরোয়া অনুষ্ঠানের জন্য দারুণ।',
    delivery_info: 'ডেলিভারি ম্যানের সামনে প্রোডাক্ট দেখে রিসিভ করতে পারবেন।',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80'
    ],
    created_at: new Date('2026-09-20').toISOString(),
    updated_at: new Date('2026-09-20').toISOString(),
  },
  {
    product_id: 'BATIK-104',
    product_name: 'খাদি সিল্ক বাটিক এক্সক্লুসিভ থ্রি-পিস',
    price: 1850,
    discount_price: 1650,
    colors: ['ম্যাজেন্টা (Magenta)', 'রয়্যাল পার্পল (Royal Purple)', 'গোল্ডেন ইয়েলো (Golden Yellow)'],
    stock: 8,
    size: 'আনস্টিচড ফ্রি সাইজ',
    fabric: 'রাজশাহী সিল্ক বাটিক ব্লেন্ড',
    kameez_length: '৪৮ ইঞ্চি (২.৫ গজ)',
    salwar_length: '২.৫ গজ বাটার সিল্ক',
    orna_length: '৫ হাত সিল্ক ওড়না',
    description: 'উৎসবে স্পেশাল লুক দেওয়ার জন্য এক্সক্লুসিভ খাদি সিল্ক বাটিক কালেকশন। গ্লসি ফিনিশিং ও লাক্সারি ফিল।',
    delivery_info: 'প্রিমিয়াম প্যাকেজিং সহ সারা দেশে ডেলিভারি।',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1596783049448-9f37c357f00c?auto=format&fit=crop&w=800&q=80'
    ],
    created_at: new Date('2026-09-25').toISOString(),
    updated_at: new Date('2026-09-25').toISOString(),
  },
  {
    product_id: 'BATIK-105',
    product_name: 'ইন্ডিগো হ্যান্ড বাটিক ড্রেস কালেকশন',
    price: 1500,
    discount_price: 1350,
    colors: ['ডিপ ইন্ডিগো ব্লু (Deep Indigo)', 'আকাশী নীল (Sky Blue)'],
    stock: 12,
    size: 'আনস্টিচড ফ্রি সাইজ',
    fabric: '১০০% হ্যান্ডলুম কটন (Handloom Cotton)',
    kameez_length: '৪৮ ইঞ্চি (২.৫ গজ)',
    salwar_length: '২.৫ গজ সলিড ইন্ডিগো',
    orna_length: '৫ হাত টাই-ডাই নামাজি ওড়না',
    description: 'প্রাকৃতিক নীল রঙের খাঁটি হ্যান্ডলুম বাটিক। নরম এবং দীর্ঘস্থায়ী।',
    delivery_info: 'হোম ডেলিভারি প্রযোজ্য।',
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80'
    ],
    created_at: new Date('2026-09-28').toISOString(),
    updated_at: new Date('2026-09-28').toISOString(),
  }
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-001',
    name: 'তানজিলা রহমান',
    phone: '01819283746',
    district: 'ঢাকা (Dhaka)',
    thana: 'ধানমন্ডি',
    area: 'রোড নং ৮/এ',
    full_address: 'বাসা # ৩২/বি, ফ্ল্যাট ৪এ, রোড নং ৮/এ, ধানমন্ডি, ঢাকা',
    total_orders: 2,
    total_spent: 2470,
    last_order_at: new Date('2026-10-02').toISOString(),
    created_at: new Date('2026-09-10').toISOString(),
  },
  {
    id: 'CUST-002',
    name: 'ফারজানা আক্তার রুমি',
    phone: '01711223344',
    district: 'চট্টগ্রাম (Chittagong)',
    thana: 'পাঁচলাইশ',
    area: 'জিইসি মোড়',
    full_address: 'হোল্ডিং # ১২৩, গোলপাহাড় মোড় সংলগ্ন, পাঁচলাইশ, চট্টগ্রাম',
    total_orders: 1,
    total_spent: 1440,
    last_order_at: new Date('2026-10-03').toISOString(),
    created_at: new Date('2026-09-15').toISOString(),
  },
  {
    id: 'CUST-003',
    name: 'মাহমুদুল হাসান',
    phone: '01912345678',
    district: 'ঢাকা (Dhaka)',
    thana: 'সাভার',
    area: 'আশুলিয়া',
    full_address: 'পল্লীবিদ্যুৎ বাসস্ট্যান্ড সংলগ্ন, আশুলিয়া, সাভার, ঢাকা',
    total_orders: 1,
    total_spent: 2420,
    last_order_at: new Date('2026-10-04').toISOString(),
    created_at: new Date('2026-10-04').toISOString(),
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-101',
    order_code: 'GS-000101',
    customer_id: 'CUST-001',
    customer_name: 'তানজিলা রহমান',
    customer_phone: '01819283746',
    district: 'ঢাকা',
    thana: 'ধানমন্ডি',
    area: 'রোড ৮/এ',
    full_address: 'বাসা # ৩২/বি, ফ্ল্যাট ৪এ, রোড নং ৮/এ, ধানমন্ডি, ঢাকা',
    items: [
      {
        id: 'ITEM-1',
        product_id: 'BATIK-101',
        product_name: 'প্রিমিয়াম চুন্দ্রি সুতি বাটিক থ্রি-পিস',
        color: 'রয়েল ব্লু (Royal Blue)',
        quantity: 1,
        unit_price: 1150,
        total_price: 1150,
        image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      }
    ],
    subtotal: 1150,
    discount: 0,
    delivery_charge: 80,
    total: 1230,
    status: 'delivered',
    telegram_dispatched: true,
    created_at: new Date('2026-10-01T14:30:00Z').toISOString(),
    updated_at: new Date('2026-10-03T11:00:00Z').toISOString(),
  },
  {
    id: 'ORD-102',
    order_code: 'GS-000102',
    customer_id: 'CUST-002',
    customer_name: 'ফারজানা আক্তার রুমি',
    customer_phone: '01711223344',
    district: 'চট্টগ্রাম',
    thana: 'পাঁচলাইশ',
    area: 'জিইসি মোড়',
    full_address: 'হোল্ডিং # ১২৩, গোলপাহাড় মোড় সংলগ্ন, পাঁচলাইশ, চট্টগ্রাম',
    items: [
      {
        id: 'ITEM-2',
        product_id: 'BATIK-102',
        product_name: 'জয়পুরী মোম বাটিক সুতি থ্রি-পিস',
        color: 'মেরুন (Maroon)',
        quantity: 1,
        unit_price: 1290,
        total_price: 1290,
        image_url: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=800&q=80',
      }
    ],
    subtotal: 1290,
    discount: 0,
    delivery_charge: 150,
    total: 1440,
    status: 'processing',
    telegram_dispatched: true,
    created_at: new Date('2026-10-03T16:15:00Z').toISOString(),
    updated_at: new Date('2026-10-03T17:00:00Z').toISOString(),
  },
  {
    id: 'ORD-103',
    order_code: 'GS-000103',
    customer_id: 'CUST-003',
    customer_name: 'মাহমুদুল হাসান',
    customer_phone: '01912345678',
    district: 'ঢাকা',
    thana: 'সাভার',
    area: 'আশুলিয়া',
    full_address: 'পল্লীবিদ্যুৎ বাসস্ট্যান্ড সংলগ্ন, আশুলিয়া, সাভার, ঢাকা',
    items: [
      {
        id: 'ITEM-3',
        product_id: 'BATIK-101',
        product_name: 'প্রিমিয়াম চুন্দ্রি সুতি বাটিক থ্রি-পিস',
        color: 'টকটকে লাল (Crimson Red)',
        quantity: 2,
        unit_price: 1150,
        total_price: 2300,
        image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      }
    ],
    subtotal: 2300,
    discount: 0,
    delivery_charge: 120,
    total: 2420,
    status: 'confirmed',
    telegram_dispatched: true,
    created_at: new Date('2026-10-04T09:40:00Z').toISOString(),
    updated_at: new Date('2026-10-04T09:40:00Z').toISOString(),
  }
];

const INITIAL_TELEGRAM_GROUPS: TelegramGroup[] = [
  {
    id: 'TG-GRP-1',
    group_name: 'Batik Shopping — Product Management Group',
    group_id: '-1002489102381',
    group_type: 'product_management',
    is_active: true,
  },
  {
    id: 'TG-GRP-2',
    group_name: 'Batik Shopping — Order Notification Group',
    group_id: '-1002938102947',
    group_type: 'order_notification',
    is_active: true,
  }
];

const INITIAL_TELEGRAM_ADMINS: TelegramAdmin[] = [
  {
    id: 'TG-ADM-1',
    telegram_user_id: '184920491',
    username: 'rashed_batik',
    display_name: 'রাশেদ খান (Shop Owner)',
    role: 'super_admin',
    is_authorized: true,
  },
  {
    id: 'TG-ADM-2',
    telegram_user_id: '928174012',
    username: 'sales_lead_tanvir',
    display_name: 'তানভীর আহমেদ (Product Ops)',
    role: 'product_admin',
    is_authorized: true,
  }
];

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          ...this.getDefaultDatabase(),
          ...parsed,
        };
      }
    } catch (err) {
      console.warn('Could not read existing database, initializing fresh seed:', err);
    }
    const fresh = this.getDefaultDatabase();
    this.saveDatabase(fresh);
    return fresh;
  }

  private getDefaultDatabase(): DatabaseSchema {
    return {
      products: INITIAL_PRODUCTS,
      customers: INITIAL_CUSTOMERS,
      orders: INITIAL_ORDERS,
      order_status_history: [
        {
          id: 'HIST-1',
          order_id: 'ORD-101',
          order_code: 'GS-000101',
          previous_status: 'confirmed',
          new_status: 'delivered',
          changed_by: 'রাশেদ খান (Shop Owner)',
          source: 'telegram_group',
          note: 'কাস্টমার প্রোডাক্ট পেয়ে মূল্য পরিশোধ করেছেন।',
          created_at: new Date('2026-10-03T11:00:00Z').toISOString(),
        },
        {
          id: 'HIST-2',
          order_id: 'ORD-102',
          order_code: 'GS-000102',
          previous_status: 'confirmed',
          new_status: 'processing',
          changed_by: 'তানভীর আহমেদ',
          source: 'telegram_group',
          note: 'প্যাকেজিং শুরু হয়েছে।',
          created_at: new Date('2026-10-03T17:00:00Z').toISOString(),
        },
        {
          id: 'HIST-3',
          order_id: 'ORD-103',
          order_code: 'GS-000103',
          previous_status: 'pending',
          new_status: 'confirmed',
          changed_by: 'AI Sales Agent',
          source: 'system',
          note: 'কাস্টমারের নিশ্চিতকরণ পেয়ে অর্ডার কনফার্ম হয়েছে।',
          created_at: new Date('2026-10-04T09:40:00Z').toISOString(),
        }
      ],
      telegram_groups: INITIAL_TELEGRAM_GROUPS,
      telegram_admins: INITIAL_TELEGRAM_ADMINS,
      telegram_messages: [
        {
          id: 'TG-MSG-1',
          group_id: '-1002938102947',
          sender_id: 'SYSTEM_BOT',
          sender_name: 'Batik Sales Bot 🤖',
          is_admin: true,
          text: `━━━━━━━━━━━━━━━━━━━━━\n🛍️ NEW ORDER CONFIRMED\n━━━━━━━━━━━━━━━━━━━━━\nOrder ID: GS-000103\n\n👗 Product: প্রিমিয়াম চুন্দ্রি সুতি বাটিক থ্রি-পিস\n🎨 Color: টকটকে লাল (Crimson Red)\n🔢 Quantity: 2 পিস\n\n💰 Subtotal: ৳2300\n🚚 Delivery: ৳120 (সাভার/আশুলিয়া)\n💳 Total: ৳2420\n\n👤 Customer: মাহমুদুল হাসান\n📞 Phone: 01912345678\n📍 District: ঢাকা | থানা: সাভার\n🏡 Address: পল্লীবিদ্যুৎ বাসস্ট্যান্ড সংলগ্ন, আশুলিয়া, সাভার\n\nStatus: 🟢 CONFIRMED`,
          order_card: INITIAL_ORDERS[2],
          buttons: [
            { text: '⏳ Processing', callback_data: 'status_processing_ORD-103' },
            { text: '📦 Packed', callback_data: 'status_packed_ORD-103' },
            { text: '🚚 Shipped', callback_data: 'status_shipped_ORD-103' },
            { text: '✅ Delivered', callback_data: 'status_delivered_ORD-103' },
            { text: '❌ Cancel', callback_data: 'status_cancelled_ORD-103' }
          ],
          timestamp: new Date('2026-10-04T09:40:00Z').toISOString(),
        }
      ],
      conversations: [],
      business_settings: {
        business_name: 'Batik Shopping (ঘড়ের শপিং)',
        tagline: 'শতভাগ খাঁটি ও আরামদায়ক সুতি বাটিকের বিশ্বস্ত ঠিকানা',
        phone: '01712-345678',
        email: 'sales@ghorershopping.com',
        address: 'দোকান # ১২, ইসলামপুর মার্কেট, ঢাকা-১১০০',
        about: 'আমরা সরাসরি তাঁতি ও কারিগরদের থেকে সংগৃহীত খাঁটি মোম বাটিক, চুন্দ্রি বাটিক ও জয়পুরী কটন ড্রেস পাইকারি ও খুচরা সরবরাহ করি। রঙ শতভাগ পাকা ও কাপড়ের মান প্রিমিয়াম।',
        return_policy: 'প্রোডাক্ট রিসিভ করার সময় ডেলিভারি ম্যানের সামনে দেখে চেক করবেন। রঙ, কাপড় বা কোনো ত্রুটি থাকলে ডেলিভারি চার্জ দিয়ে রিটার্ন করতে পারবেন। ব্যবহারের পর রিটার্ন গ্রহণযোগ্য নয়।',
        exchange_policy: 'সাইজ বা কালার এক্সচেঞ্জ করতে চাইলে ডেলিভারির ৩ দিনের মধ্যে ইনবক্সে জানাতে হবে। প্রোডাক্ট অক্ষত অবস্থায় এক্সচেঞ্জ করে দেওয়া হবে।',
        payment_methods: 'সারা দেশে ক্যাশ অন ডেলিভারি (Cash on Delivery)। এছাড়া বিকাশ ও নগদ মার্চেন্ট পেমেন্ট সুবিধা আছে।',
        business_hours: 'প্রতিদিন সকাল ৯:০০ টা থেকে রাত ১১:০০ টা পর্যন্ত ইনবক্স ওপেন থাকে।',
      },
      delivery_settings: {
        inside_dhaka_fee: 80,
        outside_dhaka_fee: 150,
        sub_dhaka_fee: 120, // Savar, Gazipur, Keraniganj, Narayanganj
        free_delivery_threshold: 4000,
        estimated_dhaka_days: '২ কার্যদিবস',
        estimated_outside_days: '৩-৪ কার্যদিবস',
      },
      ai_settings: {
        provider: 'gemini',
        model_name: 'gemini-3.8-flash',
        system_prompt: `You are the friendly, professional, and natural Bengali AI Sales Assistant for 'Batik Shopping (ঘড়ের শপিং)'.
You chat naturally with customers in Bengali (or friendly Banglish if the customer prefers).
CRITICAL RULES:
1. ALWAYS use the provided tool data as the absolute source of truth.
2. NEVER invent product names, prices, colors, stock availability, discounts, delivery fees, or store policies.
3. If information is unavailable or uncertain, politely state that you are escalating to our human support team.
4. ORDER COLLECTION WORKFLOW:
   - When a customer wants to buy ('অর্ডার করতে চাই' / 'আমি এটা নিব' / 'order'), politely collect:
     a) Product name & chosen Color
     b) Quantity (সংখ্যা)
     c) Customer full name (নাম)
     d) 11-digit Bangladeshi mobile number (মোবাইল নম্বর)
     e) District (জেলা), Thana/Upazila (থানা), Area/Village (এলাকা), and Full street address (সম্পূর্ণ ঠিকানা)
   - Do NOT ask for information the customer has already supplied! Collect remaining details step-by-step naturally.
5. EXPLICIT ORDER CONFIRMATION RULE:
   - Before confirming an order, calculate Subtotal + Delivery fee and present the COMPLETE final order summary:
     আপনার অর্ডারের তথ্য:
     নাম: [Customer Name]
     মোবাইল: [Mobile Number]
     প্রোডাক্ট: [Product Name]
     কালার: [Chosen Color]
     পরিমাণ: [Quantity]
     জেলা: [District]
     থানা: [Thana]
     এলাকা: [Area]
     সম্পূর্ণ ঠিকানা: [Full Address]
     Subtotal: ৳[Subtotal]
     ডেলিভারি চার্জ: ৳[Delivery Fee]
     সর্বমোট: ৳[Total]
     আপনার অর্ডারটি কি Confirm করবেন?
   - Wait for EXPLICIT customer confirmation ('হ্যাঁ', 'জি', 'অর্ডার করেন', 'Confirm', 'ঠিক আছে', 'নিশ্চিত').
   - Once confirmed, invoke 'confirm_order' and 'send_order_to_telegram_group'.
6. HUMAN HANDOFF:
   - If customer asks to speak with a human/admin ('মানুষের সাথে কথা বলতে চাই', 'অ্যাডমিন এর সাথে কথা বলব', 'representative চাই'), invoke 'handoff_to_human'.`,
        temperature: 0.3,
        communication_style: 'friendly_natural_bangla',
        auto_confirm_explicit_only: true,
      },
      telegram_settings: {
        bot_token: process.env.TELEGRAM_BOT_TOKEN || '7481920491:AAH8j-fake-bot-token-demo',
        bot_username: 'BatikSalesAgentBot',
        product_group_id: '-1002489102381',
        product_group_name: 'Batik Shopping — Product Management',
        order_group_id: '-1002938102947',
        order_group_name: 'Batik Shopping — Order Notification',
        authorized_admin_ids: '184920491,928174012',
        is_connected: true,
      },
      facebook_settings: {
        page_id: process.env.FACEBOOK_PAGE_ID || '102938475610293',
        page_name: 'Batik Shopping — ঘরোয়া কালেকশন',
        access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN || 'EAA...',
        verify_token: process.env.FACEBOOK_VERIFY_TOKEN || 'batik_sales_agent_secret_verify_token',
        webhook_url: `${process.env.APP_URL || ''}/api/webhook/facebook`,
        is_connected: true,
      },
      order_counter: 104,
    };
  }

  private saveDatabase(dataToSave?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save database to disk:', err);
    }
  }

  // --- Products ---
  public getProducts(filter?: { status?: string; search?: string }): Product[] {
    let list = this.data.products;
    if (filter?.status && filter.status !== 'all') {
      list = list.filter((p) => p.status === filter.status);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.product_name.toLowerCase().includes(q) ||
          p.product_id.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q) ||
          p.colors.some((c) => c.toLowerCase().includes(q))
      );
    }
    return list;
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find((p) => p.product_id.toUpperCase() === id.toUpperCase());
  }

  public createProduct(productData: Omit<Product, 'created_at' | 'updated_at'>): Product {
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...productData,
      created_at: now,
      updated_at: now,
    };
    this.data.products.unshift(newProduct);
    this.saveDatabase();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.data.products.findIndex((p) => p.product_id.toUpperCase() === id.toUpperCase());
    if (index === -1) return null;
    const updated = {
      ...this.data.products[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.data.products[index] = updated;
    this.saveDatabase();
    return updated;
  }

  public deleteProduct(id: string): boolean {
    const before = this.data.products.length;
    this.data.products = this.data.products.filter((p) => p.product_id.toUpperCase() !== id.toUpperCase());
    const deleted = this.data.products.length < before;
    if (deleted) this.saveDatabase();
    return deleted;
  }

  public updateProductStock(id: string, deltaOrAbsolute: number, isDelta = false): Product | null {
    const product = this.getProductById(id);
    if (!product) return null;
    const newStock = isDelta ? Math.max(0, product.stock + deltaOrAbsolute) : Math.max(0, deltaOrAbsolute);
    const newStatus = newStock === 0 ? 'out_of_stock' : product.status === 'out_of_stock' ? 'active' : product.status;
    return this.updateProduct(id, { stock: newStock, status: newStatus });
  }

  public updateProductPrice(id: string, price: number, discountPrice?: number): Product | null {
    return this.updateProduct(id, { price, discount_price: discountPrice });
  }

  // --- Orders ---
  public getOrders(statusFilter?: string): Order[] {
    let list = this.data.orders;
    if (statusFilter && statusFilter !== 'all') {
      list = list.filter((o) => o.status === statusFilter);
    }
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find((o) => o.id === id || o.order_code === id);
  }

  public generateOrderCode(): string {
    const num = this.data.order_counter++;
    this.saveDatabase();
    return `GS-${String(num).padStart(6, '0')}`;
  }

  public createOrder(orderInput: {
    customer_name: string;
    customer_phone: string;
    district: string;
    thana: string;
    area: string;
    full_address: string;
    alt_phone?: string;
    delivery_note?: string;
    items: Array<{
      product_id: string;
      color: string;
      quantity: number;
    }>;
  }): Order {
    const order_code = this.generateOrderCode();
    const id = `ORD-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    // Prepare items with pricing
    let subtotal = 0;
    const items = orderInput.items.map((item, idx) => {
      const product = this.getProductById(item.product_id);
      const unitPrice = product ? (product.discount_price ?? product.price) : 1200;
      const totalItem = unitPrice * item.quantity;
      subtotal += totalItem;

      // Deduct stock if active
      if (product) {
        this.updateProductStock(product.product_id, -item.quantity, true);
      }

      return {
        id: `ITEM-${idx + 1}-${Date.now().toString(36)}`,
        product_id: item.product_id,
        product_name: product?.product_name || 'Batik 3-Piece',
        color: item.color,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: totalItem,
        image_url: product?.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      };
    });

    // Calculate delivery fee
    const delivery_charge = this.calculateDeliveryCharge(orderInput.district, orderInput.thana);
    const total = subtotal + delivery_charge;

    // Create or update customer
    const customer = this.upsertCustomer({
      name: orderInput.customer_name,
      phone: orderInput.customer_phone,
      district: orderInput.district,
      thana: orderInput.thana,
      area: orderInput.area,
      full_address: orderInput.full_address,
      alt_phone: orderInput.alt_phone,
      delivery_note: orderInput.delivery_note,
      order_total: total,
    });

    const now = new Date().toISOString();
    const order: Order = {
      id,
      order_code,
      customer_id: customer.id,
      customer_name: orderInput.customer_name,
      customer_phone: orderInput.customer_phone,
      district: orderInput.district,
      thana: orderInput.thana,
      area: orderInput.area,
      full_address: orderInput.full_address,
      alt_phone: orderInput.alt_phone,
      delivery_note: orderInput.delivery_note,
      items,
      subtotal,
      discount: 0,
      delivery_charge,
      total,
      status: 'confirmed', // Created upon explicit confirmation
      telegram_dispatched: false,
      created_at: now,
      updated_at: now,
    };

    this.data.orders.unshift(order);

    // Record initial status history
    this.data.order_status_history.unshift({
      id: `HIST-${Date.now().toString(36)}`,
      order_id: order.id,
      order_code: order.order_code,
      previous_status: 'none',
      new_status: 'confirmed',
      changed_by: 'AI Sales Agent (Customer Confirmed)',
      source: 'system',
      note: 'কাস্টমার চূড়ান্ত অর্ডার সামারি নিশ্চিত করেছেন।',
      created_at: now,
    });

    this.saveDatabase();
    return order;
  }

  public updateOrderStatus(
    orderIdOrCode: string,
    newStatus: Order['status'],
    changedBy: string,
    source: OrderStatusHistory['source'] = 'admin_dashboard',
    note?: string
  ): Order | null {
    const order = this.getOrderById(orderIdOrCode);
    if (!order) return null;

    const previousStatus = order.status;
    order.status = newStatus;
    order.updated_at = new Date().toISOString();

    const historyEntry: OrderStatusHistory = {
      id: `HIST-${Date.now().toString(36)}`,
      order_id: order.id,
      order_code: order.order_code,
      previous_status: previousStatus,
      new_status: newStatus,
      changed_by: changedBy,
      source,
      note: note || `Status changed from ${previousStatus} to ${newStatus}`,
      created_at: new Date().toISOString(),
    };

    this.data.order_status_history.unshift(historyEntry);

    // Update in telegram message if exists
    const tgMsg = this.data.telegram_messages.find((m) => m.order_card?.id === order.id);
    if (tgMsg && tgMsg.order_card) {
      tgMsg.order_card.status = newStatus;
    }

    this.saveDatabase();
    return order;
  }

  public getOrderStatusHistory(orderId?: string): OrderStatusHistory[] {
    if (!orderId) return this.data.order_status_history;
    return this.data.order_status_history.filter((h) => h.order_id === orderId || h.order_code === orderId);
  }

  // --- Delivery Calculation ---
  public calculateDeliveryCharge(district: string, thana?: string): number {
    const dLower = (district || '').toLowerCase();
    const tLower = (thana || '').toLowerCase();

    const isSubDhaka =
      tLower.includes('savar') ||
      tLower.includes('সাভার') ||
      tLower.includes('ashulia') ||
      tLower.includes('আশুলিয়া') ||
      tLower.includes('gazipur') ||
      tLower.includes('গাজীপুর') ||
      tLower.includes('narayanganj') ||
      tLower.includes('নারায়ণগঞ্জ') ||
      tLower.includes('keraniganj') ||
      tLower.includes('কেরানীগঞ্জ');

    if (isSubDhaka) {
      return this.data.delivery_settings.sub_dhaka_fee || 120;
    }

    if (dLower.includes('dhaka') || dLower.includes('ঢাকা')) {
      return this.data.delivery_settings.inside_dhaka_fee || 80;
    }

    return this.data.delivery_settings.outside_dhaka_fee || 150;
  }

  // --- Customers ---
  public getCustomers(): Customer[] {
    return this.data.customers;
  }

  public getCustomerByPhone(phone: string): Customer | undefined {
    const clean = phone.replace(/[^0-9]/g, '');
    return this.data.customers.find((c) => c.phone.replace(/[^0-9]/g, '').includes(clean));
  }

  public upsertCustomer(input: {
    name: string;
    phone: string;
    district: string;
    thana: string;
    area: string;
    full_address: string;
    alt_phone?: string;
    delivery_note?: string;
    order_total: number;
  }): Customer {
    const existing = this.getCustomerByPhone(input.phone);
    const now = new Date().toISOString();

    if (existing) {
      existing.name = input.name || existing.name;
      existing.district = input.district || existing.district;
      existing.thana = input.thana || existing.thana;
      existing.area = input.area || existing.area;
      existing.full_address = input.full_address || existing.full_address;
      existing.alt_phone = input.alt_phone || existing.alt_phone;
      existing.delivery_note = input.delivery_note || existing.delivery_note;
      existing.total_orders += 1;
      existing.total_spent += input.order_total;
      existing.last_order_at = now;
      this.saveDatabase();
      return existing;
    }

    const newCust: Customer = {
      id: `CUST-${String(this.data.customers.length + 1).padStart(3, '0')}`,
      name: input.name,
      phone: input.phone,
      district: input.district,
      thana: input.thana,
      area: input.area,
      full_address: input.full_address,
      alt_phone: input.alt_phone,
      delivery_note: input.delivery_note,
      total_orders: 1,
      total_spent: input.order_total,
      last_order_at: now,
      created_at: now,
    };

    this.data.customers.unshift(newCust);
    this.saveDatabase();
    return newCust;
  }

  // --- Telegram Groups & Admins ---
  public getTelegramAdmins(): TelegramAdmin[] {
    return this.data.telegram_admins;
  }

  public isTelegramAdminAuthorized(userId: string): boolean {
    const cleanId = String(userId).trim();
    // Also check comma-separated list from settings
    const settingList = this.data.telegram_settings.authorized_admin_ids.split(',').map((s) => s.trim());
    if (settingList.includes(cleanId)) return true;

    const adm = this.data.telegram_admins.find((a) => a.telegram_user_id === cleanId && a.is_authorized);
    return Boolean(adm);
  }

  public getTelegramMessages(groupId?: string): TelegramGroupMessage[] {
    if (!groupId) return this.data.telegram_messages;
    return this.data.telegram_messages.filter((m) => m.group_id === groupId);
  }

  public addTelegramMessage(msg: Omit<TelegramGroupMessage, 'id' | 'timestamp'>): TelegramGroupMessage {
    const newMsg: TelegramGroupMessage = {
      id: `TG-MSG-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...msg,
    };
    this.data.telegram_messages.unshift(newMsg);
    this.saveDatabase();
    return newMsg;
  }

  public dispatchOrderToTelegramGroup(orderId: string): { success: boolean; message?: TelegramGroupMessage; error?: string } {
    const order = this.getOrderById(orderId);
    if (!order) return { success: false, error: 'Order not found' };

    const orderGroup = this.data.telegram_groups.find((g) => g.group_type === 'order_notification');
    const groupId = orderGroup?.group_id || this.data.telegram_settings.order_group_id || '-1002938102947';

    const firstItem = order.items[0];
    const itemsList = order.items
      .map((i) => `👗 ${i.product_name}\n🎨 Color: ${i.color} | Qty: ${i.quantity} | ৳${i.total_price}`)
      .join('\n');

    const messageText = `━━━━━━━━━━━━━━━━━━━━━\n🛍️ NEW ORDER CONFIRMED\n━━━━━━━━━━━━━━━━━━━━━\nOrder ID: ${order.order_code}\n\n${itemsList}\n\n💰 Subtotal: ৳${order.subtotal}\n🚚 Delivery: ৳${order.delivery_charge}\n💳 Total: ৳${order.total}\n\n━━━━━━━━━━━━━━━━━━━━━\n👤 CUSTOMER INFORMATION\n━━━━━━━━━━━━━━━━━━━━━\nName: ${order.customer_name}\nPhone: ${order.customer_phone}\nDistrict: ${order.district}\nThana: ${order.thana}\nArea: ${order.area}\nFull Address: ${order.full_address}${order.alt_phone ? `\nAlt Phone: ${order.alt_phone}` : ''}${order.delivery_note ? `\nNote: ${order.delivery_note}` : ''}\n\nStatus: 🟢 CONFIRMED`;

    const buttons = [
      { text: '⏳ Processing', callback_data: `status_processing_${order.id}` },
      { text: '📦 Packed', callback_data: `status_packed_${order.id}` },
      { text: '🚚 Shipped', callback_data: `status_shipped_${order.id}` },
      { text: '✅ Delivered', callback_data: `status_delivered_${order.id}` },
      { text: '❌ Cancel', callback_data: `status_cancelled_${order.id}` },
    ];

    const tgMessage = this.addTelegramMessage({
      group_id: groupId,
      sender_id: 'SYSTEM_BOT',
      sender_name: 'Batik Sales Bot 🤖',
      is_admin: true,
      text: messageText,
      order_card: order,
      buttons,
    });

    order.telegram_dispatched = true;
    order.telegram_message_id = tgMessage.id;
    this.saveDatabase();

    return { success: true, message: tgMessage };
  }

  // --- Conversations & Memory ---
  public getOrCreateConversation(customerIdOrPhone: string, customerName?: string): Conversation {
    let conv = this.data.conversations.find(
      (c) => c.customer_id === customerIdOrPhone || c.customer_phone === customerIdOrPhone
    );
    if (!conv) {
      conv = {
        id: `CONV-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        customer_id: customerIdOrPhone,
        customer_name: customerName,
        customer_phone: customerIdOrPhone.startsWith('01') ? customerIdOrPhone : undefined,
        is_human_handoff: false,
        status: 'active',
        last_message_at: new Date().toISOString(),
        messages: [],
      };
      this.data.conversations.unshift(conv);
      this.saveDatabase();
    }
    return conv;
  }

  public getConversation(id: string): Conversation | undefined {
    return this.data.conversations.find((c) => c.id === id);
  }

  public addMessageToConversation(
    conversationId: string,
    message: Omit<Conversation['messages'][0], 'id' | 'timestamp'>
  ): Conversation['messages'][0] {
    const conv = this.data.conversations.find((c) => c.id === conversationId);
    if (!conv) throw new Error('Conversation not found');

    const msgWithMeta = {
      id: `MSG-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...message,
    };
    conv.messages.push(msgWithMeta);
    conv.last_message_at = msgWithMeta.timestamp;
    this.saveDatabase();
    return msgWithMeta;
  }

  public setHumanHandoff(conversationId: string, isHandoff: boolean, reason?: string) {
    const conv = this.data.conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.is_human_handoff = isHandoff;
      conv.handoff_reason = reason;
      conv.status = isHandoff ? 'waiting_admin' : 'active';
      this.saveDatabase();
    }
  }

  // --- Settings ---
  public getSettings() {
    return {
      business: this.data.business_settings,
      delivery: this.data.delivery_settings,
      ai: this.data.ai_settings,
      telegram: this.data.telegram_settings,
      facebook: this.data.facebook_settings,
    };
  }

  public updateBusinessSettings(settings: Partial<BusinessSettings>) {
    this.data.business_settings = { ...this.data.business_settings, ...settings };
    this.saveDatabase();
    return this.data.business_settings;
  }

  public updateDeliverySettings(settings: Partial<DeliverySettings>) {
    this.data.delivery_settings = { ...this.data.delivery_settings, ...settings };
    this.saveDatabase();
    return this.data.delivery_settings;
  }

  public updateAISettings(settings: Partial<AISettings>) {
    this.data.ai_settings = { ...this.data.ai_settings, ...settings };
    this.saveDatabase();
    return this.data.ai_settings;
  }

  public updateTelegramSettings(settings: Partial<TelegramSettings>) {
    this.data.telegram_settings = { ...this.data.telegram_settings, ...settings };
    this.saveDatabase();
    return this.data.telegram_settings;
  }

  public updateFacebookSettings(settings: Partial<FacebookSettings>) {
    this.data.facebook_settings = { ...this.data.facebook_settings, ...settings };
    this.saveDatabase();
    return this.data.facebook_settings;
  }

  // --- Dashboard Stats ---
  public getDashboardStats(): DashboardStats {
    const today = new Date().toISOString().slice(0, 10);
    const totalOrders = this.data.orders.length;
    const todayOrders = this.data.orders.filter((o) => o.created_at.slice(0, 10) === today).length;
    const pendingOrders = this.data.orders.filter((o) => o.status === 'pending').length;
    const confirmedOrders = this.data.orders.filter((o) => o.status === 'confirmed').length;
    const deliveredOrders = this.data.orders.filter((o) => o.status === 'delivered').length;
    const cancelledOrders = this.data.orders.filter((o) => o.status === 'cancelled').length;
    const totalRevenue = this.data.orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    return {
      total_products: this.data.products.length,
      active_products: this.data.products.filter((p) => p.status === 'active').length,
      total_orders: totalOrders,
      today_orders: todayOrders,
      pending_orders: pendingOrders,
      confirmed_orders: confirmedOrders,
      delivered_orders: deliveredOrders,
      cancelled_orders: cancelledOrders,
      total_revenue: totalRevenue,
      total_customers: this.data.customers.length,
    };
  }

  public clearAllData(): void {
    this.data.products = [];
    this.data.orders = [];
    this.data.customers = [];
    this.data.order_status_history = [];
    this.data.telegram_messages = [];
    this.data.conversations = [];
    this.data.order_counter = 1;
    this.saveDatabase();
  }

  public resetDemoData(): void {
    this.clearAllData();
  }
}

export const db = new DatabaseService();
