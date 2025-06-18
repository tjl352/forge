// lib/gas.ts
export async function fetchAmoyGasPrices() {
  const res = await fetch("https://gasstation.polygon.technology/amoy", {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch gas prices");

  const data = await res.json();
  return {
    maxFeePerGas: BigInt(Math.ceil(data.fast.maxFee) * 1e9),         // convert Gwei → Wei
    maxPriorityFeePerGas: BigInt(Math.ceil(data.fast.maxPriorityFee) * 1e9),
  };
}
