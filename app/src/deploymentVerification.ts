import { Contract, getAddress, getCreateAddress, keccak256, type InterfaceAbi, type Provider } from "ethers";

export const DEPLOY_CHAIN_ID = 10143n;
export const DEPLOY_RPC_URL = "https://testnet-rpc.monad.xyz";
export const DEPLOY_EXPLORER_URL = "https://testnet.monadvision.com";

export type DeploymentArtifact = {
  abi: InterfaceAbi;
  bytecode: string;
  deployedBytecode: string;
  sourceRevision: string;
  sourceSha256: string;
  compiler: { version: string; evmVersion: string; optimizer: { enabled: boolean; runs: number } };
};

export type DeploymentProof = {
  network: "Monad Testnet";
  chainId: number;
  address: string;
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
  deployer: string;
  gasUsed: string;
  runtimeCodeBytes: number;
  runtimeCodeKeccak256: string;
  sourceRevision: string;
  sourceSha256: string;
  compiler: DeploymentArtifact["compiler"];
  verified: false;
  nextRoomId: string;
};

export type DeploymentResult =
  | { state: "pending" }
  | { state: "failed"; transactionHash: string; blockNumber: number }
  | { state: "verified"; proof: DeploymentProof };

/** Read-only: never broadcasts and never accepts an address without its deployment receipt. */
export async function verifyDeployment(
  provider: Provider,
  transactionHash: string,
  artifact: DeploymentArtifact,
): Promise<DeploymentResult> {
  if (!/^0x[\da-f]{64}$/i.test(transactionHash)) throw new Error("Hash transaksi harus 0x diikuti 64 karakter hex.");
  if ((await provider.getNetwork()).chainId !== DEPLOY_CHAIN_ID) throw new Error("RPC bukan Monad Testnet (10143).");
  const receipt = await provider.getTransactionReceipt(transactionHash);
  if (!receipt) return { state: "pending" };
  const transaction = await provider.getTransaction(transactionHash);
  if (!transaction || transaction.chainId !== DEPLOY_CHAIN_ID || transaction.to !== null || transaction.value !== 0n) {
    throw new Error("Transaksi bukan deploy langsung BomOper tanpa dana di chain 10143.");
  }
  if (transaction.data.toLowerCase() !== artifact.bytecode.toLowerCase()) throw new Error("Init bytecode tidak cocok dengan artifact BomOper lokal.");
  if (receipt.status === 0) return { state: "failed", transactionHash: receipt.hash, blockNumber: receipt.blockNumber };
  if (receipt.status !== 1 || !receipt.contractAddress) throw new Error("Receipt bukan deployment kontrak yang sukses.");
  const address = getAddress(receipt.contractAddress);
  if (address !== getCreateAddress({ from: transaction.from, nonce: transaction.nonce })) throw new Error("Alamat receipt tidak cocok dengan pengirim/nonce deploy.");
  const [runtime, block] = await Promise.all([
    provider.getCode(address),
    provider.getBlock(receipt.blockNumber),
  ]);
  if (!block || block.hash !== receipt.blockHash) throw new Error("Blok receipt belum cocok dengan blok kanonis RPC. Periksa lagi.");
  if (runtime === "0x" || runtime.toLowerCase() !== artifact.deployedBytecode.toLowerCase()) {
    throw new Error("Runtime bytecode tidak cocok dengan kontrak yang dikompilasi dan dites.");
  }
  const game = new Contract(address, artifact.abi, provider);
  const [targetChain, nextRoomId] = await Promise.all([
    game.getFunction("TARGET_CHAIN_ID").staticCall({ blockTag: block.number }) as Promise<bigint>,
    game.getFunction("nextRoomId").staticCall({ blockTag: block.number }) as Promise<bigint>,
  ]);
  if (targetChain !== DEPLOY_CHAIN_ID || nextRoomId < 1n) throw new Error("View kontrak tidak sesuai BomOper.");
  return { state: "verified", proof: {
    network: "Monad Testnet", chainId: Number(DEPLOY_CHAIN_ID), address,
    transactionHash: receipt.hash, blockNumber: receipt.blockNumber, blockHash: receipt.blockHash,
    deployer: transaction.from, gasUsed: receipt.gasUsed.toString(),
    runtimeCodeBytes: (runtime.length - 2) / 2, runtimeCodeKeccak256: keccak256(runtime),
    sourceRevision: artifact.sourceRevision, sourceSha256: artifact.sourceSha256, compiler: artifact.compiler,
    verified: false, nextRoomId: nextRoomId.toString(),
  } };
}
