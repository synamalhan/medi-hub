# MediHub Platform

> **The Future of Medical Education**

MediHub is a modern, AI-powered web platform designed for medical students and professionals. It consolidates patient simulators, adaptive flashcards, research summarization, mnemonics, deadline tracking, and advanced analytics into a single, intelligent system. Built with React, TypeScript, Vite, Tailwind CSS, Zustand, and Supabase, MediHub leverages state-of-the-art AI/ML models and a robust subscription/paywall system to deliver a best-in-class learning experience.

---

## 🚀 Features

### 1. **AI Research Paper Summarizer**
- Upload PDF research papers and generate concise, AI-powered summaries.
- Uses local Transformers.js (DistilBART) for privacy and speed.
- Extracts, analyzes, and highlights key findings, methodology, and results.
- Summaries are saved to your account for future reference.

### 2. **Adaptive Flashcards**
- Create, review, and manage medical flashcards with spaced repetition.
- Tag, search, and filter cards by specialty or topic.
- Tracks review accuracy, streaks, and next review dates.

### 3. **Deadline Tracker**
- Organize exams, assignments, rotations, and applications.
- Smart countdowns, priority management, and overdue alerts.
- Filter, sort, and mark deadlines as complete.

### 4. **AI Mnemonic Generator**
- Generate creative, funny, or professional mnemonics for any medical term using OpenAI.
- Save, browse, and categorize mnemonics.
- Free users get 5 AI generations/month; Pro users get unlimited.

### 5. **AI Patient Simulator**
- Practice clinical reasoning with realistic, AI-generated virtual patients.
- Each case includes demographics, symptoms, history, and voice synthesis (ElevenLabs).
- Submit diagnoses, receive instant feedback, and track your accuracy.

### 6. **Advanced Analytics** *(Pro)*
- Visualize study progress, session history, and category performance.
- Track streaks, total study hours, accuracy, and more.
- Seed test data for demo or development.

### 7. **User Profile & Achievements**
- Manage account info, export data, and view earned badges.
- Track stats: streaks, flashcards reviewed, mnemonics created, simulator cases completed, etc.

### 8. **Subscription & Paywall System**
- RevenueCat + Stripe integration for Pro subscriptions (monthly/yearly).
- Feature gating via `ProFeature` component and paywall modals.
- Mock mode for local development/testing.

---

## 🏗️ Tech Stack & Architecture

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Zustand, Framer Motion
- **Backend/DB:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **AI/ML:**
  - Transformers.js (DistilBART) for local summarization
  - OpenAI (GPT-3.5) for mnemonics
  - ElevenLabs for patient voice synthesis
  - Tavus for demo video generation
- **Payments:** RevenueCat (web billing), Stripe
- **Other:** ESLint, Prettier, Recharts, Lucide Icons

---

## 📁 Directory Structure

```
project/
├── src/
│   ├── pages/           # Main app pages (Dashboard, Flashcards, Simulator, etc.)
│   ├── components/      # UI components, paywall, layout, etc.
│   ├── lib/             # API clients, AI integrations, utilities
│   ├── stores/          # Zustand state stores
│   ├── hooks/           # Custom React hooks
│   ├── types/           # Shared TypeScript types
│   └── index.css        # Tailwind base styles
├── public/
│   └── models/          # Local AI model files (ONNX, tokenizer, config)
├── supabase/
│   ├── migrations/      # SQL migrations for all tables and policies
│   └── functions/       # Edge Functions (e.g., RevenueCat webhook)
├── package.json         # Project metadata and scripts
├── tailwind.config.js   # Tailwind theme and tokens
├── vite.config.ts       # Vite build config
├── .env                 # Environment variables (not committed)
└── README.md            # This file
```

---

## ⚡ Quick Start

### 1. **Clone the Repository**
```bash
git clone https://github.com/synamalhan/medi-hub.git
cd medi-hub
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Configure Environment Variables**
Create a `.env` file in the root (see `.gitignore`). Example:
```
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI (for mnemonics)
VITE_OPENAI_API_KEY=your_openai_api_key

