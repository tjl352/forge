// components/MintButton.tsx
"use client";

import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { erc1155TokenAbi, erc1155TokenAddress } from "../lib/contracts";
import { Button } from "./ui/button";
import { formatTime } from "@/lib/utils";

export function MintButton({ tokenId }: { tokenId: number }) {
  const { address } = useAccount();
  const { writeContract, isPending } = useWriteContract();
  
  const { data: lastMintTime } = useReadContract({
    address: erc1155TokenAddress,
    abi: erc1155TokenAbi,
    functionName: "getLastMintTime",
    args: [address!, BigInt(tokenId)],
    query: { enabled: !!address }
  });

  const canMint = !lastMintTime || Date.now() / 1000 - Number(lastMintTime) >= 60;

    const handleMint = () => {
    console.log("Mint button clicked");
    console.log("Token ID:", tokenId);
    console.log("User address:", address);
    console.log("Mint attempt:");
    console.log("Cooldown ok?", canMint);
    console.log("Last mint time:", lastMintTime?.toString());
    console.log("Now:", Math.floor(Date.now() / 1000));

    writeContract(
        {
        address: erc1155TokenAddress,
        abi: erc1155TokenAbi,
        functionName: "mint",
        args: [BigInt(tokenId), BigInt(1)],
        },
        {
        onSuccess(data) {
            console.log("Transaction submitted:", data);
        },
        onError(error) {
            console.error("Transaction failed:", error);

            if (error?.cause && typeof error.cause === "object" && "message" in error.cause) {
                console.error("Revert reason:", (error.cause as { message: string }).message);
            } else {
                console.error("Error message:", error.message);
            }
        },
        onSettled(data, error) {
            console.log("Transaction settled:", { data, error });
        }
       }
    );
    };


  return (
    <div className="flex items-center gap-2">
      <Button 
        onClick={handleMint}
        disabled={isPending || !canMint}
      >
        {isPending ? "Minting..." : "Mint"}
      </Button>
      {!canMint && (
        <span className="text-sm text-gray-500">
          Cooldown: {formatTime(60 - (Date.now() / 1000 - Number(lastMintTime)))}
        </span>
      )}
    </div>
  );
}