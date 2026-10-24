import { JsonRpcProvider, Wallet, getAddress, isAddress, resolveAddress, type TransactionRequest } from "ethers";

export const MONAD_CHAIN_ID = 10143n;
export const MONAD_RPC_URL = "https://testnet-rpc.monad.xyz";
const SESSION_KEY = "bom-oper:play-session:v1";
const SESSION_TTL_MS = 10 * 60 * 1000;

type StoredSession = {
  privateKey: string;
  createdAt: number;
  expiresAt: number;
  pending?: { hash: string; purpose: string; startedAt: number };
  activeRoomId?: string;
};

export type PublicPlaySession = {
  address: string;
  createdAt: number;
  expiresAt: number;
  pending: StoredSession["pending"];
  activeRoomId?: string;
};

let writeInFlight = false;

function readStoredSession(): StoredSession | null {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const stored = JSON.parse(raw) as StoredSession;
    if (!stored.privateKey || !Number.isFinite(stored.expiresAt)) throw new Error("invalid session");
    if (Date.now() >= stored.expiresAt) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return stored;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function saveStoredSession(stored: StoredSession) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(stored));
}

export function restorePlaySession(): PublicPlaySession | null {
  const stored = readStoredSession();
  if (!stored) return null;
  const address = new Wallet(stored.privateKey).address;
  return {
    address,
    createdAt: stored.createdAt,
    expiresAt: stored.expiresAt,
    pending: stored.pending,
    activeRoomId: stored.activeRoomId,
  };
}

/** Called only by the explicit user-consent action; never call during render. */
export function createPlaySessionAfterConsent(consented: boolean): PublicPlaySession {
  if (!consented) throw new Error("Persetujuan wallet bermain belum diberikan.");
  if (restorePlaySession()) throw new Error("Sesi wallet bermain yang masih berlaku sudah ada di tab ini.");
  const now = Date.now();
  const wallet = Wallet.createRandom();
  const stored: StoredSession = {
    privateKey: wallet.privateKey,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };
  saveStoredSession(stored);
  return { address: wallet.address, createdAt: now, expiresAt: stored.expiresAt, pending: undefined };
}

export function getPlaySigner(provider: JsonRpcProvider): Wallet {
  const stored = readStoredSession();
  if (!stored) throw new Error("Sesi wallet bermain sudah habis. Mode penonton aktif.");
  return new Wallet(stored.privateKey, provider);
}

export function getConfiguredGameAddress(): string {
  const address = import.meta.env.VITE_BOM_OPER_ADDRESS?.trim();
  if (!address || !isAddress(address)) throw new Error("Alamat kontrak belum dikonfigurasi dari bukti deployment publik.");
  return getAddress(address);
}

export function updateActiveRoom(roomId: string | undefined) {
  const stored = readStoredSession();
  if (!stored) return;
  if (roomId) stored.activeRoomId = roomId;
  else delete stored.activeRoomId;
  saveStoredSession(stored);
}

export async function assertMonadRpc(provider: JsonRpcProvider) {
  const network = await provider.getNetwork();
  if (network.chainId !== MONAD_CHAIN_ID) {
    throw new Error(`RPC chain ${network.chainId} tidak cocok dengan Monad Testnet (10143).`);
  }
  return network;
}

/** Generic guarded sender. The caller must pass the one public deployment address. */
export async function sendAllowedContractTransaction(
  provider: JsonRpcProvider,
  populate: (signer: Wallet) => Promise<TransactionRequest>,
  purpose: string,
  onHash: (hash: string) => void,
  refreshSnapshotAfterReceipt: () => Promise<void>,
) {
  const allowedContractAddress = getConfiguredGameAddress();
  await assertMonadRpc(provider);
  const stored = readStoredSession();
  if (!stored) throw new Error("Sesi wallet bermain sudah habis. Mode penonton aktif.");
  if (stored.pending) throw new Error(`Transaksi sebelumnya masih perlu diperiksa: ${stored.pending.hash}`);
  if (writeInFlight) throw new Error("Satu transaksi wallet bermain sedang diproses.");

  writeInFlight = true;
  try {
    const signer = new Wallet(stored.privateKey, provider);
    const tx = await populate(signer);
    if (!tx.to || (await resolveAddress(tx.to)).toLowerCase() !== allowedContractAddress.toLowerCase()) {
      throw new Error("Transaksi diblokir: tujuan bukan kontrak allowlist.");
    }
    const nonce = await provider.getTransactionCount(signer.address, "pending");
    const balance = await provider.getBalance(signer.address);
    const feeData = await provider.getFeeData();
    const feePerGas = feeData.maxFeePerGas ?? feeData.gasPrice;
    if (feePerGas === null) throw new Error("RPC belum memberikan data fee.");
    const gasLimit = await provider.estimateGas({ ...tx, from: signer.address });
    const maximumFee = gasLimit * feePerGas;
    if (balance < maximumFee) throw new Error("Saldo MON testnet tidak cukup untuk estimasi aksi ini.");

    const response = await signer.sendTransaction({ ...tx, nonce, gasLimit });
    stored.pending = { hash: response.hash, purpose, startedAt: Date.now() };
    saveStoredSession(stored);
    onHash(response.hash);
    const receipt = await response.wait();
    if (!receipt) throw new Error(`Receipt belum tersedia. Periksa transaksi ${response.hash}; jangan kirim ulang.`);
    await refreshSnapshotAfterReceipt();
    const latest = readStoredSession();
    if (latest?.pending?.hash === response.hash) {
      delete latest.pending;
      saveStoredSession(latest);
    }
    if (receipt.status !== 1) throw new Error(`Transaksi gagal pada chain. State dibaca ulang. Hash: ${response.hash}`);
    return receipt;
  } finally {
    writeInFlight = false;
  }
}

export async function inspectPendingTransaction(provider: JsonRpcProvider, refreshSnapshotAfterReceipt?: () => Promise<void>) {
  const stored = readStoredSession();
  const pending = stored?.pending;
  if (!stored || !pending) return { pending: null, receipt: null };
  await assertMonadRpc(provider);
  const receipt = await provider.getTransactionReceipt(pending.hash);
  if (receipt && refreshSnapshotAfterReceipt) await refreshSnapshotAfterReceipt();
  if (receipt && refreshSnapshotAfterReceipt && stored.pending?.hash === pending.hash) {
    delete stored.pending;
    saveStoredSession(stored);
  }
  return { pending, receipt };
}

export function getStoredPendingTransaction() {
  return readStoredSession()?.pending ?? null;
}
