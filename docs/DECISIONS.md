# Keputusan dan perubahan

Tabel ini memuat keputusan rencana dari pengguna/panduan dan status aktual proyek. Kontrak BomOper dan tes aturan Tahap 3 tersedia lokal; integrasi wallet dan deployment kontrak belum dijalankan.

| Keputusan rencana | Alasan | Status |
|---|---|---|
| Satu ronde 2-4 pemain, creator holder pertama | Lingkup enam jam, tanpa kebutuhan randomness | Diimplementasikan dan tes aturan lulus secara lokal pada Tahap 3 |
| Aturan/hasil di kontrak Monad | Semua pemain memakai state bersama yang dapat diperiksa | Kontrak dan tes aturan tersedia lokal; kontrak belum dideploy |
| Frontend statis tanpa backend | Mengurangi komponen yang perlu dibangun/deploy | Direncanakan |
| Figma sebelum UI, sekitar20menit | Acuan visual konkret dan editable | Lima frame editable dibuat dan diperiksa pada Prompt 0 |
| Opening + loading nyata sebelum lobby | Sambutan game dan status persiapan yang mudah dipahami; tanpa menambah waktu buatan | Diminta pengguna, belum diimplementasikan |
| Commit/push tiap prompt bermakna | Riwayat pembangunan nyata dan pemulihan konteks | Diterapkan pada Prompt Induk; checkpoint fondasi terverifikasi |
| Dokumen sejak awal dan AGENTS sebagai pengarah | Codex di VS Code dapat melanjutkan dengan konteks berkas | Paket dokumen tersedia |
| EOA sementara testnet/sessionStorage10menit | Mengurangi popup saat demo; kompromi prototipe | Direncanakan, belum diuji |
| Fallback ekstensi+60detik | Jika wallet bermain belum stabil jam ketiga | Belum diaktifkan |
| Minimum demo dua pemain nyata | Jika empat konteks belum stabil | Belum diaktifkan |

Setiap perubahan berikutnya mencatat waktu aktual, pemicu, pilihan, alasan, dampak pada SPEC/UI/tes/jadwal, dan bukti. Jika pengguna mengubah lingkup, sinkronkan dokumen terkait. Jangan diam-diam mengganti aturan/durasi/identitas atau menyebut fallback sebagai target asli yang sudah selesai.

## 24 Oktober 2026 WIB - compiler dan guard jaringan Tahap 2

