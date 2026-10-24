# Keputusan dan perubahan

## 24 Oktober 2026 WIB - tag preview testnet

- Pilihan: beri tag anotasi `v0.1.0-testnet-preview` pada checkpoint dokumentasi yang sudah dipush.
- Alasan: pengguna mengklarifikasi bahwa yang dimaksud adalah GitHub Tags, bukan GitHub Topics.
- Batas: nama preview menghindari klaim rilis MVP; tag mencatat bahwa bukti ronde multiplayer publik belum ada.
- Distribusi video: beri tahu pengguna bahwa file WebM perlu diekspor ke MP4/MOV sebelum upload X sesuai spesifikasi X; belum ada post yang dibuat.

## 24 Oktober 2026 WIB - topik repository GitHub

- Pilihan: tambahkan topik yang mewakili Monad, testnet, Web3, game multiplayer dan stack yang benar-benar dipakai (`Solidity`, `TypeScript`, `React`).
- Hasil: About repository menampilkan 10 topik terpilih, bersama deskripsi proyek dan homepage game publik.
- Batas: metadata meningkatkan ketercarian dan presentasi; bukan endorsement Monad atau bukti bahwa ronde multiplayer telah lulus uji.

## 24 Oktober 2026 WIB - video explainer

- Pilihan: buat explainer berbahasa Inggris sekitar 30 detik dengan voiceover, pakai artwork/storyboard Figma yang sudah ada dan beri label bahwa arena/hasil adalah konsep desain.
- Alasan: pengguna meminta video motion yang menjelaskan BOM OPER dan Monad, lalu menetapkan bahasa Inggris dan durasi 30 detik.
- Batas bukti: video menerangkan integrasi dan status proyek; bukan rekaman gameplay atau bukti receipt. Penutup menyebut bahwa ronde dua pemain masih memerlukan bukti transaksi publik.

## 24 Oktober 2026 WIB - satu alur game live

- Pemicu: pengguna meminta MVP yang benar-benar siap dimainkan dan tidak menginginkan simulasi.
- Pilihan: hapus route `/prototype`, komponen permainan mock, tombol/tautan simulasi, serta ubah ajakan utama ke `/play`. Pisahkan artwork karakter/bom yang dipakai arena live agar tetap bisa digunakan tanpa kode permainan simulasi.
- Dampak: satu-satunya alur game yang ditampilkan memakai Monad Testnet dan transaksi sungguhan. Build dan publish berhasil; uji dua wallet/receipt tetap harus dilakukan. Deployment kontrak ada, tetapi belum ada bukti ronde live.
- Batas: UI, polling, dan animasi tetap berjalan di browser. Hanya aturan dan keadaan room/hasil yang berasal dari kontrak. Pemain masih perlu menyiapkan wallet testnet dan menyetujui tindakan wallet/funding.

## 24 Oktober 2026 WIB — mulai Prompt 9 atas permintaan terbaru

- Pengguna meminta melanjutkan sampai MVP/submission; arahan sebelumnya berhenti di Prompt 8 kini digantikan.
- Menyiapkan naskah pitch dan form draft tanpa mengarang nama tim, kontak, hash game, video, screenshot, atau tanda penerimaan. Simpan di `docs/SUBMISSION-DRAFT.md`.
- Belum mengirim form: tautan form panitia belum ada di repo dan panduan meminta pengguna memberi link yang benar. Submission juga belum didukung receipt ronde dua wallet.
- Aksi transaksi testnet dan konfirmasi wallet dilakukan pengguna. Setelah bukti gameplay tersedia dan link form dipastikan, cocokkan persyaratan, minta pengguna meninjau isian akhir, lalu catat status penerimaan sesuai bukti.

## 24 Oktober 2026 WIB — gameplay live Prompt 5–6

