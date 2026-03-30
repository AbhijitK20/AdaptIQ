# AdaptIQ

**An intelligent learning system that diagnoses *why* students fail by analyzing concept dependencies and provides personalized learning paths using visual knowledge graphs and AI assistance.**

> Stop wondering why you got it wrong. Start understanding why.

---

## Vision

Move from:
> "You got this wrong"

To:
> "You got this wrong because you missed concept X, which depends on Y"

AdaptIQ is not just another quiz platform. It's a **structured diagnostic system** that understands how knowledge connects and identifies exactly where your learning breaks down.

---

## Live Demo

- **Landing Page**: `/landing` - Product overview and value proposition
- **Dashboard**: `/` - Your learning hub with progress stats
- **Practice**: `/practice` - Answer questions and get diagnosed
- **Knowledge Map**: `/knowledge-map` - Visual concept dependency graph
- **Progress**: `/progress` - Track your learning journey

---

## Core Features

### 1. Concept Graph Engine
A predefined structured knowledge graph where:
- **Nodes** represent concepts (e.g., Force, Mass, Acceleration)
- **Edges** represent dependencies/prerequisites
- Visual status indicators: Green (mastered), Yellow (weak), Red (missing)

### 2. Practice System
- Curated question bank with difficulty levels (easy, medium, hard)
- Questions tagged with related concepts
- Instant feedback with detailed explanations
- Root cause analysis for incorrect answers

### 3. Diagnosis Engine (Core Innovation)
When a student answers incorrectly:
1. Maps the error to specific concepts
2. Traces prerequisite chain (1-2 levels deep)
3. Identifies missing concepts and probable root causes
4. Suggests personalized learning paths

### 4. Visual Knowledge Map
- Interactive graph visualization using SVG
- Pan/zoom controls for exploration
- Click nodes for concept details
- Visual dependency highlighting on hover
- Color-coded progress indicators

### 5. AI Study Companion
- Context-aware chat assistant
- Explains concepts and mistakes
- Suggests what to study next
- Quick action buttons for common queries

### 6. Progress Tracking
- Accuracy metrics over time
- Concept mastery breakdown (pie chart)
- Individual concept progress bars
- Learning insights and achievements

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Charts | Recharts |
| Graph Visualization | Custom SVG-based component |
| Typography | Plus Jakarta Sans |
| Icons | Lucide React |

---

## Project Structure

```
adaptiq/
├── app/
│   ├── layout.tsx          # Root layout with fonts and metadata
│   ├── page.tsx             # Dashboard page
│   ├── globals.css          # Design system tokens
│   ├── landing/
│   │   └── page.tsx         # Marketing landing page
│   ├── practice/
│   │   └── page.tsx         # Practice session with questions
│   ├── knowledge-map/
│   │   └── page.tsx         # Interactive knowledge graph
│   └── progress/
│       └── page.tsx         # Progress tracking and insights
├── components/
│   ├── navbar.tsx           # Navigation component
│   ├── stat-card.tsx        # Statistics display card
│   ├── concept-card.tsx     # Concept information card
│   ├── concept-badge.tsx    # Status badge (mastered/weak/missing)
│   ├── question-card.tsx    # MCQ question component
│   ├── diagnosis-panel.tsx  # Root cause analysis display
│   ├── ai-chat-panel.tsx    # AI assistant chat interface
│   └── knowledge-graph.tsx  # SVG-based graph visualization
├── lib/
│   ├── types.ts             # TypeScript type definitions
│   ├── data.ts              # Mock data and utility functions
│   └── utils.ts             # Helper utilities
└── README.md
```

---

## Design System

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#2563EB` | Intelligent blue - main actions |
| Secondary | `#38BDF8` | Light blue highlights |
| Background | `#F8FAFC` | Page background |
| Surface | `#FFFFFF` | Cards and surfaces |
| Success | `#22C55E` | Mastered concepts |
| Warning | `#F59E0B` | Weak concepts |
| Danger | `#EF4444` | Missing concepts |
| Text Primary | `#0F172A` | Main text |
| Text Muted | `#64748B` | Secondary text |
| Border | `#E2E8F0` | Borders and dividers |

### Typography
- **Font**: Plus Jakarta Sans (fallback: Inter, sans-serif)
- **H1**: 40-48px, weight 700
- **H2**: 28-32px, weight 600
- **H3**: 20-24px, weight 600
- **Body**: 16px, weight 400-500
- **Caption**: 12-14px, weight 400

### Spacing
- Gap system: 8px base scale (8 / 12 / 16 / 24 / 32)
- Card padding: 20-24px
- Section padding: 64-96px
- Max width: 1200px (dashboard), 1400px (graph view)

### Border Radius
- Cards: 16px
- Buttons: 10px
- Inputs: 8px

---

## Data Model

### Entities

```typescript
// Core domain types
interface Concept {
  id: string;
  name: string;
  subject: string;
  chapter: string;
  description: string;
  status?: 'mastered' | 'weak' | 'missing';
  accuracy?: number;
}

interface ConceptDependency {
  id: string;
  parentConceptId: string;
  childConceptId: string;
}

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
  conceptIds: string[];
}

interface UserConceptProgress {
  id: string;
  userId: string;
  conceptId: string;
  accuracy: number;
  confidenceLevel: 'low' | 'medium' | 'high';
  lastUpdated: Date;
}
```

---

## User Interaction Flow

### Dashboard
1. View progress summary and stats
2. See weak concepts that need attention
3. Get suggested next topic
4. Start practice session

### Practice Session
1. Answer MCQ questions
2. Get instant feedback
3. View explanations for correct answers
4. See root cause analysis for incorrect answers
5. Get AI-powered assistance
6. View session summary on completion

