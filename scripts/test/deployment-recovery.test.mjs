import assert from "node:assert/strict";
import { test } from "node:test";
import { DEPLOY_CHECK_RPCS, deploymentErrorMessage, planDeploymentRetry } from "../../app/src/deploymentRecovery.ts";

const intent = { account: `0x${"11".repeat(20)}`, startedAt: 123, state: "awaiting-wallet" };
const observations = (nonce = 0) => DEPLOY_CHECK_RPCS.map((rpc) => ({ rpc, chainId: 10143n, latestNonce: nonce, pendingNonce: nonce, candidateCode: "0x" }));

test("legacy first-deployment recovery pins nonce zero and preserves original attempt metadata", () => {
  const result = planDeploymentRetry(intent, observations(), true);
  assert.equal(result.nonce, 0);
  assert.equal(result.state, "retry-ready");
  assert.equal(result.startedAt, intent.startedAt);
  assert.equal(result.account, intent.account);
});

test("recovery requires explicit confirmation of failed/no-pending wallet activity", () => {
  assert.throws(() => planDeploymentRetry(intent, observations(), false), /Aktivitas MetaMask/);
});

test("hash-bearing transactions cannot be retried through the no-hash path", () => {
  assert.throws(() => planDeploymentRetry({ ...intent, hash: `0x${"22".repeat(32)}`, state: "broadcast" }, observations(), true), /receipt/);
});

test("both independently named official RPCs must be present", () => {
  assert.throws(() => planDeploymentRetry(intent, observations().slice(0, 1), true), /Dua RPC/);
  assert.throws(() => planDeploymentRetry(intent, [observations()[0], observations()[0]], true), /Dua RPC/);
});

for (const [name, patch] of [
  ["pending transaction", { pendingNonce: 1 }],
  ["consumed nonce", { latestNonce: 1, pendingNonce: 1 }],
  ["visible contract", { candidateCode: "0x6000" }],
  ["wrong chain", { chainId: 143n }],
]) {
  test(`recovery fails closed for ${name} observed by either RPC`, () => {
    for (const index of [0, 1]) {
      const rows = observations(); rows[index] = { ...rows[index], ...patch };
      assert.throws(() => planDeploymentRetry(intent, rows, true));
    }
  });
}

test("new journal recovery reuses the saved nonce, never advances it", () => {
  const saved = { ...intent, nonce: 7 };
  assert.equal(planDeploymentRetry(saved, observations(7), true).nonce, 7);
  assert.throws(() => planDeploymentRetry(saved, observations(8), true), /Nonce/);
  assert.throws(() => planDeploymentRetry(intent, observations(7), true), /Nonce/);
});

test("rate limit error is translated without exposing its bytecode payload", () => {
  const bytecode = `0x${"60".repeat(200)}`;
  const message = deploymentErrorMessage({ code: "UNKNOWN_ERROR", error: { code: -32603, message: "RPC 0x279f Custom eth_sendRawTransaction: Request is being rate limited." }, message: `could not coalesce error payload=${bytecode}` });
  assert.match(message, /rate limited/);
  assert.doesNotMatch(message, /60606060|payload|could not coalesce/);
  assert.ok(message.length < 400);
  assert.doesNotMatch(deploymentErrorMessage({ message: `payload=${bytecode}` }), /60606060|payload/);
});