- Pilihan: pakai ABI/address yang dihasilkan dan diverifikasi terhadap record deployment chain 10143; seluruh room state dibaca dari `getRoomSnapshot`/timestamp pada satu blok dan polling 2 detik. Create/join/start/pass/settle masuk melalui helper wallet yang menjaga hash/nonce pending sebelum broadcast dan menunggu receipt.
- Keamanan wallet: sesi EOA sementara berlaku 10 menit; pada expiry secret dibersihkan sementara metadata room/transaksi dipertahankan agar identitas tak dapat berotasi saat ada room/pending. Guard menghitung biaya aksi dengan estimasi dan fee saat itu, bukan angka gasUsed simulasi; transaksi tanpa `value` ke kontrak yang diizinkan saja.
- UI: route `/play` terpisah dari simulasi `/prototype`; tautan room langsung ke Arena. Poll/manual refresh, retry baca, inspeksi receipt, seleksi penerima, hot-pass, dan settle manual setelah waktu chain tercapai. Gerak bom resmi dimulai setelah receipt lalu snapshot. Tidak ada settle otomatis atau retry transaksi otomatis.
- Batas bukti: implementasi/build lokal bukan transaksi on-chain. Belum menguji 2 wallet, receipt pass/settle, kasus adversarial dari browser, atau deploy final URL. Karena itu Prompt 5–8 tetap belum lulus acceptance sampai bukti tersebut tersedia.
- Update Prompt 8: setelah build dan Wrangler dry-run, versi frontend `dc4678cf-4b64-4904-bd43-aa6bb4540acf` berhasil dipublish ke Worker yang sama. Pemeriksaan HTTP publik `/`, `/play`, room contoh dan chunk JS memberi 200. ID room contoh tidak ada di kontrak; tidak ada transaksi game yang dikirim dalam deployment ini.

## 24 Oktober 2026 WIB — simpan hash sebelum broadcast

- Risiko: jika RPC menerima raw transaksi tetapi koneksi putus sebelum respons kembali, aplikasi lama belum menyimpan hash dan pemulihan sulit dilakukan.
- Keputusan: wallet bermain menyiapkan dan menandatangani transaksi lokal, menyimpan hash terhitung dan nonce sebagai pending sebelum broadcast, lalu menunggu receipt dengan hash itu. Error broadcast meninggalkan pending untuk diperiksa; tidak ada retry otomatis.
- Batas: helper belum dipanggil oleh alur gameplay; ini baru hardening fondasi transaksi. Build berhasil, belum ada transaksi testnet dari perubahan ini.
- Figma: file terlihat melalui tab pengguna, tetapi API MCP design-context tidak tersedia pada sesi ini. Pemeriksaan visual tidak dianggap sebagai ekstraksi layer/aset.

## 24 Oktober 2026 WIB — receipt deploy terverifikasi dan alamat bersama

- Pengguna memberikan record `10143.json`; hash diverifikasi ulang lewat RPC Monad Testnet. Receipt sukses, transaksi creation tanpa value, init/runtime bytecode, alamat berdasarkan deployer/nonce, blok kanonis, serta `TARGET_CHAIN_ID` dan `nextRoomId` cocok dengan artifact lokal.
- Simpan bukti lengkap di `deployments/10143.json`. `verified:false` tetap menyatakan source explorer belum diverifikasi.
- Guard transaksi mengambil alamat publik dari `deploymentConfig.json` yang diekspor dari record itu. Build menolak chain/alamat/hash/source revision/hash/compiler yang tidak cocok. Guard belum dipanggil gameplay; integrasi aksi masih tahap berikutnya.
- Build, 23 tes Hardhat dan 15 tes pemulihan lulus setelah perubahan. Ini belum menguji wallet bermain, transaksi gameplay, multiplayer atau ronde publik. Warning reputasi MetaMask tetap belum jelas.

## 24 Oktober 2026 WIB — RPC rate limited, retry manual dengan nonce sama

