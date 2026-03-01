# NBA Analytics Hub

A comprehensive NBA player analytics platform featuring EPD (Effectiveness Per Dollar) rankings and Breakout Tracker predictions.

## Features

- **EPD Rankings**: Measures player value relative to contract cost, accounting for age, availability, and replaceability
- **Breakout Tracker**: Identifies players poised for breakout seasons based on talent and opportunity metrics
- **Player Comparison**: Side-by-side analysis of any two players
- **Team Analytics**: Roster value breakdown and team standings
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM
- **Icons**: Lucide React

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

### Option 1: Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project" → Import your repository
4. Vercel auto-detects Vite settings
5. Click "Deploy"

No configuration needed - Vercel handles everything automatically.

### Option 2: Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com)
3. Create a new "Static Site"
4. Connect your repository
5. Configure:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
6. Click "Deploy"

### Option 3: Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your repository
5. Configure:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
6. Click "Deploy"

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx       # Navigation header
│   └── ui.tsx           # Shared components (badges, cards, etc.)
├── data/                # Player and team data
│   ├── players.ts       # Base player data + teams
│   └── additionalPlayers.ts  # Extended player roster
├── hooks/               # React hooks
│   └── usePlayers.ts    # Player data management
├── lib/                 # Business logic
│   └── metrics.ts       # EPD & Breakout calculations
├── pages/               # Route components
│   ├── HomePage.tsx
│   ├── EPDPage.tsx
│   ├── BreakoutPage.tsx
│   ├── PlayersPage.tsx
│   ├── PlayerDetailPage.tsx
│   ├── TeamsPage.tsx
│   └── ComparePage.tsx
├── types/               # TypeScript interfaces
│   └── index.ts
├── App.tsx              # Main app with routing
├── main.tsx             # Entry point
└── index.css            # Global styles + Tailwind
```

## Analytics Methodology

### EPD (Effectiveness Per Dollar)

```
EPD = (Age-Adjusted Production × Availability × Replaceability) / Salary
```

**Tiers:**
- Elite: ≥$8 EPD per $1M
- Great: ≥$5
- Good: ≥$3
- Average: ≥$1.5
- Below Average: ≥$0.5
- Poor: <$0.5

### Breakout Tracker

**Breakout Score**: Geometric mean of Talent Score × Opportunity Score

**Tiers:**
- Established: Already starring or age >29
- Imminent: Score ≥70
- High Potential: Score ≥55
- Developing: Score ≥40
- Blocked: Score <40

## Data

Uses realistic static data based on the 2024-25 NBA season. Architecture ready for live API integration.

## License

MIT
