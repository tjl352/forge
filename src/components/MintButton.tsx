"use client";

import { polygonAmoy } from "wagmi/chains";
import { useEffect, useState } from "react";
import { useAccount, useWriteContract, useReadContract, usePublicClient, useChainId } from "wagmi";
import { erc1155TokenAbi, erc1155TokenAddress } from "../lib/contracts";
import { fetchAmoyGasPrices } from "../lib/gas";
import { Button } from "./ui/button";
import { formatTime } from "@/lib/utils";

export function MintButton({ tokenId }: { tokenId: number }) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContract, isPending } = useWriteContract();
  const isAmoy = useChainId() == polygonAmoy.id;

  const { data: lastMintTime, refetch } = useReadContract({
    address: erc1155TokenAddress,
    abi: erc1155TokenAbi,
    functionName: "getLastMintTime",
    args: [address!, BigInt(tokenId)],
    query: { enabled: !!address },
  });

  const [cooldownLeft, setCooldownLeft] = useState(0);

  useEffect(() => {
    if (!lastMintTime) return;

    const updateCooldown = () => {
      const now = Math.floor(Date.now() / 1000);
      const lastTime = Number(lastMintTime);
      const diff = now - lastTime;
      const timeLeft = Math.max(60 - diff, 0);
      setCooldownLeft(timeLeft);
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [lastMintTime]);

  const canMint = !lastMintTime || cooldownLeft <= 0;

  const handleMint = async () => {
    if (!address || !canMint) return;

    try {
      const gas = await fetchAmoyGasPrices();
      console.log("[Mint] Gas prices fetched:", {
        maxFeePerGas: gas.maxFeePerGas.toString(),
        maxPriorityFeePerGas: gas.maxPriorityFeePerGas.toString(),
      });

      console.log("[Mint] Preparing transaction:", {
        sender: address,
        contract: erc1155TokenAddress,
        tokenId,
        amount: 1,
      });

      writeContract(
        {
          address: erc1155TokenAddress,
          abi: erc1155TokenAbi,
          functionName: "mint",
          args: [BigInt(tokenId), BigInt(1)],
          ...gas,
          gas: BigInt(300_000),
        },
        {
          async onSuccess(txHash) {
            console.log("[Mint] Tx submitted:", txHash);

            if (!publicClient) {
              console.error("[Mint] publicClient is undefined.");
              return;
            }
            const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

            console.log("[Mint] Tx confirmed:");
            console.log("  From:", receipt.from);
            console.log("  To (contract):", receipt.to);
            console.log("  Gas Used:", receipt.gasUsed.toString());
            console.log("  Block:", receipt.blockNumber.toString());
            console.log("  Tx Hash:", receipt.transactionHash);

            refetch(); // update lastMintTime
            window.dispatchEvent(new Event("balanceUpdated"));
          },
          onError(error) {
           if (error.message?.includes("User rejected")) {
             console.warn("[Mint] Transaction rejected by user.");
           } else {
             console.error("[Mint] Transaction failed:", error);
           }
          },
        }
      );
    } catch (err) {
      console.error("[Mint] Failed to fetch gas prices or execute mint:", err);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleMint}
        disabled={isPending || !canMint || !isAmoy}
        className="bg-gray-800 text-white rounded-full px-4 py-1 text-sm hover:bg-gray-700"
      >
        {isPending ? "Minting..." : "Mint"}
      </Button>
      {!canMint && (
        <span className="text-sm text-gray-500">
          Cooldown: {formatTime(cooldownLeft)}
        </span>
      )}
    </div>
  );
}
