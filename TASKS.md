# Rundown enam jam dan checklist

## Status sekarang - alur live, 24 Oktober 2026 WIB

- [x] `/play` terhubung ke kontrak Monad Testnet untuk baca room dan transaksi create/join/start/pass/settle.
- [x] Mode permainan simulasi `/prototype` dan tautan menuju simulasi dihapus dari aplikasi. Artwork kartun yang dipakai arena live tetap tersedia.
- [x] Build akhir, publikasi perubahan tanpa mode simulasi, dan cek URL publik. Worker versi `f8fd2923-5e65-44f7-9c1c-ecfc066fd6e4`; bundle live tersedia, chunk/rute simulasi tidak.
- [x] Rapikan halaman depan repo: README baru dengan aturan, cara main, stack, status bukti, gambar konsep berlabel, tautan Figma/LinkedIn/GitHub/game; topik GitHub `monad` dan tautan Website game disimpan.
- [ ] Dua wallet terpisah memainkan satu ronde sampai `Finished`; simpan receipt pass dan finalisasi.
- [ ] QA perangkat/browser terpisah dan pastikan refresh link room berfungsi.

MVP belum boleh disebut teruji sebelum ronde live dua pemain punya receipt dan hasil kontrak `Finished`. Riwayat di bawah ini mencatat checkpoint sebelumnya; status di atas adalah ringkasan terkini.

## Checkpoint metadata repository GitHub - 24 Oktober 2026 WIB

- [x] About repo tetap memuat deskripsi ringkas BOM OPER dan URL game publik.
- [x] Topik repo diverifikasi di halaman publik: `monad`, `monad-testnet`, `web3`, `blockchain`, `smart-contracts`, `web3-gaming`, `multiplayer-game`, `solidity`, `typescript`, `react`.
- [x] README menyediakan tautan game, desain Figma, profil/repository GitHub, LinkedIn, dan video explainer; status receipt multiplayer tetap dijelaskan.

## Checkpoint video explainer - 24 Oktober 2026 WIB

- [x] Dibuat video explainer berbahasa Inggris, sekitar 30 detik, 1280×720, dengan voiceover dan tautan unduh dari README.
- [x] Naskah menjelaskan aturan BOM OPER, Monad sebagai L1 kompatibel EVM dengan eksekusi paralel, dan integrasi testnet yang ada.
- [x] Status penutup menyatakan receipt ronde multiplayer belum dibuktikan; visual arena/hasil ditandai sebagai konsep desain.
- [ ] Ronde dua wallet publik, receipt oper/finalisasi, dan status `Finished` tetap perlu dibuktikan terpisah.

## Checkpoint tampilan repository - 24 Oktober 2026 WIB

- [x] README disusun ulang sebagai halaman pengenalan proyek dengan tautan game live, Figma editable, profil/repository GitHub, LinkedIn, Monad Testnet, kontrak dan panduan main.
- [x] GitHub About Website diarahkan ke game publik dan repository topic `monad` ditambahkan melalui halaman repo.
- [ ] Acceptance MVP multiplayer tetap terbuka; dokumentasi ini tidak menambah bukti receipt gameplay.

## Kelanjutan terbaru sampai Prompt 8 — 24 Oktober 2026 WIB

Instruksi pengguna terbaru sekarang mengotorisasi Prompt 9. Catatan historis yang meminta berhenti di Prompt 8 telah digantikan; submission masih menunggu bukti ronde live dan tautan form resmi.

- [x] Prompt 5 implementasi lokal: sesi EOA 10 menit, biaya/gas diperiksa saat aksi, transaksi ditandatangani lokal dan hash disimpan sebelum broadcast, receipt/pemulihan, room aktif mengikat identitas.
- [x] Prompt 6 implementasi lokal: route `/play` membuka Opening/Lobby/Arena/Hasil dari snapshot Monad, create/join/start/pass/finalisasi, tautan room, poll dan refresh, error yang dapat dipahami, gerak oper setelah receipt/snapshot, reduced motion.
- [x] Build, 23 tes Hardhat, 15 tes recovery, Wrangler dry-run, dan verifikasi ulang kontrak publik lulus. Bukti rinci di `TEST-RESULTS.md`.
- [ ] Prompt 5–7 belum lulus acceptance: belum ada dua wallet berbeda yang memainkan ronde sampai `Finished`; kasus gagal dan receipt oper/settle belum diuji publik.
- [x] Prompt 8 build/deploy frontend ke Worker yang sama; versi `dc4678cf-4b64-4904-bd43-aa6bb4540acf`. URL `/`, `/play`, `/play?room=1`, dan bundle gameplay merespons HTTP 200.
- [ ] Prompt 8 ronde final dua pemain, operan dan finalisasi masih belum terbukti. Jangan menyatakan MVP selesai sebelum receipt nyata.
- [ ] Fallback 60 detik, pemeriksaan browser HP terpisah, dan bukti video belum dilakukan. Prompt 9 hanya disiapkan sampai bukti dan tujuan resmi tersedia.

## Kelanjutan hardening wallet dan inspeksi Figma — 24 Oktober 2026 WIB