- Pengguna memilih melanjutkan warning secara manual, mendanai akun dan mencapai pra-deploy lulus. Error berikutnya berasal dari pengiriman RPC wallet, bukan aturan kontrak. Status warning domain tetap belum diselesaikan; tidak mengubah proteksi atas nama pengguna.
- Bug pemulihan: intent tanpa hash terjaga tetapi tidak punya jalur untuk error pengiriman yang ditandai Gagal oleh wallet. Jangan menghapus jurnal atau auto-send. Tambahkan jalur eksplisit yang memerlukan pemeriksaan Aktivitas pengguna dan kesepakatan nonce/code dari dua RPC resmi.
- Jurnal baru menyimpan nonce sebelum send dan setiap request deploy mengisinya eksplisit. Retry mempertahankan nonce/pengirim; nonce yang sudah terpakai memblokir percobaan, bukan menaikkan nomor untuk membuat kontrak baru. Jurnal lama tanpa nonce dibatasi pada kasus pertama nonce 0. Penolakan konfirmasi retry tidak menghapus jejak nonce asal.
- Alternatif RPC Foundation berasal dari docs resmi dan diuji chain ID 10143. Karena batch tidak didukung, recovery memakai request tunggal. RPC wallet harus dipilih pengguna di MetaMask; mengubah provider pembacaan saja tidak memperbaiki jalur send wallet.
- Error ditampilkan singkat tanpa dump bytecode/payload. Semua gerbang receipt/code/view publik tetap diperlukan; perubahan ini tidak menandai Prompt 4 selesai atau memulai Prompt 5.
- Bukti aktual dan batas tes di TEST-RESULTS.md; langkah pengguna di docs/DEPLOY-RECOVERY.md.

## 24 Oktober 2026 WIB — hentikan koneksi saat domain ditandai

- Screenshot MetaMask memperlihatkan domain BOM OPER ditandai berbahaya. Ini bukti nyata hambatan baru sebelum deploy, bukan alasan mengubah aturan/wallet/chain.
- Pilihan: arahkan kembali ke keamanan, lakukan pemeriksaan read-only, siapkan permintaan review resmi dengan bukti terbatas. Tidak melanjutkan dengan mengabaikan warning, mematikan proteksi, atau mengganti domain untuk menghindarinya.
- Pemeriksaan list publik tidak menemukan exact/parent match dan aset publik cocok build; klasifikasi masih belum dijelaskan. Tidak menyimpulkan false positive atau situs pasti aman.
- Draf di `docs/references/METAMASK-REVIEW.md` belum dikirim karena belum ada instruksi eksplisit untuk mengirim pesan ke pihak lain. Tidak meminta rahasia. Prompt 4 tertahan pada review/remediasi domain sebelum koneksi/deploy; target tetap sampai Prompt 8.

## 24 Oktober 2026 WIB — lanjut sampai Prompt 8 dan pemulihan deploy

- Pengguna mengotorisasi kelanjutan berurutan sampai Prompt 8 dengan PDF sebagai referensi Monad. Arahan baru menggantikan catatan lama menunggu prompt satu per satu; Prompt 9 tetap tidak dikerjakan.
- Prompt 4 belum punya kontrak publik. Konfirmasi wallet pengguna tetap diperlukan oleh AGENTS/Prompt 4. Tidak mengganti bukti dengan simulasi atau membuat proyek/kontrak/Figma baru.
- Hash helper lama hanya ada dalam state React dan hilang setelah refresh. Dipilih jurnal metadata publik di localStorage (terpisah dari secret wallet bermain), intent sebelum konfirmasi, hash setelah broadcast, dan pemulihan receipt read-only. Error transport tetap belum jelas; penolakan wallet eksplisit dan receipt gagal memiliki jalur penutupan berbeda.
- Bukti harus mencocokkan deploy langsung, init/runtime bytecode, receipt/alamat, blok dan view dengan artifact Hardhat. Ekspor memeriksa source build info lewat `userSourceNameMap`, dengan normalisasi CRLF/LF Windows. Ini bukan source verification explorer.
- PDF utuh tidak dimasukkan ke repo publik karena memuat informasi akses venue. Ringkasan teknis dan perbedaan explorer/jadwal dicatat. Tidak memasang skill, menggunakan mainnet, mint atau fitur tambahan dari contoh slide.
- Aturan/SPEC tidak berubah. Prompt 5–8 belum dinyatakan lulus; kelanjutan bergantung pada hash deploy publik pengguna. Hasil aktual di TEST-RESULTS.md.

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

## 24 Oktober 2026 WIB — persiapan UI wallet Tahap 5

