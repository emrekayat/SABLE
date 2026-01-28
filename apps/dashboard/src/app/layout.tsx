"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@demox-labs/aleo-wallet-adapter-react";
import { WalletModalProvider } from "@demox-labs/aleo-wallet-adapter-reactui";
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
      new PuzzleWalletAdapter(),
    ],
    []
  );

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="alternate icon" href="/sable-logo.png" type="image/png" />
        <title>SABLE - Privacy-Preserving Payroll on Aleo</title>
        <meta name="description" content="Zero-knowledge payroll management system built on Aleo blockchain" />
      </head>
      <body className={inter.className}>
        <WalletProvider wallets={wallets} autoConnect={false}>
          <WalletModalProvider>
            {children}
          </WalletModalProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
