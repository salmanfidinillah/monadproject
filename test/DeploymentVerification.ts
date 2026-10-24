import assert from "node:assert/strict";
import { network } from "hardhat";
import { readFile } from "node:fs/promises";
import { verifyDeployment } from "../app/src/deploymentVerification.ts";

const { ethers } = await network.create({ network: "monadTestnetLocal" });
const artifact = JSON.parse(await readFile(new URL("../app/src/contract/BomOper.artifact.json", import.meta.url), "utf8"));

describe("Deployment proof verifier (local simulation only)", function () {
  it("verifies a real local deployment receipt, bytecode and view calls", async function () {
    const game = await ethers.deployContract("BomOper");
    await game.waitForDeployment();
    const hash = game.deploymentTransaction()!.hash;
    const result = await verifyDeployment(ethers.provider, hash, artifact);
    assert.equal(result.state, "verified");
    if (result.state !== "verified") throw new Error("Expected verified result");
    assert.equal(result.proof.address, await game.getAddress());
    assert.equal(result.proof.transactionHash, hash);
    assert.equal(result.proof.chainId, 10143);
    assert.equal(result.proof.nextRoomId, "1");
    assert.equal(result.proof.verified, false, "source explorer verification is independent");
  });

  it("leaves missing receipts unresolved", async function () {
    const result = await verifyDeployment(ethers.provider, `0x${"12".repeat(32)}`, artifact);
    assert.equal(result.state, "pending");
  });

  it("rejects a successful ordinary transfer as a deployment", async function () {
    const [sender, recipient] = await ethers.getSigners();
    const tx = await sender.sendTransaction({ to: recipient.address, value: 1n });
    await tx.wait();
    await assert.rejects(verifyDeployment(ethers.provider, tx.hash, artifact), /bukan deploy langsung/);
  });

  it("rejects mismatched init bytecode and runtime bytecode", async function () {
    const game = await ethers.deployContract("BomOper");
    await game.waitForDeployment();
    const hash = game.deploymentTransaction()!.hash;
    await assert.rejects(verifyDeployment(ethers.provider, hash, { ...artifact, bytecode: "0x00" }), /Init bytecode/);
    await assert.rejects(verifyDeployment(ethers.provider, hash, { ...artifact, deployedBytecode: "0x00" }), /Runtime bytecode/);
  });

  it("rejects malformed transaction hashes before RPC lookup", async function () {
    await assert.rejects(verifyDeployment(ethers.provider, "0xwrong", artifact), /Hash transaksi/);
  });

  it("records a mined out-of-gas deploy as failed rather than verified", async function () {
    const [sender] = await ethers.getSigners();
    await ethers.provider.send("evm_setAutomine", [false]);
    try {
      const tx = await sender.sendTransaction({ data: artifact.bytecode, gasLimit: 150000n });
      await ethers.provider.send("evm_mine", []);
      const result = await verifyDeployment(ethers.provider, tx.hash, artifact);
      assert.equal(result.state, "failed");
    } finally { await ethers.provider.send("evm_setAutomine", [true]); }
  });
});
