import { useState } from "react";
import "./game-preview.css";

type Screen = "opening" | "lobby" | "arena" | "result";
export type ArcadeColor = "orange" | "cyan" | "violet" | "pink";
type Player = { label: string; color: ArcadeColor; address: string };

const players: Player[] = [
  { label: "KAMU", color: "orange", address: "0x91c4…20af" },
  { label: "PEMAIN 2", color: "cyan", address: "0x42d1…881a" },
  { label: "PEMAIN 3", color: "violet", address: "0x7aa0…ef42" },
  { label: "PEMAIN 4", color: "pink", address: "0x311b…903c" },
];

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.append(field);
  field.select();
  const copied = document.execCommand("copy");
  field.remove();
  if (!copied) throw new Error("Browser tidak mengizinkan salin otomatis. Salin link yang ditampilkan.");
}

function getRoomUrl(roomId: string, capacity: number, duration: number) {
  const url = new URL("/prototype", window.location.origin);
  url.searchParams.set("room", roomId);
  url.searchParams.set("capacity", String(capacity));
  url.searchParams.set("duration", String(duration));
  return url;
}

export function Character({ color, className = "", label }: { color: ArcadeColor; className?: string; label?: string }) {
  return <div className={`character character-${color} ${className}`} aria-label={label ?? "Karakter pemain"}>
    <svg viewBox="0 0 120 145" role="img" aria-hidden="true">
      <ellipse cx="60" cy="137" rx="38" ry="7" fill="#212346" opacity=".22" />
      <rect x="40" y="109" width="19" height="26" rx="9" className="char-boot" />
      <rect x="63" y="109" width="19" height="26" rx="9" className="char-boot" />
      <rect x="31" y="71" width="58" height="51" rx="18" className="char-body" />
      <rect x="15" y="82" width="22" height="31" rx="11" className="char-hand" />
      <rect x="83" y="82" width="22" height="31" rx="11" className="char-hand" />
      <rect x="29" y="24" width="62" height="60" rx="22" className="char-head" />
      <rect x="49" y="14" width="22" height="14" rx="6" className="char-antenna" />
      <rect x="39" y="40" width="42" height="30" rx="12" fill="#fff2c7" stroke="#212346" strokeWidth="3" />
      <ellipse cx="50" cy="53" rx="3.6" ry="5" fill="#212346" />
      <ellipse cx="70" cy="53" rx="3.6" ry="5" fill="#212346" />
      <path d="M53 62 Q60 67 67 62" fill="none" stroke="#212346" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="53" y="84" width="14" height="12" rx="4" fill="#fff2c7" stroke="#212346" strokeWidth="2" />
    </svg>
    {label && <span className="character-label">{label}</span>}
  </div>;
}

export function Bomb({ small = false }: { small?: boolean }) {
  return <span className={`bomb-art ${small ? "bomb-small" : ""}`} aria-label="Bom menyala">
    <svg viewBox="0 0 90 100" aria-hidden="true">
      <path d="M55 20 C57 7 69 8 75 3" fill="none" stroke="#212346" strokeWidth="7" strokeLinecap="round" />
      <path d="M74 4 L79 0 M75 7 L85 7 M71 2 L73 -3" stroke="#ffaf3e" strokeWidth="4" strokeLinecap="round" />
      <circle cx="45" cy="55" r="35" fill="#212346" />
      <circle cx="45" cy="55" r="29" fill="#45456f" />
      <ellipse cx="35" cy="39" rx="9" ry="5" fill="#fff2c7" opacity=".9" transform="rotate(-30 35 39)" />
      <text x="45" y="69" textAnchor="middle" fontFamily="Nunito, sans-serif" fontSize="37" fontWeight="900" fill="#fff2c7">!</text>
    </svg>
  </span>;
}

