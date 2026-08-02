# Workpage

A schedule-based task manager that solves a problem most to-do list apps ignore: **losing track of which subject a task belongs to.**

🔗 **Live Demo:** [https://workpage-zeta.vercel.app]
📂 **Repo:** [https://github.com/ArtWarakorn/workpage]

---

## 💡 The Problem

Generic to-do list apps let you dump tasks into one big list. When you're juggling multiple subjects, that quickly becomes confusing — you write down "finish assignment 3" and a week later have no idea which class it was for.

## ✅ The Solution

Workpage starts with your **class schedule**, not a blank task list. Every task you add is created by clicking directly into a scheduled class, so it's automatically tied to that subject. No mislabeling, no guessing — your workload is organized by class from the moment you create it.

**Core features:**
- 📅 Build a personal class schedule (day/time/subject)
- ✏️ Click into any scheduled class to add tasks or assignments for it
- 📋 View tasks grouped clearly by subject — no more mixed, ambiguous to-do lists
- ☁️ Data synced and persisted per user via Supabase

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| Backend | Next.js (API routes) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Hosting | Vercel |

Fully deployed on a free-tier stack — no paid infrastructure required to run or extend.

## 🖼️ Screenshots

> _Add 2–3 screenshots or a short GIF here showing: (1) the schedule view, (2) clicking into a class to add a task, (3) the subject-grouped task list._

## 🚀 Getting Started (Local Setup)

```bash
# Clone the repo
git clone https://github.com/ArtWarakorn/workpage
cd workpage

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase URL and anon key to .env.local

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it locally.

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🗺️ Roadmap / Ideas for Future Improvement

- [ ] Due date reminders / notifications
- [ ] Mark tasks complete + progress tracking per subject
- [ ] Weekly/monthly workload overview
- [ ] Mobile-optimized UI polish
- [ ] Export schedule/tasks to calendar (Google Calendar sync)

## 👤 Author

Built by **[Warakorn junsongnean]** — student & developer, currently focused on full-stack web development.

