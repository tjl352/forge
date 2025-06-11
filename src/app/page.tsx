// app/page.tsx
"use client";

import { useAccount, useBalance } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { NetworkSwitcher } from "@/components/NetworkSwitcher";
import { TokenBalance } from "@/components/TokenBalance";
import { MintButton } from "@/components/MintButton";
import { ForgeButton } from "@/components/ForgeButton";
import { TradeButton } from "../components/TradeButton";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function Home() {
  const { address } = useAccount();
  const { data: maticBalance } = useBalance({
    address,
    token: "0x0000000000000000000000000000000000001010", // MATIC token address
  });

  return (
    <main className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">ERC1155 Token Forge</h1>
        <ConnectButton />
      </div>

      <NetworkSwitcher />

      {address && (
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Info</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">Connected: {address}</p>
              <p>POL Balance: {maticBalance?.formatted || "0"} POL</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Mint Tokens (0-2) */}
        <Card>
          <CardHeader>
            <CardTitle>Base Tokens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[0, 1, 2].map((tokenId) => (
              <div key={tokenId} className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Token #{tokenId}</h3>
                  <p className="text-sm text-gray-600">
                    Balance: <TokenBalance tokenId={tokenId} />
                  </p>
                </div>
                <MintButton tokenId={tokenId} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Forge Tokens (3-6) */}
        <Card>
          <CardHeader>
            <CardTitle>Forged Tokens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[3, 4, 5, 6].map((tokenId) => (
              <div key={tokenId} className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Token #{tokenId}</h3>
                  <p className="text-sm text-gray-600">
                    Balance: <TokenBalance tokenId={tokenId} />
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {tokenId === 3 && "Requires Token 0 + 1"}
                    {tokenId === 4 && "Requires Token 1 + 2"}
                    {tokenId === 5 && "Requires Token 0 + 2"}
                    {tokenId === 6 && "Requires Token 0 + 1 + 2"}
                  </p>
                </div>
                <ForgeButton tokenId={tokenId} />
              </div>
            ))}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Trade Forged Tokens</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[3, 4, 5, 6].map((tokenId) => (
              <div key={tokenId} className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Token #{tokenId}</h3>
                  <p className="text-sm text-gray-600">
                    Balance: <TokenBalance tokenId={tokenId} />
                  </p>
                </div>
                <TradeButton inputTokenId={tokenId} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Button variant="link" asChild>
          <a 
            href={`https://testnets.opensea.io/${address}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            View on OpenSea Testnet
          </a>
        </Button>
      </div>
    </main>
  );
}
