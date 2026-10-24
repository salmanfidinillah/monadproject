import assert from "node:assert/strict";
import { expect } from "chai";
import { network } from "hardhat";

const { ethers: monadEthers } = await network.create({ network: "monadTestnetLocal" });
const { ethers: wrongChainEthers } = await network.create({ network: "wrongChainLocal" });

describe("BomOper chain restriction", function () {
  it("uses Monad Testnet chain ID in its local simulation and deploys there", async function () {
    const chain = await monadEthers.provider.getNetwork();
    assert.equal(chain.chainId, 10143n);

    const game = await monadEthers.deployContract("BomOper");
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
