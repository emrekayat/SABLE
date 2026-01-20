"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@demox-labs/aleo-wallet-adapter-react";
import { WalletModalProvider } from "@demox-labs/aleo-wallet-adapter-reactui";
import { LeoWalletAdapter } from "@demox-labs/aleo-wallet-adapter-leo";
import { PuzzleWalletAdapter } from "../lib/PuzzleWalletAdapter";
import { useMemo } from "react";

require("@demox-labs/aleo-wallet-adapter-reactui/styles.css");

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const wallets = useMemo(
    () => [
      new LeoWalletAdapter({
        appName: "SABLE",
      }),
      new PuzzleWalletAdapter(),
    ],
    []
  );

  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider wallets={wallets} autoConnect={false} decentralization="required">
          <WalletModalProvider>
            {children}
          </WalletModalProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