function ArenaArt({ holder, capacity, onSelect, selected }: { holder: number; capacity: number; onSelect?: (index: number) => void; selected?: number }) {
  const order = capacity === 2 ? [0, 1] : [0, 1, 2, 3];
  return <div className={`arena-art capacity-${capacity}`}>
    <div className="arena-shadow" />
    <div className="arena-rim"><div className="arena-floor" />
      {order.map((index, slot) => <button key={index} type="button" className={`arena-player slot-${slot} ${holder === index ? "is-holder" : ""} ${selected === index ? "is-selected" : ""}`} onClick={() => onSelect?.(index)} disabled={!onSelect || index === holder} aria-label={`${players[index].label}${holder === index ? ", pemegang bom" : ", pilih sebagai penerima"}`}>
        <Character color={players[index].color} label={index === 0 ? "KAMU" : players[index].label} />
        {holder === index && <Bomb small />}
      </button>)}
    </div>
  </div>;
}

export default function GamePreview() {
  const [screen, setScreen] = useState<Screen>(() => new URLSearchParams(window.location.search).has("room") ? "lobby" : "opening");
  const [capacity, setCapacity] = useState(() => [2, 3, 4].includes(Number(new URLSearchParams(window.location.search).get("capacity"))) ? Number(new URLSearchParams(window.location.search).get("capacity")) : 4);
  const [duration, setDuration] = useState(() => [30, 60].includes(Number(new URLSearchParams(window.location.search).get("duration"))) ? Number(new URLSearchParams(window.location.search).get("duration")) : 30);
  const [joinId, setJoinId] = useState(new URLSearchParams(window.location.search).get("room") ?? "");
  const [roomId, setRoomId] = useState(() => new URLSearchParams(window.location.search).get("room") ?? "024");
  const [holder, setHolder] = useState(0);
  const [selected, setSelected] = useState<number | undefined>(undefined);
  const [hotCount, setHotCount] = useState(1);
  const [notice, setNotice] = useState("");
  const [showRules, setShowRules] = useState(false);

  function createRoom() {
    const id = String(Number(roomId || "24") + 1).padStart(3, "0");
    setRoomId(id);
    setJoinId(id);
    setHolder(0);
    window.history.replaceState(null, "", getRoomUrl(id, capacity, duration));
    setNotice(`Room contoh #${id} siap dibagikan. Room ini hanya tersimpan di pratinjau lokal.`);
  }

  function joinRoom() {
    const id = joinId.trim().replace(/^#/, "");
    if (!id) { setNotice("Masukkan ID room untuk melihat pratinjau."); return; }
    setRoomId(id);
    window.history.replaceState(null, "", getRoomUrl(id, capacity, duration));
    setNotice(`Membuka contoh room #${id}. Ini bukan snapshot on-chain.`);
  }

  async function shareRoom() {
    const url = getRoomUrl(roomId, capacity, duration);
    const shareData = { title: `Room contoh BOM OPER #${roomId}`, text: "Ikut lihat pratinjau room BOM OPER ini.", url: url.toString() };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setNotice("Link room contoh berhasil dibagikan.");
        return;
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
      }
    }

    try {
      await copyText(url.toString());
      setNotice("Link room contoh disalin. Buka di perangkat lain untuk melihat pratinjau.");
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : "Link tidak berhasil disalin. Salin alamat room yang tampil di layar.");
    }
  }

  function passBomb(hot: boolean) {
    if (selected === undefined) { setNotice("Pilih karakter penerima dulu."); return; }
    if (hot && hotCount === 0) { setNotice("Contoh ini sudah memakai jatah panas lokal."); return; }
    setHolder(selected);
    setSelected(undefined);
    if (hot) setHotCount(0);
    setNotice(hot ? "Simulasi lokal: bom berpindah dan contoh deadline berkurang 3 detik." : "Simulasi lokal: bom berpindah; deadline contoh tetap.");
  }

  function resetPreview() {
    setHolder(0); setHotCount(1); setSelected(undefined); setNotice(""); setScreen("opening");
    window.history.replaceState(null, "", "/prototype");
  }

  return <main className="game-preview">
    <header className="preview-header">
      <a className="preview-brand" href="/" aria-label="Kembali ke BOM OPER"><img className="brand-symbol" src="/bom-oper-mark.svg" alt="" aria-hidden="true" /><span>BOM OPER</span></a>
      <span className="preview-network"><i />MONAD TESTNET</span>
      <span className="preview-stamp">PRATINJAU LOKAL · SIMULASI</span>
    </header>

    {screen === "opening" && <section className="preview-opening">
      <div className="opening-copy">
        <span className="preview-kicker">PARTY GAME · 2–4 PEMAIN</span>
        <h1>BOM<br />OPER</h1>
        <p className="opening-tagline">Oper cepat. Tahan panik.</p>
        <p>Satu bom. Teman-temanmu.<br />Jangan jadi pemegang terakhir.</p>
        <div className="opening-actions"><button className="arcade-button button-orange" onClick={() => { setScreen("lobby"); setNotice("Kamu sedang melihat pratinjau. Wallet tidak diminta dan tidak ada transaksi."); }}>Coba demo</button><button className="arcade-button button-cream" onClick={() => setShowRules((value) => !value)}>Cara main</button></div>
        <p className="mock-caption">Tanpa wallet · 2–4 pemain · ronde asli memakai MON testnet</p>
        {showRules && <div className="rules-popover"><strong>Cara main</strong><ol><li>Buat room dan undang 1–3 teman.</li><li>Oper bom sebelum deadline kontrak.</li><li>Oper panas memotong 3 detik, sekali per pemain.</li></ol><small>Di pratinjau ini semua langkah hanya simulasi lokal.</small></div>}
      </div>
      <div className="opening-scene"><div className="sun-disc" /><span className="scene-word">OPER!</span><ArenaArt holder={3} capacity={4} /><span className="scene-spark spark-a">✦</span><span className="scene-spark spark-b">✧</span><Bomb /></div>
    </section>}

    {screen === "lobby" && <section className="preview-lobby">
      <div className="lobby-heading"><span className="preview-kicker">SIAP-SIAP · PRATINJAU</span><h1>Kumpul dulu.<br className="mobile-break" /> Panik nanti.</h1><p>Room <strong>#{roomId}</strong> · contoh lokal, belum dibaca dari kontrak</p></div>
      <div className="lobby-toolbar"><label>Kapasitas <select value={capacity} onChange={(event) => setCapacity(Number(event.target.value))}><option value={2}>2 pemain</option><option value={3}>3 pemain</option><option value={4}>4 pemain</option></select></label><label>Durasi <select value={duration} onChange={(event) => setDuration(Number(event.target.value))}><option value={30}>30 detik</option><option value={60}>60 detik</option></select></label><button className="arcade-button button-orange" onClick={createRoom}>Buat room contoh</button></div>
      <div className="invite-panel"><div><strong>Room #{roomId}</strong><span>Link pratinjau · belum menjadi room on-chain</span></div><button className="arcade-button button-cream" onClick={() => void shareRoom()}>Bagikan room</button><code>{getRoomUrl(roomId, capacity, duration).toString()}</code></div>
      <div className="lobby-toolbar lobby-join"><label>ID room teman <input inputMode="numeric" autoComplete="off" value={joinId} onChange={(event) => setJoinId(event.target.value)} placeholder="Contoh: 024" /></label><button className="arcade-button button-cream" onClick={joinRoom}>Buka room</button></div>
      <div className="lobby-characters">{players.slice(0, capacity).map((player, index) => <div className={`lobby-seat ${index < 2 ? "seat-ready" : "seat-empty"}`} key={player.color}><Character color={player.color} /><span>{index === 0 ? "KAMU · PEMBUAT" : index === 1 ? "PEMAIN 2 · CONTOH" : "MENUNGGU…"}</span></div>)}</div>
      <div className="lobby-status"><strong>2 / {capacity} pemain</strong><span>Wallet belum diminta · saldo belum diperiksa</span></div>
      <button className="arcade-button button-violet lobby-primary-action" onClick={() => { setHolder(0); setScreen("arena"); setNotice("Arena contoh dibuka. Timer tetap contoh, tidak berjalan dari chain."); }}>Lihat arena contoh</button>
      <p className="mock-caption">Buat/join/start sungguhan aktif setelah alamat kontrak publik tersedia.</p>
      <section className="status-guide" aria-labelledby="status-guide-title"><div className="status-guide-title"><span className="preview-kicker">PANDUAN STATUS</span><h2 id="status-guide-title">Apa yang terjadi saat main?</h2><p>Ini contoh label untuk game terhubung; belum ada wallet/transaksi di pratinjau ini.</p></div><ol><li><span className="status-icon" aria-hidden="true">1</span><div><strong>Menunggu persetujuan wallet</strong><p>Wallet terbuka untuk kamu tinjau. Belum ada aksi sampai disetujui.</p></div></li><li><span className="status-icon status-pending" aria-hidden="true">2</span><div><strong>Transaksi diproses</strong><p>Tunggu receipt. Jangan kirim aksi yang sama lagi saat statusnya belum jelas.</p></div></li><li><span className="status-icon status-finished" aria-hidden="true">3</span><div><strong>Ronde selesai</strong><p>Hasil resmi muncul setelah kontrak memberi status Finished.</p></div></li></ol></section>
    </section>}

    {screen === "arena" && <section className="preview-arena-screen">
      <div className="arena-topline"><span className="room-chip">ROOM #{roomId} · SIMULASI</span><span className="holder-chip">{holder === 0 ? "KAMU" : players[holder].label} PEGANG BOM!</span></div>
      <div className="timer-sample" aria-label="Waktu contoh, tidak berjalan">00:18<small>WAKTU CONTOH</small></div>
      <ArenaArt holder={holder} capacity={capacity} selected={selected} onSelect={setSelected} />
      <div className="arena-controls"><p>{selected === undefined ? "Pilih karakter tujuan" : `Tujuan: ${players[selected].label} · ${players[selected].address}`}</p><div className="pass-actions"><button className="arcade-button button-orange" onClick={() => passBomb(false)} disabled={holder !== 0}>Oper biasa</button><button className="arcade-button button-pink" onClick={() => passBomb(true)} disabled={holder !== 0 || hotCount === 0}>Oper panas −3s <small>{hotCount ? "jatah contoh: 1" : "jatah contoh: habis"}</small></button></div><p className="mock-caption">Tombol di sini hanya mengubah contoh lokal. Tidak ada wallet, transaksi, countdown chain, atau hasil resmi.</p><div className="arena-preview-footer"><button className="text-button" onClick={() => setNotice("Perbarui pratinjau: tidak ada RPC yang dipanggil.")}>Perbarui contoh</button><button className="text-button" onClick={() => { setScreen("result"); setNotice("Hasil contoh ini bukan pemenang dari kontrak."); }}>Lihat contoh layar hasil</button></div></div>
    </section>}

    {screen === "result" && <section className="preview-result"><span className="preview-kicker">CONTOH LAYAR SELESAI · BUKAN HASIL CHAIN</span><h1>Kena bom!</h1><p className="result-subtitle">{players[holder].label} memegang bom pada contoh ini.</p><div className="result-scene"><div className="sun-disc" /><div className="result-platform"><Character color={players[holder].color} /></div><span className="scene-spark spark-a">✦</span><span className="scene-spark spark-b">✦</span></div><div className="result-ribbon">HASIL SIMULASI LOKAL · BELUM ADA RECEIPT</div><div className="result-actions"><button className="arcade-button button-orange" onClick={resetPreview}>Main lagi (pratinjau)</button><button className="arcade-button button-cream" onClick={() => setNotice("Bukti transaksi belum ada di pratinjau lokal.")}>Bukti transaksi</button></div><p className="mock-caption">Hasil game yang sebenarnya hanya tampil setelah kontrak berstatus Finished.</p></section>}

    <div className="preview-notice" role="status" aria-live="polite"><span aria-hidden="true">ⓘ</span>{notice || "PRATINJAU DESAIN · pemain, waktu, room, dan aksi di layar ini adalah contoh."}</div>
    <footer className="preview-footer"><span>MONAD TESTNET · 10143</span><span>Pratinjau visual lokal · belum tersambung ke kontrak</span><a href="/">Kembali</a></footer>
  </main>;
}
