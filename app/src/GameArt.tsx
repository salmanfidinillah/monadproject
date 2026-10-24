import "./game-art.css";

export type ArcadeColor = "orange" | "cyan" | "violet" | "pink";

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
