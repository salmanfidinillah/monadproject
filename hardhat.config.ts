import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { defineConfig } from "hardhat/config";

export default defineConfig({
  plugins: [hardhatToolboxMochaEthers],
  paths: {
    sources: "./contracts",
    tests: { mocha: "./test" },
    cache: "./cache/hardhat",
    artifacts: "./artifacts/hardhat",
  },
});
