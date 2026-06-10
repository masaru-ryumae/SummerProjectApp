# 🚀 Summer Builder Project App — MVP

**Find your perfect summer project in 60 seconds!**

A smart project recommender for high schoolers interested in building cool summer projects. Answer 6 quick questions, get personalized recommendations with budgets, timelines, and tutorial links.

---

## ✨ What It Does

1. **Answer 6 questions** about your interests, budget, time, and location
2. **Get top 3 personalized recommendations** with explanations
3. **See project details**: budget, skill level, time commitment, resources needed
4. **Click through to tutorials** and get started building!

---

## 🎯 Key Features

✅ **6-Question Decision Tree**
- Interest (CS, Electronics, Physics, Robotics, Web/App, Mixed)
- Skill Level (Beginner, Intermediate, Advanced)
- Budget ($0-25, $25-50, $50-100, $100-200, $200+)
- Time per Week (1-2 hrs, 3-5 hrs, 5+ hrs)
- Location (Home, Home+maker space, School lab, Outdoor)
- Preference (Learn, Build, Impress, Challenge)

✅ **Smart Matching Algorithm**
- Weighted scoring: Interest (40%), Budget (30%), Difficulty (15%), Time (10%), Location (5%)
- Personalized explanations ("Great for your $50 budget + Electronics interest!")
- Top 3 ranked results

✅ **50 Summer Projects**
- Diverse categories: Electronics, Robotics, CS, Physics, Web/App, Mixed
- All difficulty levels: Beginner (13), Intermediate (21), Advanced (16)
- Wide budget range: $0 to $250+
- Time estimates: 2-6 weeks
- Real tutorial links and parts lists

✅ **Beautiful UI**
- Dark mode (system preference + manual toggle)
- Mobile-responsive design
- Tech Dad voice (encouraging, hacker-ish tone)
- No external UI libraries (TailwindCSS only)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ (check: `node -v`)
- npm 8+ (check: `npm -v`)

### Install & Run

```bash
# Clone the repo
git clone https://github.com/yourusername/SummerProjectApp.git
cd SummerProjectApp

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open `http://localhost:5173` in your browser. 🎉

### Production Build

```bash
npm run build
npm run preview
```

Output: `dist/` folder ready for deployment.

---

## 📁 Project Structure

```
SummerProjectApp/
├── src/
│   ├── components/
│   │   ├── DecisionTree.jsx      # 6-question form
│   │   ├── ProjectCard.jsx       # Individual project card
│   │   ├── RecommendationView.jsx # Top 3 results
│   │   └── Dashboard.jsx         # State flow display
│   ├── data/
│   │   └── projects.json         # 50 summer projects
│   ├── utils/
│   │   └── projectMatcher.js     # Matching algorithm
│   ├── App.jsx                   # Main app
│   └── index.css                 # TailwindCSS styles
├── public/                       # Static assets
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── QA_REPORT.md                  # Testing details
```

---

## 🧠 How the Matching Works

### Scoring Algorithm

Each project is scored (0-100) based on:

1. **Interest Match (40%)** — Does the project match your interests?
2. **Budget Match (30%)** — Is it within your budget?
3. **Difficulty Match (15%)** — Does it match your skill level?
4. **Time Match (10%)** — Can you fit it in your schedule?
5. **Location Match (5%)** — Do you have access to required space/tools?

**Formula**: `score = (interest × 0.4) + (budget × 0.3) + (difficulty × 0.15) + (time × 0.1) + (location × 0.05)`

Top 3 projects are ranked and displayed with personalized explanations.

---

## 🧪 Testing

All 61 QA tests passed ✅

```bash
# Run tests
npm run test

# View test report
cat QA_REPORT.md
```

**Test Coverage:**
- DecisionTree component (8 tests)
- ProjectMatcher logic (12 tests)
- RecommendationView (8 tests)
- ProjectCard display (9 tests)
- UI/UX (11 tests)
- Integration (6 tests)
- Build verification (7 tests)

---

## 📊 Build Stats

- **Size**: 81.71 KB gzipped
- **JavaScript**: 248 KB
- **CSS**: 34 KB
- **Build time**: ~5 seconds
- **Type checking**: TypeScript-ready

---

## 🔮 Future Features (v2.0+)

- [ ] Save favorite projects to account
- [ ] Track project progress (start/in-progress/completed)
- [ ] User authentication & profiles
- [ ] Advanced filtering (tags, skills, location)
- [ ] Project sharing with friends
- [ ] Real-time community updates
- [ ] Video tutorials embedded
- [ ] Difficulty progression path
- [ ] Cost calculator with bulk purchasing
- [ ] Tutorial difficulty ratings from users

---

## 💡 Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: TailwindCSS v4
- **State**: React hooks (useState)
- **Build**: Vite

**Why this stack?**
- Vite: 10x faster than Create React App
- TailwindCSS: No bloated UI libraries, pure CSS
- React Hooks: Simple, scalable state management

---

## 🤝 Contributing

Found a bug or have a project idea? Open an issue or PR!

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/cool-idea`)
3. Make changes
4. Commit with clear messages
5. Push to your fork
6. Open a Pull Request

**Adding Projects:**
Edit `src/data/projects.json` and add your project following the schema. Must include:
- Title, description, category, difficulty, budget
- Required skills, time estimate, tutorial link
- Parts needed and why it's great

---

## 📝 License

MIT — use freely in personal and commercial projects.

---

## 🎓 Made for Builders

Built with ❤️ by the Tech Dad team. Help high schoolers discover and build awesome summer projects!

**Questions?** Open an issue or email us.

---

**Version**: 1.0.0 (MVP)  
**Last Updated**: 2026-06-10  
**Status**: ✅ Ready for Production
