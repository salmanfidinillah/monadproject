import { useState } from "react";
import {
  BrowserProvider,
  Contract,
  ContractFactory,
  JsonRpcProvider,
  formatEther,
} from "ethers";
import artifact from "./contract/BomOper.artifact.json";
import "./setup.css";

const TARGET_CHAIN_ID = 10143n;
const TARGET_CHAIN_HEX = "0x279f";
const RPC_URL = "https://testnet-rpc.monad.xyz";
const EXPLORER_URL = "https://testnet.monadvision.com";

type InjectedWallet = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: InjectedWallet;
  }
}

type Preflight = {
  chainId: bigint;
  address: string;
  balance: bigint;
  gasLimit: bigint;
  feePerGas: bigint;
  maximumFee: bigint;
};

type DeploymentProof = {
  chainId: number;
  address: string;
  transactionHash: string;
  blockNumber: number;
  gasUsed: string;
  runtimeCodeBytes: number;
  sourceRevision: string;
  sourceSha256: string;
  compiler: typeof artifact.compiler;
  verified: false;
  nextRoomId: string;
};

function getPublicProvider() {
  return new JsonRpcProvider(RPC_URL);
}

function formatMon(value: bigint) {
  const amount = formatEther(value).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  return `${amount} MON`;
}

function explorerAddress(address: string) {
  return `${EXPLORER_URL}/address/${address}`;
}

function explorerTransaction(hash: string) {
  return `${EXPLORER_URL}/tx/${hash}`;
}

async function checkPreflight(wallet: InjectedWallet, address: string): Promise<Preflight> {
  const walletProvider = new BrowserProvider(wallet as never, "any");
  const [walletNetwork, signer] = await Promise.all([
    walletProvider.getNetwork(),
    walletProvider.getSigner(address),
  ]);
  if (walletNetwork.chainId !== TARGET_CHAIN_ID) {
    throw new Error("Wallet belum berada di Monad Testnet (Chain ID 10143).");
  }

  const rpc = getPublicProvider();
  const rpcNetwork = await rpc.getNetwork();
  if (rpcNetwork.chainId !== TARGET_CHAIN_ID) {
    throw new Error(`RPC mengembalikan chain ID ${rpcNetwork.chainId}, bukan 10143.`);
  }

  const factory = new ContractFactory(artifact.abi, artifact.bytecode, signer);
  const unsignedDeployment = await factory.getDeployTransaction();
  const [balance, feeData, gasLimit] = await Promise.all([
    rpc.getBalance(address),
    rpc.getFeeData(),
    rpc.estimateGas({ ...unsignedDeployment, from: address }),
  ]);
  const feePerGas = feeData.maxFeePerGas ?? feeData.gasPrice;
  if (feePerGas === null) throw new Error("RPC belum memberikan data fee untuk estimasi.");
  const maximumFee = gasLimit * feePerGas;
  if (balance < maximumFee) {
    throw new Error(`Saldo kurang. Estimasi batas atas fee saat ini ${formatMon(maximumFee)}.`);
  }
  return { chainId: walletNetwork.chainId, address, balance, gasLimit, feePerGas, maximumFee };
}

function serializeProof(proof: DeploymentProof) {
  return `${JSON.stringify({
    network: "Monad Testnet",
    ...proof,
  }, null, 2)}\n`;
}

