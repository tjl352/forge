"use client";

import { polygonAmoy } from "wagmi/chains";
import { useAccount, useWriteContract, usePublicClient, useChainId } from "wagmi";
import {
  forgeContractAbi,
  forgeContractAddress
} from "../lib/contracts";
import { fetchAmoyGasPrices } from "../lib/gas";
import { Button } from "./ui/button";

export function ForgeButton({ tokenId }: { tokenId: number }) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContract, isPending } = useWriteContract();
  const isAmoy = useChainId() == polygonAmoy.id;

  const handleForge = async () => {
    if (!address) return;

    try {
      const gas = await fetchAmoyGasPrices();
      console.log("[Forge] Gas prices fetched:", {
        maxFeePerGas: gas.maxFeePerGas.toString(),
        maxPriorityFeePerGas: gas.maxPriorityFeePerGas.toString(),
      });

      console.log("[Forge] Preparing transaction:", {
        sender: address,
        contract: forgeContractAddress,
        tokenId,
      });

      writeContract(
        {
          address: forgeContractAddress,
          abi: forgeContractAbi,
          functionName: "forge",
          args: [BigInt(tokenId)],
          ...gas,
          gas: BigInt(300_000),
        },
        {
          async onSuccess(txHash) {
            console.log("[Forge] Tx submitted:", txHash);

            if (!publicClient) {
              console.error("[Forge] publicClient is undefined.");
              return;
            }
            const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

            console.log("[Forge] Tx confirmed:");
            console.log("  From:", receipt.from);
            console.log("  To (contract):", receipt.to);
            console.log("  Gas Used:", receipt.gasUsed.toString());
            console.log("  Block:", receipt.blockNumber.toString());
            console.log("  Tx Hash:", receipt.transactionHash);

            window.dispatchEvent(new Event("balanceUpdated"));
          },
          onError(error) {
           if (error.message?.includes("User rejected")) {
             console.warn("[Forge] Transaction rejected by user.");
           } else {
             console.error("[Forge] Transaction failed:", error);
           }
          },
        }
      );
    } catch (err) {
      console.error("[Forge] Failed to fetch gas prices or execute forge:", err);
    }
  };

  return (
    <Button
      onClick={handleForge}
      disabled={isPending || !isAmoy}
      className="bg-gray-800 text-white rounded-full px-4 py-1 text-sm hover:bg-gray-700"
    >
      {isPending ? "Forging..." : `Forge`}
    </Button>
  );
}
