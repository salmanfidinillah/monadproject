import { Contract, Interface, JsonRpcProvider, formatEther, getAddress, type InterfaceAbi } from "ethers";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Character, Bomb, type ArcadeColor } from "./GameArt";
import artifact from "./contract/BomOper.artifact.json";
import {
  MONAD_RPC_URL,
  assertMonadRpc,
  getConfiguredGameAddress,
  getStoredPendingTransaction,
  getStoredSessionExpiry,
  inspectPendingTransaction,
  restorePlaySession,
  sendAllowedContractTransaction,
  updateActiveRoom,
  type PublicPlaySession,
} from "./temporaryWallet";
import "./game-art.css";
import "./live-game.css";

type RoomSnapshot = {
  roomId: string;
  status: number;
  capacity: number;
  duration: number;
  creator: string;
  holder: string;
  turn: string;
  startedAt: number;
  deadline: number;
  loser: string;
  finishedAt: number;
  players: string[];
  hotUsed: boolean[];
};
type PassMotion = { id: number; from: number; to: number; hot: boolean };

const abi = artifact.abi as InterfaceAbi;
const iface = new Interface(abi);
const colors: ArcadeColor[] = ["orange", "cyan", "violet", "pink"];
const statusNames = ["MENUNGGU PEMAIN", "RONDE AKTIF", "SELESAI"];

function compact(value: string) { return `${value.slice(0, 6)}…${value.slice(-4)}`; }
function mono(value: bigint | null) { return value === null ? "Memeriksa saldo…" : `${Number(formatEther(value)).toFixed(4)} MON`; }
function readableError(cause: unknown) {
  const detail = cause instanceof Error ? cause.message : String(cause);
  const messages: Array<[string, string]> = [
    ["UnknownRoom", "Room ini belum ada di kontrak Monad Testnet."],
    ["RoomFull", "Room sudah penuh."],
    ["RoomNotFull", "Kursi belum penuh; ronde belum dapat dimulai."],
    ["AlreadyJoined", "Wallet ini sudah menjadi anggota room."],
    ["InvalidRoomStatus", "Status room sudah berubah. Data diperbarui."],
    ["NotCurrentHolder", "Hanya pemegang bom saat ini yang dapat mengoper."],
    ["ExpectedTurnMismatch", "Giliran berubah sebelum transaksi masuk. Periksa snapshot lagi."],
    ["HotAlreadyUsed", "Jatah oper panas wallet ini sudah dipakai."],
    ["HotWindowClosed", "Oper panas hanya boleh saat waktu tersisa lebih dari 6 detik."],
    ["DeadlinePassed", "Waktu ronde lewat. Periksa status finalisasi."],
    ["NotRoomMember", "Wallet ini bukan anggota room."],
  ];
  const match = messages.find(([name]) => detail.includes(name));
  if (match) return match[1];
  if (/429|rate.?limit|too many requests/i.test(detail)) return "RPC sedang membatasi permintaan. Tunggu sebentar lalu perbarui data.";
  if (/network|fetch failed|timeout|could not coalesce|missing response/i.test(detail)) return "RPC Monad belum merespons. Periksa koneksi lalu coba baca ulang.";
  return detail;
}
function playerName(snapshot: RoomSnapshot | null, address: string) {
  const index = snapshot?.players.findIndex((p) => p.toLowerCase() === address.toLowerCase()) ?? -1;
  return index < 0 ? compact(address) : index === 0 && snapshot?.creator.toLowerCase() === address.toLowerCase() ? "PEMAIN 1 · HOST" : `PEMAIN ${index + 1}`;
}
function toSnapshot(raw: Record<string, unknown>): RoomSnapshot {
  return {
    roomId: String(raw.roomId), status: Number(raw.status), capacity: Number(raw.capacity), duration: Number(raw.duration),
    creator: getAddress(String(raw.creator)), holder: getAddress(String(raw.holder)), turn: String(raw.turn),
    startedAt: Number(raw.startedAt), deadline: Number(raw.deadline), loser: getAddress(String(raw.loser)),
    finishedAt: Number(raw.finishedAt), players: Array.from(raw.players as string[], getAddress),
    hotUsed: Array.from(raw.hotUsed as boolean[]),
  };
}

