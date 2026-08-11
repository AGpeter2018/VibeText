<div align="center">
  <img src="./client/public/favicon.svg" alt="VibeText Logo" width="80" />
  <h1>VibeText Protocol</h1>
  <p><strong>AI Context Translator & Authenticity Engine on the BOT Chain</strong></p>
</div>

VibeText is a hybrid Web2/Web3 application that allows users to instantly translate boring, generic text into entirely new "vibes" (e.g., Gen-Z, Corporate, Shakespearean, Hacker) using generative AI. 

By combining traditional social mechanics (upvotes, saves, sharing) with an on-chain **Authenticity Engine**, VibeText dynamically rewards community curators with native $BOT tokens on the BOT Chain. Let's make text fun again! ⚡️

---

## 🏗 System Architecture

VibeText is a monorepo consisting of three main layers:

1. **/client (Frontend)**
   - **Framework**: React 18 / TypeScript / Vite
   - **Styling**: Tailwind CSS / Framer Motion
   - **Web3**: Reown AppKit / Ethers.js
   - **State Engine**: Opt-in wallet mapping. Web2 users use email/Google; Web3 users link wallets for rewards.

2. **/server (Backend)**
   - **Framework**: Node.js / Express
   - **Database**: MongoDB (Mongoose)
   - **Real-time**: Socket.IO (live notifications)
   - **Services**: OpenAI (Generation / Images), Nodemailer (OTP Auth), Custom OAuth2 (Google/Discord).

3. **/VibeText-contract (Smart Contracts)**
   - **Framework**: Foundry
   - **Network**: BOT Chain Testnet/Mainnet
   - **Mechanism**: Admin Whitelist Oracle pattern. The NodeJS backend holds a designated Oracle wallet that pushes verified Community ratings into the contract to trigger gasless payouts to user wallets.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+)
- MongoDB daemon running locally (or MongoDB Atlas string)
- Foundry (if compiling contracts)

### 1. Database & Server Setup
```bash
cd server
npm install
```
Create a `.env` in `/server`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/vibetext
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

# Core Services
OPENAI_API_KEY=sk-proj-...
GOOGLE_CLIENT_ID=...
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...

# Auth Email Setup (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=youremail@gmail.com
SMTP_PASS=app_password

# Web3 Oracle Backend
BOTCHAIN_RPC_URL=https://rpc.botchain.ai
ORACLE_PRIVATE_KEY=your_backend_wallet_key
VIBETEXT_CONTRACT_ADDRESS=0x...
```
Start the API:
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd client
npm install
```
Create a `.env` in `/client`:
```env
VITE_API_URL=http://localhost:5000
VITE_PROJECT_ID=your_reown_appkit_project_id
VITE_BOT_CHAIN_RPC_URL=https://rpc.botchain.ai
VITE_VIBETEXT_CONTRACT_ADDRESS=0x...
```
Start the React App:
```bash
npm run dev
```

### 3. Smart Contract Deployment (Foundry)
```bash
cd VibeText-contract
forge install
forge script script/VibeText.s.sol --rpc-url https://rpc.botchain.ai --broadcast -vvvv
```

---

## 🔐 Progressive Web3 Enhancement
VibeText operates on a strict **Progressive Web3 Enhancement** model.
- **Web2 Baseline:** Standard users can create accounts (OTP/Google), translate text, share images natively, save vibes, and rate other vibes entirely gas-free, with zero crypto knowledge required.
- **Web3 Layer:** If a user chooses to connect a Rabby/MetaMask wallet, the backend links their MongoDB User ID to their EVM Address.
- **Validator Payouts:** When a web3-linked user gives a rating, the backend verifies it through anomaly detection. If authentic, the Node server signs a transaction using its securely stored `ORACLE_PRIVATE_KEY` and calls the `VibeText.sol` contract on-chain to instantly distribute a BOT token reward from the treasury to the user.

## 🤝 Smart Contract Admin Panel
The platform includes an admin dashboard (visible only to the address that owns the `VibeText.sol` contract). From this UI, the owner can dynamically manage the Oracle whitelist (adding/removing Node Admin addresses), view treasury balances, pause the contract, pull funds, and execute an ownership transfer—all through standard front-end peer-to-peer wallet signatures.