- Pilihan: solc 0.8.30, optimizer 200 runs, EVM target Cancun; Hardhat 3.21.0 membangun artefak dan tes pada EDR simulated network ber-chain ID 10143. Network lokal 31337 terpisah hanya untuk membuktikan constructor menolak chain yang salah.
- Verifikasi RPC publik Monad Testnet: POST `eth_chainId` ke `https://testnet-rpc.monad.xyz` mengembalikan decimal 10143; Hardhat remote config mengharapkan chain ID yang sama.
- Dasar: [Monad Deployment Summary](https://docs.monad.xyz/developer-essentials/summary) menyatakan opcode EVM hingga Fusaka didukung; compiler Cancun adalah target konservatif yang kompatibel, dan tersedia sebagai target di [Solidity 0.8.30 compiler docs](https://docs.soliditylang.org/en/v0.8.30/using-the-compiler.html). [Hardhat Configuration](https://hardhat.org/docs/reference/configuration) mendokumentasikan `evmVersion`, `chainId`, serta Cancun pada jaringan simulasi. Keduanya diverifikasi dengan kompilasi dan tes aktual.
- Referensi pengguna: slide workshop Monad Blitz mencantumkan Monad Testnet chain ID 10143, MON, dan RPC `testnet-rpc.monad.xyz`; deployment tidak dilakukan di tahap ini. Instruksi slide tentang deployment tidak menggantikan tahap 4/persetujuan pengguna. Informasi akses venue pada dokumen tidak disalin ke repo.
- Dampak: constructor menolak deployment selain chain 10143. Tes acceptance rules Tahap 3 lulus di simulasi lokal; belum ada kontrak di testnet.

## 24 Oktober 2026 WIB - pengujian aturan Tahap 3

- Pilihan: menguji perilaku pada simulasi Hardhat chain ID 10143 dengan helper pengaturan timestamp; untuk kasus batas dan dua transaksi bersaing, matikan automine sementara, tambang blok, lalu periksa receipt sukses/gagal.
- Alasan: membuktikan deadline tepat, hot-window tepat 6 detik, dan hasil transaksi kompetitif tanpa sleep dunia nyata atau sekadar membuat objek transaksi.
- Dampak: 16 tes lokal lulus; receipt gas enam aksi dicatat di `TEST-RESULTS.md`. Ini bukti simulasi saja, belum bukti deploy atau biaya aktual di Monad Testnet.

## 24 Oktober 2026 WIB - helper deployment Tahap 4

- Pilihan: helper deploy dipublikasikan di route `/setup` pada Worker BOM OPER yang sama. ABI, bytecode, compiler metadata dan fingerprint source dihasilkan dari artifact Hardhat; ethers v6.17.0 menjadi dependency app langsung.
- Dasar integrasi: [Monad Testnet Network Information](https://docs.monad.xyz/developer-essentials/testnet), [Monad Block Explorers](https://docs.monad.xyz/tooling-and-infra/block-explorers), dan [ethers v6 documentation](https://docs.ethers.org/v6/); live RPC `eth_chainId` tetap dicek oleh helper/runtime.
- Keamanan/alur: koneksi wallet hanya setelah tombol ditekan; halaman memeriksa chain wallet/RPC, saldo akun dan estimasi gas/fee sebelum menampilkan tombol deploy. Transaksi kontrak hanya dikirim setelah pengguna menekan tombol dan menyetujui pop-up wallet; tak ada private key di app, env, atau log.
- Setelah receipt rencana pemeriksaan runtime code dan view `nextRoomId()` melalui RPC publik, lalu pengguna mengunduh record. Belum ada record `deployments/10143.json` karena belum ada receipt; alamat tidak diisi placeholder.
- Dampak: helper tersedia di URL publik `https://bom-oper.salmansegaf52.workers.dev/setup`. Kontrak testnet, konfigurasi alamat bersama frontend, dan verify source menunggu hasil transaksi nyata.

## 24 Oktober 2026 WIB — fondasi Prompt Induk

- Pemicu: pengguna mengirim Prompt Induk dan meminta fondasi dokumen serta checkpoint GitHub sebelum Prompt 0.
- Pilihan: gunakan folder dokumen ini sebagai root repository lokal pada branch main, pertahankan spesifikasi serta catatan awal, dan tambahkan .gitignore sebelum staging.
- Alasan: pemeriksaan awal membuktikan folder belum menjadi repository dan belum berisi implementasi. Tidak ada proyek, remote, atau deployment lama yang diubah.
- Tujuan remote menunggu input pengguna; profil GitHub yang terhubung tidak dianggap sebagai pilihan repository atau bukti izin push. Simpan checkpoint lokal sambil menunggu tujuan yang eksplisit.
- Dampak: aturan game, stack, UI rencana, dan urutan tahap tetap mengikuti SPEC serta BUILD-GUIDE. Prompt Induk belum selesai sampai push diverifikasi; desain Figma dan kode dikerjakan pada prompt berikutnya.
- Bukti: STATUS.md dan TEST-RESULTS.md mencatat perintah serta hasil pemeriksaan aktual; SHA commit dilaporkan di chat sesudah commit dijalankan.

Pembaruan: pengguna memilih salmanfidinillah/monadproject melalui URL repository. Metadata serta git ls-remote membuktikan remote awal kosong dan default branch main; origin lokal ditetapkan ke URL yang diberikan. Tidak ada perubahan pilihan stack atau aturan permainan.

Hasil: pada 24 Oktober 2026 pukul 09.19 WIB, push fondasi berhasil dan SHA lokal cocok dengan origin/main. Bukti commit yang sudah terbit tersimpan di STATUS.md dan TEST-RESULTS.md. Prompt Induk selesai; menunggu Prompt 0 sesuai urutan yang diminta.

## 24 Oktober 2026 WIB — Prompt 0, acuan visual

- Pengguna meminta lima frame editable sebelum frontend. Satu plan terdeteksi; create/read/write berhasil pada file baru BOM OPER — MVP, tanpa perubahan izin akun.
- Tidak ada codebase, Code Connect, screen lama atau library terpasang. Library komunitas diperiksa; fondasi game minimum dibuat lokal agar palet dan state mengikuti brief tanpa library besar.
- Font Space Grotesk Bold untuk judul/timer, Inter untuk isi/kontrol; nama font/style diverifikasi. Token aktual di docs/design/tokens.json.
- Auto-layout mengatur konten berkaitan; tombol/kartu memakai instance; bom berupa SVG vektor editable. Arena desktop melingkar, mobile 2 × 2 demi keterbacaan.
- Tidak mengubah SPEC, durasi, jatah panas, expectedTurn atau finalisasi. Mock berlabel tanpa receipt palsu. Consent/reduced motion/responsive/state transaksi perlu diuji pada tahap frontend.
- Bukti URL/node/preview di docs/design/README.md; audit JSON tersimpan. Checkpoint Git desain dicatat setelah commit/push dan pencocokan SHA dijalankan.

Checkpoint desain berhasil di-push pada 24 Oktober 2026 pukul 09.41 WIB, SHA lokal cocok dengan remote. Prompt 0 selesai; tahap berikutnya Prompt 1 sesuai instruksi pengguna. Belum ada perubahan stack, aturan, implementasi game atau deployment.

## Revisi terbaru pengguna

Pengguna tetap memilih BOM OPER dan meminta visual terasa seperti game. Arah navy/kartu dashboard diganti arcade kartun; file Figma yang sama ditambah halaman revisi, halaman lama dipertahankan. Dibuat karakter, arena, opening/lobby/hasil/mobile dan storyboard gerak. Implementasi game menyusul tanpa perubahan aturan.

## 24 Oktober 2026 WIB ? Tahap 1

- Pilihan: satu repository npm dengan Vite di `app/`; Hardhat berkonfigurasi dari root ke `contracts/`, `test/`, `cache/hardhat/`, dan `artifacts/hardhat/`; catatan deployment publik di `deployments/`.
- Hosting: Cloudflare Workers Static Assets langsung dari `app/dist`, fallback SPA. Belum membuat Worker deployment karena CLI belum login dan akun tujuan perlu dipilih pengguna.
- Versi dipin setelah cek dokumentasi resmi dan registry npm: Node minimal 22.13; Vite 8.3.5, React 19.3.1, TypeScript 5.9.3, Hardhat 3.21.0, ethers toolbox 4.0.0, Wrangler 4.152.0.
- Arahan warna mengikuti deskripsi terbaru di `docs/design/README.md` (ink/cream/teal/oranye arcade), bukan nilai lama di `docs/design/tokens.json`; token JSON belum disinkronkan dan perlu diperiksa sebelum implementasi UI penuh.
- Dampak: hanya scaffold/landing; kontrak, tes aturan, wallet, animasi runtime, dan URL publik tetap belum ada.
