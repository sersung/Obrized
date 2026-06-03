# BuildrAI — Production Deployment Guide (Clerk + Supabase)

This guide provides step-by-step instructions to configure **BuildrAI** for production deployment on Vercel, using **Clerk** for authentication (Google OAuth & Credentials) and **Supabase** for database storage.

---

## 🔑 Required Environment Variables

To make all platform features (Clerk Login, Google Login, AI Quantity Takeoffs, CCDC Analysis, and Supabase database persistence) work in production, configure the following variables in your **Vercel Project Settings > Environment Variables**:

| Variable Name | Description | Example / Recommended Value |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key (Client-side) | `pk_test_...` (Local) / `pk_live_...` (Prod) |
| `CLERK_SECRET_KEY` | Clerk Secret Key (Server-side) | `sk_test_...` (Local) / `sk_live_...` (Prod) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Redirect path for logging in | `/login` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Redirect path for signing up | `/register` |
| `SUPABASE_URL` | Your Supabase project API Endpoint. | `https://your-project-id.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Your Supabase project secret service role key. | `eyJhbGciOiJIUzI1NiIsInR...` |
| `GEMINI_API_KEY` | Google Gemini API Key for Takeoffs & AI Agents. | `AIzaSyYourGeminiAPIKeyHere` |

---

## 🛠️ Step 1: Setting up Clerk Authentication (Google OAuth & Credentials)

Clerk manages both credentials login and Google login automatically with zero domain or session cookie bugs on Vercel.

### 1. Creating a Clerk Application
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/) and create a free account.
2. Click **Create Application**.
3. Choose your sign-in methods:
   - Check **Email address** and **Password** (for standard credentials login).
   - Check **Google** (for one-click Google OAuth sign-in).
4. Click **Create Application**.
5. Copy your **Publishable Key** and **Secret Key** from the Clerk Dashboard and add them to your Vercel project settings (using the variable names in the table above).

### 2. Testing Credentials Login (Failsafe Offline Fallback)
If Clerk environment variables are not set (e.g. during local offline development), BuildrAI automatically activates **Demo Failsafe Mode**:
- You can log in instantly by clicking the **Demo Login** button.
- All client-side pages and server-side API routes will work seamlessly in demo mode with zero setup!

---

## 🌐 Step 2: Configuring Google OAuth in Clerk

Clerk handles Google OAuth callback endpoints for you automatically:

1. In the Clerk Dashboard, go to **User & Authentication** > **Social Connections**.
2. Click on the gear icon next to **Google** to edit settings.
3. By default, Clerk handles the Google credentials for development/testing out of the box (you don't even need to configure Google Cloud Console to start!).
4. For production, toggle **Use custom credentials** and paste your **Google Client ID** and **Google Client Secret** (obtained from Google Cloud Console under *APIs & Services > Credentials*) to connect it to your brand domain.

---

## 🗄️ Step 3: Setting up Supabase Database

BuildrAI uses an **automatic local offline database mock** (based on local JSON files inside `.data/`) when Supabase keys are missing. This allows local development and initial testing to run out of the box with zero setup.

For production database persistence, configure Supabase:

1. Vá para o [Supabase Console](https://supabase.com/) e crie um novo projeto.
2. Vá em **Project Settings** > **API** para copiar a URL do seu projeto (`SUPABASE_URL`) e a chave secreta service role (`SUPABASE_SERVICE_KEY`).
3. Adicione-as como variáveis de ambiente na Vercel.
4. Crie todas as tabelas necessárias e ative o RLS (Row Level Security) copiando e executando o script completo contido no arquivo [supabase_schema.sql](file:///C:/Users/pc/.gemini/antigravity/scratch/buildr-ai/supabase_schema.sql) na raiz do projeto dentro do **SQL Editor** do Supabase.

Uma vez executado o script, as tabelas `profiles`, `estimates`, `contracts`, `safety_reports` e `invoices` estarão criadas e seguras com o RLS ativado!

Uma vez configurado, o Vercel se conectará automaticamente ao banco do Supabase e persistirá todas as informações com segurança!
