# BOM OPER

Game oper bom satu ronde untuk 2–4 pemain, dengan aturan di kontrak Monad Testnet. Repository: [salmanfidinillah/monadproject](https://github.com/salmanfidinillah/monadproject).

**Status 24 Oktober 2026 WIB:** kontrak BomOper sudah dideploy di Monad Testnet dan receipt, bytecode, serta pembacaan view-nya diverifikasi. Alamat `0x18097A160477E49d52A5A637d51D6B831144aDDd`. Gameplay live berada di [URL publik](https://bom-oper.salmansegaf52.workers.dev/play); room, giliran, timer chain, dan hasil dibaca dari kontrak. Aplikasi tidak menyediakan mode simulasi. Ronde dua pemain dengan receipt operan dan finalisasi masih perlu dibuktikan sebelum MVP disebut teruji. Lihat [STATUS.md](STATUS.md), [record deployment](deployments/10143.json), dan [hasil pemeriksaan](TEST-RESULTS.md).

Konfirmasi deploy memakai wallet pengguna. Helper menyimpan metadata publik transaksi untuk pemeriksaan setelah refresh, memblokir deploy ulang yang belum jelas, dan mencocokkan init/runtime bytecode dengan artifact lokal. [Ringkasan PDF workshop dan langkah deploy](docs/references/MONAD-BLITZ.md) menjelaskan langkah berikutnya; tidak memerlukan private key di chat atau berkas.

## Cara memakai

1. Ekstrak seluruh ZIP. Buka folder yang langsung berisi AGENTS.md memakai File → Open Folder di VS Code.
2. Untuk proyek yang sudah berjalan, gabungkan berkas yang relevan; jangan menimpa AGENTS.md, spesifikasi, atau progres yang sudah ada. Sesuaikan petunjuk jika ada aturan proyek lain.
3. Mulai sesi Codex dari akar folder ini setelah dokumen tersedia. Jika sesi sudah terbuka, minta baca ulang atau mulai sesi baru. AGENTS.md dikenali sebagai arahan; dokumen lainnya tidak otomatis dibaca seluruhnya. [Sumber resmi OpenAI](https://learn.chatgpt.com/docs/agent-configuration/agents-md).
4. Buka [panduan enam jam](docs/BUILD-GUIDE.md). Acuan Figma terbaru adalah [BOM OPER Arcade](https://www.figma.com/design/T8zhiDboW04KOC9sDJrlz6/BOM-OPER?node-id=11-60). Lihat [acuan desain dan preview](docs/design/README.md), lalu ikuti tahap berikutnya sesuai STATUS.md.
5. Repository proyek ini sudah ditetapkan ke salmanfidinillah/monadproject. Gunakan origin dan branch main yang sama untuk tahap berikutnya. Setiap prompt yang mengubah proyek harus menghasilkan commit/push bermakna dan bukti verifikasi remote.

Saat latihan boleh mulai sekarang. Saat lomba ikuti ketentuan panitia tentang waktu pembangunan dan penggunaan dokumen/template; paket ini bukan bukti bahwa proyek sudah memenuhi aturan acara.

## Peta dokumen

| Berkas | Isi |
|---|---|
| [AGENTS.md](AGENTS.md) | Aturan kerja AI dan kapan membaca dokumen lain |
| [SPEC.md](SPEC.md) | Aturan BOM OPER dan syarat MVP |
| [TASKS.md](TASKS.md) | Rundown dan checklist |
| [STATUS.md](STATUS.md) | Kondisi aktual dan pekerjaan berikutnya |
| [TEST-RESULTS.md](TEST-RESULTS.md) | Catatan pengujian, bukan hasil perkiraan |
| [Arsitektur](docs/ARCHITECTURE.md) | Struktur aplikasi dan alur transaksi |
| [Desain](docs/design/README.md) | Brief dan catatan Figma |
| [Keputusan](docs/DECISIONS.md) | Alasan pilihan/fallback |
| [Panduan lengkap](docs/BUILD-GUIDE.md) | Semua prompt pembangunan dan pemulihan |
| [Draft submission](docs/SUBMISSION-DRAFT.md) | Naskah pitch dan checklist; belum dikirim, bukti gameplay masih diperlukan |

## Jika pindah chat atau komputer

Bawa folder proyek lengkap atau clone repository yang sudah di-push, termasuk dokumennya. Buka akar proyek di VS Code, lalu kirim prompt pemulihan di panduan. Codex perlu membaca kondisi berkas, status Git, dan bukti aktual; riwayat chat lama tidak otomatis ikut.

Jika ingin kalimat pembuka singkat sebelum menempelkan Prompt Induk: “Baca AGENTS.md dan dokumen yang dirujuk. Laporkan tujuan, aturan inti, serta kondisi nyata proyek, kemudian laksanakan Prompt Induk di docs/BUILD-GUIDE.md saja. Jangan mulai tahap berikutnya sebelum aku kirim.”

## Menjaga konteks tetap akurat

Perbarui TASKS dan STATUS pada tiap tahap; catat tes saat dijalankan; isi URL/alamat/hash hanya setelah terverifikasi. Sebelum menutup prompt, commit/push dokumen bersama perubahan terkait. Jangan memasukkan password, token akses, private key, seed phrase, data sessionStorage, atau .env rahasia ke dokumentasi.

## Menjalankan lokal

Gunakan Node.js 22.13 atau lebih baru dan npm. Dari root repository:

```powershell
npm install
npm run dev
npm run build
```

`npm run deploy` membuild `app/` lalu menjalankan Wrangler dengan `wrangler.jsonc`. Deployment publik memerlukan login Cloudflare. `npm run contracts:compile` dan `npm run contracts:test` menjalankan kompilasi/tes Hardhat. `npm run deployment:test` menguji pemulihan jurnal deployment. Hasil aktual tiap perintah ada di TEST-RESULTS.md.

Setelah deploy dikonfirmasi pengguna, `npm run deployment:verify -- <hash-transaksi-deploy>` memverifikasi receipt, chain 10143, init/runtime bytecode, blok dan view melalui RPC publik. Record `deployments/10143.json` hanya ditulis bila seluruh pemeriksaan lulus; record kontrak saat ini tersedia di repo.

## Cara mulai bermain

1. Setiap pemain membuka `/wallet`, membaca persetujuan, lalu membuat wallet bermain tersendiri.
2. Isi wallet itu dengan MON Testnet melalui wallet ekstensi atau transfer manual. Saldo ini membayar gas transaksi; setiap pemain perlu wallet dan saldo sendiri.
3. Buka `/play`. Pemain pertama membuat room untuk 2â€“4 pemain dengan durasi 30 atau 60 detik, lalu membagikan tautan room.
4. Pemain lain membuka tautan dan menekan **Gabung dengan wallet ini**. Setelah semua kursi terisi, anggota room dapat memulai ronde.
5. Pemegang bom memilih pemain lain lalu melakukan oper biasa atau oper panas. Setiap aksi adalah transaksi nyata; perubahan resmi muncul setelah receipt dan pembacaan snapshot kontrak.
6. Saat waktu chain habis, pemain yang masih punya sesi menekan **Finalisasi room**. Hasil muncul setelah kontrak berstatus `Finished`.

Jangan membuat sesi wallet baru untuk menggantikan identitas di room aktif. Jika receipt belum diketahui, gunakan **Periksa receipt** sebelum mencoba aksi lagi.

## Aturan dan alur main

- Buat room kapasitas 2–4 pemain dengan durasi 30 atau 60 detik; pembuat room memegang bom pertama. Gabung memakai ID atau tautan `/play?room=<ID>`.
- Pemegang bom memilih pemain lain. Oper biasa meneruskan giliran; tiap pemain dapat memakai oper panas satu kali untuk memangkas 3 detik. Kontrak memeriksa pemegang, giliran, penerima, jatah panas, dan deadline.
- Setelah deadline, pemegang terakhir dapat difinalisasi melalui transaksi settle; layar hasil hanya menganggap ronde selesai setelah snapshot kontrak berstatus `Finished`.
- `/play` adalah satu-satunya alur permainan. Animasi berjalan di browser; state resmi tetap berasal dari kontrak Monad Testnet.

## Wallet, gas, dan bukti

Setiap pemain membuat EOA sementara setelah persetujuan. Private key tersimpan di `sessionStorage` tab itu paling lama 10 menit. Transaksi game ditandatangani wallet bermain di browser; ekstensi hanya dipakai bila pemain memilih funding lewat wallet sumber. Isi wallet bermain dengan MON Testnet untuk gas; saldo dan perkiraan biaya diperiksa lagi sebelum aksi. Jangan gunakan wallet ini untuk aset bernilai atau membagikan seed/private key. Biaya aktual bergantung pada `gasLimit` dan fee RPC saat transaksi. Jangan mengirim ulang transaksi yang hash/receipt-nya belum jelas; gunakan **Periksa receipt**.

Alamat kontrak: `0x18097A160477E49d52A5A637d51D6B831144aDDd` di chain 10143. [Receipt deploy](https://testnet.monadvision.com/tx/0x2ea47703572772f2f32ccb65421b921ebf728b62008fc41c0340d8deb879ed82). Receipt operan dan finalisasi belum tersedia. Untuk main: buka `/play`, pilih Mulai main, buat room, salin tautan/ID, lalu pemain lain membuka link dan memilih Gabung. Pastikan masing-masing memakai wallet berbeda, Monad Testnet, dan saldo testnet.

Aturan dan keadaan permainan ditujukan on-chain; UI dan animasi berjalan di browser. Kontribusi AI: Codex membantu implementasi, dokumentasi dan pengujian; tindakan wallet serta pengujian manusia tetap dibedakan pada catatan bukti.
