# Hasil pengujian

**BELUM ADA TES GAME YANG DIJALANKAN.** Tabel di bawah adalah rencana kasus, bukan daftar lulus. Tambahkan tanggal/lingkungan, perintah aktual, hasil, dan bukti ketika dijalankan.

| Kelompok | Kasus minimum | Hasil awal |
|---|---|---|
| Room | Capacity 2/3/4, durasi30/60, invalid, auto-join, room tak dikenal | BELUM DIUJI |
| Join/start | Ganda/penuh/terlambat, luar anggota, belum penuh, start ulang | BELUM DIUJI |
| Oper | Hanya holder, penerima anggota lain, self/nonanggota gagal, turn naik | BELUM DIUJI |
| Turn lama | expectedTurn salah; queued oper tetap gagal setelah bom kembali | BELUM DIUJI |
| Panas | Tepat −3s, sekali/pemain, batas6s ditolak, >6s diizinkan | BELUM DIUJI |
| Deadline | Biasa tanpa reset, tepat deadline oper ditolak dan settle diizinkan | BELUM DIUJI |
| Hasil | Settle dini/ganda gagal; siapa pun boleh settle; loser/event sesuai | BELUM DIUJI |
| Isolasi | Dua room tidak mengubah satu sama lain; dua oper bersaing | BELUM DIUJI |
| Jaringan/gas | Salah jaringan ditolak; gas terukur untuk setiap fungsi utama | BELUM DIUJI |
| Wallet | Consent, fund, kurang gas, expiry/hilang, wrong chain, reject | BELUM DIUJI |
| Pending | Klik ganda, refresh pending, receipt gagal/tertunda, tanpa retry buta | BELUM DIUJI |
| Multiplayer | 2–4 konteks terpisah, holder/turn/deadline/loser konsisten | BELUM DIUJI |
| UI/Figma | Mobile/desktop, pending/gagal, ikon+teks, perbandingan acuan Figma | BELUM DIUJI |
| Opening/loading | Mulai Main/Cara Main, tidak auto-connect, reduced motion, loading nyata, gagal baca/retry, deep link tanpa ulang opening | BELUM DIUJI |
| Hosting | URL publik, HP, refresh link room, build/ABI/chain sama | BELUM DIUJI |
| Ronde final | Create→join→start→pass→panas→settle→Finished dengan receipt | BELUM DIUJI |

## Format catatan pelaksanaan

Tanggal/waktu; tahap/commit sumber yang diuji; lingkungan (lokal/testnet/URL); kasus dan langkah/perintah aktual; hasil LULUS/GAGAL/TERHALANG; bukti/log ringkas bebas rahasia; masalah; tes ulang setelah perbaikan.

Bedakan simulasi lokal, UI disabled, dan penolakan kontrak sebenarnya. Transaksi dibuat belum berarti receipt sukses. Gunakan kontrol waktu jaringan tes untuk batas deadline. Hasil manual yang menunggu pengguna tetap BELUM DIUJI/TERHALANG sampai ada bukti.

## Pelaksanaan Prompt Induk — 24 Oktober 2026 WIB

Lingkungan: PowerShell lokal di folder proyek, branch main. Pemeriksaan ini mengenai dokumen dan fondasi Git; seluruh kasus game pada tabel awal tetap BELUM DIUJI. Commit sumber adalah checkpoint fondasi yang memuat catatan ini; SHA dilaporkan di chat setelah commit dibuat.

