import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { db } from './db';
import { Product, Order } from '../src/types';

// Controlled Tools definitions for Gemini
const searchProductsTool: FunctionDeclaration = {
  name: 'search_products',
  description: 'Search available batik products in inventory by keyword, color, or fabric. NEVER invent products.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'Search term or keyword (e.g., "সুতি বাটিক", "চুন্দ্রি", "জয়পুরী", "সিল্ক")',
      },
      color: {
        type: Type.STRING,
        description: 'Specific color requested (e.g., "লাল", "নীল", "কালো", "মেরুন")',
      },
    },
  },
};

const getProductDetailsTool: FunctionDeclaration = {
  name: 'get_product_details',
  description: 'Get complete authentic specification of a product by ID: price, fabric, kameez/salwar/orna measurements, stock, and available colors.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      product_id: {
        type: Type.STRING,
        description: 'The product ID (e.g. BATIK-101)',
      },
    },
    required: ['product_id'],
  },
};

const checkStockTool: FunctionDeclaration = {
  name: 'check_stock',
  description: 'Check actual remaining stock quantity and active colors for a product.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      product_id: {
        type: Type.STRING,
        description: 'The product ID',
      },
      color: {
        type: Type.STRING,
        description: 'Specific color to check',
      },
      quantity: {
        type: Type.NUMBER,
        description: 'Desired quantity',
      },
    },
    required: ['product_id'],
  },
};

const calculateOrderTool: FunctionDeclaration = {
  name: 'calculate_order',
  description: 'Accurately calculates subtotal, delivery fee (Inside Dhaka ৳80, Sub-Dhaka Savar/Gazipur ৳120, Outside Dhaka ৳150), and total.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      items: {
        type: Type.ARRAY,
        description: 'List of product items',
        items: {
          type: Type.OBJECT,
          properties: {
            product_id: { type: Type.STRING },
            color: { type: Type.STRING },
            quantity: { type: Type.NUMBER },
          },
          required: ['product_id', 'quantity'],
        },
      },
      district: {
        type: Type.STRING,
        description: 'Customer district (e.g. ঢাকা, চট্টগ্রাম, রাজশাহী)',
      },
      thana: {
        type: Type.STRING,
        description: 'Customer thana / upazila (e.g. ধানমন্ডি, সাভার, পাঁচলাইশ)',
      },
    },
    required: ['items', 'district'],
  },
};

const getCustomerTool: FunctionDeclaration = {
  name: 'get_customer',
  description: 'Look up an existing customer by phone number to prefill previously used delivery address.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      phone: {
        type: Type.STRING,
        description: 'Customer mobile number (e.g. 018XXXXXXXX)',
      },
    },
    required: ['phone'],
  },
};

const createOrderTool: FunctionDeclaration = {
  name: 'create_order',
  description: 'Creates a confirmed order in the database ONLY AFTER the customer has explicitly approved the final summary.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      customer_name: { type: Type.STRING, description: 'Customer full name' },
      phone: { type: Type.STRING, description: '11-digit mobile phone number' },
      district: { type: Type.STRING, description: 'District (জেলা)' },
      thana: { type: Type.STRING, description: 'Thana/Upazila (থানা)' },
      area: { type: Type.STRING, description: 'Area/Village (এলাকা)' },
      full_address: { type: Type.STRING, description: 'Full street address with house/flat' },
      alt_phone: { type: Type.STRING, description: 'Alternative phone (optional)' },
      delivery_note: { type: Type.STRING, description: 'Special delivery instructions' },
      items: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            product_id: { type: Type.STRING },
            color: { type: Type.STRING },
            quantity: { type: Type.NUMBER },
          },
          required: ['product_id', 'quantity'],
        },
      },
    },
    required: ['customer_name', 'phone', 'district', 'thana', 'area', 'full_address', 'items'],
  },
};

