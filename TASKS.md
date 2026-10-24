# Rundown enam jam dan checklist

## Kelanjutan terbaru sampai Prompt 8 — 24 Oktober 2026 WIB

- [x] Investigasi awal peringatan domain MetaMask dari screenshot pengguna; siapkan draf review di `docs/references/METAMASK-REVIEW.md`. Pemeriksaan awal tidak membuktikan false positive.
- [ ] Peninjauan/remediasi domain dan konfirmasi peringatan sudah selesai sebelum koneksi/deploy dilanjutkan. Laporan belum dikirim; proteksi tetap aktif.

- [x] Baca panduan enam jam, cocokkan progres/Git dan Prompt 4; tahap terbukti tidak dibuat ulang. Verifikasi HP Tahap 1 tetap pending.
- [x] Baca PDF workshop integrasi Monad; simpan ringkasan aman di `docs/references/MONAD-BLITZ.md`.
- [x] Perbaiki pemulihan deploy saat refresh/timeout, blokir deploy ulang yang belum jelas, cocokkan receipt/init/runtime bytecode/blok/view, dan tambahkan CLI verifikasi read-only.
- [x] Build produksi, 22 tes Hardhat, 4 tes jurnal, Wrangler dry-run, deploy helper dan HTTP/bundle publik lulus; detail di TEST-RESULTS.md.
- [ ] Pengguna menyetujui deploy sekali melalui `/setup` atau memberikan hash yang sudah dikirim. Sudah diminta hash publik, bukan rahasia.
- [ ] Selesaikan Prompt 4 setelah receipt/code/view nyata terbukti, lalu lanjut Prompt 5, 6, 7, 8 berurutan. Simulasi bukan bukti gerbang publik selesai.
- [ ] Berhenti setelah Prompt 8; jangan menjalankan Prompt 9/submission.

Prompt Induk dan Prompt 0 selesai dengan checkpoint GitHub terverifikasi. Tahap 1 masih menunggu verifikasi HP; scaffold sudah dibuild dan URL publik merespons. Tahap 2 dan Tahap 3 selesai lokal; helper Tahap 4 sudah publik, tetapi deployment kontrak menunggu transaksi wallet pengguna. Persiapan UI Tahap 5 sekarang ada di lokal, belum diuji dengan dua wallet atau dideploy. Tahap 6 menunggu koneksi plugin Figma dan alamat kontrak terverifikasi. Centang hanya setelah kriteria tahap terbukti. Jadwal relatif; contoh waktu 12.00-18.00 bukan konfirmasi panitia. Checkpoint GitHub 1-2 menit termasuk dalam slot yang sama.

| Tahap | Slot | Syarat lulus |
|---|---|---|
| Induk + 0 | 00:00–00:20 | Dokumen/remote siap, Figma editable dan referensi tersimpan |
| 1 | 00:20–00:40 | Halaman awal publik dapat dibuka dari HP |
| 2 | 00:40–01:10 | Kontrak aturan inti berhasil compile |
| 3 | 01:10–01:30 | Tes perilaku/batas kontrak lulus dan gas tercatat |
| 4 | 01:30–02:00 | Deploy testnet dibuktikan receipt/code dan ABI sesuai |
| 5 | 02:00–03:00 | Wallet serta pengiriman aksi dua pemain berjalan |
| 6 | 03:00–04:00 | Lobby/arena/hasil dan satu ronde URL publik berjalan |
| 7 | 04:00–05:00 | Tes multiplayer, kasus gagal, refresh dan sinkronisasi tercatat |
| 8 | 05:00–05:30 | Build final, ronde final, README dan bukti demo |
| 9 | 05:30–06:00 | Presentasi, submission, dan bukti penerimaan |

