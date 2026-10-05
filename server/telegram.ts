import { db } from './db';
import { TelegramGroupMessage, OrderStatus } from '../src/types';

export interface TelegramCommandResult {
  replyText: string;
  buttons?: Array<{ text: string; callback_data: string }>;
  success: boolean;
}

// Handles incoming Telegram Group message or command
export function handleTelegramGroupMessage(
  groupId: string,
  userId: string,
  userName: string,
  messageText: string
): TelegramCommandResult {
  const isAuth = db.isTelegramAdminAuthorized(userId);
  const trimmed = messageText.trim();

  // If user is not authorized, reject per PRD Section 17 & 25
  if (!isAuth) {
    const errorMsg = `⛔ **দুঃখিত (${userName})!**\nআপনি এই গ্রুপের অথোরাইজড অ্যাডমিন নন। প্রোডাক্ট বা অর্ডার পরিচালনার জন্য অনুমতি নেই।`;
    db.addTelegramMessage({
      group_id: groupId,
      sender_id: userId,
      sender_name: userName,
      is_admin: false,
      text: trimmed,
    });
    db.addTelegramMessage({
      group_id: groupId,
      sender_id: 'SYSTEM_BOT',
      sender_name: 'Batik Admin Bot 🤖',
      is_admin: true,
      text: errorMsg,
    });
    return { replyText: errorMsg, success: false };
  }

  // Record admin incoming message
  db.addTelegramMessage({
    group_id: groupId,
    sender_id: userId,
    sender_name: userName,
    is_admin: true,
    text: trimmed,
  });

  // 1. /start or /help
  if (trimmed === '/start' || trimmed === '/help') {
    const help = `👋 **স্বাগতম ${userName}!** (Batik Admin Bot)\n\n📌 **গ্রুপ ১: Product Management Commands:**\n• \`/products\` — সকল প্রোডাক্টের তালিকা ও স্টক দেখুন\n• \`/addproduct <নাম> | <মূল্য> | <ডিসকাউন্ট> | <কালারসমূহ> | <স্টক> | <ফেব্রিক>\`\n• \`/stock <Product_ID> <নতুন_সংখ্যা>\` — সরাসরি স্টক আপডেট করুন\n• \`/price <Product_ID> <নতুন_দাম> [ডিসকাউন্ট]\` — মূল্য পরিবর্তন করুন\n• \`/search <নাম>\` — প্রোডাক্ট খুঁজুন\n• \`/delete <Product_ID>\` — প্রোডাক্ট রিমুভ করুন\n\n📌 **গ্রুপ ২: Order Notification Group:**\nকনফার্ম হওয়া নতুন অর্ডারের নিচে দেওয়া বোতামে ক্লিক করে স্ট্যাটাস (Processing, Packed, Shipped, Delivered) আপডেট করতে পারবেন।`;

    db.addTelegramMessage({
      group_id: groupId,
      sender_id: 'SYSTEM_BOT',
      sender_name: 'Batik Admin Bot 🤖',
      is_admin: true,
      text: help,
    });

    return { replyText: help, success: true };
  }

  // 2. /products
  if (trimmed === '/products' || trimmed === '/list') {
    const list = db.getProducts();
    if (list.length === 0) {
      const msg = 'ইনভেন্টরিতে কোনো প্রোডাক্ট পাওয়া যায়নি।';
      db.addTelegramMessage({ group_id: groupId, sender_id: 'SYSTEM_BOT', sender_name: 'Batik Admin Bot 🤖', is_admin: true, text: msg });
      return { replyText: msg, success: true };
    }

    const textList = list
      .map(
        (p, idx) =>
          `${idx + 1}. **${p.product_name}** (${p.product_id})\n   💰 মূল্য: ৳${p.discount_price || p.price} | 📦 স্টক: ${p.stock} পিস | স্ট্যাটাস: ${p.status === 'active' ? '🟢 Active' : '🔴 Out of Stock'}`
      )
      .join('\n\n');

    const fullMsg = `📦 **বর্তমানে ইনভেন্টরিতে থাকা প্রোডাক্ট তালিকা (${list.length}টি):**\n\n${textList}\n\nস্টক আপডেট করতে: \`/stock <ID> <সংখ্যা>\`\nমূল্য আপডেট করতে: \`/price <ID> <দাম>\``;

    db.addTelegramMessage({
      group_id: groupId,
      sender_id: 'SYSTEM_BOT',
      sender_name: 'Batik Admin Bot 🤖',
      is_admin: true,
      text: fullMsg,
    });

    return { replyText: fullMsg, success: true };
  }

  // 3. /stock <product_id> <quantity>
  if (trimmed.startsWith('/stock')) {
    const parts = trimmed.split(/\s+/);
    if (parts.length < 3) {
      const err = '❌ সঠিক নিয়ম: `/stock <Product_ID> <নতুন_সংখ্যা>`\nউদাহরণ: `/stock BATIK-101 35`';
      db.addTelegramMessage({ group_id: groupId, sender_id: 'SYSTEM_BOT', sender_name: 'Batik Admin Bot 🤖', is_admin: true, text: err });
      return { replyText: err, success: false };
    }
    const pid = parts[1].toUpperCase();
    const qty = parseInt(parts[2], 10);
    if (isNaN(qty) || qty < 0) {
      const err = '❌ স্টক সংখ্যা সঠিক নয়।';
      return { replyText: err, success: false };
    }

    const updated = db.updateProductStock(pid, qty, false);
    if (!updated) {
      const err = `❌ প্রোডাক্ট আইডি **${pid}** খুঁজে পাওয়া যায়নি।`;
      db.addTelegramMessage({ group_id: groupId, sender_id: 'SYSTEM_BOT', sender_name: 'Batik Admin Bot 🤖', is_admin: true, text: err });
      return { replyText: err, success: false };
    }

    const reply = `✅ **স্টক আপডেট সফল!**\n\n👗 প্রোডাক্ট: **${updated.product_name}** (${updated.product_id})\n📦 বর্তমান স্টক: **${updated.stock} পিস**\n🟢 স্ট্যাটাস: ${updated.status}`;
    db.addTelegramMessage({ group_id: groupId, sender_id: 'SYSTEM_BOT', sender_name: 'Batik Admin Bot 🤖', is_admin: true, text: reply });
    return { replyText: reply, success: true };
  }

  // 4. /price <product_id> <price> [discount]
  if (trimmed.startsWith('/price')) {
    const parts = trimmed.split(/\s+/);
    if (parts.length < 3) {
      const err = '❌ সঠিক নিয়ম: `/price <Product_ID> <মূল্য> [ডিসকাউন্ট_মূল্য]`\nউদাহরণ: `/price BATIK-101 1300 1200`';
      db.addTelegramMessage({ group_id: groupId, sender_id: 'SYSTEM_BOT', sender_name: 'Batik Admin Bot 🤖', is_admin: true, text: err });
      return { replyText: err, success: false };
    }
    const pid = parts[1].toUpperCase();
    const price = parseInt(parts[2], 10);
    const discount = parts[3] ? parseInt(parts[3], 10) : undefined;

    const updated = db.updateProductPrice(pid, price, discount);
    if (!updated) {
      const err = `❌ প্রোডাক্ট আইডি **${pid}** পাওয়া যায়নি।`;
      db.addTelegramMessage({ group_id: groupId, sender_id: 'SYSTEM_BOT', sender_name: 'Batik Admin Bot 🤖', is_admin: true, text: err });
      return { replyText: err, success: false };
    }

    const reply = `✅ **মূল্য আপডেট সফল!**\n\n👗 প্রোডাক্ট: **${updated.product_name}** (${updated.product_id})\n💰 রেগুলার মূল্য: ৳${updated.price}\n🏷️ ডিসকাউন্ট মূল্য: ৳${updated.discount_price || 'নেই'}`;
    db.addTelegramMessage({ group_id: groupId, sender_id: 'SYSTEM_BOT', sender_name: 'Batik Admin Bot 🤖', is_admin: true, text: reply });
    return { replyText: reply, success: true };
  }

  // 5. /search <query>
  if (trimmed.startsWith('/search')) {
    const query = trimmed.replace('/search', '').trim();
    if (!query) {
      return { replyText: 'অনুগ্রহ করে কী খুঁজতে চান লিখুন। যেমন: `/search বাটিক`', success: false };
    }
    const results = db.getProducts({ search: query });
    if (results.length === 0) {
      const msg = `🔍 "${query}" সংক্রান্ত কোনো প্রোডাক্ট পাওয়া যায়নি।`;
      db.addTelegramMessage({ group_id: groupId, sender_id: 'SYSTEM_BOT', sender_name: 'Batik Admin Bot 🤖', is_admin: true, text: msg });
      return { replyText: msg, success: true };
    }

    const text = results
      .map((p) => `• **${p.product_name}** (${p.product_id})\n  দাম: ৳${p.discount_price || p.price} | স্টক: ${p.stock} | কালার: ${p.colors.join(', ')}`)
      .join('\n\n');

    const msg = `🔍 **খোঁজের ফলাফল (${results.length}টি):**\n\n${text}`;
    db.addTelegramMessage({ group_id: groupId, sender_id: 'SYSTEM_BOT', sender_name: 'Batik Admin Bot 🤖', is_admin: true, text: msg });
    return { replyText: msg, success: true };
  }

  // 6. /addproduct
  if (trimmed.startsWith('/addproduct')) {
    const raw = trimmed.replace('/addproduct', '').trim();
    if (!raw) {
      const guide = `➕ **নতুন প্রোডাক্ট যুক্ত করার নিয়ম:**\n\nফরম্যাট:\n\`/addproduct নাম | দাম | ডিসকাউন্ট | কালারসমূহ | স্টক | ফেব্রিক | বিবরণ\`\n\nউদাহরণ:\n\`/addproduct রাজশাহী খাদি সিল্ক বাটিক | 1850 | 1650 | লাল, নীল, কালো | 20 | ১০০% খাদি সিল্ক | উৎসবের জন্য এক্সক্লুসিভ কালেকশন\``;
      db.addTelegramMessage({ group_id: groupId, sender_id: 'SYSTEM_BOT', sender_name: 'Batik Admin Bot 🤖', is_admin: true, text: guide });
      return { replyText: guide, success: false };
    }

    const parts = raw.split('|').map((s) => s.trim());
    const name = parts[0] || 'নতুন বাটিক থ্রি-পিস';
    const price = parseInt(parts[1] || '1200', 10);
    const discount = parts[2] ? parseInt(parts[2], 10) : undefined;
    const colors = parts[3] ? parts[3].split(/[,/]/).map((c) => c.trim()) : ['রয়েল ব্লু', 'মেরুন'];
    const stock = parts[4] ? parseInt(parts[4], 10) : 10;
    const fabric = parts[5] || '১০০% সুতি কটন';
    const desc = parts[6] || 'প্রিমিয়াম কোয়ালিটি বাটিক ড্রেস।';

    const nextNum = db.getProducts().length + 101;
    const pid = `BATIK-${nextNum}`;

    const newProduct = db.createProduct({
      product_id: pid,
      product_name: name,
      price,
      discount_price: discount,
      colors,
      stock,
      size: 'আনস্টিচড ফ্রি সাইজ',
      fabric,
      kameez_length: '৪৮ ইঞ্চি (২.৫ গজ)',
      salwar_length: '২.৫ গজ',
      orna_length: '৫ হাত নামাজি ওড়না',
      description: desc,
      delivery_info: 'সারা দেশে হোম ডেলিভারি।',
      status: 'active',
      images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'],
    });

    const reply = `✅ **নতুন প্রোডাক্ট সফলভাবে ডাটাবেজে যোগ হয়েছে!**\n\n📌 আইডি: **${newProduct.product_id}**\n👗 নাম: ${newProduct.product_name}\n💰 মূল্য: ৳${newProduct.discount_price || newProduct.price}\n🎨 কালার: ${newProduct.colors.join(', ')}\n📦 স্টক: ${newProduct.stock} পিস\n🧵 ফেব্রিক: ${newProduct.fabric}\n\nAI সেলস এজেন্ট এখন কাস্টমারকে এই প্রোডাক্টটি সুপারিশ করতে পারবে!`;

    db.addTelegramMessage({
      group_id: groupId,
      sender_id: 'SYSTEM_BOT',
      sender_name: 'Batik Admin Bot 🤖',
      is_admin: true,
      text: reply,
    });

    return { replyText: reply, success: true };
  }

  // 7. /delete <id>
  if (trimmed.startsWith('/delete')) {
    const parts = trimmed.split(/\s+/);
    if (parts.length < 2) {
      return { replyText: 'ব্যবহার: `/delete <Product_ID>`', success: false };
    }
    const pid = parts[1].toUpperCase();
    const ok = db.deleteProduct(pid);
    const reply = ok ? `🗑️ প্রোডাক্ট **${pid}** সফলভাবে মুছে ফেলা হয়েছে।` : `❌ প্রোডাক্ট **${pid}** খুঁজে পাওয়া যায়নি।`;
    db.addTelegramMessage({ group_id: groupId, sender_id: 'SYSTEM_BOT', sender_name: 'Batik Admin Bot 🤖', is_admin: true, text: reply });
    return { replyText: reply, success: ok };
  }

  const defaultMsg = `ℹ️ কমান্ডটি বুঝতে পারিনি। সাহায্য পেতে \`/help\` লিখুন।`;
  db.addTelegramMessage({ group_id: groupId, sender_id: 'SYSTEM_BOT', sender_name: 'Batik Admin Bot 🤖', is_admin: true, text: defaultMsg });
  return { replyText: defaultMsg, success: false };
}