const sendOrderToTelegramGroupTool: FunctionDeclaration = {
  name: 'send_order_to_telegram_group',
  description: 'Dispatches confirmed order card with product image and interactive buttons to the Telegram Order Notification Group.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      order_id: {
        type: Type.STRING,
        description: 'The internal ID or order code of the confirmed order',
      },
    },
    required: ['order_id'],
  },
};

const handoffToHumanTool: FunctionDeclaration = {
  name: 'handoff_to_human',
  description: 'Switches the conversation to Human Support Mode when customer asks for a person or admin.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      reason: {
        type: Type.STRING,
        description: 'Reason for handoff (e.g., customer requested human, complex custom inquiry)',
      },
    },
    required: ['reason'],
  },
};

const getBusinessPoliciesTool: FunctionDeclaration = {
  name: 'get_business_policies',
  description: 'Returns the store official business policies: delivery, return, exchange, payments, and hours.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const TOOLS = [
  {
    functionDeclarations: [
      searchProductsTool,
      getProductDetailsTool,
      checkStockTool,
      calculateOrderTool,
      getCustomerTool,
      createOrderTool,
      sendOrderToTelegramGroupTool,
      handoffToHumanTool,
      getBusinessPoliciesTool,
    ],
  },
];

// Helper to execute tools against our DB
export async function executeTool(name: string, args: any): Promise<any> {
  switch (name) {
    case 'search_products': {
      const products = db.getProducts({ search: args.query || args.color });
      return products.map((p) => ({
        product_id: p.product_id,
        name: p.product_name,
        price: p.discount_price || p.price,
        original_price: p.price,
        colors: p.colors,
        stock: p.stock,
        fabric: p.fabric,
        status: p.status,
        image: p.images[0],
      }));
    }
    case 'get_product_details': {
      const p = db.getProductById(args.product_id);
      if (!p) return { error: 'Product not found with ID: ' + args.product_id };
      return {
        product_id: p.product_id,
        name: p.product_name,
        price: p.price,
        discount_price: p.discount_price,
        colors: p.colors,
        stock: p.stock,
        fabric: p.fabric,
        kameez_length: p.kameez_length,
        salwar_length: p.salwar_length,
        orna_length: p.orna_length,
        description: p.description,
        delivery_info: p.delivery_info,
        status: p.status,
        images: p.images,
      };
    }
    case 'check_stock': {
      const p = db.getProductById(args.product_id);
      if (!p) return { available: false, error: 'Product not found' };
      const requestedQty = args.quantity || 1;
      const isAvailable = p.status === 'active' && p.stock >= requestedQty;
      return {
        product_id: p.product_id,
        name: p.product_name,
        available: isAvailable,
        stock_remaining: p.stock,
        available_colors: p.colors,
      };
    }
    case 'calculate_order': {
      let subtotal = 0;
      const breakdown = (args.items || []).map((item: any) => {
        const p = db.getProductById(item.product_id);
        const unit = p ? (p.discount_price || p.price) : 1200;
        const total = unit * (item.quantity || 1);
        subtotal += total;
        return {
          product_id: item.product_id,
          name: p?.product_name || 'Batik Product',
          color: item.color,
          quantity: item.quantity,
          unit_price: unit,
          total_price: total,
        };
      });
      const deliveryCharge = db.calculateDeliveryCharge(args.district, args.thana);
      return {
        items: breakdown,
        subtotal,
        delivery_charge: deliveryCharge,
        total: subtotal + deliveryCharge,
      };
    }
    case 'get_customer': {
      const cust = db.getCustomerByPhone(args.phone);
      if (!cust) return { found: false };
      return {
        found: true,
        name: cust.name,
        phone: cust.phone,
        district: cust.district,
        thana: cust.thana,
        area: cust.area,
        full_address: cust.full_address,
      };
    }
    case 'create_order': {
      const order = db.createOrder({
        customer_name: args.customer_name,
        customer_phone: args.phone,
        district: args.district,
        thana: args.thana,
        area: args.area,
        full_address: args.full_address,
        alt_phone: args.alt_phone,
        delivery_note: args.delivery_note,
        items: args.items,
      });
      return {
        success: true,
        order_id: order.id,
        order_code: order.order_code,
        total: order.total,
        status: order.status,
      };
    }
    case 'send_order_to_telegram_group': {
      const res = db.dispatchOrderToTelegramGroup(args.order_id);
      return res;
    }
    case 'handoff_to_human': {
      return {
        handoff_activated: true,
        message: 'Human support has been notified. An admin representative will join shortly.',
      };
    }
    case 'get_business_policies': {
      const settings = db.getSettings();
      return {
        business_name: settings.business.business_name,
        about: settings.business.about,
        return_policy: settings.business.return_policy,
        exchange_policy: settings.business.exchange_policy,
        payment_methods: settings.business.payment_methods,
        delivery_policy: settings.delivery,
      };
    }
    default:
      return { error: 'Unknown tool: ' + name };
  }
}

