import { readFile, writeFile } from "node:fs/promises";
import { JsonRpcProvider } from "ethers";
import { DEPLOY_RPC_URL, verifyDeployment } from "../app/src/deploymentVerification.ts";

const [hash, ...extra] = process.argv.slice(2);
if (!hash || extra.length || !/^0x[\da-f]{64}$/i.test(hash)) {
  console.error("Usage: npm run deployment:verify -- <deployment-transaction-hash>");
  process.exitCode = 1;
} else {
  const artifact = JSON.parse(await readFile(new URL("../app/src/contract/BomOper.artifact.json", import.meta.url), "utf8"));
  const output = new URL("../deployments/10143.json", import.meta.url);
  const rpc = new JsonRpcProvider(DEPLOY_RPC_URL);
  try {
    const result = await verifyDeployment(rpc, hash, artifact);
    if (result.state !== "verified") throw new Error(`Receipt ${result.state}; tidak ada record sukses yang ditulis.`);
    let existing;
    try { existing = JSON.parse(await readFile(output, "utf8")); } catch (error) { if (error.code !== "ENOENT") throw error; }
    if (existing && existing.transactionHash.toLowerCase() !== hash.toLowerCase()) throw new Error("Sudah ada deployment berbeda; tidak menimpa kontrak bersama.");
    await writeFile(output, `${JSON.stringify(result.proof, null, 2)}\n`);
    console.log(`Verified deployment ${result.proof.address}; saved deployments/10143.json. Source explorer belum diverifikasi.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally { rpc.destroy(); }
}