- Pemicu: pengguna meminta melanjutkan Tahap 5, lalu Tahap 6 setelah wallet siap.
- Pilihan: tambahkan route lokal `/wallet` yang membuat EOA hanya dari aksi + persetujuan eksplisit, menyimpan private key di sessionStorage tab dengan batas 10 menit, dan menyediakan funding via ekstensi atau alamat salin.
- Gas baseline dihitung dari receipt simulasi Tahap 3 dengan fee RPC yang dibaca saat pengguna meminta estimasi. Model contoh dan batasnya ditampilkan; bukan janji saldo cukup.
- Aksi game memerlukan RPC chain 10143 dan alamat kontrak publik konfigurasi build; saat alamat belum tersedia, transaksi harus diblokir. Jangan menganggap route lokal sebagai uji wallet atau Tahap 5 selesai.
- Dampak: route `/wallet` belum dideploy dan belum diuji dengan dua wallet karena belum ada receipt/alamat deployment kontrak. Tahap 6 menunggu plugin Figma yang benar-benar tersambung agar screenshot/context dari frame tepat dapat diambil sebelum implementasi visual.

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

## 24 Oktober 2026 WIB — pratinjau UI sebelum koneksi eksternal

- Pengguna memilih membangun tanpa koneksi wallet/Figma dahulu untuk menghemat waktu.
- Tambahkan route `/prototype` sebagai pratinjau responsif Opening/Lobby/Arena/Hasil. Interaksi room dan oper hanya mengubah state lokal; timer contoh tetap statis. Label simulasi ditampilkan agar tidak disangka transaksi atau hasil kontrak.
- Deploy pratinjau ke Worker `bom-oper` yang sama, tanpa mengganti konfigurasi hosting. URL: `https://bom-oper.salmansegaf52.workers.dev/prototype`.
- Untuk tahap ini gunakan preview/token desain yang sudah berada di repository. Pengambilan design context/screenshot langsung lewat plugin Figma, wallet, kontrak publik, polling, dan hasil on-chain ditunda. Ini prototipe review visual, bukan tahap 6 selesai atau bukti demo multiplayer.
- Berikutnya: setelah kontrak dideploy oleh pengguna di `/setup`, sinkronkan gameplay dengan alamat publik dan receipt; sambungkan Figma bila pengguna siap dan bandingkan frame spesifik.

## 24 Oktober 2026 WIB — UX demo HP

- Pengguna meminta CTA yang lebih jelas, undangan room yang mudah dibagikan, dan istilah status wallet/transaksi/hasil yang mudah dipahami. Tidak perlu mengubah desain Figma; gunakan frame dan token arcade yang sudah tersimpan.
- Landing menonjolkan aksi “Coba demo di HP” dan sticky CTA di viewport kecil. `/prototype` menyediakan share link via Web Share dengan fallback salin; parameter kapasitas/durasi ikut agar konfigurasi contoh tidak hilang saat link dibuka.
- Status wallet/transaksi/ronde dijelaskan sebagai panduan visual untuk alur game nyata, disertai peringatan bahwa route masih simulasi. UI tidak memalsukan popup wallet, transaksi pending, countdown atau hasil on-chain.
- Kontrol utama dibuat setidaknya 48px untuk nyaman disentuh; ini pilihan desain di atas target minimum WCAG 2.2. Rujukan: W3C WCAG 2.2, Digital.gov accessibility visual design, Apple HIG Feedback (detail aktual dicatat di `TEST-RESULTS.md`).
- Belum ada QA interaktif di perangkat HP karena browser tidak tersedia di sesi lokal; minta review manual pada URL publik. Tahap 6 tetap belum selesai tanpa kontrak/ronde nyata.

## 24 Oktober 2026 WIB — tanda logo minimal

- Pengguna meminta logo profesional yang minimal, tanpa brush atau tekstur bergaya generatif.
- Buat mark SVG geometris: monogram B dengan sumbu/percikan kecil, stroke warna ink dan aksen oranye. Tanpa gradient, tekstur, bayangan atau ilustrasi raster. Gunakan wordmark HTML “BOM OPER” agar konsisten dan tajam pada berbagai ukuran.
- Terapkan di semua header dan favicon supaya landing, wallet, setup, dan preview memakai identitas sama. Tidak memerlukan perubahan Figma untuk implementasi ini; bila pengguna ingin logo ikut menjadi aset desain editable, jadwalkan setelah koneksi Figma tersedia.
