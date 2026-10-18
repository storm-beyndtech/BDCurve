import { env } from "../config/env.js";

export const rpcUrls = {
  ethereum: env.ETHEREUM_RPC_URL,
  bsc: env.BSC_RPC_URL,
  polygon: env.POLYGON_RPC_URL,
  arbitrum: env.ARBITRUM_RPC_URL,
  base: env.BASE_RPC_URL,
  solana: env.SOLANA_RPC_URL,
} as const;

export type RpcNetwork = keyof typeof rpcUrls;

export async function rpcCall<T>(network: RpcNetwork, method: string, params: unknown[] = []): Promise<T> {
  const response = await fetch(rpcUrls[network], {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }),
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error(`${network} RPC request failed with ${response.status}`);
  const payload = await response.json() as { result?: T; error?: { message?: string } };
  if (payload.error) throw new Error(payload.error.message || `${network} RPC returned an error`);
  if (payload.result === undefined) throw new Error(`${network} RPC returned no result`);
  return payload.result;
}

export function getLatestBlock(network: RpcNetwork) {
  return rpcCall<string>(network, network === "solana" ? "getSlot" : "eth_blockNumber");
}

export function getTransactionReceipt(network: Exclude<RpcNetwork, "solana">, hash: string) {
  return rpcCall<Record<string, unknown> | null>(network, "eth_getTransactionReceipt", [hash]);
}