// Handles interactive button clicks on Order cards in Telegram Group 2
export function handleTelegramCallbackQuery(
  callbackData: string,
  userId: string,
  userName: string
): { success: boolean; message: string; updatedOrder?: any } {
  const isAuth = db.isTelegramAdminAuthorized(userId);
  if (!isAuth) {
    return {
      success: false,
      message: `⛔ দুঃখিত ${userName}, আপনি এই অ্যাকশন পরিবর্তন করার অনুমতিপ্রাপ্ত নন।`,
    };
  }

  // Format: "status_<new_status>_<order_id>"
  if (callbackData.startsWith('status_')) {
    const parts = callbackData.split('_');
    const newStatus = parts[1] as OrderStatus;
    const orderId = parts.slice(2).join('_');

    const updated = db.updateOrderStatus(
      orderId,
      newStatus,
      `${userName} (Telegram Admin)`,
      'telegram_group',
      `Order status marked as ${newStatus} from Telegram Group 2`
    );

    if (!updated) {
      return { success: false, message: '❌ অর্ডারটি খুঁজে পাওয়া যায়নি।' };
    }

    const statusBadge: Record<string, string> = {
      confirmed: '🟢 CONFIRMED',
      processing: '⏳ PROCESSING',
      packed: '📦 PACKED',
      shipped: '🚚 SHIPPED',
      delivered: '✅ DELIVERED',
      cancelled: '❌ CANCELLED',
      returned: '↩️ RETURNED',
    };

    const replyMsg = `🔔 **অর্ডার স্ট্যাটাস আপডেট হয়েছে!**\n\n📌 অর্ডার: **${updated.order_code}**\n👤 অ্যাডমিন: ${userName}\n🏷️ বর্তমান স্ট্যাটাস: **${statusBadge[newStatus] || newStatus}**`;

    // Add confirmation message to Telegram Group 2
    const settings = db.getSettings();
    db.addTelegramMessage({
      group_id: settings.telegram.order_group_id,
      sender_id: 'SYSTEM_BOT',
      sender_name: 'Batik Admin Bot 🤖',
      is_admin: true,
      text: replyMsg,
      order_card: updated,
    });

    return {
      success: true,
      message: `অর্ডার ${updated.order_code} সফলভাবে ${newStatus} করা হয়েছে!`,
      updatedOrder: updated,
    };
  }

  return { success: false, message: 'Unknown callback action' };
}
