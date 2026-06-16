# VibeText MVP Specification (Phase 1)

This document serves as the comprehensive Minimum Viable Product (MVP) specification for the VibeText pivot. It outlines exactly what needs to be built for the V1 launch, and strictly defines what is excluded to ensure a fast, successful launch.

## 1. Product Overview
VibeText is a community-driven AI text tuner. It transitions from a single-player utility into a multiplayer platform where users can translate text into specific cultural "vibes," publish their results to a public feed, and upvote the best translations.

## 2. Core Features (In-Scope for MVP)

### 2.1 The Core Tuning Engine (Frictionless UX)
*   **Text Input:** A simple textarea for the user's original text.
*   **Vibe Selector:** A dropdown/selector containing pre-defined vibes (e.g., "Professional," "Gen-Z," "1920s Mafia," "Polite," "Aggressive").
*   **AI Processing:** Backend connection to an LLM (Gemini initially, structured to allow OpenAI/Claude later) to process the tuning.
*   **Instant Result:** Display the tuned text seamlessly.

### 2.2 The "Vibe Wall" (Public Feed)
*   **Trending Feed:** A homepage feed displaying the top upvoted public tunings.
*   **Recent Feed:** A feed showing the latest public tunings in chronological order.
*   **Tuning Cards:** Each post on the feed is a card displaying:
    *   Original Text
    *   Tuned Text
    *   The Vibe Used
    *   Upvote Count

### 2.3 Community Engagement
*   **Publish Toggle:** When a user tunes text, they have a highly visible option: `[ ] Publish to Vibe Wall`. 
*   **Upvoting:** Users can click a heart/upvote button on any card in the feed.

### 2.4 Viral Marketing Feature
*   **Share as Image (Watermarked):** A button that captures the `[Original] ➡️ [Tuned]` output into a visually appealing image format with a "Made with VibeText.com" watermark at the bottom, optimized for sharing on Twitter/X or Instagram.

### 2.5 Web 2.5 Authentication (Frictionless)
*   **No-Login Usage:** Users can tune text and view the feed *without* creating an account.
*   **Web2 Login:** Users are only prompted to create a standard account (Google Auth / Email) if they want to **Publish** or **Upvote**.

---

## 3. Out of Scope for MVP (Delayed to Phase 2)
To guarantee a fast launch, the following features are explicitly **excluded** from V1:
*   ❌ Web3 Wallet Connection & Crypto Tipping
*   ❌ Audio / Text-to-Speech Export
*   ❌ Discord / Slack Bots
*   ❌ "Remixing" other people's posts
*   ❌ User Profiles and Follow systems

---

## 4. Technical Architecture

### 4.1 Frontend (React / Vite)
*   **Pages:**
    *   `/` (Home / Vibe Wall Feed)
    *   `/tune` (The main tuning workspace)
    *   `/auth` (Simple login/signup modal)
*   **State Management:** React Context or Zustand for user session handling.

### 4.2 Backend (Node.js / Express)
*   **API Routes:**
    *   `POST /api/tune` (Calls the LLM)
    *   `POST /api/feed/publish` (Saves a tuning to the DB)
    *   `GET /api/feed` (Fetches trending/recent posts)
    *   `POST /api/feed/upvote/:id` (Increments upvote count)

### 4.3 Database (MongoDB or Supabase/PostgreSQL)
*   **Post Schema:**
    *   `id` (UUID)
    *   `originalText` (String)
    *   `tunedText` (String)
    *   `vibe` (String)
    *   `authorId` (UUID, optional/anonymous allowed)
    *   `upvotes` (Integer, default: 0)
    *   `createdAt` (Timestamp)

### 4.4 AI Layer
*   **Provider:** Google Gemini SDK (configured with Strict Safety Settings to block NSFW/Hate Speech).
*   **Prompt Architecture:** Abstracted behind a routing function so it can easily be swapped to a Multi-Model system (Claude/GPT-4) in the future.

---

## 5. Standard User Flow
1. User lands on `VibeText.com`.
2. They see the **Vibe Wall** feed and laugh at a highly upvoted "Gen-Z" translation.
3. Inspired, they scroll to the top input box and paste an angry email to their boss.
4. They select the **"Extremely Diplomatic"** vibe and click *Tune*.
5. The result appears instantly. They love it.
6. They click **"Share as Image"** to send it to a friend.
7. They check **"Publish to Vibe Wall"**. The app prompts them for a quick Google Login to publish.
8. They log in, the post goes live on the feed, and other users begin upvoting it.