- [x] Induk: baca/periksa dokumen, Git/remote tujuan, commit/push fondasi; SHA checkpoint cocok dengan origin/main (bukti di STATUS.md).
- [x] 0: Figma Opening/Lobby/Arena/Hasil desktop + Arena mobile, anotasi opening mobile/loading, URL/frame/tokens/preview; push desain dan SHA remote terverifikasi.
- [ ] 1: app scaffold, lockfile, .gitignore, .env.example, SPA hosting dan URL publik sudah tersedia; verifikasi buka dari HP masih pending.
- [x] 2: `BomOper.sol`, state machine/event/snapshot, expectedTurn, panas, deadline, compiler/EVM target dan guard chain 10143; compile, ABI, serta tes chain guard lulus. Full rule tests ada di Tahap 3.
- [x] 3: tes aturan dan batas lulus di simulasi chain ID 10143 dengan pengaturan timestamp jaringan; gas enam aksi dicatat di TEST-RESULTS.md. Bukan sleep dunia nyata.
- [ ] 4: helper `/setup` publik dan pra-pemeriksaan siap; menunggu pengguna menyetujui deploy 10143, lalu verifikasi receipt/code/view dan simpan record.
- [ ] 5: UI persetujuan EOA/sessionStorage 10 menit, saldo/funding ekstensi, budget gas dan guard aksi tersedia lokal di `/wallet`; belum ada deployment kontrak, receipt game, atau uji dua alamat. Fallback belum diaktifkan.
- [ ] 6: Pratinjau interaktif `/prototype` sudah dideploy; CTA, invite, panduan status, dan logo vektor minimal sudah diterapkan di landing/setup/demo. Room/oper/hasil tetap simulasi; gameplay kontrak, polling, settle, design context langsung lewat plugin, dan ronde publik belum ada. Tahap 6 belum lulus.
- [ ] 7: dua sampai empat konteks nyata, kasus gagal, hasil sama, perbaikan terbukti.
- [ ] 8: build/deploy final, cek HP/room link, ronde final, dokumentasi/video.
- [ ] 9: pitch dua menit, form resmi, bukti submission.

Pada tiap tahap: perbarui STATUS/tes, cek diff/rahasia, commit/push, verifikasi SHA remote dan laporkan di chat. Jangan mencentang hanya karena kode telah ditulis. Jika terlambat, kurangi pemolesan/target demo ke dua pemain; jangan hapus tes inti.

## Progres Prompt Induk — 24 Oktober 2026 WIB

- [x] Baca dokumen dan cocokkan dengan berkas aktual: paket awal berisi 10 Markdown tanpa kode game.
- [x] Inisialisasi repository lokal pada main; verifikasi root dan identitas author Git yang sudah tersedia.
- [x] Tambahkan .gitignore; periksa tautan dokumen, code fence, aturan ignore, dan pola kredensial (hasil aktual: TEST-RESULTS.md).
- [x] Periksa koneksi profil GitHub: akun terhubung salmanfidinillah.
- [x] Tetapkan repository tujuan dari jawaban pengguna: salmanfidinillah/monadproject; metadata plugin melaporkan izin push, origin dipasang dan git ls-remote berhasil (remote awal kosong).
- [x] Commit/push fondasi berhasil; SHA fddf27fcf121c0cc8cca9b26526f1c65137a1c25 sama dengan refs/heads/main di origin, diverifikasi 24 Oktober 2026 pukul 09.19 WIB.
- [x] Fondasi lengkap; menunggu Prompt 0 untuk desain Figma.

## Progres Prompt 0 — 24 Oktober 2026 WIB

- [x] Periksa koneksi/plan, buat file BOM OPER — MVP yang sebenarnya di Figma.
- [x] Buat Opening/Lobby/Arena/Hasil desktop serta Arena mobile sebagai layer editable.
- [x] Tambahkan anotasi responsif/loading/error/wallet/pending/gas/finalisasi/sesi.
- [x] Periksa visual dan struktur; perbaiki clipping; simpan 6 PNG, token, ID dan audit di docs/design/.
- [x] Commit/push acuan desain; SHA f826af720c7ca88232bdd859d09df05a525e3076 cocok dengan origin/main, 24 Oktober 2026 pukul 09.41 WIB.
- [x] Checkpoint selesai; menunggu Prompt 1.

## Catatan desain yang sudah tersedia

Revisi arcade lima layar dan storyboard motion sudah dibuat/diperiksa di Figma. Checklist tahap 0 belum dicentang penuh karena bukti commit/push dan kelengkapan flow setup belum tersedia di sini. Gunakan docs/design/MOTION.md sebagai acuan frontend berikutnya.

## Progres Tahap 1 ? 24 Oktober 2026 WIB

