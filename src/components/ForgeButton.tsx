// components/ForgeButton.tsx
"use client";

import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { erc1155TokenAbi, erc1155TokenAddress, forgeContractAbi, forgeContractAddress } from "../lib/contracts";
import { Button } from "./ui/button";

export function ForgeButton({ tokenId }: { tokenId: number }) {
  const { address } = useAccount();
  const { writeContract, isPending } = useWriteContract();

  // Check if user has required tokens
  const { data: hasRequiredTokens } = useReadContract({
    address: forgeContractAddress,
    abi: forgeContractAbi,
    functionName: "canForge",
    args: [address!, BigInt(tokenId)],
    query: { enabled: !!address }
  });

const handleForge = () => {
  console.log("Forge button clicked");
  console.log("User address:", address);
  console.log("Token ID to forge:", tokenId);
  console.log("Has required tokens?", hasRequiredTokens);

  writeContract(
    {
      address: forgeContractAddress,
      abi: forgeContractAbi,
      functionName: "forge",
      args: [BigInt(tokenId)],
    },
    {
      onSuccess(data) {
        console.log("Forge transaction submitted:", data);
      },
      onError(error) {
        console.error("Forge transaction failed:", error);

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
        console.log("Forge transaction settled:", { data, error });
      }
    }
  );
};

  return (
    <Button 
      onClick={handleForge}
      disabled={isPending || !hasRequiredTokens}
    >
      {isPending ? "Forging..." : "Forge"}
    </Button>
  );
}