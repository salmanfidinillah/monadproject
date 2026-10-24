import { useRef, useState } from "react";
import {
  BrowserProvider,
  ContractFactory,
  JsonRpcProvider,
  formatEther,
} from "ethers";
import artifact from "./contract/BomOper.artifact.json";
import { verifyDeployment, type DeploymentProof } from "./deploymentVerification";
import { clearFailedDeployment, clearRejectedDeployment, readDeploymentJournal, writeDeploymentJournal, type DeploymentJournal } from "./deploymentJournal";
import { checkDeploymentRetry, deploymentErrorMessage, WALLET_ALTERNATIVE_RPC } from "./deploymentRecovery";
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
  const rpc = getPublicProvider();
  try {
    const [walletNetwork, signer, rpcNetwork] = await Promise.all([
      walletProvider.getNetwork(), walletProvider.getSigner(address), rpc.getNetwork(),
    ]);
    if (walletNetwork.chainId !== TARGET_CHAIN_ID) throw new Error("Wallet belum berada di Monad Testnet (Chain ID 10143).");
    if (rpcNetwork.chainId !== TARGET_CHAIN_ID) throw new Error(`RPC mengembalikan chain ID ${rpcNetwork.chainId}, bukan 10143.`);
    const factory = new ContractFactory(artifact.abi, artifact.bytecode, signer);
    const unsignedDeployment = await factory.getDeployTransaction();
    const [balance, feeData, gasLimit] = await Promise.all([
      rpc.getBalance(address), rpc.getFeeData(), rpc.estimateGas({ ...unsignedDeployment, from: address }),
    ]);
    const feePerGas = feeData.maxFeePerGas ?? feeData.gasPrice;
    if (feePerGas === null) throw new Error("RPC belum memberikan data fee untuk estimasi.");
    const maximumFee = gasLimit * feePerGas;
    if (balance < maximumFee) throw new Error(`Saldo kurang. Estimasi batas atas fee saat ini ${formatMon(maximumFee)}.`);
    return { chainId: walletNetwork.chainId, address, balance, gasLimit, feePerGas, maximumFee };
  } finally { rpc.destroy(); walletProvider.destroy(); }
}

function serializeProof(proof: DeploymentProof) {
  return `${JSON.stringify(proof, null, 2)}\n`;
}

