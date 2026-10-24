import { useEffect, useMemo, useState } from "react";
import { BrowserProvider, JsonRpcProvider, formatEther, parseEther } from "ethers";
import {
  MONAD_CHAIN_ID,
  MONAD_RPC_URL,
  createPlaySessionAfterConsent,
  inspectPendingTransaction,
  restorePlaySession,
  type PublicPlaySession,
} from "./temporaryWallet";
import "./wallet.css";

type InjectedWallet = { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
declare global { interface Window { ethereum?: InjectedWallet } }

const EXPLORER_URL = "https://testnet.monadvision.com";
const GAS_BASELINE = { create: 142383n, join: 75827n, start: 83139n, normalPass: 60105n, hotPass: 68881n, settle: 87740n };
const BUDGET_GAS = GAS_BASELINE.create + GAS_BASELINE.join + GAS_BASELINE.start + 4n * GAS_BASELINE.normalPass + GAS_BASELINE.hotPass + GAS_BASELINE.settle;

function mon(value: bigint | null) {
  if (value === null) return "Belum diperiksa";
  return `${Number(formatEther(value)).toFixed(6)} MON`;
}

function shortAddress(value: string) { return `${value.slice(0, 7)}…${value.slice(-5)}`; }

export default function PlayWalletSetup() {
  const rpc = useMemo(() => new JsonRpcProvider(MONAD_RPC_URL), []);
  const [session, setSession] = useState<PublicPlaySession | null>(null);
  const [consented, setConsented] = useState(false);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [budget, setBudget] = useState<bigint | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("Wallet tidak dibuat sampai kamu menekan tombol persetujuan.");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [pendingCheck, setPendingCheck] = useState("");
  const [deadlineNow, setDeadlineNow] = useState(Date.now());

  useEffect(() => {
    setSession(restorePlaySession());
    const timer = window.setInterval(() => setDeadlineNow(Date.now()), 1000);
    return () => { window.clearInterval(timer); void rpc.destroy(); };
  }, [rpc]);

  const expired = session !== null && deadlineNow >= session.expiresAt;
  const activeSession = expired ? null : session;

  useEffect(() => {
    if (expired) restorePlaySession();
  }, [expired]);

  useEffect(() => {
    if (!activeSession) { setBalance(null); return; }
    let cancelled = false;
    const loadBalance = async () => {
      try {
        const network = await rpc.getNetwork();
        if (network.chainId !== MONAD_CHAIN_ID) throw new Error("RPC bukan Monad Testnet (10143).");
        const value = await rpc.getBalance(activeSession.address);
        if (!cancelled) setBalance(value);
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Saldo RPC gagal dibaca.");
      }
    };
    void loadBalance();
    return () => { cancelled = true; };
  }, [activeSession?.address, rpc]);

  async function refreshBudget() {
    setBusy(true); setError("");
    try {
      const [network, fee] = await Promise.all([rpc.getNetwork(), rpc.getFeeData()]);
      if (network.chainId !== MONAD_CHAIN_ID) throw new Error("RPC bukan Monad Testnet (10143).");
      const perGas = fee.maxFeePerGas ?? fee.gasPrice;
      if (perGas === null) throw new Error("RPC tidak memberi fee saat ini.");
      setBudget(BUDGET_GAS * perGas);
      setStatus("Anggaran indikatif dihitung dari gas receipt simulasi dan fee RPC saat ini.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Fee RPC tidak dapat dibaca.");
    } finally { setBusy(false); }
  }

  function createWallet() {
    setError("");
    try {
      const created = createPlaySessionAfterConsent(consented);
      setSession(created);
      setStatus("Wallet testnet dibuat untuk tab ini. Catat alamat publiknya untuk pendanaan manual.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Wallet tidak dapat dibuat."); }
  }

  async function connectFundingWallet() {
    setError("");
    if (!window.ethereum) { setError("Wallet browser belum ditemukan di perangkat ini."); return; }
    setBusy(true);
    try {
      const provider = new BrowserProvider(window.ethereum as never, "any");
      await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();
      if (network.chainId !== MONAD_CHAIN_ID) throw new Error("Wallet sumber harus berada di Monad Testnet (Chain ID 10143).");
      const signer = await provider.getSigner();
      setWalletAddress(await signer.getAddress());
      setStatus("Wallet sumber terhubung. Belum ada transfer yang dibuat.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Koneksi wallet sumber gagal/ditolak."); }
    finally { setBusy(false); }
  }

  async function fundPlayWallet() {
    if (!activeSession || !window.ethereum || !walletAddress) return;
    setError(""); setBusy(true);
    try {
      const value = parseEther(amount);
      if (value <= 0n) throw new Error("Masukkan jumlah MON lebih besar dari nol.");
      const provider = new BrowserProvider(window.ethereum as never, "any");
      const network = await provider.getNetwork();
      if (network.chainId !== MONAD_CHAIN_ID) throw new Error("Wallet sumber berubah jaringan. Transfer diblokir.");
      const signer = await provider.getSigner(walletAddress);
      const currentSource = await signer.getAddress();
      setStatus(`Periksa wallet: ${shortAddress(currentSource)} akan mengirim ${mon(value)} ke ${shortAddress(activeSession.address)}.`);
      const tx = await signer.sendTransaction({ to: activeSession.address, value });
      setStatus(`Transfer menunggu receipt: ${tx.hash}`);
      const receipt = await tx.wait();
      if (!receipt || receipt.status !== 1) throw new Error(`Transfer tidak sukses. Hash: ${tx.hash}`);
      const refreshed = await rpc.getBalance(activeSession.address);
      setBalance(refreshed);
      setAmount("");
      setStatus(`Transfer sukses pada blok ${receipt.blockNumber}. Saldo bermain dibaca ulang dari RPC.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Transfer gagal atau dibatalkan."); }
    finally { setBusy(false); }
  }

  async function copyAddress() {
    if (!activeSession) return;
    await navigator.clipboard.writeText(activeSession.address);
    setStatus("Alamat wallet bermain disalin. Kirim MON Testnet dari wallet lain secara manual.");
  }

  async function checkPendingTransaction() {
    setBusy(true); setError("");
    try {
      const result = await inspectPendingTransaction(rpc);
      if (!result.pending) { setPendingCheck("Tidak ada hash transaksi pending yang tersimpan."); return; }
      if (!result.receipt) {
        setPendingCheck(`Receipt belum ditemukan untuk ${result.pending.hash}. Status belum jelas; jangan mengirim ulang.`);
      } else {
        setPendingCheck(`Receipt blok ${result.receipt.blockNumber}, status ${result.receipt.status === 1 ? "sukses" : "gagal"}. Baca ulang snapshot room sebelum aksi berikutnya.`);
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Pemeriksaan receipt gagal."); }
    finally { setBusy(false); }
  }

  const estimatedSingleAction = budget === null ? null : (budget * 60105n) / BUDGET_GAS;
  const fundedForEntry = balance !== null && estimatedSingleAction !== null && balance >= estimatedSingleAction;

  return (
    <main className="wallet-shell">
      <header className="wallet-topbar">
        <a className="brand" href="/"><img className="brand-symbol" src="/bom-oper-mark.svg" alt="" aria-hidden="true" /><span>BOM OPER</span></a>
        <span className="network-pill"><span className="network-dot" aria-hidden="true" />MONAD TESTNET · 10143</span>
      </header>

      <section className="wallet-intro">
        <p className="eyebrow">WALLET PEMAIN · TESTNET SAJA</p>
        <h1>Siapkan akun<br /><span className="headline-pop">bermainmu.</span></h1>
        <p className="intro">Akun sementara ini menandatangani aksi permainan langsung dan membayar gas MON testnet. Bukan wallet utama, bukan gasless, dan bukan izin smart contract yang dibatasi.</p>
      </section>

      <section className="wallet-card" aria-labelledby="session-title">
        <p className="eyebrow">SESI TAB INI · MAKSIMAL 10 MENIT</p>
        <h2 id="session-title">{activeSession ? "Wallet bermain aktif" : "Buat wallet sementara"}</h2>
        {!activeSession ? (
          <>
            <label className="wallet-consent"><input type="checkbox" checked={consented} onChange={(event) => setConsented(event.target.checked)} />
              <span>Saya paham private key akun sementara disimpan di sessionStorage tab ini sampai sesi berakhir. Saya hanya akan memakai wallet ini untuk MON testnet, dan sesi yang habis tidak diganti otomatis.</span>
            </label>
            <button className="setup-button" type="button" onClick={createWallet} disabled={!consented}>Buat wallet bermain 10 menit</button>
          </>
        ) : (
          <>
            <dl className="setup-facts compact">
              <div><dt>Alamat publik</dt><dd><code>{activeSession.address}</code></dd></div>
              <div><dt>Saldo MON</dt><dd>{mon(balance)}</dd></div>
              <div><dt>Sisa sesi</dt><dd>{Math.max(0, Math.ceil((activeSession.expiresAt - deadlineNow) / 1000))} detik</dd></div>
              <div><dt>Kesiapan masuk</dt><dd>{fundedForEntry ? "Saldo melewati estimasi satu oper biasa" : "Isi saldo dan periksa ulang sebelum join"}</dd></div>
            </dl>
            <button className="setup-button secondary" type="button" onClick={copyAddress}>Salin alamat untuk didanai manual</button>
            {activeSession.pending && <div className="wallet-warning"><p>Transaksi pending perlu diperiksa: <a href={`${EXPLORER_URL}/tx/${activeSession.pending.hash}`} target="_blank" rel="noreferrer">{activeSession.pending.hash}</a>. Jangan kirim ulang otomatis.</p><button className="setup-button secondary" type="button" onClick={checkPendingTransaction} disabled={busy}>Periksa receipt tersimpan</button>{pendingCheck && <p>{pendingCheck}</p>}</div>}
          </>
        )}
      </section>

      <section className="wallet-card" aria-labelledby="fund-title">
        <p className="eyebrow">PENDANAAN</p><h2 id="fund-title">Isi MON testnet</h2>
        <p className="wallet-copy">Sambungkan ekstensi hanya saat kamu menekan tombol. Aplikasi memeriksa chain 10143, menampilkan penerima dan jumlah, lalu transfer baru dibuat setelah kamu menekan tombol persetujuan transfer dan menyetujui pop-up wallet.</p>
        {!walletAddress ? <button className="setup-button" type="button" onClick={connectFundingWallet} disabled={busy}>Hubungkan wallet sumber</button> : (
          <>
            <p className="wallet-source"><strong>Pengirim:</strong> <code>{walletAddress}</code><br /><strong>Penerima:</strong> <code>{activeSession?.address ?? "Buat wallet bermain terlebih dahulu"}</code></p>
            <label className="wallet-amount">Jumlah MON <input inputMode="decimal" type="number" min="0" step="0.001" value={amount} onChange={(event) => setAmount(event.target.value)} disabled={!activeSession || busy} /></label>
            <button className="setup-button" type="button" onClick={fundPlayWallet} disabled={!activeSession || !amount || busy}>Minta persetujuan transfer</button>
            <p className="wallet-copy">Alternatif: salin alamat bermain di atas dan kirim dari wallet sumber secara manual.</p>
          </>
        )}
      </section>

      <section className="wallet-card budget-card" aria-labelledby="budget-title">
        <p className="eyebrow">DASAR PERKIRAAN GAS</p><h2 id="budget-title">Kamu yang tentukan batas isi.</h2>
        <p className="wallet-copy">Model contoh: satu create, satu join, satu start, empat oper biasa, satu oper panas, dan satu settle; gas action memakai receipt Hardhat lokal. Biaya memakai fee RPC saat diperiksa. Simulasi lokal bukan biaya aktual testnet dan jumlah ini tidak menjamin cukup. Tidak termasuk deployment, transaksi gagal, dan fluktuasi fee.</p>
        <p className="wallet-budget">{mon(budget)}</p>
        <button className="setup-button secondary" type="button" onClick={refreshBudget} disabled={busy}>{busy ? "Memeriksa RPC…" : "Periksa fee RPC & hitung contoh"}</button>
        {budget !== null && <p className="wallet-copy">Gas baseline {BUDGET_GAS.toLocaleString()} × fee RPC; pembanding satu oper biasa kira-kira {mon(estimatedSingleAction)}.</p>}
      </section>

      {error && <p className="setup-error" role="alert">{error}</p>}
      <p className="wallet-status" role="status">{expired ? "Sesi habis. Mode penonton aktif; jangan buat identitas baru untuk room aktif." : status}</p>
      <footer className="setup-footer"><span>RPC publik: {MONAD_RPC_URL}</span><a href={`${EXPLORER_URL}/`} target="_blank" rel="noreferrer">MonadVision Testnet Explorer ↗</a><a href="/">Kembali ke BOM OPER</a></footer>
    </main>
  );
}
