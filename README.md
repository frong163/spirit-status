# ✦ Spirit Status

> Daily tarot draws · Aura tiers · Global spiritual rankings

A mobile-first web app where users draw one tarot card per day to improve their spiritual attributes and compete on a global leaderboard.

---

## ✨ Features

- **22 Major Arcana Cards** — each with unique attribute effects, lucky number/color/direction
- **5 Core Attributes** — Luck 🍀, Wealth 💰, Love ❤️, Career 💼, Energy ⚡
- **5 Aura Tiers** — Wanderer → Seeker → Mystic → Oracle → Celestial
- **6 Leaderboards** — Spirit Score + one per attribute
- **Daily Streak Rewards** — 3-day, 7-day, 30-day milestones
- **Public Profiles** at `/u/[username]`
- **Shareable Aura Cards** — optimized for X, Facebook, LINE, Instagram
- **Animated Radar Chart** — visualize all 5 attributes
- **Dark Mystical Theme** — purple/gold/navy palette, Cinzel + Inter fonts

---

## 🚀 Quick Start

### 1. Clone and install

\`\`\`bash
git clone <your-repo>
cd spirit-status
npm install
\`\`\`

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the full schema:

\`\`\`bash
# Copy contents of supabase/schema.sql into Supabase SQL Editor and run
\`\`\`

3. Copy your project credentials:

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

4. Fill in `.env.local`:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

### 3. Run locally

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

---

## 📦 Deploy to Vercel

### Option A — Vercel CLI

\`\`\`bash
npm i -g vercel
vercel
\`\`\`

### Option B — GitHub + Vercel Dashboard

1. Push to GitHub
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Supabase Auth Redirect URLs

In Supabase → Authentication → URL Configuration, add:

\`\`\`
https://your-app.vercel.app/**
http://localhost:3000/**
\`\`\`

---

## 🗂 Project Structure

\`\`\`
spirit-status/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/page.tsx        # Auth (sign in / sign up)
│   ├── dashboard/            # Main game UI (protected)
│   │   ├── page.tsx          # Server shell (force-dynamic)
│   │   └── DashboardClient.tsx # Full game client component
│   ├── leaderboard/page.tsx  # Public leaderboard
│   ├── u/[username]/page.tsx # Public user profiles
│   └── api/
│       ├── user/route.ts     # User profile API
│       └── leaderboard/route.ts # Leaderboard API
├── components/
│   ├── ui/
│   │   ├── AuraRing.tsx       # Animated aura ring (signature element)
│   │   ├── TierBadge.tsx      # Aura tier badge
│   │   ├── AttributeBar.tsx   # Animated stat bar
│   │   └── SpiritRadarChart.tsx # Recharts radar
│   ├── dashboard/
│   │   └── StreakDisplay.tsx  # Streak tracker with milestones
│   ├── tarot/
│   │   ├── TarotCardDraw.tsx  # 3D flip card animation
│   │   └── DailyExtras.tsx    # Lucky number/color/direction
│   ├── leaderboard/
│   │   └── Leaderboard.tsx    # 6-tab sortable leaderboard
│   ├── profile/
│   │   └── UserAvatar.tsx     # Avatar with aura glow
│   └── share/
│       └── ShareCard.tsx      # Social share card + buttons
├── lib/
│   ├── tarot.ts              # All 22 Major Arcana cards
│   ├── game.ts               # Score, tier, streak logic
│   └── supabase/
│       ├── client.ts         # Browser Supabase client
│       └── server.ts         # Server Supabase client
├── types/index.ts            # All TypeScript types
├── supabase/schema.sql       # Full DB schema + RLS + views
└── tailwind.config.ts        # Mystical design tokens
\`\`\`

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| `void` | `#0A0618` — deep background |
| `indigo.deep` | `#1A0F3C` — card background |
| `mystic` | `#7B2FBE` — primary purple |
| `oracle.gold` | `#C9A84C` — accent gold |
| `oracle.light` | `#E8D5A3` — text |
| Display font | Cinzel (Roman serif) |
| Body font | Inter |
| Data font | JetBrains Mono |

---

## 🃏 Tarot Cards & Attribute Effects

All 22 Major Arcana are implemented with:
- Unique emoji & symbol
- Description & affirmation text
- 2–4 attribute modifiers (+2 to +9)
- Lucky number (0–21)
- Lucky color with hex value
- Lucky direction

Example:
| Card | Effects |
|------|---------|
| The Sun ☀️ | +8 Luck, +5 Energy |
| The World 🌍 | +5 Luck, +4 Wealth, +3 Love, +3 Career |
| Wheel of Fortune 🎡 | +9 Luck, +2 Wealth |

---

## 🗃 Database Schema

Key tables:
- **`profiles`** — user data, all 5 attributes, streak, badges
- **`draw_history`** — every card drawn with before/after scores

Views (for leaderboards):
- `leaderboard_spirit` — ranked by spirit score
- `leaderboard_luck/wealth/love/career/energy` — ranked by attribute

Row Level Security enabled — users can only write their own data.

---

## 🔮 Architecture Notes for Future Features

The codebase is structured to support:

| Feature | Where to add |
|---------|-------------|
| Friends | `profiles` relation table + friend feed |
| Guilds | `guilds` + `guild_members` tables |
| Weekly events | `events` table + event modifier system |
| Spiritual quests | `quests` + `user_quests` tables |
| Premium memberships | Stripe + `subscriptions` table |
| Push notifications | Supabase Edge Functions + Web Push API |

---

## 📱 Mobile PWA (Optional Enhancement)

Add to `app/manifest.ts`:

\`\`\`ts
export default function manifest() {
  return {
    name: 'Spirit Status',
    short_name: 'Spirit',
    theme_color: '#0A0618',
    background_color: '#0A0618',
    display: 'standalone',
    start_url: '/dashboard',
    icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
  };
}
\`\`\`

---

Built with Next.js 15 · Supabase · Tailwind CSS · Recharts · TypeScript