export default function DeploySetup() {
  const [account, setAccount] = useState("");
  const [preflight, setPreflight] = useState<Preflight | null>(null);
  const [checking, setChecking] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [message, setMessage] = useState("Hubungkan wallet secara manual untuk mulai pemeriksaan.");
  const [error, setError] = useState("");
  const [proof, setProof] = useState<DeploymentProof | null>(null);
  const [journal, setJournal] = useState<DeploymentJournal | null>(() => {
    try { return readDeploymentJournal(localStorage); } catch { return null; }
  });
  const [hashInput, setHashInput] = useState("");
  const [walletFailureConfirmed, setWalletFailureConfirmed] = useState(false);
  const operationInFlight = useRef(false);

  function saveJournal(value: DeploymentJournal) {
    writeDeploymentJournal(localStorage, value);
    setJournal(value);
  }

  async function checkDeploymentHash(hash: string) {
    const rpc = getPublicProvider();
    try {
      const stored = readDeploymentJournal(localStorage);
      if (stored) {
        const transaction = await rpc.getTransaction(hash);
        if (transaction && transaction.from.toLowerCase() !== stored.account.toLowerCase()) throw new Error("Pengirim hash tidak cocok dengan wallet pada catatan deployment.");
      }
      const result = await verifyDeployment(rpc, hash, artifact);
      if (result.state === "pending") {
        setMessage(`Receipt belum tersedia untuk ${hash}. Jangan deploy ulang. Periksa transaksi pada wallet/explorer.`);
        return;
      }
      if (result.state === "failed") {
        if (stored) saveJournal({ ...stored, hash, state: "failed" });
        setMessage(`Receipt gagal pada blok ${result.blockNumber}. Tidak ada kontrak yang diklaim terbit.`);
        return;
      }
      saveJournal({ account: result.proof.deployer, startedAt: Date.now(), hash: result.proof.transactionHash, state: "verified" });
      setProof(result.proof);
      setMessage("Deployment sukses. Receipt, init/runtime bytecode, blok kanonis, dan view kontrak cocok dengan artifact lokal.");
      setPreflight(null);
    } finally { rpc.destroy(); }
  }

  async function recoverDeployment() {
    if (operationInFlight.current) return;
    operationInFlight.current = true;
    setChecking(true); setError(""); setProof(null);
    try {
      const stored = readDeploymentJournal(localStorage);
      const hash = hashInput.trim() || stored?.hash;
      if (!hash) throw new Error("Ambil hash deployment dari aktivitas wallet, lalu tempel di kolom ini. Jangan kirim transaksi baru.");
      if (stored?.hash && stored.hash.toLowerCase() !== hash.toLowerCase()) throw new Error("Hash berbeda dari transaksi tersimpan. Periksa hash tersimpan terlebih dahulu.");
      await checkDeploymentHash(hash);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Pemeriksaan receipt gagal."); }
    finally { operationInFlight.current = false; setChecking(false); }
  }

  async function prepareManualRetry() {
    if (operationInFlight.current) return;
    operationInFlight.current = true; setChecking(true); setError("");
    try {
      const stored = readDeploymentJournal(localStorage);
      if (!stored) throw new Error("Tidak ada percobaan deploy tersimpan untuk diperiksa.");
      const checked = await checkDeploymentRetry(stored, walletFailureConfirmed);
      saveJournal(checked);
      setAccount(checked.account); setPreflight(null);
      setMessage(`Dua RPC cocok: nonce ${checked.nonce} belum digunakan dan kontrak belum terlihat. Jalankan Periksa saldo & biaya; pengiriman berikutnya tetap memakai nonce yang sama, bukan transaksi otomatis.`);
    } catch (cause) { setError(deploymentErrorMessage(cause)); }
    finally { operationInFlight.current = false; setChecking(false); }
  }

  async function connectWallet() {
    setError("");
    setProof(null);
    const wallet = window.ethereum;
    if (!wallet) {
      setError("Wallet EVM belum terdeteksi. Buka halaman ini pada browser dengan ekstensi wallet.");
      return;
    }
    let provider: BrowserProvider | undefined;
    try {
      const accounts = await wallet.request({ method: "eth_requestAccounts" }) as string[];
      const selected = accounts[0];
      if (!selected) throw new Error("Wallet tidak memberikan akun.");
      setAccount(selected);
      provider = new BrowserProvider(wallet as never, "any");
      const chain = await provider.getNetwork();
      setPreflight(null);
      if (chain.chainId === TARGET_CHAIN_ID) {
        setMessage("Wallet terhubung. Jalankan pemeriksaan pra-deploy untuk menghitung saldo dan fee.");
      } else {
        setMessage(`Wallet berada di chain ${chain.chainId}. Pindah ke Monad Testnet sebelum deploy.`);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Koneksi wallet gagal atau ditolak.");
    } finally { provider?.destroy(); }
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
      setError(deploymentErrorMessage(cause));
    } finally {
      setChecking(false);
    }
  }

  async function deployContract() {
    const wallet = window.ethereum;
    if (!wallet || !account || !preflight || operationInFlight.current) return;
    operationInFlight.current = true;
    setDeploying(true);
    setError("");
    setProof(null);
    let walletProvider: BrowserProvider | undefined;
    let publicProvider: JsonRpcProvider | undefined;
    let retryRecord: DeploymentJournal | null = null;
    try {
      const stored = readDeploymentJournal(localStorage);
      if (stored && stored.state !== "retry-ready") throw new Error("Ada deployment tersimpan. Periksa receipt lebih dulu; deploy ulang diblokir.");
      if (stored && stored.account.toLowerCase() !== account.toLowerCase()) throw new Error("Akun berubah; percobaan ulang tidak boleh mengganti pengirim.");
      const retry = stored ? await checkDeploymentRetry(stored, walletFailureConfirmed) : null;
      retryRecord = retry;
      const fresh = await checkPreflight(wallet, account);
      walletProvider = new BrowserProvider(wallet as never, "any");
      const signer = await walletProvider.getSigner(account);
      const factory = new ContractFactory(artifact.abi, artifact.bytecode, signer);
      publicProvider = getPublicProvider();
      const [latestNonce, pendingNonce] = await Promise.all([
        publicProvider.getTransactionCount(account, "latest"), publicProvider.getTransactionCount(account, "pending"),
      ]);
      const nonce = retry?.nonce ?? latestNonce;
      if (latestNonce !== nonce || pendingNonce !== nonce) throw new Error("Nonce berubah atau masih ada transaksi pending. Periksa Aktivitas MetaMask sebelum deploy.");
      // Persist intent before asking the wallet. Refresh or an ambiguous transport error must not re-deploy.
      saveJournal({ account, startedAt: stored?.startedAt ?? Date.now(), nonce, state: "awaiting-wallet" });
      setMessage("Wallet akan menampilkan transaksi deploy. Periksa detailnya dan setujui sendiri di wallet.");
      const contract = await factory.deploy({ gasLimit: fresh.gasLimit, nonce, chainId: TARGET_CHAIN_ID });
      const transaction = contract.deploymentTransaction();
      if (!transaction) throw new Error("Hash transaksi deployment tidak tersedia.");
      saveJournal({ account, startedAt: Date.now(), nonce, hash: transaction.hash, state: "broadcast" });
      setMessage(`Menunggu receipt deploy: ${transaction.hash}`);
      // A timeout never triggers another send. The saved hash remains recoverable.
      try { await transaction.wait(1, 60_000); } catch { /* verify status independently through the public RPC */ }
      await checkDeploymentHash(transaction.hash);
    } catch (cause) {
      const code = (cause as { code?: string | number }).code;
      if (code === "ACTION_REJECTED" || code === 4001) {
        // Rejecting the new confirmation must not discard the unresolved original attempt's nonce.
        if (retryRecord) saveJournal(retryRecord);
        else clearRejectedDeployment(localStorage);
        setJournal(readDeploymentJournal(localStorage));
      }
      setMessage("Deployment belum terverifikasi.");
      setError(deploymentErrorMessage(cause));
      setPreflight(null);
    } finally {
      walletProvider?.destroy();
      publicProvider?.destroy();
      operationInFlight.current = false;
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
          {!account && !journal ? (
            <button className="setup-button" type="button" onClick={connectWallet}>Hubungkan wallet</button>
          ) : account ? (
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
          ) : null}
        </div>

        {preflight && (!journal || journal.state === "retry-ready") && (
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

      <section className="setup-card" aria-labelledby="recover-title">
        <p className="eyebrow">PEMULIHAN · HANYA MEMBACA RPC</p>
        <h2 id="recover-title">Periksa deployment yang sudah dikirim</h2>
        <p>Refresh atau koneksi putus? Jangan deploy ulang. Hash dari aktivitas wallet dapat diperiksa tanpa menghubungkan wallet.</p>
        {journal && <p role="status">Catatan tersimpan: {journal.state === "awaiting-wallet" ? "menunggu wallet / status belum jelas" : journal.state}. {journal.hash && <a href={explorerTransaction(journal.hash)} target="_blank" rel="noreferrer">Lihat transaksi tersimpan ↗</a>}</p>}
        <label className="wallet-amount" htmlFor="deploy-hash">Hash transaksi deploy
          <input id="deploy-hash" type="text" value={hashInput} placeholder={journal?.hash ?? "0x…"} onChange={(event) => setHashInput(event.target.value)} autoComplete="off" spellCheck={false} disabled={checking || deploying} />
        </label>
        <button className="setup-button secondary" type="button" onClick={recoverDeployment} disabled={checking || deploying}>{checking ? "Memeriksa…" : "Periksa receipt tanpa kirim ulang"}</button>
        {journal?.state === "failed" && <button className="setup-button secondary" type="button" disabled={checking || deploying} onClick={() => {
          try { clearFailedDeployment(localStorage); setJournal(null); setHashInput(""); setMessage("Receipt gagal sudah ditutup. Hubungkan wallet untuk pemeriksaan baru."); }
          catch (cause) { setError(cause instanceof Error ? cause.message : "Catatan belum bisa ditutup."); }
        }}>Tutup transaksi gagal</button>}

        {journal && !journal.hash && ["awaiting-wallet", "retry-ready"].includes(journal.state) && (
          <div className="preflight-panel">
            <h3>Wallet gagal sebelum hash diterima?</h3>
            <p>Periksa tab Aktivitas MetaMask. Jika ada transaksi pending atau hash, gunakan pemeriksaan receipt di atas. Status RPC yang kosong saja belum membuktikan antrean wallet kosong.</p>
            <label className="retry-confirm"><input type="checkbox" checked={walletFailureConfirmed} onChange={(event) => setWalletFailureConfirmed(event.target.checked)} />
              <span>Saya sudah memeriksa Aktivitas MetaMask: percobaan ditandai Gagal dan tidak ada transaksi deploy tertunda.</span>
            </label>
            <button className="setup-button secondary" type="button" onClick={prepareManualRetry} disabled={checking || deploying || !walletFailureConfirmed}>Periksa akun & siapkan coba ulang</button>
            <p>Pemeriksaan ini hanya membaca dua RPC, tidak mengirim transaksi. Percobaan berikut tetap meminta konfirmasi wallet dengan nonce yang sama.</p>
          </div>
        )}

        <details className="rpc-help"><summary>Panduan jika RPC wallet dibatasi</summary>
          <p>Permintaan transaksi dikirim melalui RPC yang dipilih di MetaMask. Mengganti RPC pembacaan aplikasi tidak mengganti RPC pengiriman wallet.</p>
          <ol><li>Buka menu MetaMask → Networks/Jaringan.</li><li>Pilih tiga titik pada Monad Testnet → edit jaringan.</li><li>Pada Default RPC URL, pilih Add RPC URL. Masukkan <code>{WALLET_ALTERNATIVE_RPC}</code> dan simpan/pilih sebagai RPC default. Tetap chain ID 10143.</li><li>Kembali ke sini, periksa akun lebih dahulu sebelum mengirim percobaan manual.</li></ol>
          <p><a href="https://support.metamask.io/configure/networks/how-to-add-a-custom-network-rpc" target="_blank" rel="noreferrer">Panduan resmi MetaMask ↗</a> · <a href="https://docs.monad.xyz/developer-essentials/testnet" target="_blank" rel="noreferrer">Daftar RPC resmi Monad ↗</a></p>
        </details>
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
