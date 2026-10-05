export type ProductStatus = 'active' | 'inactive' | 'out_of_stock';

export interface Product {
  product_id: string;
  product_name: string;
  price: number;
  discount_price?: number;
  colors: string[];
  stock: number;
  size: string;
  fabric: string;
  kameez_length: string;
  salwar_length: string;
  orna_length: string;
  description: string;
  delivery_info: string;
  status: ProductStatus;
  images: string[];
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  color: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  image_url?: string;
}

export interface Order {
  id: string;
  order_code: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  district: string;
  thana: string;
  area: string;
  full_address: string;
  alt_phone?: string;
  delivery_note?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  delivery_charge: number;
  total: number;
  status: OrderStatus;
  telegram_dispatched: boolean;
  telegram_message_id?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  order_code: string;
  previous_status: string;
  new_status: OrderStatus;
  changed_by: string;
  source: 'telegram_group' | 'admin_dashboard' | 'webhook' | 'system';
  note?: string;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  district: string;
  thana: string;
  area: string;
  full_address: string;
  alt_phone?: string;
  delivery_note?: string;
  total_orders: number;
  total_spent: number;
  last_order_at?: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'ai' | 'admin' | 'system';
  text: string;
  media_url?: string;
  tool_calls?: {
    name: string;
    args: any;
    result?: any;
  }[];
  order_summary?: any;
  is_human_handoff?: boolean;
  timestamp: string;
}

export interface Conversation {
  id: string;
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  is_human_handoff: boolean;
  handoff_reason?: string;
  status: 'active' | 'closed' | 'waiting_admin';
  last_message_at: string;
  messages: ChatMessage[];
  draft_order?: {
    items: Array<{ product_id: string; product_name: string; color: string; quantity: number; unit_price: number }>;
    customer_name?: string;
    phone?: string;
    district?: string;
    thana?: string;
    area?: string;
    full_address?: string;
    alt_phone?: string;
    delivery_note?: string;
    subtotal: number;
    delivery_charge: number;
    total: number;
    step: 'collecting' | 'summary_shown' | 'confirmed';
  };
}

export interface TelegramAdmin {
  id: string;
  telegram_user_id: string;
  username: string;
  display_name: string;
  role: 'super_admin' | 'product_admin' | 'order_admin';
  is_authorized: boolean;
}

export interface TelegramGroup {
  id: string;
  group_name: string;
  group_id: string;
  group_type: 'product_management' | 'order_notification';
  is_active: boolean;
}

export interface TelegramGroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  sender_name: string;
  is_admin: boolean;
  text: string;
  order_card?: Order;
  buttons?: Array<{ text: string; callback_data: string; color?: string }>;
  timestamp: string;
}

export interface BusinessSettings {
  business_name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  about: string;
  return_policy: string;
  exchange_policy: string;
  payment_methods: string;
  business_hours: string;
}

export interface DeliverySettings {
  inside_dhaka_fee: number;
  outside_dhaka_fee: number;
  sub_dhaka_fee: number;
  free_delivery_threshold: number;
  estimated_dhaka_days: string;
  estimated_outside_days: string;
}

export interface AISettings {
  provider: 'gemini' | 'openai_compatible';
  model_name: string;
  api_key?: string;
  base_url?: string;
  system_prompt: string;
  temperature: number;
  communication_style: 'friendly_natural_bangla' | 'professional_bangla' | 'banglish';
  auto_confirm_explicit_only: boolean;
}

export interface TelegramSettings {
  bot_token: string;
  bot_username: string;
  product_group_id: string;
  product_group_name: string;
  order_group_id: string;
  order_group_name: string;
  authorized_admin_ids: string;
  is_connected: boolean;
}

export interface FacebookSettings {
  page_id: string;
  page_name: string;
  access_token: string;
  verify_token: string;
  webhook_url: string;
  is_connected: boolean;
}

export interface DashboardStats {
  total_products: number;
  active_products: number;
  total_orders: number;
  today_orders: number;
  pending_orders: number;
  confirmed_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  total_customers: number;
}