// Conversation agent caller
export async function runSalesAgent(
  conversationId: string,
  userMessageText: string,
  customerMeta?: { name?: string; phone?: string }
): Promise<{
  replyText: string;
  mediaUrl?: string;
  orderSummary?: any;
  toolCallsList?: Array<{ name: string; args: any; result: any }>;
  isHumanHandoff?: boolean;
}> {
  const conv = db.getConversation(conversationId);
  const settings = db.getSettings();

  // Record user message
  db.addMessageToConversation(conversationId, {
    sender: 'customer',
    text: userMessageText,
  });

  // Check if conversation is already in human handoff
  if (conv?.is_human_handoff) {
    const reply = 'আমাদের একজন প্রতিনিধি খুব শীঘ্রই আপনার সাথে যুক্ত হবেন। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।';
    db.addMessageToConversation(conversationId, {
      sender: 'system',
      text: reply,
      is_human_handoff: true,
    });
    return {
      replyText: reply,
      isHumanHandoff: true,
    };
  }

  // Check for immediate human handoff trigger phrases
  const handoffKeywords = [
    'মানুষের সাথে কথা বলতে চাই',
    'মানুষের সাথে কথা বলব',
    'এডমিন চাই',
    'অ্যাডমিন এর সাথে কথা বলব',
    'human support',
    'agent চাই',
    'representative',
    'কথা বলতে চাই কারো সাথে',
  ];
  if (handoffKeywords.some((k) => userMessageText.toLowerCase().includes(k))) {
    db.setHumanHandoff(conversationId, true, 'Customer requested human support');
    const reply = 'জি অবশ্যই! আপনার বার্তাটি আমাদের শপ ম্যানেজারের কাছে ফরোয়ার্ড করা হয়েছে। কিছুক্ষণের মধ্যে আমাদের একজন প্রতিনিধি আপনার সাথে যুক্ত হবেন। ধন্যবাদ!';
    db.addMessageToConversation(conversationId, {
      sender: 'ai',
      text: reply,
      is_human_handoff: true,
    });
    return {
      replyText: reply,
      isHumanHandoff: true,
      toolCallsList: [{ name: 'handoff_to_human', args: { reason: 'User requested human' }, result: { success: true } }],
    };
  }

  // Check provider
  if (settings.ai.provider === 'openai_compatible' && settings.ai.api_key) {
    try {
      const baseUrl = settings.ai.base_url || 'https://api.openai.com/v1';
      const modelName = settings.ai.model_name || 'gpt-4o-mini';

      const messages: any[] = [
        { role: 'system', content: settings.ai.system_prompt },
      ];

      const pastMessages = conv?.messages.slice(-8) || [];
      for (const m of pastMessages) {
        messages.push({
          role: m.sender === 'customer' ? 'user' : 'assistant',
          content: m.text,
        });
      }
      messages.push({ role: 'user', content: userMessageText });

      const openaiTools = [
        {
          type: 'function',
          function: {
            name: 'search_products',
            description: 'Search available batik products',
            parameters: { type: 'object', properties: { query: { type: 'string' }, color: { type: 'string' } } },
          },
        },
        {
          type: 'function',
          function: {
            name: 'get_product_details',
            description: 'Get product details by ID',
            parameters: { type: 'object', properties: { product_id: { type: 'string' } }, required: ['product_id'] },
          },
        },
        {
          type: 'function',
          function: {
            name: 'check_stock',
            description: 'Check stock',
            parameters: { type: 'object', properties: { product_id: { type: 'string' }, quantity: { type: 'number' } }, required: ['product_id'] },
          },
        },
        {
          type: 'function',
          function: {
            name: 'calculate_order',
            description: 'Calculate subtotal and delivery',
            parameters: {
              type: 'object',
              properties: {
                items: { type: 'array', items: { type: 'object', properties: { product_id: { type: 'string' }, color: { type: 'string' }, quantity: { type: 'number' } } } },
                district: { type: 'string' },
                thana: { type: 'string' },
              },
              required: ['items', 'district'],
            },
          },
        },
        {
          type: 'function',
          function: {
            name: 'create_order',
            description: 'Create confirmed order after explicit customer confirmation',
            parameters: {
              type: 'object',
              properties: {
                customer_name: { type: 'string' },
                phone: { type: 'string' },
                district: { type: 'string' },
                thana: { type: 'string' },
                area: { type: 'string' },
                full_address: { type: 'string' },
                items: { type: 'array', items: { type: 'object', properties: { product_id: { type: 'string' }, color: { type: 'string' }, quantity: { type: 'number' } } } },
              },
              required: ['customer_name', 'phone', 'district', 'thana', 'area', 'full_address', 'items'],
            },
          },
        },
        {
          type: 'function',
          function: {
            name: 'handoff_to_human',
            description: 'Handoff to human support',
            parameters: { type: 'object', properties: { reason: { type: 'string' } }, required: ['reason'] },
          },
        },
      ];

      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.ai.api_key}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages,
          tools: openaiTools,
          temperature: settings.ai.temperature || 0.3,
        }),
      });

      if (res.ok) {
        const completion = await res.json();
        const choice = completion.choices?.[0]?.message;
        let reply = choice?.content || '';
        const toolCalls = choice?.tool_calls || [];
        const executedCalls: any[] = [];
        let mediaUrl: string | undefined;

        if (toolCalls.length > 0) {
          for (const tc of toolCalls) {
            const name = tc.function.name;
            const args = JSON.parse(tc.function.arguments || '{}');
            const result = await executeTool(name, args);
            executedCalls.push({ name, args, result });

            if (name === 'get_product_details' && result.images?.[0]) mediaUrl = result.images[0];
            if (name === 'search_products' && result[0]?.image) mediaUrl = result[0].image;
            if (name === 'create_order' && result.order_id) db.dispatchOrderToTelegramGroup(result.order_id);
          }

          // Follow up completion with tool results
          messages.push(choice);
          for (const tc of toolCalls) {
            const found = executedCalls.find((e) => e.name === tc.function.name);
            messages.push({
              role: 'tool',
              tool_call_id: tc.id,
              content: JSON.stringify(found?.result || {}),
            });
          }

          const res2 = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${settings.ai.api_key}`,
            },
            body: JSON.stringify({
              model: modelName,
              messages,
              temperature: settings.ai.temperature || 0.3,
            }),
          });
          if (res2.ok) {
            const comp2 = await res2.json();
            reply = comp2.choices?.[0]?.message?.content || reply;
          }
        }

        db.addMessageToConversation(conversationId, {
          sender: 'ai',
          text: reply,
          media_url: mediaUrl,
          tool_calls: executedCalls,
        });

        return {
          replyText: reply,
          mediaUrl,
          toolCallsList: executedCalls,
        };
      }
    } catch (err) {
      console.warn('OpenAI compatible call failed, falling back:', err);
    }
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      // Prepare conversation history
      const historyContents: any[] = [];
      const pastMessages = conv?.messages.slice(-8) || [];
      for (const m of pastMessages) {
        if (m.sender === 'customer') {
          historyContents.push({ role: 'user', parts: [{ text: m.text }] });
        } else if (m.sender === 'ai') {
          historyContents.push({ role: 'model', parts: [{ text: m.text }] });
        }
      }

      // Add current user message
      historyContents.push({
        role: 'user',
        parts: [{ text: userMessageText }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: historyContents,
        config: {
          systemInstruction: settings.ai.system_prompt,
          temperature: settings.ai.temperature || 0.3,
          tools: TOOLS,
        },
      });

      const executedCalls: Array<{ name: string; args: any; result: any }> = [];
      let finalReply = response.text || '';
      let mediaUrlToSend: string | undefined;
      let orderCreated: Order | undefined;
      let draftSummary: any = undefined;

      // Handle function calls if any
      const functionCalls = response.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        const functionResponsesParts: any[] = [];

        for (const call of functionCalls) {
          if (!call.name) continue;
          const callName: string = call.name;
          const result = await executeTool(callName, call.args);
          executedCalls.push({ name: callName, args: call.args, result });

          // Extract image if we searched or got product details
          if (call.name === 'get_product_details' && result.images && result.images[0]) {
            mediaUrlToSend = result.images[0];
          } else if (call.name === 'search_products' && result.length > 0 && result[0].image) {
            mediaUrlToSend = result[0].image;
          }

          if (call.name === 'create_order' && result.order_id) {
            orderCreated = db.getOrderById(result.order_id);
            // Automatically trigger telegram dispatch as per PRD
            db.dispatchOrderToTelegramGroup(result.order_id);
          }

          if (call.name === 'calculate_order') {
            draftSummary = result;
          }

          functionResponsesParts.push({
            functionResponse: {
              name: call.name,
              response: { result },
            },
          });
        }

        // Call model with tool outputs to get the final natural Bengali response
        const secondResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            ...historyContents,
            response.candidates?.[0]?.content || { role: 'model', parts: [{ text: 'Calling tools...' }] },
            {
              role: 'user',
              parts: functionResponsesParts,
            },
          ],
          config: {
            systemInstruction: settings.ai.system_prompt,
            temperature: settings.ai.temperature || 0.3,
          },
        });

        finalReply = secondResponse.text || finalReply;
      }

      // If reply is empty, formulate a helpful fallback
      if (!finalReply.trim()) {
        finalReply = 'ধন্যবাদ আপনার বার্তার জন্য। আমরা আপনাকে কীভাবে সাহায্য করতে পারি? আমাদের কাছে প্রিমিয়াম খাঁটি সুতি বাটিক ও জয়পুরী মোম বাটিক কালেকশন রয়েছে।';
      }

      // Record AI response
      db.addMessageToConversation(conversationId, {
        sender: 'ai',
        text: finalReply,
        media_url: mediaUrlToSend,
        tool_calls: executedCalls,
        order_summary: draftSummary || orderCreated,
      });

      return {
        replyText: finalReply,
        mediaUrl: mediaUrlToSend,
        orderSummary: draftSummary || orderCreated,
        toolCallsList: executedCalls,
      };
    } catch (err) {
      console.warn('Gemini API call failed or timed out, using intelligent sales engine fallback:', err);
    }
  }

  // Intelligent, deterministic fallback engine following PRD rules when API key is unconfigured or in edge cases
  const fallbackResult = await runDeterministicSalesEngine(conversationId, userMessageText, customerMeta);
  return fallbackResult;
}

// Fallback rule engine strictly implementing PRD sales flow & 10 confirmation steps
async function runDeterministicSalesEngine(
  conversationId: string,
  userText: string,
  meta?: { name?: string; phone?: string }
): Promise<{
  replyText: string;
  mediaUrl?: string;
  orderSummary?: any;
  toolCallsList?: Array<{ name: string; args: any; result: any }>;
  isHumanHandoff?: boolean;
}> {
  const lower = userText.toLowerCase().trim();
  const conv = db.getConversation(conversationId);
  const products = db.getProducts({ status: 'active' });
  const executedCalls: Array<{ name: string; args: any; result: any }> = [];

  // 1. Check for Confirmation
  const confirmWords = ['হ্যাঁ', 'জি', 'হ্যা', 'yes', 'confirm', 'অর্ডার করেন', 'অর্ডার করুন', 'ঠিক আছে', 'নিশ্চিত', 'done', 'জি করেন'];
  const isConfirmIntent = confirmWords.some((w) => lower === w || lower.startsWith(w));

  // Extract phone number from text if present (Bangladeshi 11 digits: 017..., 018..., 019..., 013..., 014..., 015..., 016...)
  const phoneMatch = userText.match(/(?:\+?88)?(01[3-9]\d{8})/);
  const foundPhone = phoneMatch ? phoneMatch[1] : undefined;

  // Check if text has district/address
  const hasDhaka = lower.includes('ঢাকা') || lower.includes('dhaka');
  const hasChittagong = lower.includes('চট্টগ্রাম') || lower.includes('chittagong');
  const hasSavar = lower.includes('সাভার') || lower.includes('savar') || lower.includes('আশুলিয়া') || lower.includes('ashulia');

  // Check state in conversation draft
  let draft = conv?.draft_order;

  // A. Handling Order Confirmation
  if (isConfirmIntent && draft && draft.items && draft.items.length > 0 && draft.step === 'summary_shown') {
    const order = db.createOrder({
      customer_name: draft.customer_name || 'সম্মানিত কাস্টমার',
      customer_phone: draft.phone || '01800000000',
      district: draft.district || 'ঢাকা',
      thana: draft.thana || 'সদর',
      area: draft.area || 'এলাকা',
      full_address: draft.full_address || 'ঠিকানা',
      items: draft.items.map((i) => ({
        product_id: i.product_id,
        color: i.color,
        quantity: i.quantity,
      })),
    });

    executedCalls.push({
      name: 'create_order',
      args: { order_code: order.order_code, total: order.total },
      result: { success: true, order_id: order.id },
    });

    const tgRes = db.dispatchOrderToTelegramGroup(order.id);
    executedCalls.push({
      name: 'send_order_to_telegram_group',
      args: { order_id: order.id },
      result: tgRes,
    });

    draft.step = 'confirmed';
    const reply = `🎉 অভিনন্দন! আপনার অর্ডারটি সফলভাবে কনফার্ম করা হয়েছে।\n\n📌 অর্ডার আইডি: **${order.order_code}**\n👗 প্রোডাক্ট: ${order.items[0].product_name} (${order.items[0].color})\n💰 সর্বমোট: ৳${order.total} (ক্যাশ অন ডেলিভারি)\n\nখুব শীঘ্রই আমাদের ডেলিভারি প্রতিনিধি আপনার ঠিকানায় প্রোডাক্ট পৌঁছে দেবেন। আমাদের সাথে থাকার জন্য ধন্যবাদ! ❤️`;

    db.addMessageToConversation(conversationId, {
      sender: 'ai',
      text: reply,
      media_url: order.items[0].image_url,
      tool_calls: executedCalls,
      order_summary: order,
    });

    return {
      replyText: reply,
      mediaUrl: order.items[0].image_url,
      orderSummary: order,
      toolCallsList: executedCalls,
    };
  }

  // B. Order intent or details submission
  const wantsOrder =
    lower.includes('অর্ডার') ||
    lower.includes('order') ||
    lower.includes('নিতে চাই') ||
    lower.includes('নিব') ||
    lower.includes('কিনি') ||
    lower.includes('পাঠান');

  if (wantsOrder || (draft && draft.step === 'collecting')) {
    // If no draft exists, initialize one
    if (!draft) {
      const defaultProduct = products[0];
      draft = {
        items: [
          {
            product_id: defaultProduct.product_id,
            product_name: defaultProduct.product_name,
            color: defaultProduct.colors[0],
            quantity: 1,
            unit_price: defaultProduct.discount_price || defaultProduct.price,
          },
        ],
        subtotal: defaultProduct.discount_price || defaultProduct.price,
        delivery_charge: 80,
        total: (defaultProduct.discount_price || defaultProduct.price) + 80,
        step: 'collecting',
      };
      if (conv) conv.draft_order = draft;
    }

    // Try to extract color from message
    for (const p of products) {
      for (const col of p.colors) {
        const colWord = col.split(' ')[0].toLowerCase();
        if (lower.includes(colWord)) {
          draft.items[0].color = col;
          draft.items[0].product_id = p.product_id;
          draft.items[0].product_name = p.product_name;
          draft.items[0].unit_price = p.discount_price || p.price;
        }
      }
    }

    // Try to extract phone
    if (foundPhone) {
      draft.phone = foundPhone;
    }

    // Try to extract district & thana
    if (hasSavar) {
      draft.district = 'ঢাকা';
      draft.thana = 'সাভার';
      draft.delivery_charge = 120;
    } else if (hasDhaka) {
      draft.district = 'ঢাকা';
      draft.thana = draft.thana || 'সদর/সিটি';
      draft.delivery_charge = 80;
    } else if (hasChittagong) {
      draft.district = 'চট্টগ্রাম';
      draft.delivery_charge = 150;
    }

    // If customer provided full address or name
    if (userText.length > 15 && (foundPhone || userText.includes('রোড') || userText.includes('বাসা') || userText.includes('গ্রাম') || userText.includes('থানা'))) {
      draft.full_address = userText;
      if (!draft.customer_name) {
        const namePart = userText.split(/[,\n।]/)[0];
        draft.customer_name = namePart.replace(/[0-9]/g, '').trim() || 'সম্মানিত কাস্টমার';
      }
      if (!draft.area) draft.area = 'উল্লেখিত এলাকা';
      if (!draft.thana) draft.thana = 'সদর';
      if (!draft.district) draft.district = 'ঢাকা';
    }

    // Recalculate subtotal & total
    draft.subtotal = draft.items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
    draft.total = draft.subtotal + draft.delivery_charge;

    // Check what is missing
    const missing: string[] = [];
    if (!draft.items[0].color) missing.push('পছন্দের কালার');
    if (!draft.phone) missing.push('১১ ডিজিটের মোবাইল নম্বর');
    if (!draft.district || !draft.full_address) missing.push('আপনার জেলা, থানা ও সম্পূর্ণ ঠিকানা (বাসা/রোড নং)');

    if (missing.length === 0) {
      // All information collected! Show the strict final confirmation summary!
      draft.step = 'summary_shown';
      const item = draft.items[0];
      const summaryText = `আপনার অর্ডারের তথ্য:\n\n👤 নাম: ${draft.customer_name || 'কাস্টমার'}\n📞 মোবাইল: ${draft.phone}\n\n👗 প্রোডাক্ট: ${item.product_name}\n🎨 কালার: ${item.color}\n🔢 পরিমাণ: ${item.quantity} পিস\n\n📍 জেলা: ${draft.district}\n🏛️ থানা: ${draft.thana || 'উল্লেখিত'}\n🏡 এলাকা ও ঠিকানা: ${draft.full_address}\n\n━━━━━━━━━━━━━━━━━\nSubtotal: ৳${draft.subtotal}\nডেলিভারি চার্জ: ৳${draft.delivery_charge}\nসর্বমোট: ৳${draft.total} (ক্যাশ অন ডেলিভারি)\n━━━━━━━━━━━━━━━━━\n\nআপনার অর্ডারটি কি Confirm করবেন? (দয়া করে 'হ্যাঁ' বা 'Confirm' লিখে জানান)`;

      db.addMessageToConversation(conversationId, {
        sender: 'ai',
        text: summaryText,
        media_url: products.find((p) => p.product_id === item.product_id)?.images[0],
        order_summary: draft,
      });

      return {
        replyText: summaryText,
        mediaUrl: products.find((p) => p.product_id === item.product_id)?.images[0],
        orderSummary: draft,
      };
    } else {
      // Ask for missing details politely
      const promptReply = `অর্ডারটি সম্পন্ন করতে অনুগ্রহ করে আপনার **${missing.join(' ও ')}** লিখে পাঠাবেন কি?\n\nউদাহরণ:\nনাম: রহিমা আক্তার\nমোবাইল: 018XXXXXXXX\nকালার: রয়েল ব্লু\nঠিকানা: বাসা ৩২, রোড ৮, ধানমন্ডি, ঢাকা`;

      db.addMessageToConversation(conversationId, {
        sender: 'ai',
        text: promptReply,
      });

      return {
        replyText: promptReply,
      };
    }
  }

  // C. Price / Color inquiry
  const asksPrice = lower.includes('দাম') || lower.includes('price') || lower.includes('কত');
  const asksColor = lower.includes('কালার') || lower.includes('রং') || lower.includes('colour') || lower.includes('color');
  const asksFabric = lower.includes('কাপড়') || lower.includes('কাপড়') || lower.includes('ফেব্রিক') || lower.includes('fabric');

  if (asksPrice || asksColor || asksFabric) {
    const p = products[0];
    executedCalls.push({
      name: 'get_product_details',
      args: { product_id: p.product_id },
      result: p,
    });

    const reply = `👗 **${p.product_name}**\n\n💰 **মূল্য:** ৳${p.discount_price || p.price} (রেগুলার ৳${p.price})\n🎨 **কালারসমূহ:** ${p.colors.join(', ')}\n🧵 **কাপড়:** ${p.fabric}\n📏 **মাপ:** কামিজ ${p.kameez_length}, সেলোয়ার ${p.salwar_length}, ওড়না ${p.orna_length}\n📦 **স্টক:** বর্তমানে ${p.stock} পিস অ্যাভেইলেবল রয়েছে।\n\nআপনি কোন কালারটি নিতে আগ্রহী? জানালে আমি অর্ডারটি প্রসেস করতে সাহায্য করব!`;

    db.addMessageToConversation(conversationId, {
      sender: 'ai',
      text: reply,
      media_url: p.images[0],
      tool_calls: executedCalls,
    });

    return {
      replyText: reply,
      mediaUrl: p.images[0],
      toolCallsList: executedCalls,
    };
  }

  // D. General Greeting or fallback
  const firstP = products[0];
  const reply = `আসসালামু আলাইকুম! **Batik Shopping (ঘড়ের শপিং)**-এ আপনাকে স্বাগতম। 🌸\n\nআমাদের কাছে ১০০% খাঁটি সুতি ভয়েল মোম বাটিক ও জয়পুরী কটন থ্রি-পিস কালেকশন রয়েছে।\n\n✨ হট সেলিং: **${firstP.product_name}** — মাত্র ৳${firstP.discount_price}!\n\nআপনি কি কোনো নির্দিষ্ট কালার বা থ্রি-পিসের বিস্তারিত জানতে চান, নাকি অর্ডার করতে চান?`;

  db.addMessageToConversation(conversationId, {
    sender: 'ai',
    text: reply,
    media_url: firstP.images[0],
  });

  return {
    replyText: reply,
    mediaUrl: firstP.images[0],
  };
}