export default function DeploySetup() {
  const [account, setAccount] = useState("");
  const [preflight, setPreflight] = useState<Preflight | null>(null);
  const [checking, setChecking] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [message, setMessage] = useState("Hubungkan wallet secara manual untuk mulai pemeriksaan.");
  const [error, setError] = useState("");
  const [proof, setProof] = useState<DeploymentProof | null>(null);

  async function connectWallet() {
    setError("");
    setProof(null);
    const wallet = window.ethereum;
    if (!wallet) {
      setError("Wallet EVM belum terdeteksi. Buka halaman ini pada browser dengan ekstensi wallet.");
      return;
    }
    try {
      const accounts = await wallet.request({ method: "eth_requestAccounts" }) as string[];
      const selected = accounts[0];
      if (!selected) throw new Error("Wallet tidak memberikan akun.");
      setAccount(selected);
      const provider = new BrowserProvider(wallet as never, "any");
      const chain = await provider.getNetwork();
      setPreflight(null);
      if (chain.chainId === TARGET_CHAIN_ID) {
        setMessage("Wallet terhubung. Jalankan pemeriksaan pra-deploy untuk menghitung saldo dan fee.");
      } else {
        setMessage(`Wallet berada di chain ${chain.chainId}. Pindah ke Monad Testnet sebelum deploy.`);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Koneksi wallet gagal atau ditolak.");
    }
  }

  async function switchToMonad() {
    const wallet = window.ethereum;
    if (!wallet) return setError("Wallet EVM tidak terdeteksi.");
    setError("");
    try {
      await wallet.request({ method: "wallet_switchEthereumChain", params: [{ chainId: TARGET_CHAIN_HEX }] });
    } catch (cause) {
      const code = (cause as { code?: number }).code;
      if (code !== 4902) {
        setError(cause instanceof Error ? cause.message : "Pergantian jaringan ditolak.");
        return;
      }
      try {
        await wallet.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: TARGET_CHAIN_HEX,
            chainName: "Monad Testnet",
            nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
            rpcUrls: [RPC_URL],
            blockExplorerUrls: [EXPLORER_URL],
          }],
        });
      } catch (addError) {
        setError(addError instanceof Error ? addError.message : "Penambahan Monad Testnet ditolak.");
        return;
      }
    }
    setPreflight(null);
    setMessage("Permintaan jaringan selesai. Jalankan ulang pemeriksaan pra-deploy.");
  }

  async function runChecks() {
    if (!account || !window.ethereum) return;
    setChecking(true);
    setPreflight(null);
    setError("");
    setProof(null);
    setMessage("Memeriksa chain, ABI/bytecode, fee deployment, dan saldo...");
    try {
      const result = await checkPreflight(window.ethereum, account);
      setPreflight(result);
      setMessage("Pemeriksaan lulus. Transaksi belum dikirim; tombol deploy akan meminta persetujuan wallet.");
    } catch (cause) {
      setMessage("Pemeriksaan belum lulus.");
      setError(cause instanceof Error ? cause.message : "Pemeriksaan RPC gagal.");
    } finally {
      setChecking(false);
    }
  }

  async function deployContract() {
    const wallet = window.ethereum;
    if (!wallet || !account || !preflight) return;
    setDeploying(true);
    setError("");
    setProof(null);
    try {
      const fresh = await checkPreflight(wallet, account);
      const walletProvider = new BrowserProvider(wallet as never, "any");
      const signer = await walletProvider.getSigner(account);
      const factory = new ContractFactory(artifact.abi, artifact.bytecode, signer);
      setMessage("Wallet akan menampilkan transaksi deploy. Periksa detailnya dan setujui sendiri di wallet.");
      const contract = await factory.deploy({ gasLimit: fresh.gasLimit });
      const transaction = contract.deploymentTransaction();
      if (!transaction) throw new Error("Hash transaksi deployment tidak tersedia.");
      setMessage(`Menunggu receipt deploy: ${transaction.hash}`);
      const receipt = await transaction.wait();
      if (!receipt || receipt.status !== 1 || !receipt.contractAddress) {
        throw new Error("Transaksi tidak menghasilkan receipt deployment sukses.");
      }

      const address = await contract.getAddress();
      const rpc = getPublicProvider();
      const [code, network, deployedGame] = await Promise.all([
        rpc.getCode(address),
        rpc.getNetwork(),
        Promise.resolve(new Contract(address, artifact.abi, rpc)),
      ]);
      if (network.chainId !== TARGET_CHAIN_ID) throw new Error("Chain RPC berubah sebelum verifikasi code.");
      if (code === "0x") throw new Error("Receipt sukses tetapi runtime code belum terlihat pada RPC publik.");
      const nextRoomId = await deployedGame.getFunction("nextRoomId").staticCall() as bigint;
      const deploymentProof: DeploymentProof = {
        chainId: Number(network.chainId),
        address,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        runtimeCodeBytes: (code.length - 2) / 2,
        sourceRevision: artifact.sourceRevision,
        sourceSha256: artifact.sourceSha256,
        compiler: artifact.compiler,
        verified: false,
        nextRoomId: nextRoomId.toString(),
      };
      setProof(deploymentProof);
      setMessage("Deployment sukses. Receipt, runtime code, dan pembacaan view nextRoomId() terverifikasi.");
      setPreflight(null);
    } catch (cause) {
      setMessage("Deployment belum terverifikasi.");
      setError(cause instanceof Error ? cause.message : "Deployment dibatalkan atau gagal.");
      setPreflight(null);
    } finally {
      setDeploying(false);
    }
  }

  async function downloadRecord() {
    if (!proof) return;
    const blob = new Blob([serializeProof(proof)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "10143.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const walletChainMatches = preflight?.chainId === TARGET_CHAIN_ID;

  return (
    <main className="setup-shell">
      <header className="setup-topbar">
        <a className="brand" href="/" aria-label="Kembali ke BOM OPER">
          <img className="brand-symbol" src="/bom-oper-mark.svg" alt="" aria-hidden="true" /><span>BOM OPER</span>
        </a>
        <span className="network-pill"><span className="network-dot" aria-hidden="true" />MONAD TESTNET · 10143</span>
      </header>

      <section className="setup-hero">
        <p className="eyebrow">SETUP DEVELOPER · TESTNET SAJA</p>
        <h1>Deploy <span className="headline-pop">BomOper</span></h1>
        <p className="intro">Pemeriksaan dan deployment dilakukan di browser. Tidak ada private key yang diminta atau dikirim ke aplikasi.</p>
      </section>

      <section className="setup-card" aria-labelledby="deploy-title">
        <div className="setup-card-heading">
          <div><p className="eyebrow">KONTRAK PERMAINAN</p><h2 id="deploy-title">Pemeriksaan sebelum transaksi</h2></div>
          <span className="setup-chip">SOLC {artifact.compiler.version}</span>
        </div>
        <dl className="setup-facts">
          <div><dt>Target</dt><dd>Monad Testnet · 10143</dd></div>
          <div><dt>RPC aktual</dt><dd>{RPC_URL}</dd></div>
          <div><dt>EVM/compiler</dt><dd>{artifact.compiler.evmVersion} · solc {artifact.compiler.version}</dd></div>
          <div><dt>Optimizer</dt><dd>{artifact.compiler.optimizer.enabled ? `aktif · ${artifact.compiler.optimizer.runs} runs` : "nonaktif"}</dd></div>
          <div><dt>Artifact lokal</dt><dd>{artifact.abi.filter((item) => item.type === "function").length} fungsi ABI · {((artifact.bytecode.length - 2) / 2).toLocaleString()} byte init code</dd></div>
          <div><dt>Versi sumber</dt><dd>{artifact.sourceRevision.slice(0, 10)} · SHA-256 {artifact.sourceSha256.slice(0, 12)}…</dd></div>
        </dl>

        <div className="setup-actions">
          {!account ? (
            <button className="setup-button" type="button" onClick={connectWallet}>Hubungkan wallet</button>
          ) : (
            <>
              <p className="account-line"><strong>Wallet:</strong> <code>{account}</code></p>
              <div className="setup-button-row">
                <button className="setup-button" type="button" onClick={runChecks} disabled={checking || deploying}>
                  {checking ? "Memeriksa…" : "Periksa saldo & biaya"}
                </button>
                <button className="setup-button secondary" type="button" onClick={switchToMonad} disabled={checking || deploying}>
                  Pindah ke Monad Testnet
                </button>
              </div>
            </>
          )}
        </div>

        {preflight && (
          <div className="preflight-panel" aria-live="polite">
            <h3>Pra-deploy lulus</h3>
            <dl className="setup-facts compact">
              <div><dt>Chain wallet & RPC</dt><dd>{preflight.chainId.toString()} · cocok</dd></div>
              <div><dt>Saldo saat ini</dt><dd>{formatMon(preflight.balance)}</dd></div>
              <div><dt>Estimasi gas</dt><dd>{preflight.gasLimit.toLocaleString()} gas</dd></div>
              <div><dt>Fee per gas saat ini</dt><dd>{formatEther(preflight.feePerGas)} MON</dd></div>
              <div><dt>Batas atas fee dari estimasi</dt><dd>{formatMon(preflight.maximumFee)}</dd></div>
            </dl>
            <p className="estimate-note">Estimasi memakai RPC publik dan fee saat pemeriksaan; nilai wallet saat konfirmasi dapat berubah. Tombol berikut mengirim permintaan ke wallet untuk persetujuanmu.</p>
            <button className="setup-button deploy-button" type="button" onClick={deployContract} disabled={deploying || !walletChainMatches}>
              {deploying ? "Menunggu wallet / receipt…" : "Deploy dan minta persetujuan wallet"}
            </button>
          </div>
        )}

        <p className="setup-message" role="status">{message}</p>
        {error && <p className="setup-error" role="alert">{error}</p>}
      </section>

      {proof && (
        <section className="setup-card proof-card" aria-labelledby="proof-title">
          <p className="eyebrow">RECEIPT PUBLIK</p>
          <h2 id="proof-title">Kontrak sudah terbit</h2>
          <dl className="setup-facts compact">
            <div><dt>Alamat</dt><dd><a href={explorerAddress(proof.address)} target="_blank" rel="noreferrer">{proof.address}</a></dd></div>
            <div><dt>Transaksi</dt><dd><a href={explorerTransaction(proof.transactionHash)} target="_blank" rel="noreferrer">{proof.transactionHash}</a></dd></div>
            <div><dt>Blok</dt><dd>{proof.blockNumber.toLocaleString()}</dd></div>
            <div><dt>Gas receipt</dt><dd>{BigInt(proof.gasUsed).toLocaleString()}</dd></div>
            <div><dt>Runtime code</dt><dd>{proof.runtimeCodeBytes.toLocaleString()} byte · diverifikasi melalui RPC</dd></div>
            <div><dt>Panggilan view dari app</dt><dd>nextRoomId() = {proof.nextRoomId}</dd></div>
            <div><dt>Source explorer</dt><dd>belum diverifikasi</dd></div>
          </dl>
          <button className="setup-button secondary" type="button" onClick={downloadRecord}>Unduh catatan deployments/10143.json</button>
        </section>
      )}

      <footer className="setup-footer">
        <span>RPC: {RPC_URL}</span>
        <a href={EXPLORER_URL} target="_blank" rel="noreferrer">MonadVision Testnet Explorer ↗</a>
      </footer>
    </main>
  );
}