- [x] Memeriksa root/branch/remote, Node v24.13.1, npm 11.8.0 dan Git 2.54.0.
- [x] Membuat `app/` React/Vite/TypeScript; root workspace scripts; Hardhat config dengan `contracts/` dan `test/`; `deployments/` untuk bukti publik.
- [x] Membuat landing BOM OPER dengan aturan ringkas dan label target Monad Testnet, mengikuti palet arcade terbaru di `docs/design/README.md`.
- [x] Menyiapkan `wrangler.jsonc` untuk `app/dist` + SPA fallback, `.env.example`, dan lockfile.
- [x] Build lokal dan Wrangler dry-run lulus; deployment publik berhasil ke https://bom-oper.salmansegaf52.workers.dev; GET / dan /room/example merespons 200.
- [x] Login Cloudflare, pastikan Worker bom-oper belum ada pada akun terautentikasi, lalu deploy.
- [ ] Minta pengguna membuka URL publik melalui koneksi HP; Tahap 1 tetap belum lulus sampai verifikasi ini.

## Progres Tahap 2 - 24 Oktober 2026 WIB

- [x] Membuat `contracts/BomOper.sol` sesuai aturan SPEC; tidak ada pembayaran, saldo game, admin, atau randomisasi.
- [x] Mematok solc 0.8.30/EVM Cancun; simulated Monad test menggunakan chain ID 10143, network 31337 hanya untuk tes guard.
- [x] Compile, inspeksi ABI functions/events/snapshot, dan tes deploy di chain yang benar serta ditolak di chain yang salah.
- [x] Abaikan output TypeChain `types/` agar generated code tidak masuk checkpoint.
- [x] Tes seluruh aturan batas/gas diselesaikan di Tahap 3; kontrak belum dideploy ke Monad Testnet.

## Progres Tahap 3 - 24 Oktober 2026 WIB

- [x] Menambah tes aturan room, join/start, oper, expectedTurn basi setelah round-trip, hot pass, batas waktu, finalisasi, event/snapshot, isolasi room, dan chain guard; 16 tes Mocha lulus.
- [x] Kasus bersaing mengirim dua transaksi pending dengan nonce berurutan dalam satu blok: receipt pertama sukses, receipt kedua status 0. Kasus hot pada sisa 6 detik dan oper pada deadline juga menambang lalu memeriksa receipt status 0.
- [x] Waktu dimajukan dengan `networkHelpers.time.setNextBlockTimestamp`; tidak menggunakan sleep dunia nyata.
- [x] Catat gas receipt untuk create 142,383; join 75,827; start 83,139; pass normal 60,105; pass hot 68,881; settle 87,740. Nilai lokal simulasi, bukan estimasi biaya MON testnet.
- [x] `npm run contracts:test` lulus 16 passing; `npm run contracts:compile` lulus (`No contracts to compile`, artefak sudah terbangun).
- [ ] Tahap 4 deployment Monad Testnet masih belum dilakukan; verifikasi buka URL landing melalui HP masih menunggu pengguna.

## Progres Tahap 4 - helper siap, menunggu persetujuan wallet

- [x] `ethers` 6.17.0 tersedia eksplisit di workspace app; `contracts:export` menyalin ABI/bytecode/compiler/source fingerprint dari artifact Hardhat ke app.
- [x] Route `/setup` memakai wallet EIP-1193 yang terhubung setelah klik pengguna; tidak auto-connect, tidak auto-deploy, dan tidak meminta/menyimpan private key.
- [x] Pra-deploy memeriksa chain wallet dan RPC 10143, saldo akun, estimasi gas, dan fee saat itu; tombol deploy baru tersedia bila pemeriksaan lolos.
- [x] Sesudah receipt, helper memeriksa status transaksi, runtime code dan `nextRoomId()` melalui RPC serta menampilkan link MonadVision/record JSON.
- [x] Build Vite, Wrangler dry-run, deployment Worker `bom-oper`, GET publik `/` dan `/setup` lulus. URL helper: `https://bom-oper.salmansegaf52.workers.dev/setup`; version `8d168b42-2e07-4490-b7d2-eb8decd07841`.
- [ ] Pengguna membuka helper, menghubungkan akun Monad Testnet yang dananya cukup, memeriksa estimasi, lalu menyetujui transaksi deploy di wallet. Setelah itu record kontrak publik dan konfigurasi alamat bersama perlu dicatat, dibuild ulang, diuji, dan dipush.
