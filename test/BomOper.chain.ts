import assert from "node:assert/strict";
import { expect } from "chai";
import { network } from "hardhat";

const { ethers, networkHelpers } = await network.create({ network: "monadTestnetLocal" });
const { ethers: wrongChainEthers } = await network.create({ network: "wrongChainLocal" });

async function deployFixture() {
  const signers = await ethers.getSigners();
  const game = await ethers.deployContract("BomOper");
  await game.waitForDeployment();
  return { game, signers };
}

async function createRoom(game: any, creator: any, capacity = 2, duration = 30) {
  const receipt = await (await game.connect(creator).createRoom(capacity, duration)).wait();
  const event = receipt!.logs.map((log: any) => {
    try { return game.interface.parseLog(log); } catch { return null; }
  }).find((entry: any) => entry?.name === "RoomCreated");
  return { roomId: event!.args.roomId as bigint, receipt };
}

async function createActiveRoom(game: any, signers: any[], capacity = 2, duration = 30) {
  const { roomId } = await createRoom(game, signers[0], capacity, duration);
  for (let i = 1; i < capacity; i++) await (await game.connect(signers[i]).joinRoom(roomId)).wait();
  const startReceipt = await (await game.connect(signers[0]).startRoom(roomId)).wait();
  return { roomId, startReceipt };
}

function parsedEvents(game: any, receipt: any) {
  return receipt.logs.map((log: any) => {
    try { return game.interface.parseLog(log); } catch { return null; }
  }).filter(Boolean);
}

async function expectMinedRevert(send: () => Promise<any>) {
  // Disable automining so exact-boundary failures are included and checked by receipt status.
  await ethers.provider.send("evm_setAutomine", [false]);
  let caught: any;
  try {
    const tx = await send();
    await networkHelpers.mine();
    try { await tx.wait(); } catch (error) { caught = error; }
  } finally {
    await ethers.provider.send("evm_setAutomine", [true]);
  }
  assert.ok(caught, "expected transaction receipt to revert");
  assert.equal(caught.receipt?.status, 0, "failed transaction must have a status-0 receipt");
  return caught.receipt;
}

describe("BomOper chain restriction", function () {
  it("uses Monad Testnet chain ID in its local simulation and deploys there", async function () {
    const chain = await ethers.provider.getNetwork();
    assert.equal(chain.chainId, 10143n);
    const game = await ethers.deployContract("BomOper");
    await game.waitForDeployment();
    assert.notEqual(await game.getAddress(), "0x0000000000000000000000000000000000000000");
  });

  it("rejects deployment on a different chain ID", async function () {
    const chain = await wrongChainEthers.provider.getNetwork();
    assert.equal(chain.chainId, 31337n);
    const factory = await wrongChainEthers.getContractFactory("BomOper");
    await expect(factory.deploy())
      .to.be.revertedWithCustomError(factory, "UnsupportedChain")
      .withArgs(31337n, 10143n);
  });
});