| Pemeriksaan yang benar-benar dijalankan | Hasil aktual |
|---|---|
| Inventaris rg --files --hidden sebelum inisialisasi; git status --short --branch | 10 berkas Markdown, tidak ada kode; Git semula melaporkan bukan repository |
| git init -b main; git rev-parse --show-toplevel; git branch --show-current; git remote -v | LULUS lokal: root sesuai folder proyek, branch main, remote kosong |
| git --version; node --version; npm.cmd --version; Get-Command gh | Git 2.54.0.windows.1, Node v24.13.1, npm 11.8.0; gh tidak ditemukan. Tidak menilai kompatibilitas dependency |
| Pembacaan profil lewat plugin GitHub | LULUS koneksi profil: salmanfidinillah; izin repository/push belum diuji |
| PowerShell inline: rg --files -g '*.md', Get-Content -Raw -Encoding UTF8, regex tautan/code fence, dan Test-Path untuk setiap target lokal | LULUS: 10 Markdown, 11 tautan lokal ditemukan dan seluruhnya ada, code fence berpasangan |
| git check-ignore -q -- untuk 11 path sensitif/generated dan 5 path yang harus bisa dilacak; tidak membuat berkas rahasia | LULUS: seluruh exit code sesuai; rincian path di bawah |
| rg -l --hidden -g '!.git/**' dengan pola token GitHub/AWS/OpenAI, blok private key PEM, dan nilai hex 64 digit berawalan 0x | LULUS pemeriksaan heuristik: tidak ada kecocokan; hasil tidak menjamin seluruh jenis rahasia terdeteksi |
| git diff --check sebelum staging awal | Exit 0; file awal masih untracked, sehingga pemeriksaan staged diperlukan sebelum commit |
| Pemeriksaan ulang tautan/code fence sesudah pembaruan dokumen; git diff --cached --stat; tinjauan diff staged dokumen progres dan .gitignore | LULUS: 10 Markdown, 13 tautan lokal ada, code fence berpasangan; tinjauan mencakup 11 berkas fondasi tanpa kode game |
| git diff --cached --check; git grep --cached -l -E dengan pola kredensial yang sama | LULUS: whitespace staged bersih; pemindaian staged tidak menemukan kecocokan |
| Build, tes kontrak, tes wallet, deployment, multiplayer publik | BELUM DIJALANKAN; kode/dependency belum ada |
| Metadata repository dan git ls-remote --symref https://github.com/salmanfidinillah/monadproject.git | LULUS akses baca: ref awal kosong; plugin melaporkan owner salmanfidinillah, default branch main, permissions.push = true |
| git remote add origin https://github.com/salmanfidinillah/monadproject.git; git remote -v; git ls-remote origin refs/heads/main | LULUS konfigurasi origin dan baca remote; main belum mempunyai commit pada pemeriksaan awal |
| git commit -m 'docs: define bomb oper MVP and delivery plan' | LULUS: commit fondasi fddf27fcf121c0cc8cca9b26526f1c65137a1c25, 11 berkas |
| git push -u origin main | LULUS: main baru dibuat di origin dan tracking origin/main disiapkan |
| git rev-parse HEAD dibandingkan dengan git ls-remote origin refs/heads/main | LULUS 24 Oktober 2026 pukul 09.19 WIB: lokal dan remote sama-sama fddf27fcf121c0cc8cca9b26526f1c65137a1c25 |
| git status --short --branch setelah push fondasi | LULUS: main...origin/main tanpa perubahan working tree |

Path yang berhasil diabaikan: .env, .env.local, app/.env.production, .dev.vars, app/node_modules/example/index.js, app/dist/index.html, artifacts/example.json, cache/example.json, .wrangler/state/example, tmp/example, wallet.key.

Path yang tetap dapat dilacak: .env.example, app/.env.example, package-lock.json, deployments/10143.json, docs/design/README.md. Ini hanya uji nama path; bukan bukti file tersebut sudah dibuat.

Bukti hasil GitHub di atas merujuk commit fondasi yang sudah dibuat dan di-push sebelum catatan ini ditambahkan. Commit pembaruan dokumentasi serta pemeriksaan SHA final dilaporkan di chat setelah dijalankan. Tidak ada tes game, hasil testnet, atau deployment yang dinyatakan lulus.

## Pelaksanaan Prompt 0 — 24 Oktober 2026 WIB

Lingkungan: plugin Figma + PowerShell lokal, branch main. File T8zhiDboW04KOC9sDJrlz6, page 0:1. Bukti: docs/design/figma-audit.json, docs/design/tokens.json, enam PNG di docs/design/previews/. Semua contoh permainan adalah mock, bukan tes kontrak.

