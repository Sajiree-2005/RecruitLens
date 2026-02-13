# 🚀 GitHub Portfolio Signal Analyzer

**AI-Inspired Recruiter Signal Engine (Client-Side)**

A fully client-side GitHub profile intelligence platform that simulates how recruiters evaluate developer portfolios.

This application analyzes public GitHub profiles using a multi-dimensional signal scoring engine, README quality heuristics, recruiter simulation modes, and career path alignment insights — all without any backend.

## 🔍 Problem

Recruiters don’t read every line of your code.

They scan for signals:
- Project depth
- Documentation quality
- Engineering maturity
- Consistency
- Ownership
- Impact

Most developers don’t know how their GitHub actually looks to hiring managers.

This tool makes those signals visible.

## 🧠 Core Features
### 🧮 1. 9-Dimension Signal Scoring Engine
Transparent weighted scoring across:
- Profile Completeness
- Repository Quality
- Commit Consistency
- Documentation Quality
- Community Engagement
- Project Diversity
- Ownership & Depth
- Engineering Maturity
- Impact Score
Each dimension contributes to a final Recruiter Signal Score.

### 📄 2. README Quality Analyzer (Heuristic-Based)
Fetches README files from top repositories via GitHub API and evaluates:
- Installation instructions
- Usage examples
-
Architecture documentation
-
Screenshots / visuals
-
Badges
-
Demo links
-
Contributing guidelines
-
License presence 
Each README is scored (0–100) with missing elements clearly listed.

### 🏢 3. Recruiter Simulation Mode 
Simulates evaluation styles of different hiring environments:
- Startup Mode – Shipping speed, deployment signals, ownership 
- Enterprise Mode – Testing, documentation, licenses, PR structure 
- AI/ML Mode – Python repos, ML keywords, research signals 
Each mode highlights:
 - Strengths 
 - Concerns 
 - Hiring readiness 

### 🎯 4. Career Path Alignment 
Analyzes readiness for:
- Frontend Engineer 
- Backend Engineer 
- Full-Stack Engineer 
- DevOps Engineer 
- ML Engineer 
and provides strengths, gaps, and actionable improvements.

### 📊 5. Radar Skill Visualization 
a 9-axis SVG radar chart to visually represent portfolio signal depth.

### ⚠️ 6. Red Flag Detection
detects:
eFork-heavy profiles
tutorial clones
eEmpty repositories
extended inactivity gaps.

### 📈 7. Before vs After Simulator
ghows projected score increases for specific improvements:
e“Add READMEs → +9 pts”
e“Add tests → +6 pts”
e“Improve documentation → +12 pts”
defines tactical roadmap with prioritized recommendations based on impact and effort.

## 🛠 Tech Stack
React
TypeScript
Vite
Tailwind CSS
shadcn/ui
GitHub REST API (client-side fetch)
No backend. No database. Fully client-executed.

## 🚀 Getting Started
1️⃣ Clone the repository
git clone <your-repo-url>
cdd <project-name>
2️⃣ Install dependenciesnpm install
3️⃣ Run development servernpm run dev
4️⃣ Build for productionnpm run build
🌍 DeploymentThis is a static Vite application and can be deployed on:VercelNetlifyGitHub PagesCloudflare Pages🎥 Ideal Use CasesHackathon demonstrationsDeveloper portfolio auditsCareer readiness analysisResume enhancement strategyGitHub optimization workshops🧩 Architecture OverviewFetch public GitHub profile dataAggregate repositoriesRun multi-factor heuristic scoringAnalyze README structureGenerate recruiter simulation insightsRender radar visualization + tactical roadmapAll computations are performed client-side.
📌 Design PhilosophyTransparent scoring logicActionable feedback over vague ratingsRecruiter-centric thinkingZero black-box AI claimsFully inspectable client logic.
📄 LicenseMIT License⭐ Why This Project Stands OutUnlike generic GitHub analytics tools, this platform focuses on:Recruiter psychologySignal-based evaluationCareer alignment insightsImprovement simulationIt doesn’t just analyze your GitHub.It shows you how to win interviews.
