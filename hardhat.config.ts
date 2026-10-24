import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { defineConfig } from "hardhat/config";

export default defineConfig({
  plugins: [hardhatToolboxMochaEthers],
  solidity: {
    version: "0.8.30",
    settings: {
      evmVersion: "cancun",
      optimizer: { enabled: true, runs: 200 },
    },
  },
  paths: {
    sources: "./contracts",
    tests: { mocha: "./test" },
    cache: "./cache/hardhat",
    artifacts: "./artifacts/hardhat",
  },
  networks: {
    monadTestnetLocal: {
      type: "edr-simulated",
      chainType: "generic",
      chainId: 10143,
      hardfork: "cancun",
    },
    wrongChainLocal: {
      type: "edr-simulated",
      chainType: "generic",
      chainId: 31337,
      hardfork: "cancun",
    },
    monadTestnet: {
      type: "http",
      chainType: "generic",
      chainId: 10143,
      url: "https://testnet-rpc.monad.xyz",
    },
  },
});
