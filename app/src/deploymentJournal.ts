// Public metadata only. Never put wallet secrets in this journal.
const KEY = "bom-oper:deployment:v1";
export type DeploymentJournal = { account: string; startedAt: number; hash?: string; state: "awaiting-wallet" | "broadcast" | "verified" | "failed" };
type JournalStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function readDeploymentJournal(storage: JournalStorage): DeploymentJournal | null {
  const raw = storage.getItem(KEY);
  if (!raw) return null;
  const value = JSON.parse(raw) as DeploymentJournal;
  if (!/^0x[\da-f]{40}$/i.test(value.account) || !Number.isFinite(value.startedAt)
    || !["awaiting-wallet", "broadcast", "verified", "failed"].includes(value.state)
    || (value.hash !== undefined && !/^0x[\da-f]{64}$/i.test(value.hash))
    || (value.state !== "awaiting-wallet" && !value.hash)) {
    throw new Error("Catatan deployment tidak valid. Periksa transaksi pada wallet sebelum deploy lagi.");
  }
  return value;
}

export function writeDeploymentJournal(storage: JournalStorage, value: DeploymentJournal) {
  storage.setItem(KEY, JSON.stringify(value));
}

export function clearRejectedDeployment(storage: JournalStorage) {
  const record = readDeploymentJournal(storage);
  if (record?.state === "awaiting-wallet" && !record.hash) storage.removeItem(KEY);
}

export function clearFailedDeployment(storage: JournalStorage) {
  if (readDeploymentJournal(storage)?.state !== "failed") throw new Error("Hanya transaksi dengan receipt gagal yang boleh ditutup.");
  storage.removeItem(KEY);
}
