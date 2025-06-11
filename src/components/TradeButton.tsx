// components/TradeButton.tsx
"use client";

import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import {
  forgeContractAbi,
  forgeContractAddress
} from "../lib/contracts";
import { Button } from "./ui/button";

export function TradeButton({ inputTokenId }: { inputTokenId: number }) {
  const { address } = useAccount();
  const [desiredTokenId, setDesiredTokenId] = useState(0);
  const { writeContract, isPending } = useWriteContract();

  const handleTrade = () => {
    console.log("Trade button clicked");
    console.log("User address:", address);
    console.log("Trading token:", inputTokenId);
    console.log("For base token:", desiredTokenId);

    writeContract(
      {
        address: forgeContractAddress,
        abi: forgeContractAbi,
        functionName: "tradeForBaseToken",
        args: [BigInt(inputTokenId), BigInt(desiredTokenId)],
      },
      {
        onSuccess(data) {
          console.log("Trade transaction submitted:", data);
        },
        onError(error) {
          console.error("Trade transaction failed:", error);

          if (error?.cause && typeof error.cause === "object" && "message" in error.cause) {
            console.error("Revert reason:", (error.cause as { message: string }).message);
          } else {
            console.error("Error message:", error.message);
          }

          if (error?.cause && typeof error.cause === "object" && "data" in error.cause) {
            console.log("Raw revert data:", (error.cause as { data: unknown }).data);
          }
        },
        onSettled(data, error) {
          console.log("Trade transaction settled:", { data, error });
        }
      }
    );
  };

  return (
    <div className="flex flex-col space-y-2">
      <select
        value={desiredTokenId}
        onChange={(e) => setDesiredTokenId(Number(e.target.value))}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value={0}>Token 0</option>
        <option value={1}>Token 1</option>
        <option value={2}>Token 2</option>
      </select>

      <Button onClick={handleTrade} disabled={isPending}>
        {isPending ? "Trading..." : `Trade #${inputTokenId}`}
      </Button>
    </div>
  );
}
