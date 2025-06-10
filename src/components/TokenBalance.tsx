"use client";

import { useAccount, useReadContract } from "wagmi";
import { erc1155TokenAbi, erc1155TokenAddress } from "@/lib/contracts";

export function TokenBalance({ tokenId }: { tokenId: number }) {
  const { address } = useAccount();

  const { data: balance, isLoading } = useReadContract({
    address: erc1155TokenAddress,
    abi: erc1155TokenAbi,
    functionName: "balanceOf",
    args: [address!, BigInt(tokenId)],
    query: { enabled: !!address }
  });

  if (isLoading) return <span className="inline-block h-6 w-8 bg-gray-200 rounded animate-pulse" />;
  
  return <span>{balance?.toString() || "0"}</span>;
}