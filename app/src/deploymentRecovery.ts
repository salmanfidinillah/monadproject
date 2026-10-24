import { JsonRpcProvider, getCreateAddress } from "ethers";
import type { DeploymentJournal } from "./deploymentJournal.ts";

export const DEPLOY_CHECK_RPCS = ["https://testnet-rpc.monad.xyz", "https://rpc-testnet.monadinfra.com"] as const;
export const WALLET_ALTERNATIVE_RPC = DEPLOY_CHECK_RPCS[1];

export type AccountObservation = { rpc: string; chainId: bigint; latestNonce: number; pendingNonce: number; candidateCode: string };

/** This only prepares a manual, same-nonce attempt; it never broadcasts or deletes history. */
export function planDeploymentRetry(record: DeploymentJournal, observations: AccountObservation[], walletFailureConfirmed: boolean): DeploymentJournal {
  if (!walletFailureConfirmed) throw new Error("Periksa Aktivitas MetaMask: konfirmasikan percobaan gagal dan tidak ada transaksi tertunda.");
  if (record.hash || !["awaiting-wallet", "retry-ready"].includes(record.state)) throw new Error("Ada hash/status transaksi yang harus diperiksa melalui receipt, bukan dicoba ulang.");
  const nonce = record.nonce ?? 0;
  if (observations.length !== DEPLOY_CHECK_RPCS.length || !DEPLOY_CHECK_RPCS.every((rpc) => observations.some((item) => item.rpc === rpc))) {
    throw new Error("Dua RPC resmi harus berhasil diperiksa sebelum menyiapkan percobaan.");
  }
  for (const item of observations) {
    if (item.chainId !== 10143n) throw new Error("RPC pemeriksaan bukan Monad Testnet 10143.");
    if (item.latestNonce !== nonce || item.pendingNonce !== nonce || item.candidateCode !== "0x") {
      throw new Error("Nonce sudah berubah, ada transaksi pending, atau kontrak sudah terlihat. Periksa hash di Aktivitas MetaMask; jangan deploy ulang.");
    }
  }
  return { ...record, nonce, state: "retry-ready" };
}

export async function checkDeploymentRetry(record: DeploymentJournal, walletFailureConfirmed: boolean) {
  if (!walletFailureConfirmed) return planDeploymentRetry(record, [], false);
  const candidate = getCreateAddress({ from: record.account, nonce: record.nonce ?? 0 });
  const observations = await Promise.all(DEPLOY_CHECK_RPCS.map(async (rpc): Promise<AccountObservation> => {
    // Monad Foundation endpoint does not support batch requests.
    const provider = new JsonRpcProvider(rpc, undefined, { batchMaxCount: 1 });
    try {
      const [network, latestNonce, pendingNonce, candidateCode] = await Promise.all([
        provider.getNetwork(), provider.getTransactionCount(record.account, "latest"),
        provider.getTransactionCount(record.account, "pending"), provider.getCode(candidate),
      ]);
      return { rpc, chainId: network.chainId, latestNonce, pendingNonce, candidateCode };
    } finally { provider.destroy(); }
  }));
  return planDeploymentRetry(record, observations, walletFailureConfirmed);
}

/** Do not expose a provider's raw payload (including bytecode) as a user-facing error. */
export function deploymentErrorMessage(cause: unknown): string {
  const error = cause as { code?: unknown; shortMessage?: unknown; message?: unknown; error?: { message?: unknown } } | null;
  const details = [error?.error?.message, error?.shortMessage, error?.message].filter((value): value is string => typeof value === "string");
  if (details.some((value) => /rate.limit|too many requests|\b429\b/i.test(value))) {
    return "RPC wallet membatasi pengiriman (rate limited). Status belum terverifikasi. Periksa Aktivitas MetaMask dan jangan kirim ulang otomatis. Jika tertulis Gagal tanpa transaksi pending, gunakan pemeriksaan coba ulang di bawah. RPC wallet alternatif resmi tersedia di panduan.";
  }
  if (error?.code === "ACTION_REJECTED" || error?.code === 4001) return "Permintaan ditolak di wallet. Tidak ada keberhasilan deploy yang diklaim.";
  const friendly = details.find((value) => !/payload=|0x[\da-f]{80}|could not coalesce/i.test(value));
  return friendly ? friendly.slice(0, 360) : "Permintaan wallet/RPC gagal. Periksa Aktivitas MetaMask dan hash receipt sebelum mencoba lagi.";
}
