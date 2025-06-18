"use client";

import { useAccount, useReadContract } from "wagmi";
import { erc1155TokenAbi, erc1155TokenAddress } from "@/lib/contracts";
import { useEffect } from "react";

export function TokenBalance({ tokenId }: { tokenId: number }) {
  const { address } = useAccount();

  const { data: balance, isLoading, refetch } = useReadContract({
    address: erc1155TokenAddress,
    abi: erc1155TokenAbi,
    functionName: "balanceOf",
    args: [address!, BigInt(tokenId)],
    query: { enabled: !!address }
  });

useEffect(() => {
  const handler = async () => {
    console.log(`[TokenBalance] Refreshing balance for token ${tokenId}`);
    try {
      await refetch();
    } catch (err) {
      console.error("Refetch error:", err);
    }
  };

  window.addEventListener("balanceUpdated", handler);
  return () => {
    window.removeEventListener("balanceUpdated", handler);
  };
}, [refetch, tokenId]); // Keep both if refetch is stable


  if (isLoading) return <span className="inline-block h-6 w-8 bg-gray-200 rounded animate-pulse" />;
  
  return <span>{balance?.toString() || "0"}</span>;
}