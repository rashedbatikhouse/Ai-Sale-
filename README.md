# 🌸 Batik Shopping AI Sales & Order Agent (ঘড়ের শপিং AI)
> **An Open-Source Automated Sales, Inventory & Order Management System for Facebook Page Messenger with Dual Telegram Groups and Admin Control Center.**

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://react.dev/)
[![Gemini API](https://img.shields.io/badge/Google%20GenAI-gemini--3.8--flash-orange.svg)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 মূল উদ্দেশ্য ও সিস্টেম আর্কিটেকচার (System Architecture)

এই ওপেন সোর্স সিস্টেমটির লক্ষ্য হলো যেকোনো ই-কমার্স বা শপ (যেমন: বাটিক ও বুটিকের কাপড়) তাদের ফেসবুক পেজের মেসেঞ্জারে মানুষের মতো চ্যাট করে প্রোডাক্টের দাম ও স্টক জানিয়ে কাস্টমারের কাছ থেকে ধাপে ধাপে অর্ডার গ্রহণ করবে এবং কনফার্ম হওয়া অর্ডার স্বয়ংক্রিয়ভাবে নির্দিষ্ট **টেলিগ্রাম গ্রুপে (Telegram Group)** পাঠিয়ে দেবে।

```
                  CUSTOMER (কাস্টমার)
                           ↓
             FACEBOOK PAGE MESSENGER INBOX
                           ↓
           AI SALES AGENT (Gemini / DeepSeek / GPT)
                           ↓
               PRODUCT & STOCK DATABASE (নলেজবেজ)
                           ↓
            STEP-BY-STEP ADDRESS & ORDER DRAFT
                           ↓
             FINAL ORDER SUMMARY (চূড়ান্ত সামারি)
                           ↓
             EXPLICIT CUSTOMER CONFIRMATION ('হ্যাঁ' / 'জি')
                           ↓
                    CONFIRMED ORDER
             ┌─────────────┴─────────────┐
             ↓                           ↓
   DATABASE PERSISTENCE        TELEGRAM GROUP 2:
   (অর্ডার হিস্ট্রি ও হিসাব)     ORDER NOTIFICATION GROUP
                                         ↓
                               ADMIN LIVE STATUS BUTTONS
                               [Processing] [Packed] [Shipped]
```

সিস্টেমে দুটি আলাদা টেলিগ্রাম গ্রুপ থাকে:
1. **Group 1 — Product Management Group:** এডমিনরা চ্যাট থেকেই `/addproduct`, `/products`, `/stock`, `/price`, `/search` কমান্ড দিয়ে প্রোডাক্ট পরিচালনা করে।
2. **Group 2 — Order Notification Group:** কনফার্ম হওয়া অর্ডারের ছবি, কাস্টমার ফোন, ঠিকানা ও স্ট্যাটাস চেঞ্জের বোতাম সহ লাইভ নোটিফিকেশন যায়।

---

## 🔑 সাধারণ জিজ্ঞাসা (Frequently Asked Questions)

### ১. টেলিগ্রাম বটের টোকেন (Bot Token) কেন লাগবে?
* **বট টোকেন কী:** টেলিগ্রাম প্ল্যাটফর্মে আপনার তৈরি বটের সিক্রেট চাবি (যেমন: `7481920491:AAH8j...`)।
* **কেন প্রয়োজন:** আমাদের সার্ভার যখন কোনো কাস্টমারের অর্ডার কনফার্ম করে, তখন টেলিগ্রাম গ্রুপে স্বয়ংক্রিয়ভাবে প্রোডাক্টের ছবি ও কাস্টমারের ঠিকানা পোস্ট করতে টেলিগ্রাম API পারমিশন প্রয়োজন হয়। এই টোকেন ছাড়া টেলিগ্রাম গ্রুপে বাইরের সার্ভার থেকে কোনো নোটিফিকেশন পাঠানো বা স্ট্যাটাস বাটনের ক্লিক রিসিভ করা সম্ভব নয়।
* **কীভাবে পাবেন:**
  1. Telegram অ্যাপে গিয়ে **@BotFather** সার্চ করুন।
  2. চ্যাটে `/newbot` লিখে সেন্ড করুন।
  3. আপনার বটের নাম ও ইউজারনেম দিন (যেমন: `MyShopSalesBot`)।
  4. BotFather আপনাকে একটি HTTP API Token দেবে। সেটি কপি করে সেটিংস বা `.env` ফাইলে বসান।

---

### ২. টেলিগ্রাম গ্রুপের আইডি (Group ID) কীভাবে পাবেন?
টেলিগ্রাম গ্রুপের আইডি সবসময় **-100** দিয়ে শুরু হয় (যেমন: `-1002489102381`)। আইডি বের করার ৩টি সহজ উপায়:

* **পদ্ধতি ১ (সবচেয়ে সহজ - RawDataBot):**
  আপনার টেলিগ্রাম গ্রুপে গিয়ে সাময়িকভাবে **@RawDataBot** বটটিকে যোগ করুন। বটটি সাথে সাথে গ্রুপের বিস্তারিত ডাটা চ্যাটে পোস্ট করবে। সেখানে `"id": -100xxxxxxxxxx` সংখ্যাটি দেখতে পাবেন। সেটি কপি করে বটটিকে গ্রুপ থেকে রিমুভ করে দিন।
* **পদ্ধতি ২ (Telegram Web):**
  কম্পিউটারের ব্রাউজারে `web.telegram.org` ওপেন করে আপনার গ্রুপটিতে ক্লিক করুন। ব্রাউজারের অ্যাড্রেস বারের URL-এ লক্ষ্য করলে দেখতে পাবেন `https://web.telegram.org/a/#-1002489102381`। এই `-100...` অংশটিই আপনার Group ID।
* **পদ্ধতি ৩ (Message Forward):**
  আপনার গ্রুপের যেকোনো একটি মেসেজ কপি বা ফরোয়ার্ড করে **@getidsbot** এ পাঠালে সে ওই চ্যাটের আইডি বলে দেবে।

> ⚠️ **গুরুত্বপূর্ণ:** গ্রুপে আপনার তৈরি করা নিজস্ব বটটিকে **Administrator** হিসেবে যোগ করে মেসেজ পোস্ট করার অনুমতি দিতে হবে।

---

### ৩. গুগলের জেমিনাই (Gemini) ছাড়া অন্য যেকোনো LLM ব্যবহার করা যাবে কি?
**হ্যাঁ, শতভাগ যাবে!** সিস্টেমে মাল্টি-প্রোভাইডার সাপোর্ট রয়েছে:
* **Google Gemini:** `gemini-3.8-flash` (ডিফল্ট, অতি দ্রুত বাংলা বোঝে)
* **OpenAI Compatible Models:**
  * **DeepSeek-V3 / DeepSeek-Chat:** অত্যন্ত সাশ্রয়ী ও চমৎকার বাংলা রেসপন্স (`https://api.deepseek.com/v1`)
  * **OpenAI:** `gpt-4o-mini` / `gpt-4o` (`https://api.openai.com/v1`)
  * **Groq:** `llama-3.3-70b-versatile` (`https://api.groq.com/openai/v1`)
  * **Local Ollama:** আপনার নিজস্ব পিসিতে অফলাইনে লোকাল মডেল চালাতে পারেন (`http://localhost:11434/v1`)

ড্যাশবোর্ডের **সেটিংস ও ইন্টিগ্রেশন → AI এজেন্ট ও মডেল নির্বাচন** ট্যাবে গিয়ে এক ক্লিকেই প্রোভাইডার পরিবর্তন করা যায়।

---

## 🚀 লোকাল রান ও সেলফ-হোস্টিং গাইড (Quick Start)

### ১. রিপোজিটরি ক্লোন ও ইনস্টলেশন
```bash
git clone https://github.com/your-username/batik-sales-agent.git
cd batik-sales-agent

# প্রয়োজনীয় ডিপেন্ডেন্সি ইনস্টল করুন
npm install
```

### ২. এনভায়রনমেন্ট ভেরিয়েবল সেটআপ (`.env`)
`.env.example` ফাইলটি কপি করে `.env` তৈরি করুন:
```bash
cp .env.example .env
```
`.env` ফাইলে আপনার কি-গুলো দিন:
```env
# AI API Key (Gemini বা OpenAI)
GEMINI_API_KEY="AIzaSy..."

# আপনার অ্যাপ্লিকেশনের লাইভ ডোমেইন বা পাবলিক URL
APP_URL="https://your-domain.com"

# Telegram Bot & Dual Groups
TELEGRAM_BOT_TOKEN="7481920491:AAH8j..."
TELEGRAM_PRODUCT_GROUP_ID="-1002489102381"
TELEGRAM_ORDER_GROUP_ID="-1009876543210"
TELEGRAM_AUTHORIZED_ADMIN_IDS="184920491,928174012"

# Facebook Messenger (Meta Developer App)
FACEBOOK_PAGE_ID="109876543210"
FACEBOOK_PAGE_ACCESS_TOKEN="EAA..."
FACEBOOK_VERIFY_TOKEN="batik_sales_agent_secret_verify_token"
```

### ৩. অ্যাপ্লিকেশন রান করুন
```bash
# ডেভেলপমেন্ট মোডে:
npm run dev

# প্রোডাকশন মোডে:
npm run build
npm start
```
ব্রাউজারে `http://localhost:3000` ওপেন করলেই অ্যাডমিন ড্যাশবোর্ড ও লাইভ চ্যাট টেস্টার পেয়ে যাবেন।

---

## 🌐 GitHub Pages এবং লাইভ হোস্টিং সম্পর্কিত তথ্য

### কেন GitHub Pages-এ সাদা স্ক্রিন (Blank Page) আসত এবং সমাধান:
1. **অ্যাসেট পাথ (Vite Base Path):** GitHub Pages সাব-ফোল্ডারে হোস্ট হয় (`https://username.github.io/repo/`)। আমরা `vite.config.ts`-এ `base: './'` সেট করেছি, ফলে এখন আর অ্যাসেট 404 হবে না এবং UI সঠিকভাবে লোড হবে।
2. **ব্যাকএন্ড সার্ভার (Node.js/Express):** মনে রাখবেন, GitHub Pages শুধুমাত্র স্ট্যাটিক HTML/CSS/JS হোস্ট করে। কিন্তু আমাদের সিস্টেমে আছে **Google Gemini AI Sales Agent, Telegram Group Webhook এবং Facebook Messenger Graph API** — যা চালানোর জন্য একটি ব্যাকএন্ড Node.js সার্ভার প্রয়োজন।
3. **বিনামূল্যে ফুলস্ট্যাক হোস্ট করার উপায়:**
   * **Render.com:** New Web Service → Connect GitHub Repo → Build Command: `npm install && npm run build` → Start Command: `npm start` (ফ্রি টায়ারে সম্পূর্ণ ব্যাকএন্ড ও টেলিগ্রাম বট লাইভ চলবে!)
   * **Railway.app / Koyeb:** রিপো কানেক্ট করলেই অটোমেটিক ফুলস্ট্যাক ডিপ্লয় হয়ে যাবে।

---

## 📱 ফেসবুক পেজ মেসেঞ্জার কানেক্ট করার নিয়ম

1. **Meta for Developers** (`developers.facebook.com`) এ যান এবং একটি **Business App** তৈরি করুন।
2. **Messenger** প্রোডাক্টটি যোগ করুন।
3. আপনার ফেসবুক পেজটি কানেক্ট করে **Page Access Token** জেনারেট করুন।
4. **Webhooks** সেকশনে যান:
   * **Callback URL:** `https://your-domain.com/api/webhook/facebook`
   * **Verify Token:** আপনার ড্যাশবোর্ডে দেওয়া সিক্রেট টোকেন (ডিফল্ট: `batik_sales_agent_secret_verify_token`)
5. Subscription Fields হিসেবে `messages` এবং `messaging_postbacks` সিলেক্ট করে Verify & Save করুন।

---

## 🔒 সিকিউরিটি ও কঠোর বিক্রয় নীতি (Strict Sales Policy)

1. **Anti-Hallucination:** AI কখনোই বানিয়ে কোনো দাম, স্টক, সাইজ, ডিসকাউন্ট বা রিটার্ন পলিসি বলবে না। ডাটাবেজে তথ্য না থাকলে সে মানুষের সহায়তার জন্য রিকোয়েস্ট করবে।
2. **Explicit Confirmation Rule:** কাস্টমারকে সমস্ত আইটেম, কালার, কোয়ান্টিটি, ফোন নম্বর, জেলা, থানা, সম্পূর্ণ ঠিকানা এবং ডেলিভারি চার্জ সমন্বিত ফাইনাল সামারি দেখানোর পর কাস্টমার সুস্পষ্টভাবে সম্মতি (`হ্যাঁ` / `জি` / `অর্ডার করেন`) দিলেই কেবল অর্ডার ডাটাবেজে কনফার্মড হবে।
3. **Telegram RBAC:** গ্রুপ ১ ও ২-এ শুধুমাত্র কনফিগার করা Authorized Admin ID-রা কমান্ড ও স্ট্যাটাস বাটন চাপতে পারবে; অন্য কেউ চাপলে কমান্ড স্বয়ংক্রিয়ভাবে রিজেক্ট হবে।

---

## 📄 লাইসেন্স (License)
এই প্রোজেক্টটি **MIT License**-এর আওতাভুক্ত। আপনি বা যেকোনো ডেভেলপার এটি স্বাধীনভাবে ব্যক্তিগত বা ব্যবসায়িক কাজে ব্যবহার, পরিবর্তন ও রি-ডিস্ট্রিবিউট করতে পারবেন।
