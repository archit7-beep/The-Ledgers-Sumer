# 🏛️ Ledger of Sumer (v1.0.0)

A modern, AI-powered fintech and accounting dashboard built for the future. **Ledger of Sumer** streamlines your invoicing workflow by using advanced AI Vision models to automatically extract and digitize invoice data from raw images and PDFs, presenting it in a premium SaaS interface.

![Ledger of Sumer Dashboard](public/logo.jpeg)

## ✨ Features

- **🤖 AI-Powered Data Extraction**: Upload any invoice (Image or PDF) and let our integration with **Groq (Llama 3 Vision)** automatically extract the Vendor Name, Total, Invoice Number, and itemized Line Items instantly.
- **📊 Premium SaaS Dashboard**: A beautiful, glassmorphic interface inspired by top-tier fintech apps (Linear, Stripe, Ramp). Features a 4-card KPI grid and recent activity feeds.
- **📌 Pinning & Sorting**: Keep track of what matters. Pin important or unpaid invoices to the top of your ledger for quick access.
- **🧾 Detailed Itemization**: Click on any vendor in the ledger to view a detailed breakdown of every line item, quantity, and subtotal.
- **🌗 Dark & Light Mode**: Seamless theme switching with carefully curated HSL color palettes that look stunning in any environment.
- **⚡ Built for Speed**: Powered by the Next.js App Router and Supabase for a snappy, real-time experience.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Base UI](https://base-ui.com/), Shadcn UI, and Lucide React
- **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **AI Integration**: [Groq API](https://groq.com/) (Llama 3.2 Vision & Llama 3.3)
- **Deployment**: Ready for Netlify / Vercel

## 🚀 Getting Started

### Prerequisites

You will need Node.js installed and accounts for Supabase and Groq.

### 1. Clone & Install

```bash
git clone https://github.com/archit7-beep/temp__01.git
cd temp__01
npm install
```

### 2. Environment Variables

Copy the example environment file and fill in your keys:

```bash
cp .env.example .env.local
```

You will need:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GROQ_API_KEY`

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📦 Deployment (Netlify)

This project is structured as a standard Next.js monolithic SaaS application. 

1. Push your code to GitHub.
2. Log into Netlify and select **"Add new site"** -> **"Import an existing project"**.
3. Connect your GitHub repository.
4. Netlify will automatically detect Next.js and set the build command to `npm run build` and output directory to `.next`.
5. Add your Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, etc.) in the Netlify dashboard.
6. Click **Deploy**!

---
*Built with ❤️ for the Hackathon.*
