# BOM OPER — panduan enam jam dari proyek kosong sampai bisa dimainkan

Panduan ini untuk membangun MVP saat lomba. Jadwal di bawah memakai contoh pukul **12.00–18.00 WIB**; geser seluruh slot jika panitia menetapkan waktu lain. Target ini memerlukan akun, alat, wallet, dan token testnet yang sudah siap. Enam jam adalah batas kerja, bukan jaminan semua tahap selesai tanpa kendala.

Gunakan satu chat AI yang punya akses ke folder proyek, terminal, browser, plugin Figma, dan GitHub. Kirim **Prompt Induk sekali**, lalu **Prompt 0 (Figma)**, kemudian **Prompt 1–9** satu per satu. Jangan kirim semua tahap sekaligus. Setiap prompt yang menghasilkan perubahan diakhiri commit dan push yang diverifikasi. Jika AI hanya memberi potongan kode, gunakan prompt pemulihan di bagian akhir.

## Dokumen pendukung — siapkan sebelum Prompt Induk

Paket dokumen ini sudah diekstrak. Baca [petunjuk penggunaannya](../README.md). Isinya rencana dan template pencatatan; belum ada kode game, desain Figma, kontrak terbit, atau URL game. Untuk lomba, penggunaan dokumen/template sebelum acara tetap mengikuti aturan panitia.

1. Ekstrak ZIP, lalu buka folder yang langsung berisi **AGENTS.md** melalui **File → Open Folder** di VS Code. Jika proyek sudah ada, gabungkan dokumen yang relevan tanpa menimpa catatan progres atau aturan proyek lama.
2. Pastikan AGENTS.md berada di akar folder proyek, sejajar dengan SPEC.md dan STATUS.md; jangan hanya menyimpan ZIP atau menempelkan nama berkas ke chat. Jika nanti folder itu menjadi repository Git, berkas-berkas tersebut tetap di akarnya.
3. Buka sesi Codex dari folder tersebut setelah dokumen tersedia. AGENTS.md mengarahkan Codex membaca SPEC.md, TASKS.md, STATUS.md, lalu dokumen teknis/desain/tes sesuai tahap. Jangan menganggap semua Markdown otomatis dimuat. Bila sesi sudah berjalan, minta Codex membaca ulang petunjuk atau mulai sesi baru.
4. Kirim Prompt Induk di bawah. Dokumen awal dibaca dan diperiksa terlebih dahulu; setelah itu lanjut Prompt 0 dan Prompt 1–9. Tidak ada tambahan slot di luar enam jam: persiapan dokumen masuk slot awal 00:00–00:20 bersama Git dan Figma.
5. Setiap tahap memperbarui checklist dan status sebelum commit/push. Jika chat berpindah, gunakan prompt pemulihan dengan dokumen yang sama; jangan mengulang pembuatan proyek atau kontrak yang sudah terbukti ada.

| Dokumen | Kegunaan |
|---|---|
| AGENTS.md | Petunjuk kerja Codex, urutan baca, commit/push, dan format bantuan manusia |
| SPEC.md | Aturan game, batas MVP, dan syarat dinyatakan selesai |
| TASKS.md | Urutan enam jam dan checklist bukti tiap tahap |
| STATUS.md | Keadaan aktual, tahap berikutnya, hambatan, kontrak/hosting yang sudah terverifikasi |
| TEST-RESULTS.md | Hasil tes nyata; awalnya semua belum diuji |
| docs/ARCHITECTURE.md | Alur frontend, kontrak, wallet, sinkronisasi, dan deploy |
| docs/design/README.md | Brief Figma serta tempat URL, frame ID, token, dan hasil pemeriksaan visual |
| docs/DECISIONS.md | Alasan keputusan dan perubahan lingkup/fallback |
| docs/BUILD-GUIDE.md | Salinan panduan lengkap beserta semua prompt |
| README.md | Cara membuka paket dan memulai/melanjutkan pekerjaan |

Codex mengenali AGENTS.md sebagai petunjuk proyek; berkas lain dibaca karena dirujuk dari petunjuk tersebut atau diminta dalam prompt. Lihat [dokumentasi resmi OpenAI tentang AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md). Ini membantu menjaga konteks, tetapi hasil kerja tetap perlu diperiksa.

## Target MVP yang dikunci

- Permainan oper bom untuk 2–4 pemain, kapasitas ditentukan saat membuat ruang.
- Satu ruang, satu ronde. Default 30 detik; 60 detik hanya sebagai pilihan fallback yang terlihat jelas.
- Pembuat ruang otomatis menjadi pemain pertama dan pemegang bom pertama. Tidak ada undian acak.
- Oper biasa memindahkan bom tanpa mengatur ulang waktu.
- Oper panas memindahkan bom sekaligus memotong 3 detik, satu kali per pemain per ronde.
- Oper panas hanya diizinkan saat sisa waktu **lebih dari 6 detik**, agar penerima masih mendapat lebih dari 3 detik menurut waktu kontrak.
- Pada batas waktu, pemegang bom terakhir yang sah kalah. Pemain lain bertahan; MVP berhenti di situ. Ronde eliminasi lanjutan belum termasuk.
- Kontrak mengatur anggota, pemegang bom, deadline, giliran, jatah oper panas, dan hasil. Tampilan tidak menentukan pemenang sendiri.
- Tidak ada taruhan, uang hadiah, NFT, token buatan, chat, login email, ranking global, atau AI lawan.

**Batas penting:** transaksi yang masuk sesudah deadline ditolak meskipun tombol diklik sebelumnya. Ini permainan berdasarkan urutan transaksi blockchain, bukan jaminan adil berdasarkan waktu klik di HP. Kecepatan jaringan pemain dapat memengaruhi hasil.

## Opening, landing, dan loading game

Alur utama: **URL publik → Opening → persiapan/loading bila diperlukan → Lobby → Arena → Hasil**. Opening dan loading termasuk MVP; belum diimplementasikan dalam paket dokumen ini.

- **Opening/landing:** nama BOM OPER, visual bom ringan, aturan singkat, label Monad Testnet, tombol **Mulai Main** dan **Cara Main**. Tampilan menyesuaikan desktop/HP; penjelasan aturan dapat berupa panel kecil pada halaman yang sama.
- **Masuk game:** Mulai Main menuju lobby. Loading muncul saat aset, konfigurasi atau snapshot benar-benar disiapkan, dengan pesan tahap yang tepat. Tidak memakai delay wajib, persentase palsu, atau animasi panjang untuk berpura-pura memuat.
- **Status yang berbeda:** memuat data, menunggu persetujuan wallet, menunggu receipt transaksi, serta menunggu finalisasi hasil. Loading tidak boleh menyatakan transaksi sudah berhasil.
- **Gagal memuat:** tampilkan penjelasan dan tindakan pemulihan. Retry pembacaan data boleh; jangan mengirim ulang transaksi pending tanpa memeriksa statusnya.
- **Akses cepat:** pembukaan pertama tidak otomatis meminta koneksi/tanda tangan wallet. Link room langsung menuju room setelah persiapan, tanpa opening berulang. Opening tidak memulai timer pertandingan; countdown mengikuti kontrak Active.
- **Batas enam jam:** buat opening sederhana dan animasi ringan yang menghormati reduced motion; tombol tetap bisa dipakai. Desainnya termasuk slot Figma awal dan implementasinya slot Prompt 6, tanpa tambahan jadwal.

## Arsitektur yang dipakai

| Bagian | Pilihan |
|---|---|
| Tampilan | React + Vite + TypeScript; CSS sederhana |
| Akses blockchain | ethers v6 |
| Aturan permainan | Satu kontrak Solidity, diuji dengan Hardhat |
| Hosting | Cloudflare Workers Static Assets, situs publik untuk demo |
| Penyimpanan keadaan permainan | Monad Testnet |
| Backend/database tambahan | Tidak diperlukan untuk MVP |
| Pengiriman aksi cepat | Wallet bermain sementara per pemain, didanai MON testnet |

