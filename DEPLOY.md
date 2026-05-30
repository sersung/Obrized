# BuildrAI — Production Deployment Guide

This guide provides step-by-step instructions to configure **BuildrAI** for production deployment on Vercel, including setting up **NextAuth**, **Google OAuth**, and **Supabase Database**.

---

## 🔑 Required Environment Variables

To make all platform features (Authentication, Google Login, AI Quantity Takeoffs, CCDC Analysis, and Database persistence) work in production, configure the following variables in your **Vercel Project Settings > Environment Variables**:

| Variable Name | Description | Example / Recommended Value |
|---|---|---|
| `NEXTAUTH_SECRET` | A secure, random string used to encrypt NextAuth JWT tokens. | *Run command below to generate* |
| `NEXTAUTH_URL` | The absolute canonical URL of your production website. | `https://your-app-name.vercel.app` |
| `GOOGLE_CLIENT_ID` | Client ID from Google Cloud Console for OAuth. | `123456789-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Client Secret from Google Cloud Console for OAuth. | `GOCSPX-your_secret_key_here` |
| `SUPABASE_URL` | Your Supabase project API Endpoint. | `https://your-project-id.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Your Supabase project secret service role key. | `eyJhbGciOiJIUzI1NiIsInR...` |
| `GEMINI_API_KEY` | Google Gemini API Key for Takeoffs & AI Agents. | `AIzaSyYourGeminiAPIKeyHere` |

---

## 🛠️ Step 1: Setting up NextAuth (Session & Credentials Login)

NextAuth is pre-configured to support Credentials (email/password) and Google OAuth. 

### 1. Generating a `NEXTAUTH_SECRET`
You can generate a secure secret key by running this command in your local terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and set it as `NEXTAUTH_SECRET` in your Vercel project settings.

### 2. Testing Credentials Login (Failsafe Fallback)
We have implemented a **failsafe credentials login fallback** so you can always log in instantly with the demo account, even if your database is not yet configured:
- **Email**: `john.carter@jcconstruction.ca`
- **Password**: `password123`

---

## 🌐 Step 2: Setting up Google OAuth Sign-In

To enable the "Sign In with Google" button in production:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Search for **APIs & Services** > **OAuth consent screen**:
   - Choose **External** user type and click **Create**.
   - Complete the App Information (name, support email, logo).
   - Add the developer contact email and save.
4. Go to **APIs & Services** > **Credentials**:
   - Click **+ CREATE CREDENTIALS** > **OAuth client ID**.
   - Select **Web application** as the Application type.
   - Set the name (e.g. `BuildrAI Production`).
   - Under **Authorized JavaScript origins**, add:
     - `http://localhost:3000` (for local testing)
     - `https://your-app-name.vercel.app` (your Vercel production URL)
   - Under **Authorized redirect URIs**, add:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://your-app-name.vercel.app/api/auth/callback/google`
5. Click **Create** and copy the **Client ID** and **Client Secret**.
6. Paste them into Vercel as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

---

## 🗄️ Step 3: Setting up Supabase Database (Optional)

BuildrAI uses an **automatic local offline database mock** (based on local JSON files inside `.data/`) when Supabase keys are missing. This allows local development and initial testing to run out of the box with zero setup.

For production persistence, configure Supabase:

1. Go to [Supabase Console](https://supabase.com/) and create a new project.
2. Go to **Project Settings** > **API** to grab your **Project URL** (`SUPABASE_URL`) and **service_role API key** (`SUPABASE_SERVICE_KEY`).
3. Add them to Vercel.
4. Run the following SQL schema in the Supabase **SQL Editor** to provision your database tables:

```sql
-- Profiles table to store users
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  company TEXT,
  password_hash TEXT,
  provider TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read and update their own profile
CREATE POLICY "Allow public read for profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow individual update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
```

Once configured, Vercel will automatically connect to your live Supabase database and persist registered users, estimates, contracts, daily safety logs, and proper invoices!
