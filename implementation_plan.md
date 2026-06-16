# Transforming VibeText into a Community-Based Platform

This plan outlines the architecture and features needed to pivot VibeText from a simple "input-and-copy" AI text tuner into a vibrant **community-driven platform**. Users will not only be able to tune text, but also share, vote, remix, and tip creators for their creative outputs.

## User Review Required

> [!IMPORTANT]
> Since the current project uses a Web3 smart contract (`VibeText.sol`) along with a Node.js backend, we need to decide where the community data (posts, upvotes) will live. Storing all text on the blockchain can be expensive.
> **Proposed approach:** Store text and basic feed data off-chain in a database (like MongoDB/PostgreSQL) and use the Smart Contract primarily for **Tipping** and **Premium Features/Badges**, mapping off-chain IDs to on-chain tips. 

## Open Questions

> [!WARNING]
> Please review and provide feedback on the following questions:
> 1. **Database:** Are you comfortable adding a database (like MongoDB or PostgreSQL via Prisma) to the Express backend to store the community feed?
> 2. **Authentication:** Should we use Web3 wallets (e.g., MetaMask/WalletConnect) for user accounts, or traditional Web2 Auth (like NextAuth/Google Login)?
> 3. **Monetization:** Do you want to keep the "pay per tune" (`requestTune` price) model, or make tuning free and only monetize through tips and premium community badges?

---

## Proposed Changes

### 1. New Features Architecture

*   **Public Feed ("The Vibe Wall"):** A new page where users can browse recently published text tunings. Each card shows the Original Text, the Target Vibe/Country, and the AI Tuned Text.
*   **Upvoting & Tipping:** Users can upvote a tuning they find funny or accurate. If they really like it, they can send a crypto "Tip" directly to the creator's wallet via the `VibeText.sol` contract.
*   **Remixing:** A user can click "Remix" on someone else's post to take the same *Original Text* but try a different Vibe on it, linking it back to the original.
*   **Community Presets:** Users can create and publish custom "Vibes" (e.g., "1920s Mafia", "Gen Z Corporate"), and others can use those presets.

---

### 2. Smart Contract (`VibeText-contract`)

We will update the Solidity contract to support community interactions.

#### [MODIFY] [VibeText.sol](file:///c:/Users/HomePC/Desktop/VibeText/VibeText-contract/src/VibeText.sol)
- Add a mapping for `tipsReceived` to track top earners.
- Add a new function `tipCreator(address _creator, string memory _postId) public payable`.
- Emits events like `TipSent(address from, address to, uint256 amount, string postId)`.

---

### 3. Backend (`server`)

We need to persist community posts, so we'll introduce a database layer.

#### [NEW] Database Integration (e.g., MongoDB/Mongoose)
- Add schemas for `User`, `Post` (Tuning), and `Preset` (Custom Vibes).

#### [MODIFY] [app.js](file:///c:/Users/HomePC/Desktop/VibeText/server/src/app.js) & Routes
- Add new endpoints:
  - `GET /api/feed`: Fetch latest/trending community posts.
  - `POST /api/publish`: Publish a tuned text to the community feed.
  - `POST /api/upvote/:postId`: Upvote a post.
  - `GET /api/user/:address`: Get a user's published tunings.

#### [MODIFY] [ai-controller.js](file:///c:/Users/HomePC/Desktop/VibeText/server/src/controller/ai-controller.js)
- Optionally inject context based on Community Presets.

---

### 4. Frontend (`client`)

We will add new pages and components to display the community features.

#### [NEW] `src/pages/Feed.tsx`
- The main community wall showing trending and recent `TuningCard`s.

#### [NEW] `src/components/TuningCard.tsx`
- A component to display the Before/After text.
- Includes action buttons: **Copy**, **Upvote**, **Remix**, and **Tip Creator**.

#### [MODIFY] `src/pages/dashBoard.tsx` (or `App.tsx` routing)
- Add a navigation bar linking to the new "Community Feed" and "My Profile" pages.
- Update the tuning form to include a **"Publish to Community"** toggle before or after tuning.

---

## Verification Plan

### Automated Tests
- Write Foundry tests for the new `tipCreator` function in the smart contract.
- Add backend API tests using Mocha/Jest to verify the feed and upvote logic.

### Manual Verification
1. Run the local backend, frontend, and a local Anvil node.
2. Generate a text tune.
3. Check the "Publish to Community" toggle and verify it appears on the Feed page.
4. Switch to a different wallet/user, view the Feed, and attempt to Tip the creator.
5. Verify the tip transaction succeeds and the creator's balance increases.
