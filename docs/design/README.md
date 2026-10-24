# Desain Figma BOM OPER — MVP

Status 24 Oktober 2026 WIB: **Prompt 0 selesai; lima frame utama editable dibuat dan diperiksa** melalui plugin Figma. Commit desain f826af720c7ca88232bdd859d09df05a525e3076 berhasil di-push dan cocok dengan origin/main pada pukul 09.41 WIB. Bukti di STATUS.md; SHA commit catatan berikutnya dilaporkan di chat. Semua data permainan adalah contoh; belum ada transaksi atau game yang dapat dimainkan.

## File dan akses

- [BOM OPER — MVP](https://www.figma.com/design/T8zhiDboW04KOC9sDJrlz6), file key T8zhiDboW04KOC9sDJrlz6, page 01 · MVP / Desain & state (0:1).
- Hanya satu plan terdeteksi: salman fidinillah's team, tier student, role admin, seat terlapor View. API pembuatan file, penulisan layer, pembacaan ulang dan screenshot berhasil. Edit manual dari browser pengguna belum diuji terpisah.
- Skill: figma-create-new-file, figma-use, figma-generate-design, figma-generate-library untuk fondasi minimum.
- Tidak ada Code Connect, screen lama, atau library terpasang. Library tersedia diperiksa; button/input/background/body pada Simple Design System ditelusuri. Fondasi lokal dibuat sesuai palet dan state game dalam brief, tanpa mengimpor kit besar.

## Frame dan preview

| Frame | ID | Ukuran | Acuan |
|---|---|---|---|
| [Opening desktop](https://www.figma.com/design/T8zhiDboW04KOC9sDJrlz6?node-id=2-59) | 2:59 | 1440 × 1000 | Nama, bom vektor, aturan, Mulai Main/Cara Main, Monad Testnet; [PNG](previews/opening-desktop.png) |
| [Lobby desktop](https://www.figma.com/design/T8zhiDboW04KOC9sDJrlz6?node-id=2-60) | 2:60 | 1440 × 1000 | Consent/fund wallet, kapasitas 2/3/4, durasi 30/60, create/join, Waiting; [PNG](previews/lobby-desktop.png) |
| [Arena desktop](https://www.figma.com/design/T8zhiDboW04KOC9sDJrlz6?node-id=2-61) | 2:61 | 1440 × 1000 | Pemain melingkar, timer, holder ikon+teks, recipient, oper dan riwayat; [PNG](previews/arena-desktop.png) |
| [Hasil desktop](https://www.figma.com/design/T8zhiDboW04KOC9sDJrlz6?node-id=2-62) | 2:62 | 1440 × 1000 | Loser, survivors, tempat bukti explorer dan room baru; [PNG](previews/hasil-desktop.png) |
| [Arena mobile](https://www.figma.com/design/T8zhiDboW04KOC9sDJrlz6?node-id=2-63) | 2:63 | 390 × 1240 | Pemain 2 × 2, kontrol bertumpuk, tombol 52 px, riwayat; [PNG](previews/arena-mobile.png) |

[Anotasi state & responsif](https://www.figma.com/design/T8zhiDboW04KOC9sDJrlz6?node-id=2-64), ID 2:64, 1440 × 1050; [preview anotasi](previews/annotations.png). Ini satu area catatan, bukan frame tambahan untuk setiap state.

PNG adalah ekspor referensi dari Figma. Sumber desain editable berupa teks, frame auto-layout, vektor dan instance komponen berada di Figma. Frontend berikutnya harus membangun kontrol nyata, bukan memasang PNG sebagai UI.

## Token aktual

[tokens.json](tokens.json) memuat warna, spacing, radius, typography, ID text style dan variable. [figma-audit.json](figma-audit.json) menyimpan hasil pembacaan ulang struktur Figma, ID komponen, alias, scope dan code syntax. URL screenshot sementara, email akun dan session ID tidak disimpan.

| Peran | Nilai |
|---|---|
| Background / surface / raised | #0B1020 / #141C31 / #1C2842 |
| Border | #344563 |
| Teks utama / sekunder | #F5F7FF / #B6C3DA |
| Primary / highlight | #FFAE45 / #FFE08A |
| Player blue / purple | #82ABFF / #BEA2FF |
| Success / danger | #78DFB6 / #FF9DA5 |
| Spacing | 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64 px |
| Radius tombol & kartu pemain / panel & badge | 12 / 20 px |
| Padding desktop / mobile | 64 / 20 px |
| Tinggi tombol | 52 px |

| Text style | Font / weight | Size / line-height |
|---|---|---|
| Display | Space Grotesk Bold | 64 / 70 px |
| Heading | Space Grotesk Bold | 40 / 48 px |
| Title | Space Grotesk Bold | 24 / 30 px |
| Timer | Space Grotesk Bold | 80 / 88 px |
| Body | Inter Regular | 16 / 24 px |
| Label | Inter Semi Bold | 16 / 22 px |
| Caption | Inter Regular | 12 / 18 px |

Font dan nama style diverifikasi dengan listAvailableFontsAsync. Tidak ada font produk lama untuk diwarisi. Koleksi BOM OPER / MVP memiliki 36 variable, mode Default: 12 warna primitive, 12 alias warna semantic, 12 nilai ukuran. Syntax WEB memakai var().

Komponen minimum pada section 2:46: Button/Primary (2:47), Secondary (2:49), Hot (2:51), Disabled (2:53), Player/Card (2:55). Tombol mempunyai property Label; kartu mempunyai Nama, Alamat, Status. Tidak ada design system besar atau publikasi library.

## Responsif dan state

- Opening mobile ≤720 px: satu kolom, padding 20, judul 40/48, bom 180 px, tombol lebar penuh; aturan bertumpuk. Tablet 721–1023 px memakai dua kolom bila muat. Desktop mulai 1024 px dengan konten maksimum 1312 px. Arena mobile memakai kartu pemain 2 × 2 demi keterbacaan.
- Mulai Main menuju lobby; Cara Main membuka aturan. Link room langsung ke room setelah persiapan. Opening tidak meminta wallet otomatis atau memulai countdown.
- Loading hanya saat membaca data; gagal baca menyediakan Coba Lagi yang hanya membaca ulang. Tidak ada delay wajib atau persentase palsu.
- Persetujuan wallet, pending receipt, kurang gas, giliran orang lain dan menunggu finalisasi memiliki pesan berbeda dalam anotasi. Saat pending, kunci aksi; perpindahan resmi menunggu receipt sukses + snapshot.
- Saat waktu habis, cek waktu chain lalu settle sekali atau sediakan Finalisasi. Finished berasal dari kontrak. Sesi hilang/expired menjadi penonton, tanpa mengganti identitas room aktif.
- Gerak bom ringan pada implementasi; prefers-reduced-motion mematikan animasi. Animasi aktual/prototype interaktif belum dibuat atau diuji.

## Prioritas implementasi dan batasnya

1. Prompt 1 memakai token opening untuk halaman publik sederhana dan hosting SPA.
2. Pada Prompt 6, baca frame melalui plugin dan skill design-to-code, bangun kontrol nyata lalu bandingkan browser dengan Figma.
3. Utamakan lobby, arena, wallet/gas dan status receipt yang benar. Pemolesan animasi menyusul alur nyata.
4. Lobby memperlihatkan cakupan consent serta contoh sesi aktif dalam satu frame. Implementasi harus menampilkan panel sesuai fase aktual: alamat/saldo aktif baru sesudah persetujuan, tanpa membuat wallet otomatis.
5. Lobby berisi contoh kapasitas 3; arena memperlihatkan contoh room lain berisi 4. UI nyata wajib mendukung kapasitas 2/3/4 serta durasi 30/60; contoh tidak mengubah aturan.

Kontrak, hash, receipt dan URL game belum tersedia. Hasil berlabel DATA CONTOH, BUKAN RECEIPT; tombol bukti nonaktif sampai ada transaksi nyata. Belum ada uji browser frontend, perangkat, aksesibilitas interaktif atau transaksi.

## Hasil pemeriksaan

Lima frame utama memiliki 261 descendant: 139 TEXT, 32 INSTANCE, 30 VECTOR, 60 FRAME. Anotasi memiliki 25 descendant. Tidak ada image fill pada keenam area. Audit akhir melaporkan fontProblems = [] dan boundsProblems = []; semua placeholder selesai. Clipping/tumpang tindih awal diperbaiki melalui text HEIGHT/HUG serta axis auto-layout, lalu screenshot area terkait diperiksa lagi.

Delapan pasangan warna teks yang dipakai diperiksa dengan luminansi sRGB: rasio 6,44–17,70. Ini pemeriksaan palet, bukan audit aksesibilitas aplikasi. Hasil aktual dicatat di TEST-RESULTS.md.
