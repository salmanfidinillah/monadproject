import { JsonRpcProvider, Wallet, getAddress, isAddress, keccak256, parseEther, resolveAddress, type TransactionReceipt, type TransactionRequest } from "ethers";
import deploymentConfig from "./contract/deploymentConfig.json";

export const MONAD_CHAIN_ID = 10143n;
export const MONAD_RPC_URL = "https://testnet-rpc.monad.xyz";
const SESSION_KEY = "bom-oper:play-session:v1";
const SESSION_TTL_MS = 10 * 60 * 1000;

type StoredSession = {
  privateKey: string;
  createdAt: number;
  expiresAt: number;
  pending?: { hash: string; purpose: string; startedAt: number; nonce: number };
  activeRoomId?: string;
  lastReceiptBlock?: number;
};

export type PublicPlaySession = {
  address: string;
  createdAt: number;
  expiresAt: number;
  pending: StoredSession["pending"];
  activeRoomId?: string;
};

let writeInFlight = false;

function readSessionRecord(): StoredSession | null {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const stored = JSON.parse(raw) as StoredSession;
    if (!Number.isFinite(stored.expiresAt) || (Date.now() < stored.expiresAt && !stored.privateKey)) throw new Error("invalid session");
    if (Date.now() >= stored.expiresAt) {
      // Retain only non-secret recovery metadata so an active room identity and
      // pending transaction hash survive expiry. The private key is erased.
      if (stored.privateKey) {
        stored.privateKey = "";
        saveStoredSession(stored);
      }
    }
    return stored;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function readStoredSession(): StoredSession | null {
  const stored = readSessionRecord();
  if (!stored?.privateKey || Date.now() >= stored.expiresAt) return null;
  return stored;
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
  const previous = readSessionRecord();
  if (previous?.activeRoomId) throw new Error("Wallet lama terikat ke room aktif/tersimpan. Sesi baru diblokir agar identitas pemain tidak berganti.");
  if (previous?.pending) throw new Error(`Periksa transaksi pending ${previous.pending.hash} sebelum membuat wallet baru.`);
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
  if (deploymentConfig.network !== "Monad Testnet" || deploymentConfig.chainId !== Number(MONAD_CHAIN_ID)
    || !isAddress(deploymentConfig.address) || !/^0x[\da-f]{64}$/i.test(deploymentConfig.transactionHash)) {
    throw new Error("Konfigurasi kontrak tidak cocok dengan record deployment Monad Testnet.");
  }
  return getAddress(deploymentConfig.address);
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
  refreshSnapshotAfterReceipt: (receipt: TransactionReceipt) => Promise<void>,
  onStatus?: (status: string) => void,
) {
  const allowedContractAddress = getConfiguredGameAddress();
  await assertMonadRpc(provider);
  if ((await provider.getCode(allowedContractAddress)) === "0x") throw new Error("Alamat kontrak allowlist tidak memiliki code pada RPC ini.");
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
    if (tx.value != null && BigInt(tx.value.toString()) !== 0n) {
      throw new Error("Transaksi game tidak boleh mengirim MON ke kontrak.");
    }
    if (tx.from && (await resolveAddress(tx.from)).toLowerCase() !== signer.address.toLowerCase()) {
      throw new Error("Transaksi diblokir: pengirim bukan wallet bermain aktif.");
    }
    let balance = await provider.getBalance(signer.address);
    if (balance < parseEther("10") && stored.lastReceiptBlock !== undefined) {
      const targetBlock = stored.lastReceiptBlock + 3;
      const currentBlock = await provider.getBlockNumber();
      if (currentBlock < targetBlock) {
        onStatus?.("Menunggu tiga blok sejak aksi sebelumnya karena saldo wallet di bawah 10 MON…");
        await provider.waitForBlock(targetBlock);
        balance = await provider.getBalance(signer.address);
      }
    }
    const nonce = await provider.getTransactionCount(signer.address, "pending");
    const gasLimit = await provider.estimateGas({ ...tx, from: signer.address });
    // Populate current fee fields after any reserve-related wait, then check the
    // same gasLimit and fee cap that will be signed and broadcast.
    const prepared = await signer.populateTransaction({ ...tx, nonce, gasLimit });
    const feePerGas = prepared.maxFeePerGas ?? prepared.gasPrice;
    if (feePerGas === undefined || feePerGas === null) throw new Error("RPC belum memberikan fee untuk transaksi.");
    const maximumFee = gasLimit * BigInt(feePerGas.toString()) + BigInt((prepared.value ?? 0n).toString());
    balance = await provider.getBalance(signer.address);
    if (balance < maximumFee) throw new Error("Saldo MON testnet tidak cukup untuk estimasi aksi ini.");

    const stillActive = readStoredSession();
    if (!stillActive || new Wallet(stillActive.privateKey).address.toLowerCase() !== signer.address.toLowerCase()) {
      throw new Error("Sesi wallet habis sebelum transaksi ditandatangani. Aksi diblokir.");
    }

    // Persist a deterministic hash before broadcast. If the RPC drops its response
    // after accepting the raw transaction, the UI still has the hash to reconcile.
    const rawTransaction = await signer.signTransaction(prepared);
    const hash = keccak256(rawTransaction);
    stored.pending = { hash, purpose, startedAt: Date.now(), nonce };
    saveStoredSession(stored);
    onHash(hash);
    await provider.broadcastTransaction(rawTransaction);
    const receipt = await provider.waitForTransaction(hash);
    if (!receipt) throw new Error(`Receipt belum tersedia. Periksa transaksi ${hash}; jangan kirim ulang.`);
    await refreshSnapshotAfterReceipt(receipt);
    const latest = readStoredSession();
    if (latest?.pending?.hash === hash) {
      latest.lastReceiptBlock = receipt.blockNumber;
      delete latest.pending;
      saveStoredSession(latest);
    }
    if (receipt.status !== 1) throw new Error(`Transaksi gagal pada chain. State dibaca ulang. Hash: ${hash}`);
    return receipt;
  } finally {
    writeInFlight = false;
  }
}

export async function inspectPendingTransaction(provider: JsonRpcProvider, refreshSnapshotAfterReceipt?: () => Promise<void>) {
  const stored = readSessionRecord();
  const pending = stored?.pending;
  if (!stored || !pending) return { pending: null, receipt: null };
  await assertMonadRpc(provider);
  const receipt = await provider.getTransactionReceipt(pending.hash);
  if (receipt && refreshSnapshotAfterReceipt) await refreshSnapshotAfterReceipt();
  if (receipt && refreshSnapshotAfterReceipt && stored.pending?.hash === pending.hash) {
    stored.lastReceiptBlock = receipt.blockNumber;
    delete stored.pending;
    saveStoredSession(stored);
  }
  return { pending, receipt };
}

export function getStoredPendingTransaction() {
  return readSessionRecord()?.pending ?? null;
}

export function getStoredSessionExpiry() {
  return readSessionRecord()?.expiresAt ?? null;
}
