import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { keccak256 } from "ethers";

const root = process.cwd();
const artifactPath = resolve(root, "artifacts/hardhat/contracts/BomOper.sol/BomOper.json");
const artifact = JSON.parse(await readFile(artifactPath, "utf8"));
const buildInfoPath = resolve(root, `artifacts/hardhat/build-info/${artifact.buildInfoId}.json`);
const buildInfo = JSON.parse(await readFile(buildInfoPath, "utf8"));
const sourcePath = resolve(root, "contracts/BomOper.sol");
const source = await readFile(sourcePath);
const inputSourceName = buildInfo.userSourceNameMap?.[artifact.sourceName] ?? artifact.sourceName;
if (buildInfo.input.sources[inputSourceName]?.content.replace(/\r\n/g, "\n") !== source.toString("utf8").replace(/\r\n/g, "\n")) {
  throw new Error("Source pada build info tidak cocok dengan contracts/BomOper.sol; compile ulang sebelum ekspor.");
}
const sourceRevision = execFileSync("git", ["log", "-1", "--format=%H", "--", "contracts/BomOper.sol"], { cwd: root, encoding: "utf8" }).trim();

const requiredFunctions = [
  "createRoom", "joinRoom", "startRoom", "passBomb", "settleRoom",
  "getRoomSnapshot", "nextRoomId",
];
const functionNames = new Set(artifact.abi.filter((item) => item.type === "function").map((item) => item.name));
if (artifact.contractName !== "BomOper" || !artifact.bytecode.startsWith("0x")) {
  throw new Error("Hardhat artifact BomOper tidak valid.");
}
for (const name of requiredFunctions) {
  if (!functionNames.has(name)) throw new Error(`ABI artifact kehilangan fungsi ${name}.`);
}
if (Object.keys(artifact.linkReferences ?? {}).length > 0) {
  throw new Error("Artifact memerlukan library eksternal; ekspor dihentikan.");
}

const output = {
  contractName: artifact.contractName,
  sourceName: artifact.sourceName,
  abi: artifact.abi,
  bytecode: artifact.bytecode,
  deployedBytecode: artifact.deployedBytecode,
  compiler: {
    version: buildInfo.solcLongVersion,
    evmVersion: buildInfo.input.settings.evmVersion,
    optimizer: buildInfo.input.settings.optimizer,
  },
  sourceSha256: createHash("sha256").update(source).digest("hex"),
  sourceRevision,
};

const outputPath = resolve(root, "app/src/contract/BomOper.artifact.json");
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);

const deploymentPath = resolve(root, "deployments/10143.json");
const deployment = JSON.parse(await readFile(deploymentPath, "utf8"));
if (deployment.network !== "Monad Testnet" || deployment.chainId !== 10143
  || !/^0x[\da-f]{40}$/i.test(deployment.address)
  || !/^0x[\da-f]{64}$/i.test(deployment.transactionHash)
  || deployment.sourceRevision !== sourceRevision
  || deployment.sourceSha256 !== output.sourceSha256
  || deployment.runtimeCodeBytes !== (artifact.deployedBytecode.length - 2) / 2
  || deployment.runtimeCodeKeccak256 !== keccak256(artifact.deployedBytecode)
  || deployment.compiler?.version !== output.compiler.version
  || deployment.compiler?.evmVersion !== output.compiler.evmVersion
  || deployment.compiler?.optimizer?.enabled !== output.compiler.optimizer.enabled
  || deployment.compiler?.optimizer?.runs !== output.compiler.optimizer.runs) {
  throw new Error("Record deployment publik tidak cocok dengan source/compiler BomOper saat ini. Build dihentikan.");
}
const deploymentConfigPath = resolve(root, "app/src/contract/deploymentConfig.json");
await writeFile(deploymentConfigPath, `${JSON.stringify({
  network: deployment.network,
  chainId: deployment.chainId,
  address: deployment.address,
  transactionHash: deployment.transactionHash,
}, null, 2)}\n`);
console.log(`Exported ${requiredFunctions.length} verified ABI functions and deployment bytecode to ${outputPath}`);
console.log(`Loaded verified public deployment ${deployment.address} from deployments/10143.json`);
