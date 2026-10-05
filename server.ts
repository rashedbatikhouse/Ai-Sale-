import express from 'express';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import { db } from './server/db';
import { runSalesAgent } from './server/gemini';
import { handleTelegramGroupMessage, handleTelegramCallbackQuery } from './server/telegram';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Static uploads directory
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOAD_DIR));

// Image upload API
app.post('/api/upload', (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'imageBase64 is required' });

    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches) {
      const mime = matches[1];
      const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
      const fname = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const fpath = path.join(UPLOAD_DIR, fname);
      fs.writeFileSync(fpath, Buffer.from(matches[2], 'base64'));
      return res.json({ url: `/uploads/${fname}`, success: true });
    }
    res.json({ url: imageBase64, success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API Routes

// 1. Stats
app.get('/api/stats', (req, res) => {
  try {
    const stats = db.getDashboardStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Products
app.get('/api/products', (req, res) => {
  try {
    const { status, search } = req.query as { status?: string; search?: string };
    const products = db.getProducts({ status, search });
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', (req, res) => {
  try {
    const newProduct = db.createProduct(req.body);
    res.status(201).json(newProduct);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', (req, res) => {
  try {
    const updated = db.updateProduct(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    const ok = db.deleteProduct(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/products/:id/stock', (req, res) => {
  try {
    const { stock, delta } = req.body;
    const isDelta = typeof delta === 'number';
    const val = isDelta ? delta : stock;
    const updated = db.updateProductStock(req.params.id, val, isDelta);
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/products/:id/price', (req, res) => {
  try {
    const { price, discount_price } = req.body;
    const updated = db.updateProductPrice(req.params.id, price, discount_price);
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Orders
app.get('/api/orders', (req, res) => {
  try {
    const { status } = req.query as { status?: string };
    const orders = db.getOrders(status);
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:id', (req, res) => {
  try {
    const order = db.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/orders/:id/status', (req, res) => {
  try {
    const { status, changed_by, source, note } = req.body;
    const updated = db.updateOrderStatus(
      req.params.id,
      status,
      changed_by || 'Admin Dashboard',
      source || 'admin_dashboard',
      note
    );
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:id/history', (req, res) => {
  try {
    const history = db.getOrderStatusHistory(req.params.id);
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders/:id/dispatch-telegram', (req, res) => {
  try {
    const result = db.dispatchOrderToTelegramGroup(req.params.id);
    if (!result.success) return res.status(400).json({ error: result.error });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Customers
app.get('/api/customers', (req, res) => {
  try {
    const customers = db.getCustomers();
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Settings
app.get('/api/settings', (req, res) => {
  try {
    res.json(db.getSettings());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings/business', (req, res) => {
  try {
    res.json(db.updateBusinessSettings(req.body));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings/delivery', (req, res) => {
  try {
    res.json(db.updateDeliverySettings(req.body));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings/ai', (req, res) => {
  try {
    res.json(db.updateAISettings(req.body));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings/telegram', (req, res) => {
  try {
    res.json(db.updateTelegramSettings(req.body));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings/facebook', (req, res) => {
  try {
    res.json(db.updateFacebookSettings(req.body));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Facebook Messenger Simulation & Live AI Agent API
app.get('/api/chat/conversation/:id', (req, res) => {
  try {
    const conv = db.getConversation(req.params.id) || db.getOrCreateConversation(req.params.id);
    res.json(conv);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/chat/send', async (req, res) => {
  try {
    const { conversation_id, text, customer_name, customer_phone } = req.body;
    if (!text || !conversation_id) {
      return res.status(400).json({ error: 'conversation_id and text are required' });
    }

    const conv = db.getOrCreateConversation(conversation_id, customer_name);
    const agentResult = await runSalesAgent(conv.id, text, {
      name: customer_name,
      phone: customer_phone,
    });

    const updatedConv = db.getConversation(conv.id);
    res.json({
      success: true,
      agentResult,
      conversation: updatedConv,
    });
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/chat/handoff', (req, res) => {
  try {
    const { conversation_id, is_human_handoff, reason } = req.body;
    db.setHumanHandoff(conversation_id, is_human_handoff, reason);
    res.json({ success: true, conversation: db.getConversation(conversation_id) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Telegram Group Simulator & Webhook API
app.get('/api/telegram/messages', (req, res) => {
  try {
    const { group_id } = req.query as { group_id?: string };
    const messages = db.getTelegramMessages(group_id);
    res.json(messages);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/telegram/admins', (req, res) => {
  try {
    res.json(db.getTelegramAdmins());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/telegram/send-message', (req, res) => {
  try {
    const { group_id, user_id, user_name, text } = req.body;
    const result = handleTelegramGroupMessage(group_id, user_id, user_name, text);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/telegram/callback-query', (req, res) => {
  try {
    const { callback_data, user_id, user_name } = req.body;
    const result = handleTelegramCallbackQuery(callback_data, user_id, user_name);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Real Webhook Endpoints
// Meta/Facebook Webhook Verification
app.get('/api/webhook/facebook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const settings = db.getSettings();

  if (mode === 'subscribe' && token === settings.facebook.verify_token) {
    console.log('Facebook Webhook Verified successfully!');
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// Facebook Webhook Incoming Message Handler
app.post('/api/webhook/facebook', async (req, res) => {
  try {
    const body = req.body;
    if (body.object === 'page') {
      for (const entry of body.entry) {
        const webhookEvent = entry.messaging?.[0];
        if (webhookEvent && webhookEvent.message) {
          const senderPsid = webhookEvent.sender.id;
          const text = webhookEvent.message.text;
          console.log(`Received Facebook message from ${senderPsid}: ${text}`);

          const conv = db.getOrCreateConversation(senderPsid);
          await runSalesAgent(conv.id, text);
        }
      }
      return res.status(200).send('EVENT_RECEIVED');
    }
    return res.sendStatus(404);
  } catch (err) {
    console.error('Facebook webhook error:', err);
    return res.status(500).send('Error');
  }
});

// Telegram Bot Webhook Handler
app.post('/api/webhook/telegram', async (req, res) => {
  try {
    const update = req.body;
    if (update.message) {
      const chatId = String(update.message.chat.id);
      const userId = String(update.message.from.id);
      const userName = update.message.from.username || update.message.from.first_name || 'Admin';
      const text = update.message.text || '';
      handleTelegramGroupMessage(chatId, userId, userName, text);
    } else if (update.callback_query) {
      const userId = String(update.callback_query.from.id);
      const userName = update.callback_query.from.username || update.callback_query.from.first_name || 'Admin';
      const data = update.callback_query.data;
      handleTelegramCallbackQuery(data, userId, userName);
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Telegram webhook error:', err);
    return res.status(500).json({ ok: false });
  }
});

// Reset or Clear Data
app.post('/api/reset-demo', (req, res) => {
  try {
    db.clearAllData();
    res.json({ success: true, message: 'All demo data cleared' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clear-all-data', (req, res) => {
  try {
    db.clearAllData();
    res.json({ success: true, message: 'All data cleared successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Download full repository ZIP archive
app.get('/api/download-zip', (req, res) => {
  try {
    const zipPath = '/tmp/batik-shopping-ai-source.zip';
    const pyCmd = `python3 -c "import os, zipfile; zip_path = '${zipPath}'; os.path.exists(zip_path) and os.remove(zip_path); zipf = zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED); [zipf.write(os.path.join(r, f), os.path.relpath(os.path.join(r, f), '.')) for r, d, files in os.walk('.') if not any(p in ['node_modules', '.git', 'dist', 'build', '.cache'] for p in r.replace('\\\\\\\\', '/').split('/')) for f in files if not f.endswith('.log')]; zipf.close()"`;
    execSync(pyCmd);
    res.download(zipPath, 'batik-shopping-ai.zip');
  } catch (err: any) {
    console.error('Zip generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Development vs Production serving
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Dynamic import of vite in dev mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} at ${process.env.APP_URL || `http://localhost:${PORT}`}`);
  });
}

startServer();