# ElevenLabs (for voice synthesis)
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key

# RevenueCat/Stripe (for subscriptions)
VITE_REVENUECAT_API_KEY=your_revenuecat_api_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_STRIPE_MERCHANT_ID=your_stripe_merchant_id
REVENUECAT_WEBHOOK_SECRET=your_webhook_secret

# Tavus (for demo video)
VITE_TAVUS_API_KEY=your_tavus_api_key
```

### 4. **Run the Development Server**
```bash
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173) in your browser.

### 5. **Supabase Setup**
- Create a Supabase project and apply all SQL migrations in `supabase/migrations/`.
- Set up Edge Functions for webhooks (see `supabase/functions/revenuecat-webhook/index.ts`).
- Enable Row Level Security (RLS) on all tables.

---

## 🗄️ Database Schema (Supabase/PostgreSQL)

- **profiles**: User info, stats, subscription status
- **patient_cases**: AI-generated patient scenarios
- **flashcards**: User-created flashcards
- **deadlines**: User deadlines (exams, assignments, etc.)
- **mnemonics**: User and AI-generated mnemonics
- **study_sessions**: Study session logs
- **research_summaries**: Uploaded papers and AI summaries
- **category_performance**: Analytics by specialty
- **subscription_events**: RevenueCat webhook logs
- **ai_generations**: Track AI usage (mnemonics, summaries, etc.)

All tables have RLS enabled and policies for user data isolation. See `supabase/migrations/` for full schema and policies.

---

## 🤖 AI & ML Integrations

- **Research Summarizer:** Local Transformers.js (DistilBART) for privacy-first summarization. Model files in `public/models/`.
- **Mnemonic Generator:** OpenAI GPT-3.5 for creative mnemonics. Fallback to local templates if API unavailable.
- **Patient Simulator:** Randomized case generator with ElevenLabs voice synthesis for realistic interviews.
- **Demo Video:** Tavus API for AI-generated landing page demo video.

---

## 💳 Subscription & Paywall (Pro Features)

- **RevenueCat + Stripe** for web billing and entitlements.
- **ProFeature** component for feature gating (overlay, compact, inline, or hidden variants).
- **SubscriptionPaywall** modal for upgrades, with mock mode for local/dev.
- **Edge Function** webhook for syncing subscription status to Supabase.
- **TestPaywall** component for debugging and QA.
- See `PAYWALL_USAGE.md`, `REVENUECAT_SETUP.md`, and `PAYWALL_TESTING.md` for full details.

---

## 🧑‍💻 Usage & Demo

- **Demo Credentials:**
  - Email: `student@medihub.com`
  - Password: `password`
- Register/login to unlock all features.
- Use the navigation bar to access Flashcards, Deadlines, Research Summarizer, Patient Simulator, Mnemonics, Analytics, and Profile.
- Pro features are marked and gated; upgrade via the paywall to unlock.

---

## 🛠️ Development & Testing

- **Scripts:**
  - `npm run dev` — Start dev server
  - `npm run build` — Build for production
  - `npm run preview` — Preview production build
  - `npm run lint` — Lint codebase
- **Mock Mode:**
  - If API keys are missing, the app runs in mock mode for RevenueCat and AI features.
- **Seeding Analytics:**
  - Use the "Seed Test Data" button in Analytics to populate demo data.

---

## 🤝 Contributing

1. Fork the repo and create your branch: `git checkout -b feature/your-feature`
2. Commit your changes: `git commit -m 'Add some feature'`
3. Push to the branch: `git push origin feature/your-feature`
4. Open a pull request

**Guidelines:**
- Write clear, maintainable code (TypeScript preferred)
- Use descriptive commit messages
- Add/modify tests if applicable
- Document new features in the README

---

## 📄 License

This project is licensed under the MIT License.

---

*Made with ❤️ by the MediHub team.* 