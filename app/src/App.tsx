import { lazy, Suspense } from "react";

const DeploySetup = lazy(() => import("./DeploySetup"));

const rules = [
  {
    number: "01",
    title: "Oper sebelum habis",
    detail: "Pemegang terakhir saat hitung mundur selesai kalah.",
  },
  {
    number: "02",
    title: "Oper biasa",
    detail: "Pindahkan bom ke pemain lain tanpa mengubah deadline.",
  },
  {
    number: "03",
    title: "Oper panas",
    detail: "Pangkas 3 detik; tiap pemain punya satu jatah per ronde.",
  },
];

function App() {
  if (window.location.pathname === "/setup") {
    return <Suspense fallback={<main className="page-shell"><p>Memuat helper deployment…</p></main>}><DeploySetup /></Suspense>;
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="BOM OPER, beranda">
          <span className="brand-mark" aria-hidden="true">B</span>
          <span>BOM OPER</span>
        </a>
        <span className="network-pill">
          <span className="network-dot" aria-hidden="true" />
          MONAD TESTNET
        </span>
      </header>

      <section className="hero" id="top" aria-labelledby="page-title">
        <div className="hero-copy">
          <p className="eyebrow">PARTY GAME ON-CHAIN · 2—4 PEMAIN</p>
          <h1 id="page-title">
            Oper cepat.
            <br />
            <span>Jangan sampai</span>
            <br />
            <span className="headline-pop">meledak!</span>
          </h1>
          <p className="intro">
            Satu bom, satu hitung mundur, dan teman-temanmu. Oper sebelum waktu
            habis—pemegang terakhir yang kalah.
          </p>
          <a className="primary-link" href="#aturan">
            Lihat cara main <span aria-hidden="true">↓</span>
          </a>
          <p className="build-note">Arena publik sedang disiapkan.</p>
        </div>

        <aside className="round-card" aria-label="Ringkasan ronde">
          <div className="card-topline">
            <span>ATURAN RONDE</span>
            <span className="card-spark" aria-hidden="true">✳</span>
          </div>
          <div className="round-number">30<span>detik</span></div>
          <p className="round-caption">waktu untuk terus mengoper</p>
          <div className="card-divider" />
          <div className="round-facts">
            <div><strong>2—4</strong><span>pemain</span></div>
            <div><strong>−3s</strong><span>oper panas</span></div>
            <div><strong>1×</strong><span>jatah panas</span></div>
          </div>
          <p className="card-footnote">Durasi ronde: 30 atau 60 detik.</p>
        </aside>
      </section>

      <section className="rules-section" id="aturan" aria-labelledby="rules-title">
        <div className="section-heading">
          <p className="eyebrow">SEBELUM BOMNYA JALAN</p>
          <h2 id="rules-title">Gampang aturannya.</h2>
        </div>
        <ol className="rules-list">
          {rules.map((rule) => (
            <li className="rule" key={rule.number}>
              <span className="rule-number">{rule.number}</span>
              <div>
                <h3>{rule.title}</h3>
                <p>{rule.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <footer className="footer">
        <span>BOM OPER</span>
        <a href="/setup">Setup kontrak · developer</a>
        <span>Target jaringan: Monad Testnet · Chain ID 10143</span>
      </footer>
    </main>
  );
}

export default App;