Wallet bermain sementara adalah **akun EOA baru yang dibuat aplikasi**, bukan fitur izin sesi aman yang otomatis disediakan Monad. Wallet ini menyimpan MON testnet untuk gas dan menandatangani aksi pemain. Jangan menyebutnya gasless. Wallet utama hanya dipakai untuk menyetujui pengiriman biaya gas; aplikasi tidak meminta private key atau seed phrase wallet utama.

Untuk prototipe, rahasia wallet bermain boleh disimpan di `sessionStorage` tab yang sama dengan masa sesi 10 menit, agar refresh masih bisa dipulihkan. Ini kompromi khusus latihan testnet, bukan rancangan penyimpanan wallet produksi. Tampilkan persetujuan jelas sebelum membuat dan menggunakan wallet tersebut. Jangan gunakan akun ini untuk mainnet atau aset bernilai. Saat sesi hilang/kedaluwarsa, lanjutkan sebagai penonton; jangan membuat identitas pengganti diam-diam di pertandingan aktif.

## Persiapan sebelum jam lomba

1. Pastikan Node.js yang terpasang cocok dengan versi Vite dan Hardhat yang dipilih; siapkan Git, editor, dan akses AI yang bisa mengubah file.
2. Pastikan akun GitHub, Figma, dan Cloudflare bisa login serta plugin yang akan dipakai terhubung. Siapkan akun/organisasi GitHub tujuan; repository proyek baru dibuat saat acara mulai. Login dan persiapan alat sebelum acara mengikuti aturan panitia.
3. Siapkan ekstensi MetaMask/Rabby dan wallet khusus latihan. Siapkan MON testnet untuk deploy, mengisi wallet bermain, serta beberapa percobaan ulang. Jangan menaksir semua biaya dengan angka tetap; cek estimasi aktual.
4. Siapkan dua perangkat/profil browser untuk uji minimum; empat konteks browser terpisah untuk target empat pemain. Mengganti akun ekstensi pada satu halaman bukan pengujian multiplayer.
5. Catat aturan panitia tentang waktu mulai, template, kode latihan, dan hasil yang wajib dikumpulkan. Video menekankan proyek dibuat saat acara; gunakan latihan sebelumnya sebagai pengalaman, bukan menyalinnya seolah baru dibuat saat lomba.

Informasi jaringan yang diperiksa pada 23 Oktober 2026:

| Pengaturan | Nilai |
|---|---|
| Jaringan | Monad Testnet |
| Chain ID | `10143` / `0x279f` |
| RPC | `https://testnet-rpc.monad.xyz` |
| Gas | MON testnet |
| Explorer | `https://testnet.monadvision.com` |
| Faucet | `https://faucet.monad.xyz` |

