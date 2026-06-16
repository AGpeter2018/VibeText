# VibeText MVP Specification (Phase 1 Revised)

## Product Vision

VibeText is a community-powered cultural language engine that transforms text into authentic regional, social, professional, and cultural communication styles.

Rather than translating languages, VibeText translates "how people actually speak."

Users can generate vibe-based text, publish their best results to a public feed, discover trending transformations from around the world, and share outputs socially.

The long-term vision is to become the world's largest community-curated database of cultural communication styles.

---

# 1. Core MVP Features

## 1.1 Vibe Engine

### Text Input
Simple textarea for source text.

### Vibe Selection
Vibes are organized into categories:

#### Cultural & Regional
* Nigerian Gen Z
* Lagos Street
* London Roadman
* Southern US
* Jamaican Patois
* Tokyo Casual
* Mumbai Street

#### Professional
* Corporate Executive
* Diplomatic
* Startup Founder
* Customer Support

#### Entertainment & Character
* 1920s Mafia
* Movie Trailer Narrator
* Shakespeare
* Anime Protagonist

#### Social
* Gen Z
* Millennial
* Sarcastic
* Friendly
* Aggressive

### Intensity Slider
**Range:** 1–10
Controls how strongly the selected vibe is applied.

*Example:*
Original: "I'll come later."
Lagos Street (Intensity 2) → "I'll come later, no worries."
Lagos Street (Intensity 10) → "No wahala, I go show face later later."

### AI Processing
Gemini API for MVP.
Provider abstraction layer prepared for: GPT, Claude, Gemini.

### Instant Result
Display generated text with:
* Copy button
* Share button
* Publish button

---

## 1.2 Vibe Wall
Public homepage feed.

**Purpose:**
* Discovery
* Entertainment
* Community growth
* Viral sharing

### Feed Card
Displays: Original Text, Transformed Text, Selected Vibe, Intensity Level, Upvote Count.

### Feed Modes
MVP: Recent
Phase 1.5: Trending

---

## 1.3 Community Engagement

### Publish to Vibe Wall
Users may publish generated outputs. Publishing requires login.

### Upvoting
Authenticated users can upvote content.

### Report Content
Simple moderation system: Spam, Offensive, Abuse.

---

## 1.4 Viral Sharing

### Share as Image
Creates a branded image optimized for X, Instagram, TikTok screenshots, LinkedIn.

---

## 1.5 Frictionless Authentication

### Anonymous Usage
Users can generate text, browse feed, and share outputs without signing up.

### Login Required For
* Publishing
* Upvoting
* Saving history

**Methods:** Google, Email. (No wallet required).

---

# 2. Strategic Exclusions
The following are intentionally excluded for Phase 1:
❌ Wallet Connection
❌ Crypto Rewards
❌ Creator Marketplace
❌ Audio Generation
❌ Discord Bots
❌ User Following
❌ Premium Plans
❌ Community-Created Vibes

---

# 3. Technical Architecture
**Frontend:** React + Vite
**Backend:** Node.js + Express
**Database:** PostgreSQL (Supabase)
**AI Layer:** Gemini with provider abstraction
**Authentication:** Google OAuth + Email (via Supabase)

---

# 4. Success Metrics
**Launch Goal:** 100 active users

**Track:**
* Most-used vibe
* Most-shared vibe
* Most-published vibe
* Most-upvoted vibe
* Average generations per user

---

# 5. Phase 2 Expansion
After product validation:
* **Community-Created Vibes:** Regional packs, Character packs.
* **Reputation System:** Top contributors gain influence.
* **Creator Marketplace:** Creators publish premium vibe packs.
* **API Access:** External companies integrate VibeText.
* **Blockchain Layer:** Optional ownership verification and creator monetization.