- [x] Inspeksi visual frame Opening, Lobby, Arena desktop, Hasil, dan Arena mobile pada file Figma yang disambungkan pengguna. Tidak mengedit file desain.
- [x] Perbaiki urutan kirim transaksi wallet bermain: sign lokal, simpan hash/nonce pending sebelum broadcast, lalu tunggu receipt.
- [x] Build TypeScript/Vite dan ekspor artifact kontrak lulus setelah perubahan.
- [ ] API design-context Figma belum tersedia di daftar tool Codex, dan gameplay belum memanggil kontrak. Lanjutkan integrasi room/snapshot/transaksi; jangan menandai Prompt 5–6 selesai sebelum bukti on-chain.

## Hasil pemeriksaan repo — 24 Oktober 2026

- [x] Cocokkan dokumen status, berkas proyek, branch dan origin; tiga berkas lokal belum terlacak dijaga tetap di luar checkpoint.
- [x] Verifikasi lokal ulang: build, 23 tes Hardhat, 15 tes pemulihan, dan Wrangler dry-run lulus; catatan di `TEST-RESULTS.md`.
- [x] Periksa advisori dependency: production audit 0; full audit 16 advisori dev tooling (14 high, 2 moderate). Upgrade belum dilakukan karena kompatibilitas/fix belum ditetapkan.
- [x] Verifikasi receipt deploy yang diberikan pengguna; simpan record publik dan gunakan alamat terverifikasi sebagai konfigurasi build.
- [ ] Status warning MetaMask masih belum jelas. Lanjutkan wallet/gameplay, QA browser/Figma dan HP, uji minimal dua pemain sampai Finished, lalu Prompt 8. Jangan masuk Prompt 9.

## Kelanjutan terbaru sampai Prompt 8 — 24 Oktober 2026 WIB

- [x] Investigasi awal peringatan domain MetaMask dari screenshot pengguna; siapkan draf review di `docs/references/METAMASK-REVIEW.md`. Pemeriksaan awal tidak membuktikan false positive.
- [ ] Peninjauan/remediasi domain masih belum selesai dan laporan belum dikirim. Pengguna kemudian memilih melanjutkan sendiri; ini bukan bukti warning sudah diperbaiki. Agen tidak mengubah proteksi wallet.
- [x] Tangani error pengiriman rate limited: dua RPC read-only, error singkat, panduan RPC wallet, guard coba ulang manual dengan nonce/pengirim sama; 23 tes Hardhat + 15 tes pemulihan lulus, helper terbaru dideploy.
- [x] Pengguna memberikan hash deploy publik; receipt/code/view kemudian diverifikasi ulang di RPC Monad Testnet.

- [x] Baca panduan enam jam, cocokkan progres/Git dan Prompt 4; tahap terbukti tidak dibuat ulang. Verifikasi HP Tahap 1 tetap pending.
- [x] Baca PDF workshop integrasi Monad; simpan ringkasan aman di `docs/references/MONAD-BLITZ.md`.
- [x] Perbaiki pemulihan deploy saat refresh/timeout, blokir deploy ulang yang belum jelas, cocokkan receipt/init/runtime bytecode/blok/view, dan tambahkan CLI verifikasi read-only.
- [x] Build produksi, 22 tes Hardhat, 4 tes jurnal, Wrangler dry-run, deploy helper dan HTTP/bundle publik lulus; detail di TEST-RESULTS.md.
- [ ] Pengguna menyetujui deploy sekali melalui `/setup` atau memberikan hash yang sudah dikirim. Sudah diminta hash publik, bukan rahasia.
- [x] Gerbang publik Prompt 4 selesai dengan receipt/code/view nyata; lanjut Prompt 5, 6, 7, 8 berurutan. Simulasi bukan bukti gameplay publik selesai.
- [x] Catatan lama berhenti setelah Prompt 8 berlaku saat itu; digantikan oleh permintaan terbaru untuk lanjut sampai submission.

Prompt Induk dan Prompt 0 selesai dengan checkpoint GitHub terverifikasi. Tahap 1 masih menunggu verifikasi HP; scaffold sudah dibuild dan URL publik merespons. Tahap 2 dan Tahap 3 selesai lokal. Kontrak Tahap 4 sudah terbit dan receipt/code/view terverifikasi; konfigurasi alamat bersumber dari record tersebut. Wallet Tahap 5 dan gameplay nyata belum diuji. Tahap 6 masih menunggu implementasi/QA; plugin Figma tidak tersedia di sesi ini. Centang hanya setelah kriterianya terbukti. Jadwal relatif; contoh waktu 12.00-18.00 bukan konfirmasi panitia.

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
- [x] 4: deployment testnet dibuktikan receipt/code/view; record tersimpan di `deployments/10143.json`, konfigurasi build hanya menerima record yang cocok source/compiler.
- [ ] 5: UI EOA/sessionStorage 10 menit, saldo/funding ekstensi, budget gas dan guard aksi tersedia lokal di `/wallet`; belum diuji dengan dua alamat atau receipt game. Fallback belum diaktifkan.
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
