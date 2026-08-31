import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { type AppKitNetwork } from "@reown/appkit/networks";
import { createElement, type ReactNode } from "react";

// 1. Get projectId
const projectId = import.meta.env.VITE_PROJECT_ID;

// 2. Define the Custom BOT Chain Network manually since it isn't a preset
const botChain: AppKitNetwork = {
  id: 677, // Ensure this integer precisely matches Bohr/BOT Chain's network Chain ID
  name: 'BOT Chain',
  nativeCurrency: {
    decimals: 18,
    name: 'BOT',
    symbol: 'BOT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.botchain.ai'] // Replace with your exact official RPC node URL
    },
    public: {
      http: ['https://rpc.botchain.ai']
    },
  },
  blockExplorers: {
    default: {
      name: 'BOTScan',
      url: 'https://rpc.botchain.ai' // Web frontend URL for user routing redirects
    },
  },
};

// 3. Set the networks array
const networks: [AppKitNetwork, ...AppKitNetwork[]] = [botChain];

// 4. Create a metadata object
const metadata = {
  name: "VibeText",
  description: "This is a text tuning dapp built with AppKit",
  url: typeof window !== "undefined" ? window.location.origin : "https://vibes-text.vercel.app",
  icons: ["https://avatars.mywebsite.com/"],
};

// 5. Create the AppKit instance with EthersAdapter
const appKit = createAppKit({
  adapters: [new EthersAdapter()],
  networks,
  metadata,
  projectId,
  features: {
    analytics: true,
  },
});

appKit.switchNetwork(botChain);

export default function AppkitWrapper({ children }: { children: ReactNode }) {
  return createElement('div', null, children);
}
