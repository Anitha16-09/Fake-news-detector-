# VeriSight AI — See Beyond the Headlines

A premium, full-stack AI-powered fake news detection platform. VeriSight AI analyzes news articles, headlines, URLs, and uploaded documents (PDF/DOCX/TXT) to determine whether content is **Real**, **Fake**, or **Uncertain** — with confidence scores, bias analysis, emotional tone detection, suspicious-sentence highlighting, and fact-check suggestions.

Built as a final-year Computer Science project with a futuristic glassmorphism UI, dark mode, and a responsive design.

## Features

- **AI Fake News Detector** — paste text, enter a URL, or upload a file
- **Confidence-scored verdicts** (Real / Fake / Uncertain) with animated progress rings
- **Bias analysis** & **emotional tone detection**
- **Suspicious sentence highlighting** with per-sentence reasons
- **Manipulation indicators** (clickbait, emotional language, conspiracy framing, absolute claims, unsourced hedging)
- **AI-generated summaries** via extractive summarization
- **Fact-check keyword suggestions** with one-click search links
- **Reliability meter** & processing time
- **Text-to-speech** for results
- **Downloadable reports** (TXT)
- **History** with search, filter, sort, bookmark, and CSV export
- **Dashboard** with activity charts (bar + pie) and recent activity
- **Authentication** — email/password sign up, login, forgot password (Supabase Auth)
- **Profile** — edit name, avatar, notification prefs, dark mode, change password
- **Admin dashboard** — user management, platform analytics, verdict distribution
- **Dark mode** with system preference detection
- **Glassmorphism UI** with Framer Motion animations
- **Fully responsive** — desktop, tablet, mobile

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Routing | React Router v6 |
| Animation | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Backend / Auth / DB | Supabase (PostgreSQL + Auth + RLS) |
| AI Engine | Custom heuristic analysis engine (see below) |

## The Analysis Engine

VeriSight AI uses a multi-signal heuristic engine (`src/lib/analyze.ts`) that scores content across:

- **Clickbait patterns** — sensational phrases ("you won't believe", "shocking", etc.)
- **Emotional manipulation** — outrage, fear, alarmist vocabulary
- **Absolute claims** — "always", "never", "everyone", "100%"
- **Conspiracy framing** — "deep state", "cover-up", "wake up"
- **Unsourced hedging** — "allegedly", "sources say", "reportedly"
- **Credibility signals** — attributed sources, data references, "according to", journal citations
- **Writing style** — capitalization, exclamation density, sentence structure

These signals combine into a manipulation score and a credibility score, which produce the verdict and confidence percentage. The engine also generates an extractive summary, detects emotional tone, extracts fact-check keywords, and flags individual suspicious sentences with reasons.

> **Disclaimer:** AI predictions are advisory and not a substitute for professional fact-checking.

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck
```

## Environment Variables

Supabase credentials are pre-configured in `.env`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

No additional configuration needed.

## Database Schema

Three tables with Row Level Security:

- **profiles** — extends `auth.users` with name, avatar, role, notification prefs
- **analyses** — one row per detection run (verdict, confidence, explanation, scores, keywords)
- **reports** — shareable report records linked to analyses

The first user to sign up is automatically promoted to **admin** role.

## Project Structure

```
src/
├── components/        # Reusable UI (Navbar, Footer, Logo, AuthLayout, etc.)
├── lib/               # Supabase client, auth context, theme, toast, analysis engine
├── pages/             # Route pages (Landing, Login, Analyze, Dashboard, etc.)
├── App.tsx            # Router + providers
├── main.tsx           # Entry point
└── index.css          # Tailwind + glassmorphism utilities
```

## Brand

- **Primary:** #2563EB (Trust Blue)
- **Secondary:** #06B6D4 (Cyan)
- **Success:** #10B981 (Green)
- **Warning:** #EF4444 (Red)
- **Fonts:** Inter (body) + Poppins (display)

## License

MIT — built for educational purposes as a final-year CS project.
