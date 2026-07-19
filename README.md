# ⚡ VibeText Protocol

> Rewrite the web. Find your voice.

VibeText is the world’s first community-driven, socially-fueled text ecosystem. Far more than just another layer on top of LLMs, VibeText acts as a **cultural translation engine** that seamlessly transforms your raw thoughts, boring emails, and messy bullet points into whatever distinct "vibe" you need—all backed by community verification to ensure it actually sounds authentic.

![VibeText Demo](https://raw.githubusercontent.com/AGpeter2018/VibeText/main/client/public/demo.png)

## 🌟 Key Features

*   **The Studio (Vibe Tuning Engine):** Dump your messy context, select from 10+ standard vibes (Corporate, Gen Z, Pirate, Passive-Aggressive, etc.), dial the intensity from 1 ("Subtle") to 10 ("Unhinged"), and let the engine rewrite it instantly.
*   **The Global Vibe Wall:** A crowdsourced, real-time feed where creators publish their best-tuned outputs. Discover what’s trending, upvote the funniest translations, save favorites, and share native exports directly to social media.
*   **The Authenticity Engine:** Worried about soulless AI output? Every public vibe is subject to rigorous community rating (1-5 stars) and "Community Notes" to ensure slang and tone precisely match human internet culture.
*   **The Vibe Marketplace:** Can't find the exact mood you need? Post a bounty on the Marketplace (e.g., *"I need an overly caffeinated tech recruiter"*), vote on the best requests, and let top creators fulfill them to climb the leaderboards.
*   **Weekly Curated Drops:** Limited-time, admin-curated vibes based on real-world internet culture events. Compete to generate the highest-rated variation before the drop closes.

## 🛠️ Technology Stack

**Frontend (Client)**
*   **React 18** + **Vite**
*   **TailwindCSS** for rapid, responsive styling
*   **Framer Motion** for butter-smooth staggering and scroll animations
*   **React Router DOM** for client-side routing
*   **Lucide React** for crisp, scalable iconography

**Backend (Server)**
*   **Node.js / Express** driving the core API
*   **MongoDB / Mongoose** for data persistence (Posts, Users, Requests, Weekly Drops)
*   **AI Controller** driving the contextual tuning algorithms (Gemini/LLM integration)

## 🚀 Getting Started

To run VibeText locally on your machine, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/AGpeter2018/VibeText.git
cd VibeText
```

### 2. Set up the Backend (Server)
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory and add your environment variables (e.g., Database URI, API keys, JWT secrets). Then start the backend server:
```bash
npm run dev
```

### 3. Set up the Frontend (Client)
Open a new terminal window to spin up the frontend:
```bash
cd client
npm install
npm run dev
```

The application client will be running on `http://localhost:5173`.

## 🤝 Contributing
VibeText is built by the community, for the community. We welcome pull requests for new vibes, UI improvements, and feature updates! Please ensure all code passes standard linting and responsive design checks before opening a PR.

---
*Made with ♥ on the internet. Built for the Culture.*
