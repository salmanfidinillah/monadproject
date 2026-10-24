import assert from "node:assert/strict";
import { test } from "node:test";
import { clearFailedDeployment, clearRejectedDeployment, readDeploymentJournal, writeDeploymentJournal } from "../../app/src/deploymentJournal.ts";

function memoryStorage() {
  const data = new Map();
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: (key) => data.delete(key) };
}
const intent = { account: `0x${"11".repeat(20)}`, startedAt: 123, state: "awaiting-wallet" };
const broadcast = { ...intent, state: "broadcast", hash: `0x${"22".repeat(32)}` };

test("refresh restores an unresolved intent and its subsequently broadcast hash", () => {
  const storage = memoryStorage();
  writeDeploymentJournal(storage, intent);
  assert.deepEqual(readDeploymentJournal(storage), intent);
  writeDeploymentJournal(storage, broadcast);
  assert.deepEqual(readDeploymentJournal(storage), broadcast);
  clearRejectedDeployment(storage);
  assert.deepEqual(readDeploymentJournal(storage), broadcast, "a broadcast must not be cleared as a rejection");
});

test("only receipt-proven failures can be closed", () => {
  const storage = memoryStorage();
  writeDeploymentJournal(storage, broadcast);
  assert.throws(() => clearFailedDeployment(storage), /receipt gagal/);
  writeDeploymentJournal(storage, { ...broadcast, state: "failed" });
  clearFailedDeployment(storage);
  assert.equal(readDeploymentJournal(storage), null);
});

test("explicit wallet rejection clears only an unbroadcast intent", () => {
  const storage = memoryStorage();
  writeDeploymentJournal(storage, intent);
  clearRejectedDeployment(storage);
  assert.equal(readDeploymentJournal(storage), null);
});

test("corrupted storage fails closed rather than appearing ready for another deployment", () => {
  const storage = memoryStorage();
  writeDeploymentJournal(storage, { ...broadcast, hash: "garbled" });
  assert.throws(() => readDeploymentJournal(storage), /tidak valid/);
});