### Knowledge Map
1. Explore concept graph visually
2. Click nodes to see details
3. View prerequisites and dependents
4. Navigate to practice for specific concepts
5. Switch between graph and list views

### Progress
1. View accuracy trends over time
2. See mastery distribution
3. Review individual concept progress
4. Get personalized learning insights

---

## Development Phases

### Phase 1: Foundation (Current MVP)
- [x] Project setup with Next.js
- [x] Design system implementation
- [x] Core UI components
- [x] Mock data for Physics chapter
- [x] Basic navigation

### Phase 2: Practice System
- [x] Question card component
- [x] Answer submission flow
- [x] Feedback display
- [x] Explanation rendering

### Phase 3: Diagnosis Engine
- [x] Error to concept mapping
- [x] Prerequisite chain tracing
- [x] Root cause panel
- [x] Suggested path display

### Phase 4: Knowledge Graph
- [x] SVG-based visualization
- [x] Node color coding
- [x] Interactive pan/zoom
- [x] Concept detail panel

### Phase 5: AI Integration
- [x] Chat panel UI
- [x] Quick action buttons
- [x] Context-aware suggestions
- [ ] Real AI API integration

### Phase 6: Progress Tracking
- [x] Accuracy charts
- [x] Concept breakdown
- [x] Learning insights
- [x] Trend visualization

---

## Future Roadmap

- [ ] Database integration (Supabase/PostgreSQL)
- [ ] User authentication
- [ ] Multi-subject support
- [ ] Full syllabus coverage
- [ ] Adaptive learning paths
- [ ] AI-generated questions
- [ ] Spaced repetition engine
- [ ] Mobile app
- [ ] Teacher dashboard
- [ ] Student collaboration features

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd smart-learning-graph

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Inactivity reminder emails (2 days, then weekly)

You can send reminder emails to users who are inactive:
- First reminder after **2 days** of inactivity
- Then reminder every **7 days** while still inactive

### 1) Create reminder state table (Supabase SQL editor)

Run:
`scripts/sql/create_reminder_state_table.sql`

### 2) Required environment variables

Add these in your `.env.local` (and production env):

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

RESEND_API_KEY=...
REMINDER_FROM_EMAIL="AdaptIQ <noreply@yourdomain.com>"
REMINDER_APP_URL="http://localhost:3000"
REMINDER_JOB_SECRET=your-strong-secret
```

### 3) Trigger the reminder job endpoint

Endpoint:
`POST /api/jobs/send-inactive-reminders`

Auth header required:
`Authorization: Bearer <REMINDER_JOB_SECRET>`

Example:

```bash
curl -X POST http://localhost:3000/api/jobs/send-inactive-reminders \
  -H "Authorization: Bearer your-strong-secret"
```

Dry run (no emails sent, only evaluation):

```bash
curl -X POST "http://localhost:3000/api/jobs/send-inactive-reminders?dryRun=1" \
  -H "Authorization: Bearer your-strong-secret"
```

### 4) Schedule it

Run this endpoint on a daily schedule (e.g., Vercel Cron, GitHub Action, server cron).  
The route itself handles the 2-day first reminder and then 7-day repeat cadence.

---

## Hindsight memory integration (recommended)

AdaptIQ now supports structured memory + reasoning via Hindsight to retain learning events and produce context-aware memory insights.

### What gets retained

- Quiz outcomes (`correct/incorrect`, concept, subject/chapter)
- Diagnosis events for incorrect answers
- Recommendation accept events
- Concept interactions (knowledge-map selection, chat interactions, profile switches)
- Progress snapshots (dashboard/progress page)
- Reminder send events (from reminder job)

### Hindsight env setup

Add these to `.env.local` (and production):

```bash
HINDSIGHT_API_URL=https://hindsight.vectorize.io
HINDSIGHT_API_KEY=... # optional if your deployment is public/no-auth
HINDSIGHT_BANK_PREFIX=adaptiq-user
```

### Internal API routes

- `POST /api/hindsight/event`  
  Retains one structured event to Hindsight.

- `POST /api/hindsight/insights`  
  Runs recall + reflect to return a short memory-grounded insight for chat.

If Hindsight env vars are missing, these routes safely return `skipped: hindsight-disabled`.

### Reminder personalization

When Hindsight is enabled, inactivity reminders attempt to use `reflect` for a short personalized nudge line.  
If unavailable, reminders automatically fall back to a generic nudge.

---

## Realtime catalog parity (Std 5-12 + BTech)

To run the app with full realtime syllabus parity (same scope as `lib/data` static catalog), use:

1) Apply realtime catalog schema:

`scripts/004_create_realtime_catalog_schema.sql`

2) Sync full catalog from `lib/data.ts` to Supabase:

```bash
pnpm sync:catalog
```

This imports:
- profiles (school + btech)
- subjects, chapters, modules
- concepts + dependency graph
- questions + quizzes

3) Start app:

```bash
pnpm dev
```

The app will read from realtime catalog tables when present, with static fallback if catalog data is missing.

---

## Target Audience

- **Primary**: Class 9-10 students (Science)
- **Focus**: Students struggling with:
  - Concept clarity
  - Weak fundamentals
  - Fragmented knowledge

---

## MVP Scope

- One subject: Physics
- One chapter: Force & Laws of Motion
- Pre-built concept graph with 10 concepts
- Curated question bank (8+ questions)
- Basic diagnosis with 1-2 level dependency tracing

---

## Key Differentiator

This product is NOT:
> "Just practice questions + AI"

This product IS:
> **A structured system that understands knowledge and student learning gaps**

The core innovation lies in the **Diagnosis Engine** that traces concept dependencies to identify the root cause of learning difficulties, providing actionable insights rather than just right/wrong feedback.

---

## License

MIT

---

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting pull requests.