describe("BomOper room rules", function () {
  it("accepts capacities 2, 3, and 4 and records the creator exactly once", async function () {
    const { game, signers } = await networkHelpers.loadFixture(deployFixture);
    for (const capacity of [2, 3, 4]) {
      const { roomId, receipt } = await createRoom(game, signers[0], capacity, 30);
      const snapshot = await game.getRoomSnapshot(roomId);
      assert.equal(snapshot.capacity, BigInt(capacity));
      assert.equal(snapshot.status, 0n);
      assert.equal(snapshot.players.length, 1);
      assert.equal(snapshot.players[0], await signers[0].getAddress());
      assert.equal(snapshot.holder, await signers[0].getAddress());
      const events = parsedEvents(game, receipt);
      assert.equal(events.filter((event: any) => event.name === "RoomCreated").length, 1);
      assert.equal(events.filter((event: any) => event.name === "PlayerJoined").length, 1);
      for (let player = 1; player < capacity; player++) {
        await (await game.connect(signers[player]).joinRoom(roomId)).wait();
      }
      await (await game.connect(signers[capacity - 1]).startRoom(roomId)).wait();
      assert.equal((await game.getRoomSnapshot(roomId)).status, 1n);
    }
    const sixtySeconds = await createRoom(game, signers[0], 2, 60);
    assert.equal((await game.getRoomSnapshot(sixtySeconds.roomId)).duration, 60n);
  });

  it("rejects capacity and duration outside the allowed values", async function () {
    const { game, signers } = await networkHelpers.loadFixture(deployFixture);
    for (const capacity of [0, 1, 5, 255]) {
      await expect(game.connect(signers[0]).createRoom(capacity, 30))
        .to.be.revertedWithCustomError(game, "InvalidCapacity");
    }
    for (const duration of [0, 29, 31, 60 + 1]) {
      await expect(game.connect(signers[0]).createRoom(2, duration))
        .to.be.revertedWithCustomError(game, "InvalidDuration");
    }
    const { roomId } = await createRoom(game, signers[0]);
    await expect(game.getRoomSnapshot(roomId + 1n))
      .to.be.revertedWithCustomError(game, "UnknownRoom");
  });

  it("rejects duplicate joins, full rooms, and joins after start", async function () {
    const { game, signers } = await networkHelpers.loadFixture(deployFixture);
    const { roomId } = await createRoom(game, signers[0]);
    await expect(game.connect(signers[0]).joinRoom(roomId))
      .to.be.revertedWithCustomError(game, "AlreadyJoined");
    const joined = await (await game.connect(signers[1]).joinRoom(roomId)).wait();
    const joinedEvent = parsedEvents(game, joined).find((event: any) => event.name === "PlayerJoined");
    assert.equal(joinedEvent.args.player, await signers[1].getAddress());
    assert.equal(joinedEvent.args.playerCount, 2n);
    await expect(game.connect(signers[2]).joinRoom(roomId))
      .to.be.revertedWithCustomError(game, "RoomFull");
    await (await game.connect(signers[0]).startRoom(roomId)).wait();
    await expect(game.connect(signers[2]).joinRoom(roomId))
      .to.be.revertedWithCustomError(game, "InvalidRoomStatus");
  });

  it("requires a room member and a complete room to start, then prevents a restart", async function () {
    const { game, signers } = await networkHelpers.loadFixture(deployFixture);
    const { roomId } = await createRoom(game, signers[0]);
    await expect(game.connect(signers[1]).startRoom(roomId))
      .to.be.revertedWithCustomError(game, "NotRoomMember");
    await expect(game.connect(signers[0]).startRoom(roomId))
      .to.be.revertedWithCustomError(game, "RoomNotFull");
    await (await game.connect(signers[1]).joinRoom(roomId)).wait();
    const receipt = await (await game.connect(signers[1]).startRoom(roomId)).wait();
    const snapshot = await game.getRoomSnapshot(roomId);
    assert.equal(snapshot.status, 1n);
    assert.equal(snapshot.holder, await signers[0].getAddress());
    assert.equal(snapshot.turn, 0n);
    assert.equal(snapshot.deadline, snapshot.startedAt + 30n);
    const started = parsedEvents(game, receipt).find((event: any) => event.name === "RoomStarted");
    assert.equal(started.args.firstHolder, await signers[0].getAddress());
    assert.equal(started.args.deadline, snapshot.deadline);
    await expect(game.connect(signers[0]).startRoom(roomId))
      .to.be.revertedWithCustomError(game, "InvalidRoomStatus");
  });

  it("keeps the deadline on a normal pass and increments the turn", async function () {
    const { game, signers } = await networkHelpers.loadFixture(deployFixture);
    const { roomId } = await createActiveRoom(game, signers);
    const before = await game.getRoomSnapshot(roomId);
    const receipt = await (await game.connect(signers[0]).passBomb(roomId, await signers[1].getAddress(), false, 0)).wait();
    const after = await game.getRoomSnapshot(roomId);
    assert.equal(after.deadline, before.deadline);
    assert.equal(after.turn, 1n);
    assert.equal(after.holder, await signers[1].getAddress());
    const passed = parsedEvents(game, receipt).find((event: any) => event.name === "BombPassed");
    assert.equal(passed.args.hot, false);
    assert.equal(passed.args.previousDeadline, before.deadline);
    assert.equal(passed.args.newDeadline, before.deadline);
  });

  it("subtracts exactly 3 seconds for a hot pass and permits one hot use per player", async function () {
    const { game, signers } = await networkHelpers.loadFixture(deployFixture);
    const { roomId } = await createActiveRoom(game, signers);
    const before = await game.getRoomSnapshot(roomId);
    await networkHelpers.time.setNextBlockTimestamp(before.deadline - 7n);
    const hotReceipt = await (await game.connect(signers[0]).passBomb(roomId, await signers[1].getAddress(), true, 0, { gasLimit: 500_000 })).wait();
    const after = await game.getRoomSnapshot(roomId);
    assert.equal(after.deadline, before.deadline - 3n);
    assert.equal(after.hotUsed[0], true);
    const passed = parsedEvents(game, hotReceipt).find((event: any) => event.name === "BombPassed");
    assert.equal(passed.args.previousDeadline, before.deadline);
    assert.equal(passed.args.newDeadline, before.deadline - 3n);
    await (await game.connect(signers[1]).passBomb(roomId, await signers[0].getAddress(), false, 1)).wait();
    await expect(game.connect(signers[0]).passBomb(roomId, await signers[1].getAddress(), true, 2))
      .to.be.revertedWithCustomError(game, "HotAlreadyUsed");
  });

  it("rejects hot at exactly six seconds remaining and allows it above six", async function () {
    const { game, signers } = await networkHelpers.loadFixture(deployFixture);
    const { roomId } = await createActiveRoom(game, signers);
    const snapshot = await game.getRoomSnapshot(roomId);
    await networkHelpers.time.setNextBlockTimestamp(snapshot.deadline - 6n);
    const receipt = await expectMinedRevert(() => game.connect(signers[0]).passBomb(
      roomId, signers[1].address, true, 0, { gasLimit: 500_000 },
    ));
    assert.equal(receipt.status, 0);
    assert.equal((await game.getRoomSnapshot(roomId)).turn, 0n);

    const { roomId: secondRoom } = await createActiveRoom(game, signers);
    const second = await game.getRoomSnapshot(secondRoom);
    await networkHelpers.time.setNextBlockTimestamp(second.deadline - 7n);
    await (await game.connect(signers[0]).passBomb(secondRoom, await signers[1].getAddress(), true, 0, { gasLimit: 500_000 })).wait();
    assert.equal((await game.getRoomSnapshot(secondRoom)).deadline, second.deadline - 3n);
  });

  it("rejects self, nonmember, zero-address, nonholder, and stale turn passes", async function () {
    const { game, signers } = await networkHelpers.loadFixture(deployFixture);
    const { roomId } = await createActiveRoom(game, signers);
    const outside = await signers[2].getAddress();
    await expect(game.connect(signers[0]).passBomb(roomId, await signers[0].getAddress(), false, 0))
      .to.be.revertedWithCustomError(game, "InvalidRecipient");
    await expect(game.connect(signers[0]).passBomb(roomId, outside, false, 0))
      .to.be.revertedWithCustomError(game, "InvalidRecipient");
    await expect(game.connect(signers[0]).passBomb(roomId, "0x0000000000000000000000000000000000000000", false, 0))
      .to.be.revertedWithCustomError(game, "InvalidRecipient");
    await expect(game.connect(signers[1]).passBomb(roomId, await signers[0].getAddress(), false, 0))
      .to.be.revertedWithCustomError(game, "NotCurrentHolder");
    await expect(game.connect(signers[0]).passBomb(roomId, await signers[1].getAddress(), false, 1))
      .to.be.revertedWithCustomError(game, "ExpectedTurnMismatch");
  });

  it("rejects stale expectedTurn after the bomb returns to the original holder", async function () {
    const { game, signers } = await networkHelpers.loadFixture(deployFixture);
    const { roomId } = await createActiveRoom(game, signers);
    await (await game.connect(signers[0]).passBomb(roomId, await signers[1].getAddress(), false, 0)).wait();
    await (await game.connect(signers[1]).passBomb(roomId, await signers[0].getAddress(), false, 1)).wait();
    await expect(game.connect(signers[0]).passBomb(roomId, await signers[1].getAddress(), false, 0))
      .to.be.revertedWithCustomError(game, "ExpectedTurnMismatch").withArgs(0n, 2n);
    assert.equal((await game.getRoomSnapshot(roomId)).holder, await signers[0].getAddress());
  });

  it("allows only one of two competing passes at the same expected turn", async function () {
    const { game, signers } = await networkHelpers.loadFixture(deployFixture);
    const { roomId } = await createActiveRoom(game, signers, 3);
    const signer = signers[0];
    const nonce = await ethers.provider.getTransactionCount(await signer.getAddress());
    await ethers.provider.send("evm_setAutomine", [false]);
    let first: any;
    let second: any;
    try {
      first = await game.connect(signer).passBomb(roomId, await signers[1].getAddress(), false, 0, { nonce, gasLimit: 500_000 });
      second = await game.connect(signer).passBomb(roomId, await signers[2].getAddress(), false, 0, { nonce: nonce + 1, gasLimit: 500_000 });
      await networkHelpers.mine();
    } finally {
      await ethers.provider.send("evm_setAutomine", [true]);
    }
    assert.equal((await first.wait())!.status, 1);
    let losingReceipt: any;
    try { await second.wait(); } catch (error: any) { losingReceipt = error.receipt; }
    assert.ok(losingReceipt, "the competing transaction must produce a failed receipt");
    assert.equal(losingReceipt.status, 0);
    const snapshot = await game.getRoomSnapshot(roomId);
    assert.equal(snapshot.turn, 1n);
    assert.equal(snapshot.holder, await signers[1].getAddress());
  });

  it("rejects passing at the exact deadline and allows settling at the exact deadline", async function () {
    const { game, signers } = await networkHelpers.loadFixture(deployFixture);
    const { roomId } = await createActiveRoom(game, signers);
    const deadline = (await game.getRoomSnapshot(roomId)).deadline;
    await networkHelpers.time.setNextBlockTimestamp(deadline);
    const failed = await expectMinedRevert(() => game.connect(signers[0]).passBomb(
      roomId, signers[1].address, false, 0, { gasLimit: 500_000 },
    ));
    assert.equal(failed.status, 0);
    const settled = await (await game.connect(signers[2]).settleRoom(roomId, { gasLimit: 500_000 })).wait();
    assert.equal(settled!.status, 1);
    assert.equal((await game.getRoomSnapshot(roomId)).status, 2n);
  });

  it("rejects early and repeated settlement and records the last holder as loser", async function () {
    const { game, signers } = await networkHelpers.loadFixture(deployFixture);
    const { roomId } = await createActiveRoom(game, signers);
    await expect(game.connect(signers[2]).settleRoom(roomId))
      .to.be.revertedWithCustomError(game, "DeadlineNotReached");
    await (await game.connect(signers[0]).passBomb(roomId, await signers[1].getAddress(), false, 0)).wait();
    const active = await game.getRoomSnapshot(roomId);
    await networkHelpers.time.setNextBlockTimestamp(active.deadline);
    const receipt = await (await game.connect(signers[2]).settleRoom(roomId, { gasLimit: 500_000 })).wait();
    const snapshot = await game.getRoomSnapshot(roomId);
    assert.equal(snapshot.status, 2n);
    assert.equal(snapshot.loser, await signers[1].getAddress());
    assert.equal(snapshot.finishedAt, active.deadline);
    const finished = parsedEvents(game, receipt).find((event: any) => event.name === "RoomFinished");
    assert.equal(finished.args.finalizer, await signers[2].getAddress());
    assert.equal(finished.args.loser, await signers[1].getAddress());
    assert.deepEqual([...finished.args.players], [await signers[0].getAddress(), await signers[1].getAddress()]);
    await expect(game.connect(signers[3]).settleRoom(roomId))
      .to.be.revertedWithCustomError(game, "InvalidRoomStatus");
  });

  it("keeps two room snapshots and hot-use state independent", async function () {
    const { game, signers } = await networkHelpers.loadFixture(deployFixture);
    const first = await createActiveRoom(game, signers, 2);
    const second = await createActiveRoom(game, signers.slice(2), 2);
    await (await game.connect(signers[0]).passBomb(first.roomId, await signers[1].getAddress(), true, 0)).wait();
    const firstSnapshot = await game.getRoomSnapshot(first.roomId);
    const secondSnapshot = await game.getRoomSnapshot(second.roomId);
    assert.equal(firstSnapshot.turn, 1n);
    assert.equal(firstSnapshot.hotUsed[0], true);
    assert.equal(secondSnapshot.turn, 0n);
    assert.equal(secondSnapshot.holder, await signers[2].getAddress());
    assert.equal(secondSnapshot.hotUsed[0], false);
    assert.notEqual(firstSnapshot.deadline, secondSnapshot.deadline);
  });

  it("records receipt gas for create, join, start, normal pass, hot pass, and settle", async function () {
    const { game, signers } = await networkHelpers.loadFixture(deployFixture);
    const created = await createRoom(game, signers[0]);
    const joined = await (await game.connect(signers[1]).joinRoom(created.roomId)).wait();
    const started = await (await game.connect(signers[0]).startRoom(created.roomId)).wait();
    const normal = await (await game.connect(signers[0]).passBomb(created.roomId, await signers[1].getAddress(), false, 0)).wait();
    const hot = await (await game.connect(signers[1]).passBomb(created.roomId, await signers[0].getAddress(), true, 1)).wait();
    const snapshot = await game.getRoomSnapshot(created.roomId);
    await networkHelpers.time.setNextBlockTimestamp(snapshot.deadline);
    const settled = await (await game.connect(signers[2]).settleRoom(created.roomId, { gasLimit: 500_000 })).wait();
    console.log("BOM_OPER_GAS", JSON.stringify({
      create: created.receipt!.gasUsed.toString(), join: joined!.gasUsed.toString(),
      start: started!.gasUsed.toString(), passNormal: normal!.gasUsed.toString(),
      passHot: hot!.gasUsed.toString(), settle: settled!.gasUsed.toString(),
    }));
  });
});