export default function LiveGame() {
  const provider = useMemo(() => new JsonRpcProvider(MONAD_RPC_URL, undefined, { batchMaxCount: 1 }), []);
  const [session, setSession] = useState<PublicPlaySession | null>(() => restorePlaySession());
  const [sessionExpiry] = useState<number | null>(() => session?.expiresAt ?? getStoredSessionExpiry());
  const [sessionExpired, setSessionExpired] = useState(() => sessionExpiry !== null && Date.now() >= sessionExpiry);
  const sessionExpiryRef = useRef<number | null>(sessionExpiry);
  const [room, setRoom] = useState<RoomSnapshot | null>(null);
  const [screen, setScreen] = useState<"opening" | "lobby" | "room">(() => new URLSearchParams(location.search).has("room") ? "room" : "opening");
  const [roomId, setRoomId] = useState(() => new URLSearchParams(location.search).get("room") ?? "");
  const [joinId, setJoinId] = useState(() => new URLSearchParams(location.search).get("room") ?? "");
  const [capacity, setCapacity] = useState(4);
  const [duration, setDuration] = useState(30);
  const [selected, setSelected] = useState("");
  const [balance, setBalance] = useState<bigint | null>(null);
  const [chainTimestamp, setChainTimestamp] = useState(0);
  const [timestampReadAt, setTimestampReadAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(() => getStoredPendingTransaction());
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [lastHash, setLastHash] = useState("");
  const [passPending, setPassPending] = useState(false);
  const [passMotion, setPassMotion] = useState<PassMotion | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const previousSnapshot = useRef<RoomSnapshot | null>(null);
  const snapshotRequest = useRef(0);

  const gameAddress = getConfiguredGameAddress();
  const expired = session !== null && Date.now() >= session.expiresAt;
  const activeSession = expired ? null : session;
  const game = useMemo(() => new Contract(gameAddress, abi, provider), [gameAddress, provider]);
  const membership = room && activeSession ? room.players.some((p) => p.toLowerCase() === activeSession.address.toLowerCase()) : false;
  const holderIsYou = Boolean(room && activeSession && room.holder.toLowerCase() === activeSession.address.toLowerCase());
  const elapsed = timestampReadAt ? Math.max(0, Math.floor((now - timestampReadAt) / 1000)) : 0;
  const secondsLeft = room?.status === 1 ? Math.max(0, room.deadline - (chainTimestamp + elapsed)) : 0;
  const hotUsed = room && activeSession ? room.hotUsed[room.players.findIndex((p) => p.toLowerCase() === activeSession.address.toLowerCase())] : true;

  const refreshRoom = useCallback(async (id = roomId) => {
    const requestId = ++snapshotRequest.current;
    await assertMonadRpc(provider);
    if (!id || !/^\d+$/.test(id) || BigInt(id) === 0n) throw new Error("Masukkan ID room yang valid.");
    const block = await provider.getBlockNumber();
    const [raw, blockData] = await Promise.all([
      game.getFunction("getRoomSnapshot").staticCall(BigInt(id), { blockTag: block }) as Promise<Record<string, unknown>>,
      provider.getBlock(block),
    ]);
    if (!blockData) throw new Error("Waktu blok terbaru belum tersedia dari RPC.");
    const normalized = toSnapshot(raw);
    if (requestId !== snapshotRequest.current) return normalized;
    const previous = previousSnapshot.current;
    if (!previous || previous.roomId !== normalized.roomId) {
      setHistory([]);
    } else if (Number(normalized.turn) > Number(previous.turn)) {
      setSelected("");
      const change = Number(normalized.turn) - Number(previous.turn);
      if (change === 1) {
        const wasHot = previous.hotUsed[previous.players.findIndex((p) => p.toLowerCase() === previous.holder.toLowerCase())] !== normalized.hotUsed[normalized.players.findIndex((p) => p.toLowerCase() === previous.holder.toLowerCase())];
        setHistory((items) => [`${playerName(previous, previous.holder)} ${wasHot ? "mengoper panas" : "mengoper"} ke ${compact(normalized.holder)} · giliran ${normalized.turn}`, ...items].slice(0, 8));
      } else {
        setHistory((items) => [`Snapshot melewati ${change} giliran; riwayat lengkap tidak tersedia pada tampilan ini.`, ...items].slice(0, 8));
      }
    } else if (previous.status !== 1 && normalized.status === 1) {
      setHistory((items) => ["Ronde dimulai; pemegang pertama ditetapkan kontrak.", ...items].slice(0, 8));
    } else if (previous.status !== 2 && normalized.status === 2) {
      setHistory((items) => ["Receipt finalisasi dibaca; status room Finished.", ...items].slice(0, 8));
    } else if (normalized.players.length > previous.players.length) {
      const newlyJoined = normalized.players.find((p) => !previous.players.some((old) => old.toLowerCase() === p.toLowerCase()));
      if (newlyJoined) setHistory((items) => [`${compact(newlyJoined)} bergabung · ${normalized.players.length}/${normalized.capacity}`, ...items].slice(0, 8));
    }
    previousSnapshot.current = normalized;
    setRoom(normalized);
    setRoomId(id);
    setChainTimestamp(blockData.timestamp);
    setTimestampReadAt(Date.now());
    if (!activeSession) setBalance(null);
    if (normalized.status === 2 && activeSession?.activeRoomId === id) updateActiveRoom(undefined);
    setError("");
    return normalized;
  }, [activeSession?.address, game, provider, roomId]);

  useEffect(() => {
    const clock = window.setInterval(() => setNow(Date.now()), 250);
    const sessionClock = window.setInterval(() => {
      const restored = restorePlaySession();
      if (restored) sessionExpiryRef.current = restored.expiresAt;
      else if (sessionExpiryRef.current !== null && Date.now() >= sessionExpiryRef.current) setSessionExpired(true);
      setSession(restored);
    }, 1000);
    return () => { window.clearInterval(clock); window.clearInterval(sessionClock); };
  }, [provider]);

  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;
    let running = false;
    const poll = async () => {
      if (running || cancelled) return;
      running = true;
      try { await refreshRoom(roomId); }
      catch (cause) { if (!cancelled) setError(readableError(cause)); }
      finally { running = false; }
    };
    void poll();
    const timer = window.setInterval(() => void poll(), 2000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [roomId, refreshRoom]);

  useEffect(() => {
    if (!activeSession) { setBalance(null); return; }
    void provider.getBalance(activeSession.address).then(setBalance).catch(() => setBalance(null));
  }, [activeSession?.address, provider]);

  function enterRoom(id: string) {
    setRoomId(id);
    setJoinId(id);
    setScreen("room");
    window.history.replaceState(null, "", `/play?room=${encodeURIComponent(id)}`);
    setError("");
  }

  async function submitTransaction(method: string, args: unknown[], purpose: string, afterReceipt?: (receipt: import("ethers").TransactionReceipt) => Promise<void>) {
    if (!activeSession) throw new Error("Sesi wallet bermain tidak aktif. Mode penonton; jangan buat identitas baru untuk room aktif.");
    if (purpose === "createRoom" && activeSession.activeRoomId) throw new Error(`Wallet ini tercatat di room ${activeSession.activeRoomId}; selesaikan atau buka room itu sebelum membuat room lain.`);
    if (pending) throw new Error(`Transaksi sebelumnya perlu diperiksa: ${pending.hash}`);
    setBusy(true); setError(""); setMessage("Menyiapkan dan memperkirakan transaksi…");
    try {
      const receipt = await sendAllowedContractTransaction(
        provider,
        async (signer) => new Contract(gameAddress, abi, signer).getFunction(method).populateTransaction(...args),
        purpose,
        (hash) => { const p = getStoredPendingTransaction(); setPending(p); setLastHash(hash); if (purpose.startsWith("passBomb")) setPassPending(true); setMessage(`Transaksi dikirim. Menunggu receipt ${compact(hash)}…`); },
        async (receipt) => {
          if (afterReceipt) await afterReceipt(receipt);
          else if (roomId) await refreshRoom(roomId);
        },
        setMessage,
      );
      setLastHash(receipt.hash);
      setPending(getStoredPendingTransaction());
      setBalance(await provider.getBalance(activeSession.address));
      setMessage(`Receipt sukses di blok ${receipt.blockNumber}; snapshot dibaca ulang.`);
      return receipt;
    } catch (cause) {
      setPending(getStoredPendingTransaction());
      throw cause;
    } finally { setBusy(false); }
  }

  async function createRoom() {
    try {
      let id = "";
      const receipt = await submitTransaction("createRoom", [capacity, duration], "createRoom", async (txReceipt) => {
        const created = txReceipt.logs.map((log) => { try { return iface.parseLog(log); } catch { return null; } }).find((log) => log?.name === "RoomCreated");
        id = created?.args.roomId?.toString() ?? "";
        if (!id) throw new Error(`Room dibuat tetapi event RoomCreated belum terbaca. Simpan hash ${txReceipt.hash} dan jangan kirim ulang.`);
        await refreshRoom(id);
      });
      if (!id) throw new Error(`Room dibuat pada ${receipt.hash}, tetapi ID belum terbaca; jangan kirim ulang.`);
      updateActiveRoom(id);
      setSession(restorePlaySession());
      enterRoom(id);
      await refreshRoom(id);
    } catch (cause) { setError(readableError(cause)); }
  }

  async function joinRoom() {
    try {
      const id = joinId.trim();
      const before = await refreshRoom(id);
      if (before.status !== 0) throw new Error("Room ini tidak lagi menunggu pemain; kamu bisa membukanya sebagai penonton.");
      if (activeSession?.activeRoomId && activeSession.activeRoomId !== id) throw new Error(`Wallet ini masih terikat ke room ${activeSession.activeRoomId}. Jangan ganti identitas sebelum room itu selesai.`);
      if (activeSession && before.players.some((player) => player.toLowerCase() === activeSession.address.toLowerCase())) {
        updateActiveRoom(id);
        setSession(restorePlaySession());
        enterRoom(id);
        return;
      }
      const receipt = await submitTransaction("joinRoom", [BigInt(id)], "joinRoom", async () => { await refreshRoom(id); });
      updateActiveRoom(id);
      setSession(restorePlaySession());
      enterRoom(id);
      await refreshRoom(id);
      setMessage(`Gabung dikonfirmasi pada blok ${receipt.blockNumber}.`);
    } catch (cause) { setError(readableError(cause)); }
  }

  async function viewRoom() {
    const id = joinId.trim();
    try { enterRoom(id); await refreshRoom(id); }
    catch (cause) { setError(readableError(cause)); }
  }

  async function startRound() {
    if (!room) return;
    try { await submitTransaction("startRoom", [BigInt(room.roomId)], "startRoom", async () => { await refreshRoom(room.roomId); }); }
    catch (cause) { setError(readableError(cause)); }
  }

  async function passBomb(hot: boolean) {
    if (!room || !selected) return;
    const from = room.players.findIndex((player) => player.toLowerCase() === room.holder.toLowerCase());
    const to = room.players.findIndex((player) => player.toLowerCase() === selected.toLowerCase());
    try {
      await submitTransaction("passBomb", [BigInt(room.roomId), selected, hot, BigInt(room.turn)], hot ? "passBomb:hot" : "passBomb", async () => { await refreshRoom(room.roomId); });
      setPassPending(false);
      const animationId = Date.now();
      setPassMotion({ id: animationId, from, to, hot });
      window.setTimeout(() => setPassMotion((current) => current?.id === animationId ? null : current), 650);
      setSelected("");
    } catch (cause) { setPassPending(false); setError(readableError(cause)); }
  }

  async function settle() {
    if (!room) return;
    try {
      const latest = await provider.getBlock("latest");
      if (!latest || latest.timestamp < room.deadline) {
        await refreshRoom(room.roomId);
        throw new Error("Waktu blok chain belum melewati deadline. Data diperbarui; jangan kirim finalisasi dulu.");
      }
      setMessage("Mengirim finalisasi; hasil belum resmi sebelum receipt sukses…");
      await submitTransaction("settleRoom", [BigInt(room.roomId)], "settleRoom", async () => { await refreshRoom(room.roomId); });
    } catch (cause) { setError(readableError(cause)); }
  }

  async function checkPending() {
    setBusy(true); setError("");
    try {
      const result = await inspectPendingTransaction(provider, async () => { if (roomId) await refreshRoom(roomId); });
      setPending(getStoredPendingTransaction());
      if (!result.pending) setMessage("Tidak ada transaksi tersimpan yang menunggu pemeriksaan.");
      else if (!result.receipt) setMessage(`Receipt belum ditemukan untuk ${result.pending.hash}. Status belum jelas; jangan kirim ulang.`);
      else { setLastHash(result.pending.hash); setMessage(`Receipt blok ${result.receipt.blockNumber}, status ${result.receipt.status === 1 ? "sukses" : "gagal"}. Snapshot diperbarui.`); }
    } catch (cause) { setError(readableError(cause)); }
    finally { setBusy(false); }
  }

  async function copyInvite() {
    const url = `${location.origin}/play?room=${room?.roomId ?? roomId}`;
    try { await navigator.clipboard.writeText(url); setMessage("Tautan room disalin."); }
    catch { setMessage(`Salin tautan ini: ${url}`); }
  }

  function characterName(address: string) {
    return playerName(room, address);
  }

  return <main className="game-preview live-game">
    <header className="preview-header"><a className="preview-brand" href="/"><img className="brand-symbol" src="/bom-oper-mark.svg" alt="" />BOM OPER</a><span className="preview-network"><i />MONAD TESTNET · 10143</span></header>
    {screen === "opening" && <section className="preview-opening live-opening">
      <div className="opening-copy"><span className="preview-stamp">PARTY GAME · 2–4 PEMAIN</span><h1>BOM<br />OPER</h1><p className="opening-tagline">Oper cepat. Tahan panik.</p><p>Satu bom, teman-temanmu. Jangan jadi pemegang terakhir.</p><div className="opening-actions"><button className="arcade-button button-orange" onClick={() => setScreen("lobby")}>Mulai main</button><a className="arcade-button button-cream" href="#cara-main">Cara main</a></div><p className="live-disclaimer">Game tersambung ke kontrak Monad Testnet. Wallet tidak diminta sampai kamu memilih aksi.</p></div>
      <div className="live-hero-arena"><div className="sun-disc" /><div className="arena-rim"><div className="arena-floor" /><div className="live-hero-characters"><Character color="orange" /><Character color="cyan" /><Character color="violet" /><Character color="pink" /><Bomb small /></div></div></div>
      <div id="cara-main" className="live-rules"><strong>CARA MAIN</strong><span>Oper sebelum waktu habis</span><span>Oper panas memangkas 3 detik</span><span>Room dan pemenang mengikuti kontrak</span></div>
    </section>}

    {screen === "lobby" && <section className="live-lobby"><span className="preview-kicker">PERSIAPAN ROOM</span><h1>Kumpul dulu.<br />Panik nanti.</h1>
      <div className="live-wallet-status"><div><strong>{activeSession ? `WALLET · ${compact(activeSession.address)}` : expired || sessionExpired ? "SESI HABIS · MODE PENONTON" : "WALLET BELUM SIAP"}</strong><span>{activeSession ? `Saldo ${mono(balance)}` : expired || sessionExpired ? "Baca room boleh; aksi tetap berhenti. Selesaikan room aktif tanpa mengganti identitas." : "Sesi sementara berlaku 10 menit dan butuh MON untuk gas."}</span></div>{!activeSession && !sessionExpired && <a className="arcade-button button-violet" href="/wallet">Siapkan wallet</a>}</div>
      <div className="live-lobby-grid"><section className="live-card"><h2>Buat room</h2><label>Jumlah pemain<select value={capacity} onChange={(e) => setCapacity(Number(e.target.value))}><option value={2}>2 pemain</option><option value={3}>3 pemain</option><option value={4}>4 pemain</option></select></label><label>Durasi<select value={duration} onChange={(e) => setDuration(Number(e.target.value))}><option value={30}>30 detik</option><option value={60}>60 detik</option></select></label><button className="arcade-button button-orange" disabled={!activeSession || busy || Boolean(pending)} onClick={() => void createRoom()}>Buat room on-chain</button></section>
        <section className="live-card"><h2>Gabung room</h2><label>ID room<input inputMode="numeric" value={joinId} onChange={(e) => setJoinId(e.target.value)} placeholder="Contoh: 7" /></label><button className="arcade-button button-cyan" disabled={!joinId || busy || (Boolean(pending) && Boolean(activeSession))} onClick={() => activeSession ? void joinRoom() : void viewRoom()}>{activeSession ? "Gabung dengan wallet ini" : "Lihat room"}</button><p>Room dari tautan dapat dibuka sebagai penonton tanpa membuat wallet.</p></section></div>
    </section>}

    {screen === "room" && <section className="live-room">
      <div className="arena-topline"><span className="room-chip">ROOM #{room?.roomId ?? roomId} · {room ? statusNames[room.status] : error ? "GAGAL DIBACA" : "MEMUAT"}</span><span className={`holder-chip ${holderIsYou ? "" : "holder-spectator"}`}>{room ? holderIsYou ? "KAMU PEGANG BOM!" : `${compact(room.holder)} PEGANG BOM` : "MEMBACA ROOM…"}</span></div>
      {room && <><div className={`live-room-meta ${room.status === 2 ? "is-finished" : ""}`}><span>{room.players.length} / {room.capacity} PEMAIN</span><span>{room.duration} DETIK</span><span>GILIRAN {room.turn}</span></div>
        {room.status === 1 && <div className={`timer-sample live-timer ${secondsLeft <= 6 ? "timer-danger" : ""}`}>{`00:${String(secondsLeft).padStart(2,"0")}`}<small>{secondsLeft === 0 ? "MENUNGGU FINALISASI CHAIN" : "SISA WAKTU · PERKIRAAN DARI BLOK"}</small></div>}
        <div className={`arena-art capacity-${room.capacity} live-arena`}><div className="arena-shadow" /><div className="arena-rim"><div className="arena-floor" />{room.players.map((player, index) => <button type="button" key={player} aria-label={`Pilih ${characterName(player)} sebagai penerima`} onClick={() => setSelected(player)} disabled={!holderIsYou || player.toLowerCase() === room.holder.toLowerCase() || busy || Boolean(pending) || secondsLeft === 0} className={`arena-player slot-${index} ${player.toLowerCase() === room.holder.toLowerCase() ? "is-holder" : ""} ${passPending && player.toLowerCase() === room.holder.toLowerCase() ? "is-pass-pending" : ""} ${selected.toLowerCase() === player.toLowerCase() ? "is-selected" : ""}`}><Character color={colors[index]} label={characterName(player)} />{player.toLowerCase() === room.holder.toLowerCase() && <Bomb small />}</button>)}{Array.from({length: room.capacity - room.players.length}, (_, i) => <div key={`empty-${i}`} className={`live-empty-seat slot-${room.players.length + i}`}>MENUNGGU…</div>)}{passMotion && <div aria-hidden="true" className={`pass-bomb-flight ${passMotion.hot ? "is-hot" : ""}`} style={{ "--from-x": ["14%", "86%", "50%", "50%"][passMotion.from], "--from-y": ["33%", "33%", "5%", "78%"][passMotion.from], "--to-x": ["14%", "86%", "50%", "50%"][passMotion.to], "--to-y": ["33%", "33%", "5%", "78%"][passMotion.to] } as React.CSSProperties}><Bomb small /></div>}</div></div>
        {room.status === 0 && <div className="live-room-actions"><p>Room dibuat oleh {compact(room.creator)}. {room.players.length === room.capacity ? "Semua kursi terisi; siapa pun anggota dapat mulai." : "Bagikan undangan dan tunggu pemain."}</p><button className="arcade-button button-violet" onClick={() => void copyInvite()}>Salin undangan</button>{room.players.length === room.capacity && membership && <button className="arcade-button button-orange" disabled={busy || Boolean(pending)} onClick={() => void startRound()}>Mulai ronde</button>}{!membership && room.players.length < room.capacity && activeSession && <button className="arcade-button button-cyan" disabled={busy || Boolean(pending)} onClick={() => { setJoinId(room.roomId); void joinRoom(); }}>Gabung room</button>}</div>}
        {room.status === 1 && <div className="arena-controls live-controls"><p>{holderIsYou ? selected ? `Tujuan: ${characterName(selected)}` : "Pilih pemain lain untuk menerima bom." : membership ? "Tunggu giliranmu; hanya pemegang bom yang bisa mengoper." : "Mode penonton · room sudah aktif."}</p><div className="live-recipient-list">{room.players.filter((p) => p.toLowerCase() !== room.holder.toLowerCase()).map((p) => <button key={p} className={`live-recipient ${selected.toLowerCase() === p.toLowerCase() ? "is-selected" : ""}`} disabled={!holderIsYou || busy || Boolean(pending) || secondsLeft === 0} onClick={() => setSelected(p)}>{characterName(p)}<small>{compact(p)}</small></button>)}</div><div className="pass-actions"><button className="arcade-button button-orange" disabled={!holderIsYou || !selected || busy || Boolean(pending) || secondsLeft === 0} onClick={() => void passBomb(false)}>Oper biasa</button><button className="arcade-button button-pink" disabled={!holderIsYou || !selected || Boolean(hotUsed) || busy || Boolean(pending) || secondsLeft <= 6} onClick={() => void passBomb(true)}>Oper panas −3s<small>{hotUsed ? "jatah panas habis" : "1× per pemain · sisa harus >6s"}</small></button></div>{secondsLeft === 0 && <button className="arcade-button button-violet" disabled={busy || Boolean(pending) || !activeSession} onClick={() => void settle()}>Finalisasi room</button>}</div>}
        {room.status === 2 && <section className="live-result"><span className="preview-kicker">HASIL RESMI · STATUS FINISHED</span><h1>{characterName(room.loser)} kena bom!</h1><p>Pemain bertahan: {room.players.filter((p) => p.toLowerCase() !== room.loser.toLowerCase()).map(characterName).join(", ")}</p>{lastHash && <a href={`https://testnet.monadvision.com/tx/${lastHash}`} target="_blank" rel="noreferrer">Bukti transaksi terakhir ↗</a>}<button className="arcade-button button-orange" onClick={() => { setRoom(null); setRoomId(""); setScreen("lobby"); window.history.replaceState(null,"","/play"); }}>Buat room baru</button></section>}
        <section className="live-history"><h2>Riwayat yang diamati di tab ini</h2>{history.length ? <ol>{history.map((event, index) => <li key={`${index}-${event}`}>{event}</li>)}</ol> : <p>Belum ada perubahan sejak layar room ini dibuka. State utama tetap dibaca dari snapshot kontrak.</p>}</section>
      </>}
      <div className="live-status-area" role="status" aria-live="polite">{error && <p className="setup-error">{error}</p>}{message && <p>{message}</p>}{pending && <p>Transaksi perlu diperiksa: <a href={`https://testnet.monadvision.com/tx/${pending.hash}`} target="_blank" rel="noreferrer">{compact(pending.hash)}</a> · jangan kirim ulang.</p>}{pending && <button className="arcade-button button-cream" disabled={busy} onClick={() => void checkPending()}>Periksa receipt</button>}{lastHash && <a href={`https://testnet.monadvision.com/tx/${lastHash}`} target="_blank" rel="noreferrer">Lihat receipt terakhir ↗</a>}{!room && !error && <p>Membaca satu snapshot room di satu blok terbaru…</p>}<button className="text-button" disabled={busy} onClick={() => void refreshRoom().catch((e) => setError(readableError(e)))}>Perbarui data</button></div>
      <button className="text-button" onClick={() => setScreen("lobby")}>Kembali ke lobby</button>
    </section>}
    <footer className="preview-footer"><span>MONAD TESTNET · 10143</span><span>Room dan hasil resmi mengikuti receipt kontrak.</span><a href="/">Beranda</a></footer>
  </main>;
}
