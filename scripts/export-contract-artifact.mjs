import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = process.cwd();
const artifactPath = resolve(root, "artifacts/hardhat/contracts/BomOper.sol/BomOper.json");
const artifact = JSON.parse(await readFile(artifactPath, "utf8"));
const buildInfoPath = resolve(root, `artifacts/hardhat/build-info/${artifact.buildInfoId}.json`);
const buildInfo = JSON.parse(await readFile(buildInfoPath, "utf8"));
const sourcePath = resolve(root, "contracts/BomOper.sol");
const source = await readFile(sourcePath);
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
console.log(`Exported ${requiredFunctions.length} verified ABI functions and deployment bytecode to ${outputPath}`);