| Pemeriksaan aktual | Hasil |
|---|---|
| whoami, create_new_file, create_session, pembacaan file/font/style/variable melalui use_figma | LULUS: satu plan student, file Design dibuat, file awal kosong, font dipilih dari daftar aktual |
| rg --files -g '*.figma.*'; get_libraries; search_design_system button/input/background/body di Simple Design System | Tidak ada Code Connect; hasil library diperiksa. Fondasi lokal minimum dibuat sesuai brief |
| Penulisan variable/style/komponen/frame melalui use_figma | LULUS: 36 variable, 7 text style, 5 komponen lokal, 5 frame utama dan satu anotasi |
| get_screenshot dan tinjauan visual pertama | GAGAL awal: tinggi teks/auto-layout memotong dan menumpuk konten; belum dianggap selesai |
| Perbaikan text HEIGHT/HUG, axis sizing, lebar teks pemain mobile, spacing dan tinggi anotasi/mobile; screenshot ulang | LULUS visual setelah perbaikan. Ikon bom vektor + teks holder ditambahkan; screenshot kedua arena diperiksa ulang |
| Pembacaan hierarchy, node types, image fill, font family, bounds dan placeholder | LULUS: 5 frame utama, 261 descendant (139 TEXT, 32 INSTANCE, 30 VECTOR, 60 FRAME); anotasi 25 descendant; image fill kosong, fontProblems/boundsProblems kosong, placeholder false |
| Audit variable/scope/alias/code syntax/component properties | LULUS: mode Default, alias semantic ke primitive, scope eksplisit, syntax WEB var(); Label/Nama/Alamat/Status tersedia |
| Luminansi sRGB pada 8 pasangan palet yang digunakan | LULUS palet: white/navy 17,70; muted/raised 8,25; blue/raised 6,44; purple/raised 6,85; green/surface 10,51; red/surface 8,56; navy/orange 10,27; navy/yellow 14,68 |
| get_screenshot → Invoke-WebRequest -OutFile → view_image | LULUS: 6 PNG diekspor dan ditinjau; URL sementara tidak disimpan ke repository |
| Edit manual browser Figma, prototype interaktif, browser frontend, transaksi/testnet | BELUM DIUJI / BELUM ADA; tahap ini desain dan dokumentasi |

Token visual tidak mengubah SPEC. Data room/saldo/hasil ditandai contoh; bukti explorer nonaktif sampai ada receipt nyata. Tes kontrak dan runtime aplikasi pada tabel awal tetap BELUM DIUJI.

Pemeriksaan lokal setelah ekspor: ConvertFrom-Json untuk dua JSON, kecocokan inventory audit, dan System.Drawing.Image.FromFile untuk dimensi enam PNG lulus (desktop 1440 × 1000, mobile 390 × 1240, anotasi 1440 × 1050). Pemeriksaan inline pertama berhenti karena cara menghitung PSObject.Properties keliru; setelah memakai array count eksplisit, seluruh inventory lulus tanpa mengubah token/desain. Pemeriksaan ulang 10 Markdown, 22 tautan lokal dan code fence lulus; git diff --check bersih. Pemindaian pola kredensial, URL screenshot sementara dan session ID tidak menemukan kecocokan di berkas yang akan disimpan (pemeriksaan heuristik).

Checkpoint desain 24 Oktober 2026, 09.41 WIB: git diff --cached --check lulus; diff staged ditinjau dan pemindaian git grep --cached -I -l -E tidak menemukan pola kredensial/link sementara. git diff --exit-code HEAD -- SPEC.md AGENTS.md docs/BUILD-GUIDE.md docs/ARCHITECTURE.md exit 0, sehingga aturan/arsitektur tidak berubah. Commit design: add Figma screens and visual tokens menghasilkan f826af720c7ca88232bdd859d09df05a525e3076. git push origin main berhasil; git rev-parse HEAD cocok dengan git ls-remote origin refs/heads/main. git status --short --branch bersih. Bukti ini ditulis setelah checkpoint tersebut terbit; SHA pembaruan catatan dilaporkan sesudah commit/push final di chat.
