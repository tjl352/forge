"use client";

import { polygonAmoy } from "wagmi/chains";
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, usePublicClient, useChainId } from "wagmi";
import {
  forgeContractAbi,
  forgeContractAddress
} from "../lib/contracts";
import { fetchAmoyGasPrices } from "../lib/gas";
import { Button } from "./ui/button";

export function TradeButton({ inputTokenId }: { inputTokenId: number }) {
  const { address } = useAccount();
  const publicClient = usePublicClient(); // 👈 to read receipt later
  const allowedTokenIds = [0, 1, 2];
  const desiredOptions = allowedTokenIds.filter((id) => id !== inputTokenId);
  const [desiredTokenId, setDesiredTokenId] = useState(desiredOptions[0]);
  const isAmoy = useChainId() == polygonAmoy.id;
  const { writeContract, isPending } = useWriteContract();

  useEffect(() => {
    setDesiredTokenId(desiredOptions[0]);
  }, [inputTokenId]);

  const handleTrade = async () => {
    if (!address) return;

    if (!allowedTokenIds.includes(inputTokenId) || !allowedTokenIds.includes(desiredTokenId)) {
      alert("Invalid token trade.");
      return;
    }

    try {
      const gas = await fetchAmoyGasPrices();
      console.log("[Trade] Gas prices fetched:", {
        maxFeePerGas: gas.maxFeePerGas.toString(),
        maxPriorityFeePerGas: gas.maxPriorityFeePerGas.toString(),
      });

      console.log("[Trade] Preparing transaction:", {
        sender: address,
        contract: forgeContractAddress,
        inputTokenId,
        desiredTokenId,
      });

      writeContract(
        {
          address: forgeContractAddress,
          abi: forgeContractAbi,
          functionName: "tradeForBaseToken",
          args: [BigInt(inputTokenId), BigInt(desiredTokenId)],
          ...gas,
          gas: BigInt(300_000),
        },
        {
          async onSuccess(txHash) {
            console.log("[Trade] Tx submitted:", txHash);

            if (!publicClient) {
              console.error("[Trade] publicClient is undefined.");
              return;
            }
            const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

            console.log("[Trade] Tx confirmed:");
            console.log("  From:", receipt.from);
            console.log("  To (contract):", receipt.to);
            console.log("  Gas Used:", receipt.gasUsed.toString());
            console.log("  Block:", receipt.blockNumber.toString());
            console.log("  Tx Hash:", receipt.transactionHash);

            window.dispatchEvent(new Event("balanceUpdated"));
          },
          onError(error) {
            if (error.message?.includes("User rejected")) {
              console.warn("[Trade] Transaction rejected by user.");
            } else {
              console.error("[Trade] Transaction failed:", error);
            }
          },
          onSettled(data, error) {
            console.log("[Trade] Tx settled:", { data, error });
          }
        }
      );
    } catch (err) {
      console.error("[Trade] Failed to fetch gas prices or execute trade:", err);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <select
        value={desiredTokenId}
        onChange={(e) => setDesiredTokenId(Number(e.target.value))}
        className="border rounded px-2 py-1 text-sm"
      >
        {desiredOptions.map((id) => (
          <option key={id} value={id}>
            Token {id}
          </option>
        ))}
      </select>

      <Button
        onClick={handleTrade}
        disabled={isPending || !isAmoy}
        className="bg-gray-800 text-white rounded-full px-4 py-1 text-sm hover:bg-gray-700"
      >
        {isPending ? "Trading..." : `Trade`}
      </Button>
    </div>
  );
}