Verifikasi kembali dari [informasi resmi Monad Testnet](https://docs.monad.xyz/developer-essentials/testnet) pada hari pelaksanaan.

## Rundown enam jam

| Waktu relatif | Contoh WIB | Pekerjaan | Harus sudah terbukti |
|---|---|---|---|
| 00:00–00:20 | 12.00–12.20 | Git awal, spesifikasi, desain Figma | Link desain, frame utama, dan commit/push desain |
| 00:20–00:40 | 12.20–12.40 | Proyek aplikasi dan hosting awal | URL Cloudflare bisa dibuka dari HP |
| 00:40–01:30 | 12.40–13.30 | Kontrak dan tes aturan | Kasus normal dan kasus batas lolos tes lokal |
| 01:30–02:00 | 13.30–14.00 | Deploy kontrak ke Monad Testnet | Receipt berhasil, alamat kontrak, bukti explorer |
| 02:00–03:00 | 14.00–15.00 | Wallet bermain dan alur transaksi | Dua pemain dapat mengoper tanpa pop-up tiap operan |
| 03:00–04:00 | 15.00–16.00 | Lobby, arena, hasil, publikasi ulang | URL publik dapat menyelesaikan satu ronde |
| 04:00–05:00 | 16.00–17.00 | Uji 2–4 pemain dan perbaikan | Oper panas, kehabisan waktu, refresh, transaksi gagal diuji |
| 05:00–05:30 | 17.00–17.30 | Bekukan fitur, deploy final, dokumentasi | Build final online, README, video cadangan |
| 05:30–06:00 | 17.30–18.00 | Latihan presentasi dan submit | Form terkirim dan ada bukti penerimaan |

**Patokan:** desain pertama maksimal 20 menit; URL online maksimal sekitar menit ke-40; kontrak terbit maksimal sekitar jam kedua; ronde publik pertama selesai maksimal sekitar jam keempat. Sisipkan sekitar 1–2 menit pemeriksaan commit/push di setiap slot, tanpa menggeser deadline. Jika meleset, potong lingkup sebelum menambah fitur.

## Riwayat GitHub pada setiap prompt

Sebelum pembangunan, beri AI akun/organisasi dan nama repository tujuan, atau URL repository kosong jika sudah disiapkan sesuai aturan panitia. Pastikan akses push bekerja pada awal acara. Figma menyimpan desain di file Figma; yang masuk GitHub adalah referensi desain, token, ekspor preview jika tersedia, dan kode aplikasi. Perubahan Figma tidak otomatis menghasilkan commit Git.

| Prompt | Perubahan yang layak dicatat | Contoh pesan commit |
|---|---|---|
| Induk | Spesifikasi dan rencana proyek | `docs: define bomb oper MVP and delivery plan` |
| 0 | Referensi, token, dan preview desain Figma | `design: add Figma screens and visual tokens` |
| 1 | Proyek awal dan konfigurasi hosting | `chore: scaffold app and publish initial preview` |
| 2 | Kontrak dan state machine | `feat(contract): implement bomb oper rules` |
| 3 | Tes kontrak dan hasilnya | `test(contract): cover turns heat and deadlines` |
| 4 | ABI dan catatan deploy testnet | `chore(deploy): record Monad testnet deployment` |
| 5 | Wallet bermain dan alur transaksi | `feat(wallet): add testnet play wallet flow` |
| 6 | Implementasi desain dan gameplay | `feat(game): implement lobby arena and results` |
| 7 | Perbaikan/hasil pengujian multiplayer | `fix(game): resolve multiplayer synchronization issues` |
| 8 | Rilis final dan bukti | `chore(release): publish verified MVP evidence` |
| 9 | Naskah presentasi dan submission | `docs: add pitch and submission checklist` |

Pesan commit mengikuti perubahan sebenarnya. Jika pengujian tidak menemukan bug, simpan hasil uji dengan pesan `test:`/`docs:`, bukan mengaku memperbaiki bug. Jangan membuat commit kosong, mengubah tanggal, atau membagi perubahan secara palsu untuk memperbanyak riwayat. Perbaikan tambahan yang bermakna boleh menjadi commit dan push tersendiri.

Pada setiap akhir prompt: periksa status/diff, pilih file proyek yang relevan, pastikan tidak ada rahasia, commit, push ke remote/branch yang sama, lalu cocokkan HEAD lokal dengan HEAD branch remote dari pemeriksaan jaringan. Contoh pemeriksaan: `git status --short`, `git diff --check`, `git rev-parse HEAD`, dan `git ls-remote origin refs/heads/<branch-aktif>`. Tidak cukup hanya ada commit lokal. Laporan akhir berisi pesan commit, SHA, branch, status push, dan tautan commit GitHub. Jangan menyimpan SHA commit yang sedang dibuat di dalam commit itu sendiri; laporkan SHA di chat setelah commit/push.

Jika push gagal karena koneksi, commit lokal tetap dipertahankan, laporkan belum ter-push, dan coba kembali setelah masalah diketahui. Jika izin/login diperlukan, berikan langkah bantuan sesuai format di bawah. Jangan force-push atau menghapus pekerjaan untuk membuat remote tampak sinkron.

## Cara AI meminta bantuan manusia

AI perlu menyebut secara spesifik apa yang belum bisa dilakukan dan alasannya. Contoh bantuan yang mungkin diperlukan: login GitHub/Cloudflare/Figma, memilih organisasi/repository/plan Figma, menghubungkan wallet, mengambil MON testnet, menyetujui transaksi, menyediakan perangkat penguji, merekam demo, atau mengirim form panitia.

Setiap permintaan harus memuat:

1. **Yang dibutuhkan:** satu hasil/input konkret, misalnya akses push ke repository tertentu.
2. **Tujuannya:** pekerjaan mana yang bergantung pada hasil itu.
3. **Yang sudah disiapkan:** URL, layar, berkas, atau transaksi yang sudah siap diperiksa.
4. **Langkah tindakan:** instruksi bernomor dari layar/aplikasi yang tepat; sebut nama tombol dari UI yang benar-benar terlihat atau dokumentasi yang terverifikasi. Jika letak tombol berbeda, akui dan minta informasi yang diperlukan.
5. **Tanda berhasil:** apa yang harus terlihat setelah selesai.
6. **Yang perlu kubalas:** misalnya URL repository atau 'sudah login'; bukan password, token, seed phrase, atau private key.
7. **Pekerjaan berikutnya:** langkah yang akan dilanjutkan AI sesudah bantuan selesai, serta pekerjaan independen yang masih bisa dikerjakan sementara itu.

Jangan mengulang permintaan izin untuk tindakan yang sudah kuotorisasi. Jika benar-benar diperlukan konfirmasi baru, jelaskan sumber dan alasannya. Persetujuan transaksi wallet tetap dilakukan pengguna. Jangan meminta 'kirim semua aksesnya' atau meminta pengguna membagikan rahasia di chat.

---

## Prompt Induk — kirim pertama

Salin seluruh kotak ini ke AI di folder proyek baru saat lomba dimulai:

```text
Kamu adalah rekan implementasiku untuk hackathon enam jam. Bangun MVP game BOM OPER dari folder proyek baru ini. Aku pemula; jelaskan keputusan dalam bahasa Indonesia sederhana. Kerjakan file dan jalankan pemeriksaan, bukan hanya memberikan saran atau potongan kode. Kerjakan tahap yang sedang aku kirim; jangan menambahkan fitur di luar lingkup. Urutannya Prompt Induk -> Prompt 0 desain Figma -> Prompt 1–9.

Sertakan opening/landing game dan loading sesuai operasi nyata: URL utama -> Opening dengan Mulai Main/Cara Main -> persiapan bila diperlukan -> Lobby -> Arena -> Hasil. Link room langsung ke room. Tidak ada popup wallet otomatis, delay wajib, atau persentase loading palsu.

Gunakan plugin Figma di awal untuk membuat desain yang dapat diedit. Simpan file URL, frame/node ID, token warna/teks/spacing, dan preview jika ekspor tersedia dalam docs/design/. Implementasi frontend berikutnya harus membaca desain tersebut melalui plugin Figma, mengikuti skill yang tersedia, lalu membandingkan tampilan browser dengan referensi. Desain diberi waktu sekitar 20 menit dan tidak boleh mengubah aturan game.

Riwayat GitHub wajib pada setiap prompt yang mengubah proyek. Saat acara mulai, inisialisasi Git dan siapkan remote repository baru milikku. Jika tujuan belum diketahui, minta akun/organisasi dan nama repo atau URL repo kosong satu kali dengan instruksi jelas. Periksa autentikasi dan izin; jangan menebak repo atau mengganti remote proyek lain. Prompt Induk sendiri menghasilkan commit dokumen awal. Setelah setiap tahap: periksa diff, pastikan tidak ada rahasia, commit perubahan yang bermakna, push ke branch yang sama, dan cocokkan SHA lokal dengan HEAD remote memakai pemeriksaan jaringan. Laporkan commit SHA, pesan, branch, tautan commit, dan push sukses/gagal. Jangan force-push, membuat commit kosong, atau mengubah tanggal. Jika tidak ada perubahan, katakan tidak ada commit baru. Commit lokal yang belum ter-push tidak boleh dilaporkan sudah ada di GitHub. Rahasia wallet, token akses, .env berisi rahasia, node_modules, dan output sementara tidak masuk commit.

Target: 2–4 pemain dalam satu ruang, satu ronde. Pembuat ruang otomatis pemain pertama dan pemegang bom pertama. Kapasitas dipilih saat createRoom. Ronde default 30 detik, pilihan fallback 60 detik harus terlihat. Oper biasa memindahkan bom tanpa reset waktu. Oper panas memotong deadline 3 detik, maksimal sekali per pemain, hanya jika sisa waktu kontrak >6 detik. Sesudah deadline, pemegang bom terakhir kalah dan ronde selesai; belum ada eliminasi lanjutan.

Sumber kebenaran adalah satu kontrak Solidity di Monad Testnet. Gunakan React+Vite+TypeScript dan ethers v6; Hardhat untuk compile/test; Cloudflare Workers Static Assets untuk hosting. Tidak perlu server API, database, WebSocket, NFT, token baru, hadiah uang, chat, atau ranking global. Pilih versi dependensi kompatibel, simpan lockfile, dan cek dokumentasi resmi sebelum memakai API.

Untuk aksi cepat, gunakan wallet bermain EOA sementara yang dibuat di browser, khusus MON testnet. Wallet utama hanya untuk mengirim biaya gas melalui konfirmasi wallet. Wallet bermain adalah identitas pemain on-chain; belum ada pengikatan identitas permanen ke wallet utama. Ini bukan delegated session key yang dibatasi kontrak, dan bukan gasless. Minta persetujuan penggunaan otomatis wallet latihan sebelum mengaktifkannya. Simpan rahasianya hanya di sessionStorage tab itu, masa sesi 10 menit. Jangan kirim rahasia ke server, log, URL, repository, analytics, atau variabel VITE_. Jangan meminta seed phrase/private key wallet utamaku. Tolak jaringan selain 10143 dan transaksi ke kontrak selain kontrak game yang dikonfigurasi.

Semua perubahan resmi menunggu receipt sukses dan pembacaan ulang kontrak. Animasi pending boleh, tetapi tidak boleh mengaku bom sudah berpindah atau hasil sudah final sebelum konfirmasi. Urutan blockchain menentukan operan sah. Deadline memakai block.timestamp. Kontrak tidak berjalan otomatis saat waktu habis: frontend perlu mengirim settleRoom, siapa pun boleh memanggilnya, dan hasil resmi menunggu receipt.

Setiap transaksi oper menyertakan expectedTurn agar transaksi terlambat tidak berlaku pada giliran lain. Nonpemegang tidak boleh mengoper; penerima harus anggota lain; jatah panas dicek kontrak. Satu aksi transaksi pending per pemain. Tangani revert, penolakan wallet, RPC gagal, saldo gas kurang, dan receipt tertunda tanpa mengirim ulang otomatis.

Tahap awal wajib sebelum desain/kode: baca AGENTS.md, SPEC.md, TASKS.md, STATUS.md, dan README.md dari paket dokumen pendukung jika tersedia. Baca docs/BUILD-GUIDE.md pada tahap yang sedang dikerjakan; baca docs/ARCHITECTURE.md untuk implementasi, docs/design/README.md untuk desain/UI, serta TEST-RESULTS.md dan docs/DECISIONS.md untuk tes/pemulihan. Laporkan singkat berkas yang benar-benar dibaca, aturan inti, status nyata, dan langkah terdekat. Jangan mengaku membaca berkas yang tidak tersedia.

Jika belum ada dokumen pendukung, buat AGENTS.md di akar repository yang menunjuk dokumen tersebut, lalu SPEC.md, TASKS.md, STATUS.md, TEST-RESULTS.md, README.md, docs/ARCHITECTURE.md, docs/design/README.md, docs/DECISIONS.md, serta docs/BUILD-GUIDE.md dari panduan ini. Jika panduan lengkap belum tersedia sebagai berkas, minta berkasnya dan jangan mengaku menyimpan versi lengkap. Jika dokumen sudah ada, pertahankan progres/bukti dan lengkapi yang kurang; jangan menimpa dengan template kosong. SPEC.md mengunci aturan; TASKS.md mengikuti jadwal enam jam; STATUS.md menyimpan status saat ini, alamat kontrak, chain ID, ABI/artifact, URL hosting, tes aktual, hambatan, dan tindakan selanjutnya. Nilai yang belum terbukti ditulis BELUM ADA/BELUM DIUJI. Jangan menyimpan rahasia atau menandai tahap selesai sebelum ada bukti.

Selesaikan fondasi dokumen dan checkpoint GitHub Prompt Induk terlebih dahulu, lalu tunggu Prompt 0. Setelah setiap tahap perbarui TASKS.md dan STATUS.md, TEST-RESULTS.md jika ada tes, docs/design/README.md jika ada desain, dan docs/DECISIONS.md jika ada keputusan berubah. Gunakan dokumen yang sama ketika melanjutkan chat di Codex VS Code; jangan mengandalkan ingatan chat sebelumnya.

Pada akhir setiap tahap, laporkan singkat: hasil nyata, cara cek, tes yang dijalankan, commit/push yang terverifikasi, hambatan, dan tahap berikutnya. Bedakan lokal, simulasi, dan Monad Testnet. Jangan klaim deploy berhasil sebelum receipt atau status deployment membuktikannya.

Kalau membutuhkan bantuanku, jangan hanya berkata 'login dulu' atau 'kirim akses'. Jelaskan: (1) apa yang dibutuhkan, (2) mengapa perlu, (3) yang sudah disiapkan dan URL/aplikasi tujuan, (4) langkah bernomor yang harus kulakukan dengan tombol yang benar-benar terlihat/terverifikasi, (5) tanda berhasil, (6) apa yang harus kubalas, dan (7) apa yang akan kamu lanjutkan. Minta informasi yang paling dibutuhkan saat itu dan lanjutkan pekerjaan independen yang masih bisa dilakukan. Jangan meminta password, token login, seed phrase, atau private key wallet utamaku di chat. Jika perlu persetujuan baru, sebutkan sumber dan alasan kebutuhan itu; jangan mengulang izin yang sudah ada. Login interaktif, pilihan akun/plan yang belum jelas, dan konfirmasi transaksi wallet perlu bantuanku; siapkan langkahnya dahulu. Jika UI yang kamu lihat tidak sama, jangan mengarang tombol.

Checkpoint wajib sebelum menutup prompt ini: perbarui catatan progres yang relevan, periksa perubahan dan rahasia, lalu commit dan push perubahan bermakna ke repository/branch yang sama. Verifikasi SHA HEAD lokal cocok dengan HEAD remote dari pemeriksaan jaringan; laporkan pesan commit, SHA, tautan commit GitHub, dan status push. Jika tidak ada perubahan, laporkan tanpa commit kosong. Jika butuh bantuanku atau push belum berhasil, jelaskan kebutuhan dan langkah tindakannya dengan format bantuan rinci dari Prompt Induk.
```

## Prompt 0 — desain Figma, menit 0–20

```text
Laksanakan Prompt 0: buat desain BOM OPER memakai plugin Figma sebelum implementasi UI. Baca SPEC.md dan pastikan aturan permainan tidak berubah. Target waktu sekitar 20 menit.

Periksa koneksi Figma serta akun/plan yang tersedia. Gunakan file yang kuberikan jika ada; jika belum ada, buat satu Figma Design baru bernama BOM OPER — MVP. Ikuti skill Figma yang tersedia untuk membuat file, menyusun screen, menggunakan Figma API, dan membuat komponen jika diperlukan. Jika ada pilihan plan/akun yang perlu diputuskan, minta dengan format bantuan manusia dari Prompt Induk; jangan memilih akses yang tidak jelas. Jangan mengklaim Figma sudah dibuat bila hanya menghasilkan HTML atau screenshot lokal.

Buat lima frame utama: Opening desktop, Lobby desktop, Arena desktop, Hasil desktop, serta Arena mobile. Tambahkan anotasi adaptasi opening mobile dan state loading/error tanpa membuat frame tambahan untuk setiap state. Arah visual: party game yang cerah dan mudah dibaca; latar navy gelap, kartu membulat, aksen oranye/kuning untuk bom, biru/ungu untuk pemain lain, countdown besar, dan tombol besar yang nyaman di HP. Gunakan tipografi yang tersedia, kontras jelas, label Indonesia, dan pemegang bom ditandai dengan ikon+teks. Hindari ilustrasi 3D/aset mahal yang memperlambat implementasi.

Opening mencakup nama game, visual bom ringan, aturan singkat, label Monad Testnet, tombol Mulai Main serta Cara Main. Loading mencerminkan persiapan aset/data nyata; bedakan dari menunggu wallet, transaksi, dan finalisasi. Tidak ada persentase palsu atau penundaan wajib. Lobby mencakup koneksi/fund wallet bermain, create/join room, kapasitas, durasi30/60, dan daftar pemain. Arena mencakup 2–4 pemain, pemegang bom, countdown, pemilihan penerima, Oper Biasa/Oper Panas, jatah panas, status transaksi, serta riwayat singkat. Hasil mencakup pemain kalah, pemain bertahan, hash/tautan bukti, dan buat ruang baru. Sertakan contoh tampilan giliran orang lain, transaksi pending, saldo gas kurang, dan menunggu finalisasi sebagai anotasi/state kecil; jangan menambah fitur baru.

Gunakan layer teks/elemen yang dapat diedit dan layout yang bisa diimplementasikan responsif. Periksa library/style yang tersedia dan pakai yang sesuai; jangan membangun design system besar dari nol. Boleh membuat fondasi/component minimum sesuai workflow skill. Catat data contoh sebagai contoh, bukan bukti transaksi sungguhan.

Periksa hasil Figma, lalu simpan docs/design/README.md berisi URL file, node/frame ID, struktur layar dan state, token warna/teks/spacing, serta prioritas implementasi. Simpan preview hasil ekspor jika tersedia tanpa mengekspor kredensial atau data akun. Commit dan push catatan/aset desain itu ke GitHub dan verifikasi remote. Desain tetap berada di Figma; GitHub menyimpan referensi/ekspornya. Jika plugin bermasalah, dokumentasikan hambatan, minta tindakan koneksi yang rinci, dan lanjutkan persiapan hosting yang independen; jangan diam-diam mengganti permintaan desain Figma menjadi gambar rata.

Checkpoint wajib sebelum menutup prompt ini: perbarui catatan progres yang relevan, periksa perubahan dan rahasia, lalu commit dan push perubahan bermakna ke repository/branch yang sama. Verifikasi SHA HEAD lokal cocok dengan HEAD remote dari pemeriksaan jaringan; laporkan pesan commit, SHA, tautan commit GitHub, dan status push. Jika tidak ada perubahan, laporkan tanpa commit kosong. Jika butuh bantuanku atau push belum berhasil, jelaskan kebutuhan dan langkah tindakannya dengan format bantuan rinci dari Prompt Induk.
```

**Lulus tahap:** file desain Figma dapat dibuka, lima frame ada dan dapat diedit, acuan desain tersimpan di repository, serta commit/push terverifikasi. Jika hanya sebagian frame selesai saat batas 20 menit, catat bagian yang belum selesai dan prioritaskan arena serta lobby.

## Prompt 1 — proyek baru dan URL online, menit 20–40

```text
Laksanakan tahap 1 sekarang. Periksa folder, Git, Node/npm, dan kompatibilitas versi yang akan dipakai. Buat proyek BOM OPER baru tanpa mengubah proyek latihan lama. Gunakan struktur satu repository yang sederhana: app/ untuk Vite, contracts/ dan test/ untuk Hardhat, serta deployments/ untuk catatan deployment publik. Buat root scripts yang mengarahkan ke folder dan perintah yang benar; jangan mencampur output build app dengan artifact kontrak.

Baca dokumen pendukung yang sudah disiapkan pada Prompt Induk; lengkapi SPEC.md, TASKS.md, dan STATUS.md hanya bila diperlukan, tanpa menghapus progres atau bukti yang sudah ada. Siapkan .gitignore dan .env.example tanpa rahasia. Buat halaman awal dengan nama game, aturan singkat, dan label Monad Testnet. Siapkan wrangler.jsonc untuk static assets hasil build Vite, termasuk fallback SPA. Pilih satu konfigurasi hosting dan pertahankan.

Build dan deploy halaman awal ke Cloudflare sekarang. Jika login diperlukan, pandu aku login memakai format bantuan rinci dari Prompt Induk. Gunakan akun/proyek yang kupilih; jangan mengubah akses proyek lain. Simpan URL yang benar-benar dikembalikan Cloudflare. Uji dibuka melalui koneksi HP. Gunakan repository/remote yang sudah disiapkan pada Prompt Induk, jangan inisialisasi repository lain. Gunakan arah visual/tokens dari docs/design/ untuk halaman awal. Jangan habiskan waktu untuk ilustrasi atau animasi.

Checkpoint wajib sebelum menutup prompt ini: perbarui catatan progres yang relevan, periksa perubahan dan rahasia, lalu commit dan push perubahan bermakna ke repository/branch yang sama. Verifikasi SHA HEAD lokal cocok dengan HEAD remote dari pemeriksaan jaringan; laporkan pesan commit, SHA, tautan commit GitHub, dan status push. Jika tidak ada perubahan, laporkan tanpa commit kosong. Jika butuh bantuanku atau push belum berhasil, jelaskan kebutuhan dan langkah tindakannya dengan format bantuan rinci dari Prompt Induk.
```

**Lulus tahap:** halaman sederhana bisa dibuka lewat URL publik. Jika hosting belum berhasil, perbaiki sekarang sebelum menumpuk fitur. Jika kontrak/tes melewati slot waktunya, ambil waktu dari pemolesan UI; jangan menghapus tes aturan inti untuk mengejar jadwal.

## Prompt 2 — kontrak utama, menit 40–70

```text
Laksanakan tahap 2: tulis BomOper.sol sesuai SPEC.md. Gunakan versi compiler/EVM target yang didukung Monad dan cocok dengan alat tes. Batasi deployment ke chain ID 10143; set chain ID jaringan simulasi lokal sama untuk tes, dan tambah tes penolakan di jaringan yang salah.

Sediakan createRoom(capacity, duration), joinRoom(roomId), startRoom(roomId), passBomb(roomId, recipient, hot, expectedTurn), settleRoom(roomId), dan pembacaan snapshot ruang. Capacity 2–4, duration hanya 30 atau 60 detik. Create otomatis memasukkan pembuat sekali. Room lifecycle Waiting -> Active -> Finished. Mulai hanya boleh oleh anggota ketika jumlah pemain tepat sesuai capacity. Pemegang pertama adalah pembuat. Tidak ada reset waktu ketika bom dioper. Giliran/turn naik pada tiap operan sah.

Tolak room tak dikenal, join ganda, room penuh, join sesudah mulai, start ulang, oper ke diri sendiri/nonanggota, oper oleh nonpemegang, expectedTurn salah, dan semua oper pada block.timestamp >= deadline. Oper panas maksimal sekali per pemain per room dan hanya saat deadline-block.timestamp >6. Deadline berkurang tepat 3 detik. settleRoom hanya saat Active dan block.timestamp >= deadline; catat loser sebagai pemegang terakhir, ubah status Finished, dan tidak boleh difinalisasi dua kali. Siapa pun boleh settle agar tidak tergantung pembuat ruang.

Kontrak tidak menerima taruhan/deposit permainan, tidak menyimpan dana pemain, tidak punya admin untuk mengganti skor, dan tidak menggunakan timestamp/hash sebagai keacakan. Emit event lengkap untuk create, join, start, pass, dan finish. Batasi loop sesuai maksimal empat pemain. Sediakan snapshot terstruktur yang cukup untuk frontend membaca satu room tanpa menelusuri semua event dari genesis.

Compile, periksa ABI, dan jelaskan state machine singkat. Jangan mengerjakan fitur frontend tambahan pada tahap ini.

Checkpoint wajib sebelum menutup prompt ini: perbarui catatan progres yang relevan, periksa perubahan dan rahasia, lalu commit dan push perubahan bermakna ke repository/branch yang sama. Verifikasi SHA HEAD lokal cocok dengan HEAD remote dari pemeriksaan jaringan; laporkan pesan commit, SHA, tautan commit GitHub, dan status push. Jika tidak ada perubahan, laporkan tanpa commit kosong. Jika butuh bantuanku atau push belum berhasil, jelaskan kebutuhan dan langkah tindakannya dengan format bantuan rinci dari Prompt Induk.
```

## Prompt 3 — tes aturan, menit 70–90

```text
Laksanakan tahap 3 sebelum deploy. Buat dan jalankan tes Hardhat yang membuktikan perilaku kontrak, memakai pengaturan waktu jaringan tes; jangan memakai sleep dunia nyata.

Uji kapasitas 2,3,4; batas capacity/duration; auto-join pembuat; join ganda/penuh/terlambat; start oleh orang luar atau sebelum lengkap; start ulang; pemegang awal; oper biasa tidak mengubah deadline; oper panas tepat -3 detik; pemakaian panas kedua gagal; sisa waktu 6 detik menolak panas; sisa >6 mengizinkan; penerima harus anggota lain; nonpemegang ditolak; expectedTurn lama ditolak meski bom kemudian kembali ke pemain tersebut; dua operan bersaing hanya satu yang sah; tepat pada deadline oper ditolak dan settle diizinkan; settle dini/ganda gagal; hasil dan event sesuai; dua room tidak saling mengubah data; jaringan salah ditolak.

Pastikan tes transaksi yang diharapkan gagal memeriksa revert/receipt, bukan hanya berhasil membuat objek transaksi. Catat gas untuk create, join, start, pass biasa/panas, settle sebagai dasar perkiraan biaya. Perbaiki implementasi jika gagal; jangan menghapus tes agar terlihat lulus. Perbarui STATUS.md dengan perintah dan hasil nyata.

Checkpoint wajib sebelum menutup prompt ini: perbarui catatan progres yang relevan, periksa perubahan dan rahasia, lalu commit dan push perubahan bermakna ke repository/branch yang sama. Verifikasi SHA HEAD lokal cocok dengan HEAD remote dari pemeriksaan jaringan; laporkan pesan commit, SHA, tautan commit GitHub, dan status push. Jika tidak ada perubahan, laporkan tanpa commit kosong. Jika butuh bantuanku atau push belum berhasil, jelaskan kebutuhan dan langkah tindakannya dengan format bantuan rinci dari Prompt Induk.
```

**Lulus tahap:** seluruh aturan inti lolos tes. Kontrak yang mengizinkan oper oleh pemain salah atau mengganti hasil belum boleh dipakai demo.

## Prompt 4 — deploy kontrak Monad, menit 90–120

```text
Laksanakan tahap 4. Buat halaman/setup helper minimal untuk deploy artifact kontrak memakai ethers ContractFactory dan wallet browser yang terhubung. Aku sendiri akan mengonfirmasi transaksi. Ini menghindari memasukkan private key utama ke file/env. Cek chain ID 10143 dari provider nyata, dukungan jaringan, saldo gas, ABI, bytecode, dan perkiraan biaya sebelum menampilkan tombol deploy. Jangan otomatis mengirim transaksi saat halaman dibuka.

Sesudah aku menyetujui, tunggu receipt sukses dan cek ada kode di alamat kontrak. Simpan chain ID, alamat, hash transaksi deploy, block number, compiler settings, dan versi sumber dalam deployments/10143.json. Ekspor ABI yang cocok ke app. Konfigurasikan alamat kontrak publik yang sama untuk seluruh pemain, lalu rebuild. Jangan bergantung hanya pada localStorage satu browser untuk memilih kontrak produksi.

Perlihatkan tautan explorer yang benar. Uji panggilan view dari frontend ke alamat itu. Jika verifikasi source explorer mudah dilakukan, lakukan setelah deployment inti terbukti; jangan menunda integrasi demi explorer verification. Catat dengan jujur jika source belum verified. Jangan memakai alamat placeholder seolah kontrak sudah terbit.

Checkpoint wajib sebelum menutup prompt ini: perbarui catatan progres yang relevan, periksa perubahan dan rahasia, lalu commit dan push perubahan bermakna ke repository/branch yang sama. Verifikasi SHA HEAD lokal cocok dengan HEAD remote dari pemeriksaan jaringan; laporkan pesan commit, SHA, tautan commit GitHub, dan status push. Jika tidak ada perubahan, laporkan tanpa commit kosong. Jika butuh bantuanku atau push belum berhasil, jelaskan kebutuhan dan langkah tindakannya dengan format bantuan rinci dari Prompt Induk.
```

**Lulus tahap:** ada receipt deploy berhasil, kode kontrak tersedia, dan frontend dapat membaca kontrak di Monad Testnet.

## Prompt 5 — wallet pemain, menit 120–180

```text
Laksanakan tahap 5. Buat alur wallet bermain sementara sesuai Prompt Induk. Setelah persetujuan pengguna, buat akun EOA acak dengan ethers di browser, tampilkan alamat publik dan saldo MON testnet. Simpan rahasia hanya dalam sessionStorage tab dengan expiry 10 menit; jangan pernah menampilkannya di UI/log/URL. Pulihkan sesi yang masih valid setelah refresh di tab sama. Jangan membuat wallet baru pada setiap render React. Beri label jelas bahwa akun ini menandatangani aksi dan memakai gas testnet; bukan wallet utama, bukan gasless, dan bukan izin sesi yang dibatasi smart contract.

Tambahkan koneksi wallet browser untuk mendanai alamat bermain, cek chain 10143 sebelum transfer, tunjukkan penerima dan jumlah, lalu aku menyetujui lewat ekstensi. Gunakan catatan gas tes dan fee RPC untuk memberi perkiraan budget beberapa aksi dengan asumsi yang jelas; biarkan pengguna menentukan batas isi. Jangan menjanjikan jumlah tertentu pasti cukup dan jangan memakai gasLimit sangat besar. Sediakan alternatif menyalin alamat bermain untuk didanai MON testnet secara manual. Periksa saldo masuk sebelum join.

Hubungkan wallet bermain langsung ke RPC untuk transaksi game sehingga tidak ada pop-up ekstensi tiap operan. Semua helper write memakai chain/contract allowlist. Satu transaksi pending per pemain, nonce ditangani benar, tunggu receipt dan baca state ulang. Simpan hash pending dan pulihkan pemeriksaannya setelah refresh; jangan retry otomatis. Saat expiry, hentikan penandatanganan dan tampilkan mode penonton. Dilarang auto-rotate identitas dalam room aktif.

Uji dua wallet bermain terpisah melakukan create/join/start/oper. Jika alur cepat ini belum stabil pada akhir jam ketiga, aktifkan fallback wallet browser biasa untuk metode kontrak yang sama dan pakai ruang 60 detik. Catat perubahan dan jangan menyebut fallback sebagai pengalaman tanpa pop-up.

Checkpoint wajib sebelum menutup prompt ini: perbarui catatan progres yang relevan, periksa perubahan dan rahasia, lalu commit dan push perubahan bermakna ke repository/branch yang sama. Verifikasi SHA HEAD lokal cocok dengan HEAD remote dari pemeriksaan jaringan; laporkan pesan commit, SHA, tautan commit GitHub, dan status push. Jika tidak ada perubahan, laporkan tanpa commit kosong. Jika butuh bantuanku atau push belum berhasil, jelaskan kebutuhan dan langkah tindakannya dengan format bantuan rinci dari Prompt Induk.
```

**Lulus tahap:** dua alamat berbeda menjalankan operan sungguhan. Jangan menghabiskan waktu menambahkan penyedia login atau sistem relayer baru.

## Prompt 6 — lobby, arena, dan hasil, menit 180–240

```text
Laksanakan tahap 6. Baca docs/design/README.md dan ambil konteks desain serta screenshot dari frame Figma yang tepat melalui plugin. Ikuti skill Figma design-to-code sebelum mengambil design context. Jangan memakai screenshot keseluruhan sebagai gambar pengganti UI. Implementasikan teks, kontrol, dan layout interaktif sesuai stack proyek, gunakan token/aset desain yang tersedia, lalu bandingkan hasil browser dengan referensi Figma. Adaptasi mobile mengikuti frame Arena mobile. Jika desain perlu penyesuaian kecil untuk data nyata, catat alasannya tanpa mengubah arah visual.

Buat empat layar responsif: Opening, Lobby, Arena, Hasil. Opening adalah landing game dengan judul BOM OPER, visual bom ringan, aturan singkat, label Monad Testnet, tombol Mulai Main dan panel Cara Main. Jangan memicu wallet otomatis saat halaman pertama dibuka. Mulai Main menuju lobby; tampilkan loading hanya selama persiapan aset/konfigurasi/snapshot sungguhan. Bedakan pesan memuat data, menunggu persetujuan wallet, transaksi pending, dan finalisasi. Jangan memakai delay wajib atau persentase palsu. Sediakan error/retry untuk pembacaan gagal tanpa otomatis mengirim ulang transaksi. Link room langsung ke room setelah persiapan tanpa mengulang opening. Opening tidak memulai ronde/timer; countdown tetap mengikuti kontrak Active. Animasi ringan menghormati reduced motion dan tidak menghalangi tombol. Lobby bisa buat room kapasitas 2–4/durasi30 atau60, gabung memakai room ID, dan salin URL dengan room ID. Semua pemain harus memakai chain/alamat kontrak yang sama. Tampilkan jumlah pemain dan kesiapan saldo. Room penuh dapat ditonton tanpa bergabung. Gunakan nama tampilan sederhana dari indeks pemain dan alamat pendek; tidak perlu profil atau penyimpanan nama di blockchain.

Arena menampilkan 2–4 pemain melingkar, pemegang bom jelas, sisa waktu, pilihan penerima lain, tombol Oper Biasa dan Oper Panas, sisa jatah panas, status transaksi, dan riwayat aksi room ini. Hanya pemegang sah dapat mengoper. Tombol terkunci saat pending dan saat deadline lewat. Tampilkan ikon, warna, dan teks, bukan warna saja. Animasi bom baru resmi pindah sesudah receipt/snapshot on-chain; tampilkan pending terpisah.

Baca snapshot room pada blok konsisten secara berkala, mulai sekitar tiap 2 detik; hindari polling ganda dan sesuaikan bila RPC membatasi. Bersihkan subscription/timer saat pindah room atau unmount. Tambahkan tombol Perbarui. Sinkronkan countdown dari timestamp blok terakhir dan deadline; jam perangkat hanya untuk animasi perkiraan. Setelah waktu lokal nol, tampilkan 'menunggu finalisasi', cek waktu chain, lalu kirim settleRoom sekali dari wallet bermain jika memungkinkan atau sediakan tombol finalisasi. Jangan mengirim settle berulang dari tiap render.

Hasil resmi hanya setelah status kontrak Finished: tampilkan yang kalah, pemain bertahan, dan tautan bukti transaksi. Tidak ada hasil random atau state lokal sebagai pengganti. Sediakan buat room baru; tidak reset room lama.

Deploy ulang ke URL Cloudflare yang sama. Uji setidaknya dua perangkat/profil dari URL publik sampai satu ronde selesai. Jangan menambah efek visual sebelum ronde publik berhasil.

Checkpoint wajib sebelum menutup prompt ini: perbarui catatan progres yang relevan, periksa perubahan dan rahasia, lalu commit dan push perubahan bermakna ke repository/branch yang sama. Verifikasi SHA HEAD lokal cocok dengan HEAD remote dari pemeriksaan jaringan; laporkan pesan commit, SHA, tautan commit GitHub, dan status push. Jika tidak ada perubahan, laporkan tanpa commit kosong. Jika butuh bantuanku atau push belum berhasil, jelaskan kebutuhan dan langkah tindakannya dengan format bantuan rinci dari Prompt Induk.
```

## Prompt 7 — uji multiplayer dan perbaikan, menit 240–300

```text
Laksanakan tahap 7. Uji URL deployment menggunakan konteks browser atau perangkat terpisah, bukan sekadar mengganti akun pada satu halaman. Target empat alamat bermain berbeda; minimal dua jika waktu sempit. Jangan menduplikasi satu sesi wallet menjadi empat pemain. Uji create/join/start, beberapa oper biasa, satu oper panas, percobaan panas ulang, aksi nonpemegang, penerima salah, dan ronde sampai Finished.

Pastikan semua layar menyepakati holder, turn, deadline, dan loser dari snapshot on-chain. Uji klik cepat ganda, koneksi lambat, saldo gas kurang, RPC gagal, request ditolak, refresh saat pending, pembukaan room link pada perangkat lain, serta tombol saat waktu habis. Bedakan UI disabled dengan penolakan sungguhan oleh kontrak. Periksa hash dan receipt untuk transaksi utama. Catat latency yang diamati sebagai pengamatan demo, bukan klaim benchmark.

Uji opening desktop/HP, tombol Mulai Main/Cara Main, loading/error/retry sesuai proses nyata, reduced motion, tidak adanya popup wallet otomatis, dan link room yang tidak mengulang opening. Pastikan opening tidak memulai countdown atau menghambat ronde.

Periksa console, kesalahan build/TypeScript, event listener ganda, kebocoran timer, dan tidak adanya rahasia di bundle/env/repository. Perbaiki penyebab akar dan ulangi hanya alur yang terdampak. Jangan menambah NFT, token, hadiah, chat, AI, atau backend. Jika empat pemain belum stabil, capai dua pemain sungguhan dulu. Pakai fallback 60 detik bila popup/latency mengganggu; label durasi sesuai kenyataan.

Tulis TEST-RESULTS.md dengan mana yang lulus, gagal, belum diuji, beserta bukti publik yang tidak berisi rahasia. Jika suatu tahap tidak bisa diuji tanpa tindakanku, siapkan langkah tes yang tepat dan tunggu aku melakukannya; jangan mengarang hasil.

Checkpoint wajib sebelum menutup prompt ini: perbarui catatan progres yang relevan, periksa perubahan dan rahasia, lalu commit dan push perubahan bermakna ke repository/branch yang sama. Verifikasi SHA HEAD lokal cocok dengan HEAD remote dari pemeriksaan jaringan; laporkan pesan commit, SHA, tautan commit GitHub, dan status push. Jika tidak ada perubahan, laporkan tanpa commit kosong. Jika butuh bantuanku atau push belum berhasil, jelaskan kebutuhan dan langkah tindakannya dengan format bantuan rinci dari Prompt Induk.
```

## Prompt 8 — deploy final dan bukti, menit 300–330

```text
Bekukan fitur sekarang. Selesaikan build produksi dan deploy final ke Cloudflare. Verifikasi URL hasil deploy, buka melalui perangkat lain, cek room link dengan refresh langsung, pastikan konfigurasi chain10143/alamat kontrak/ABI sama dengan kontrak yang dites, lalu mainkan satu ronde final. Jika ada perbedaan, perbaiki dan ulangi alur terdampak.

Buat README berisi deskripsi satu kalimat, aturan lengkap, URL demo, langkah join dan biaya gas testnet, batas wallet sementara, alamat kontrak, explorer deploy/oper/finalisasi, cara menjalankan lokal, perintah tes dan build yang benar, serta fitur yang belum ada. Cantumkan kontribusi AI dengan jujur. Jangan menyatakan full on-chain untuk animasi/tampilan: yang on-chain adalah aturan dan keadaan permainan.

Bantu aku merekam video cadangan pendek dari permainan nyata dan mengambil screenshot hasil serta explorer. Kalau alat perekam tidak tersedia, berikan shot list dan pandu rekam manual memakai format bantuan rinci dari Prompt Induk. Video tidak boleh mengganti label transaksi pending menjadi sukses. Lanjutkan riwayat repository yang sama; commit/push hasil tahap ini seperti setiap tahap sebelumnya dan laporkan hash setelah verifikasi remote. Laporkan empat bukti: URL hidup, alamat kontrak, receipt operan, receipt finalisasi. Bukti yang belum didapat tulis belum ada.

Checkpoint wajib sebelum menutup prompt ini: perbarui catatan progres yang relevan, periksa perubahan dan rahasia, lalu commit dan push perubahan bermakna ke repository/branch yang sama. Verifikasi SHA HEAD lokal cocok dengan HEAD remote dari pemeriksaan jaringan; laporkan pesan commit, SHA, tautan commit GitHub, dan status push. Jika tidak ada perubahan, laporkan tanpa commit kosong. Jika butuh bantuanku atau push belum berhasil, jelaskan kebutuhan dan langkah tindakannya dengan format bantuan rinci dari Prompt Induk.
```

## Prompt 9 — presentasi dan submit, menit 330–360

```text
Laksanakan tahap terakhir tanpa fitur baru. Tulis naskah presentasi bahasa Indonesia sekitar dua menit dengan versi Inggris singkat. Isinya: hook oper bom; aturan30/60detik sesuai build; demo langsung; kontrak menentukan pemegang/jatah panas/hasil; alasan Monad karena banyak aksi kecil perlu cepat; dan keterbatasan jujur tentang gas, urutan transaksi, sesi sementara, serta fitur tersisa.

Siapkan urutan demo yang sudah dites: pemain siap saldo, room siap sesuai ketentuan lomba, mulai ronde, beberapa oper, oper panas, tunggu selesai, tunjukkan hasil dan hash di explorer. Bedakan bot, penguji, dan peserta manusia jika ada. Jangan mengklaim 100% original, bebas bot, adil berdasarkan waktu klik, gasless, atau ribuan pemain tanpa bukti.

Buat checklist submission mengikuti form panitia yang kuberikan: nama proyek/tim, repository, URL demo, alamat kontrak, deskripsi, video, screenshot, dan kontak bila diminta. Jika link form belum diketahui, minta satu informasi itu; jangan menebaknya. Siapkan isian untuk kutinjau dan pandu aku mengirim sebelum deadline, lalu simpan bukti penerimaan. Kalau ada persyaratan tambahan panitia, utamakan itu.

Checkpoint wajib sebelum menutup prompt ini: perbarui catatan progres yang relevan, periksa perubahan dan rahasia, lalu commit dan push perubahan bermakna ke repository/branch yang sama. Verifikasi SHA HEAD lokal cocok dengan HEAD remote dari pemeriksaan jaringan; laporkan pesan commit, SHA, tautan commit GitHub, dan status push. Jika tidak ada perubahan, laporkan tanpa commit kosong. Jika butuh bantuanku atau push belum berhasil, jelaskan kebutuhan dan langkah tindakannya dengan format bantuan rinci dari Prompt Induk.
```

## Prompt jika AI macet

```text
Hentikan penambahan fitur. Baca SPEC.md dan STATUS.md. Ini gejala/error saat ini:
[TEMPEL PESAN ERROR DAN LANGKAH MEMUNCULKANNYA; HAPUS RAHASIA]
Tentukan apakah masalah berasal dari kontrak, wallet/gas, RPC, frontend, atau hosting. Periksa file dan log yang relevan, jelaskan akar masalah, ubah bagian minimum, lalu jalankan ulang langkah yang membuktikan perbaikan. Jangan mengganti stack, menulis ulang seluruh proyek, menghapus tes, atau menyamarkan transaksi gagal dengan simulasi. Jika membutuhkan inputku, sebutkan tepat satu tindakan yang diperlukan.

Checkpoint wajib sebelum menutup prompt ini: perbarui catatan progres yang relevan, periksa perubahan dan rahasia, lalu commit dan push perubahan bermakna ke repository/branch yang sama. Verifikasi SHA HEAD lokal cocok dengan HEAD remote dari pemeriksaan jaringan; laporkan pesan commit, SHA, tautan commit GitHub, dan status push. Jika tidak ada perubahan, laporkan tanpa commit kosong. Jika butuh bantuanku atau push belum berhasil, jelaskan kebutuhan dan langkah tindakannya dengan format bantuan rinci dari Prompt Induk.
```

Jika AI hanya menjawab penjelasan:

```text
Tolong laksanakan tahap tersebut di folder proyek: buat/ubah file, jalankan perintah yang sesuai, dan verifikasi hasil. Aku butuh hasil yang bisa dijalankan. Tulis jelas jika alatmu tidak punya akses terminal/file/browser, lalu berikan langkah manual berurutan untuk bagian yang tidak bisa kamu kerjakan.

Checkpoint wajib sebelum menutup prompt ini: perbarui catatan progres yang relevan, periksa perubahan dan rahasia, lalu commit dan push perubahan bermakna ke repository/branch yang sama. Verifikasi SHA HEAD lokal cocok dengan HEAD remote dari pemeriksaan jaringan; laporkan pesan commit, SHA, tautan commit GitHub, dan status push. Jika tidak ada perubahan, laporkan tanpa commit kosong. Jika butuh bantuanku atau push belum berhasil, jelaskan kebutuhan dan langkah tindakannya dengan format bantuan rinci dari Prompt Induk.
```

Jika chat perlu dipindah:

```text
Baca AGENTS.md, SPEC.md, TASKS.md, STATUS.md, TEST-RESULTS.md, dan docs/DECISIONS.md sebelum mengubah apa pun; baca docs/BUILD-GUIDE.md pada tahap berikutnya serta docs/design/README.md jika terkait UI. Lanjutkan tahap yang belum selesai dengan alamat kontrak dan konfigurasi yang sudah terverifikasi. Jangan membuat proyek atau deployment kontrak baru tanpa alasan teknis konkret. Laporkan pemahaman status singkat lalu kerjakan langkah berikutnya.

Checkpoint wajib sebelum menutup prompt ini: perbarui catatan progres yang relevan, periksa perubahan dan rahasia, lalu commit dan push perubahan bermakna ke repository/branch yang sama. Verifikasi SHA HEAD lokal cocok dengan HEAD remote dari pemeriksaan jaringan; laporkan pesan commit, SHA, tautan commit GitHub, dan status push. Jika tidak ada perubahan, laporkan tanpa commit kosong. Jika butuh bantuanku atau push belum berhasil, jelaskan kebutuhan dan langkah tindakannya dengan format bantuan rinci dari Prompt Induk.
```

## Rencana cadangan saat waktu menipis

| Kondisi | Keputusan |
|---|---|
| Wallet sementara belum stabil pada jam ketiga | Wallet ekstensi biasa, room60detik, konfirmasi tiap aksi; tetap transaksi nyata |
| Empat pemain belum stabil pada jam keempat | Demo dua pemain nyata terlebih dahulu |
| Animasi belum rapi | Pakai kartu pemain dan label pemegang dengan token Figma; prioritaskan alur sah |
| Figma belum terhubung | Minta bantuan koneksi dengan langkah rinci; lanjutkan tugas hosting/kontrak yang independen |
| Push GitHub gagal | Pertahankan commit lokal, laporkan belum ter-push, perbaiki koneksi/izin, verifikasi push ulang |
| RPC membatasi | Kurangi polling, hentikan listener ganda, pilih endpoint resmi lain setelah verifikasi chain |
| Browser wallet tidak terdeteksi | Buka URL di Chrome/Brave ber-ekstensi atau browser dalam wallet yang mendukung EVM |
| Waktu habis tapi hasil belum final | Baca waktu chain, kirim settleRoom, tunggu receipt; jangan menetapkan pemenang dari timer lokal |
| Sesi wallet hilang/kedaluwarsa | Tonton room; main lagi memakai sesi baru di room baru |
| Transaksi tertunda saat deadline | Cek receipt/explorer; operan boleh revert jika terlambat. Jangan otomatis mengirim ulang |
| Jaringan demo terputus | Tunjukkan video rekaman sebelumnya dengan label rekaman; jangan menyebutnya demo live |

## Definisi selesai

MVP selesai bila seseorang dapat membuka **URL publik**, membuat/bergabung ke room, menjalankan **operan sungguhan di Monad Testnet**, memakai oper panas sesuai aturan, dan melihat **hasil Finished yang sama** dengan pemain lain beserta bukti transaksi. UI yang tampak berjalan tetapi holder/hasilnya hanya berubah di browser belum memenuhi target.

Jangan menghabiskan menit terakhir mengejar domain sendiri, landing page panjang, atau efek tambahan. Sisakan waktu untuk submit dan memperoleh bukti penerimaan.

## Referensi resmi

- [Monad Testnet — jaringan dan faucet](https://docs.monad.xyz/developer-essentials/testnet)
- [Monad Transactions — format dan chain ID](https://docs.monad.xyz/developer-essentials/transactions)
- [Monad Gas Pricing — gas tetap harus diperhitungkan](https://docs.monad.xyz/developer-essentials/gas-pricing)
- [ethers Wallet API — pembuatan dan penandatanganan akun EOA](https://docs.ethers.org/v6/api/wallet/)
- [Hardhat — compile, test, dan deployment](https://hardhat.org/docs/getting-started)
- [Cloudflare Static Assets — deployment](https://developers.cloudflare.com/workers/static-assets/get-started/)
- [Cloudflare SPA routing — membuka ulang URL room](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)
- [Video persiapan — aturan membangun saat acara, mulai 40:18](https://www.youtube.com/watch?v=ST8VVkpCrjs&t=2418s)

Arsitektur dan pembagian waktu di panduan ini adalah usulan untuk prototipe lomba, bukan panduan keamanan wallet produksi atau jaminan selesai tepat enam jam.
