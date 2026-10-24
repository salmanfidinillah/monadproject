# BOM OPER — revisi arcade dan acuan animasi

Revisi dibuat pada file Figma pengguna. Halaman lama dipertahankan; halaman baru bernama **02 · Arcade / Karakter & animasi**. Ini desain editable dan storyboard animasi, belum game yang terhubung ke wallet/Monad. Label room, timer, pemain dan hasil adalah contoh.

## Buka desain

| Bagian | Frame | Tautan |
|---|---|---|
| Opening | 11:183 | [Opening arcade](https://www.figma.com/design/T8zhiDboW04KOC9sDJrlz6/BOM-OPER?node-id=11-183) |
| Lobby / ruang tunggu | 11:309 | [Lobby arcade](https://www.figma.com/design/T8zhiDboW04KOC9sDJrlz6/BOM-OPER?node-id=11-309) |
| Arena desktop | 11:423 | [Arena arcade](https://www.figma.com/design/T8zhiDboW04KOC9sDJrlz6/BOM-OPER?node-id=11-423) |
| Hasil | 11:559 | [Hasil arcade](https://www.figma.com/design/T8zhiDboW04KOC9sDJrlz6/BOM-OPER?node-id=11-559) |
| Arena HP | 11:623 | [Arena HP](https://www.figma.com/design/T8zhiDboW04KOC9sDJrlz6/BOM-OPER?node-id=11-623) |
| Storyboard motion | 11:755 | [Oper → tangkap → ledakan](https://www.figma.com/design/T8zhiDboW04KOC9sDJrlz6/BOM-OPER?node-id=11-755) |
| Catatan implementasi | 11:1051 | [Arahan motion](https://www.figma.com/design/T8zhiDboW04KOC9sDJrlz6/BOM-OPER?node-id=11-1051) |

File key: `T8zhiDboW04KOC9sDJrlz6`. Page ID: `11:60`. Desktop 1440 × 900; arena mobile 390 × 844. Komponen lokal dan token berada di halaman revisi yang sama.

## Arah visual baru

- Kartun arcade dengan arena melayang, lapisan tepi ungu, lantai kuning, langit teal, outline tinta gelap dan bayangan tegas.
- Empat karakter terpisah yang bisa diedit: oranye, cyan, ungu, pink. Pemain tampil sebagai karakter di arena; kartu hanya untuk dialog/setup yang memang perlu.
- Bom memiliki shell, kilap, collar, sumbu dan percikan yang terpisah. UI, karakter, arena dan teks dibuat sebagai layer/instance editable, tanpa screenshot UI yang diratakan.
- Judul memakai **Lilita One Regular**; HUD/tombol memakai **Nunito ExtraBold**; penjelasan memakai **Nunito Regular**. Font tersebut sudah tersedia dan diperiksa pada file ini.
- Opening memberi porsi besar ke judul dan adegan permainan, dengan Mulai Main/Cara Main. Informasi detail wallet disampaikan ketika setup, bukan memenuhi hero atau arena.
- Lobby yang dibuat adalah contoh ruang tunggu. Implementasi tetap perlu create/join room, pilihan kapasitas/durasi dan dialog persetujuan/funding sesuai SPEC. Tombol setup/dialog tersebut belum dirancang sebagai frame baru pada revisi ini; gunakan flow fungsional yang sudah ada, lalu sesuaikan visualnya.

## Animasi yang sudah dibuat di Figma

Frame Motion memiliki timeline **5,4 detik**. Ini storyboard gerak, bukan simulasi aturan pertandingan atau bukti transaksi.

| Waktu konsep | Gerak |
|---|---|
| 0–0,7 detik | Bom di tangan pengirim |
| 0,7–1,5 detik | Bom mengikuti lintasan melengkung dan berputar menuju penerima |
| 1,3–1,7 detik | Penerima memantul singkat ketika menangkap |
| 2,7–3,2 detik | Karakter bergetar sebagai contoh ketegangan |
| 3,1–3,6 detik | Starburst dan partikel, bom menghilang |
| 3,2–5,2 detik | Asap membesar, naik dan memudar |

Opening juga memiliki keyframe gerak ringan pada bom. Video motion diekspor 768 × 480 pada 6 fps untuk pemeriksaan enam fase; ini preview hemat ukuran, bukan target frame rate game. Kelancaran game web perlu diperiksa terpisah pada perangkat nyata.

## Implementasi game yang tetap diperlukan

Figma tidak otomatis menghasilkan game atau animasi runtime. Implementasikan aset, layout dan timing sebagai animasi web. Pertahankan stack React/Vite/TypeScript + ethers dan kontrak yang sudah disepakati. Aset vector/layer dapat diekspor dan digerakkan dengan CSS/Web Animations; tidak perlu menambahkan engine 3D atau physics untuk revisi visual ini.

Pada game nyata:

1. Pemilihan penerima menandai karakter lain dengan ring/pointer dan label; semua target juga punya kontrol keyboard/touch yang dapat diakses.
2. Saat transaksi pending, tampilkan pose siap lempar dan status proses. Holder belum berubah. Transaksi ditolak berarti pose kembali tanpa mengaku bom berpindah.
3. Setelah receipt sukses dan snapshot diperbarui, jalankan lemparan lengkung sekitar 450–600 ms, putaran dan tangkapan 120–180 ms. Status dan input selalu mengikuti snapshot terbaru, termasuk bila ada aksi berikutnya ketika animasi masih berjalan. Jangan menunda pembacaan chain demi menyelesaikan animasi.
4. Oper panas memperkuat jejak/percikan dan mengurangi tampilan deadline hanya setelah konfirmasi. Aturan sekali per pemain serta sisa >6 detik tetap dari kontrak.
5. Saat perkiraan timer habis, tampilkan menunggu finalisasi. Ledakan hasil dan karakter kalah hanya setelah kontrak Finished. Storyboard tidak boleh digunakan sebagai timer otomatis yang menentukan loser lokal.
6. Hormati reduced motion: ganti lempar/rotasi/getar besar dengan transisi posisi singkat dan label status. Jangan menyalakan audio tanpa tindakan pengguna. Tidak ada white flash cepat atau camera shake wajib.
7. Loading mengikuti pekerjaan nyata; tidak ada persentase palsu, delay wajib atau popup wallet pada opening. Link room langsung menuju room setelah persiapan.

## Prompt revisi untuk AI implementasi

```text
Lanjutkan BOM OPER yang sudah ada. Baca AGENTS.md, SPEC.md, TASKS.md dan STATUS.md, lalu docs/design/README.md serta docs/design/MOTION.md. Pertahankan aturan kontrak, konfigurasi jaringan, alamat kontrak yang terverifikasi dan progres implementasi. Fokus tahap ini pada revisi visual arcade dan animasi; jangan membuat proyek/kontrak baru.

Sumber desain adalah Figma file T8zhiDboW04KOC9sDJrlz6, halaman 11:60. Opening 11:183; lobby 11:309; arena 11:423; hasil 11:559; mobile 11:623; storyboard motion 11:755. Baca skill Figma design-to-code sebelum get_design_context. Ambil design context dan screenshot frame relevan; untuk gerak, baca motion context sesuai alat/skill yang tersedia. Jangan memakai halaman dashboard lama sebagai acuan visual utama.

Wujudkan permainan kartun: karakter terpisah di arena melayang, perspektif lantai dan bayangan, outline tegas, tipografi Lilita One/Nunito, bom dengan sumbu/percikan, tombol arcade besar. Jangan mengganti karakter menjadi kartu nama, menambahkan sidebar dashboard atau memenuhi arena dengan istilah teknis wallet. Gunakan aset/layer dari Figma; jangan menjadikan screenshot seluruh layar sebagai background pengganti UI.

Implementasikan idle ringan, antisipasi pending, lemparan bom melengkung/rotasi setelah receipt sukses, reaksi tangkap, efek oper panas, dan ledakan/asap hasil setelah Finished on-chain. Semua efek harus terikat state sebenarnya. Sediakan reduced motion serta interaksi touch/keyboard. Animasi tidak boleh memblokir sinkronisasi atau mengganti hasil kontrak. Pertahankan create/join dan wallet consent melalui setup/dialog yang mudah dipahami.

Periksa desktop dan HP, loading/error, pending/revert, urutan animasi saat snapshot cepat, serta alur satu ronde nyata jika integrasi sudah tersedia. Bedakan preview desain dari game Monad. Perbarui dokumen progres dan hasil tes aktual. Commit/push perubahan bermakna sesuai aturan proyek dan verifikasi SHA remote; jangan mengaku sudah push atau sudah menguji jika belum ada bukti.
```

## Verifikasi revisi desain

Komposisi opening, lobby, arena, hasil dan mobile diperiksa melalui screenshot. Perbaikan dilakukan untuk label tombol yang meluber, penempatan pemain terhadap timer, ring target, footer mobile dan kontras judul hasil. Layer UI tetap editable. Ekspor motion diperiksa pada enam titik waktu untuk lemparan, tangkapan, starburst dan asap. Integrasi wallet, transaksi, pengujian multiplayer, push GitHub dan deployment game belum dilakukan pada pekerjaan desain ini.

Preview animasi untuk dilihat pengguna juga tersedia pada **1024 × 640, 24 fps**, dengan durasi sekitar 5,4 detik. Pemeriksaan file dan pembacaan enam fase berhasil. Video ini tetap storyboard visual, bukan rekaman transaksi atau benchmark game.
