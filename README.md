# BOM OPER

Game oper bom satu ronde untuk 2–4 pemain, dengan aturan di kontrak Monad Testnet. Repository: [salmanfidinillah/monadproject](https://github.com/salmanfidinillah/monadproject).

**Status 24 Oktober 2026 WIB:** kontrak BomOper sudah dideploy dan receipt/bytecode/view diverifikasi di Monad Testnet. Alamat `0x18097A160477E49d52A5A637d51D6B831144aDDd`; source explorer belum diverifikasi. [Landing publik](https://bom-oper.salmansegaf52.workers.dev), [gameplay on-chain](https://bom-oper.salmansegaf52.workers.dev/play), [pratinjau simulasi](https://bom-oper.salmansegaf52.workers.dev/prototype), [setup wallet bermain](https://bom-oper.salmansegaf52.workers.dev/wallet), dan [helper deploy](https://bom-oper.salmansegaf52.workers.dev/setup) ada di Worker yang sama. Route `/play` membaca room dari kontrak dan menyediakan create/join/start/pass/settle dengan session EOA sementara. Build dan tes lokal lulus; deploy frontend versi `dc4678cf-4b64-4904-bd43-aa6bb4540acf` sukses dan URL `/`, `/play`, `/play?room=1`, serta bundle gameplay merespons HTTP 200. Ronde dua pemain, operan, dan hasil Finished masih belum dibuktikan. Detail: [STATUS.md](STATUS.md), [record deploy](deployments/10143.json), dan [TEST-RESULTS.md](TEST-RESULTS.md).

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

## Aturan dan alur main

- Buat room kapasitas 2–4 pemain dengan durasi 30 atau 60 detik; pembuat room memegang bom pertama. Gabung memakai ID atau tautan `/play?room=<ID>`.
- Pemegang bom memilih pemain lain. Oper biasa meneruskan giliran; tiap pemain dapat memakai oper panas satu kali untuk memangkas 3 detik. Kontrak memeriksa pemegang, giliran, penerima, jatah panas, dan deadline.
- Setelah deadline, pemegang terakhir dapat difinalisasi melalui transaksi settle; layar hasil hanya menganggap ronde selesai setelah snapshot kontrak berstatus `Finished`.
- `/prototype` hanya simulasi. `/play` menggunakan Monad Testnet; animasi adalah tampilan browser, sedangkan state permainan resmi berasal dari kontrak.

## Wallet, gas, dan bukti

Wallet bermain adalah EOA sementara yang dibuat setelah klik dan persetujuan pengguna. Private key berada di `sessionStorage` paling lama 10 menit; dananya testnet saja. Jangan gunakan wallet utama atau bagikan seed/private key. Isi wallet bermain dari ekstensi, lalu tunggu saldo/estimasi aksi dibaca ulang. Biaya gas aktual bergantung pada `gasLimit` dan fee RPC pada saat transaksi; saldo MON testnet diperlukan untuk setiap aksi. Jangan mengirim ulang transaksi yang hash/receipt-nya belum jelas; gunakan Periksa receipt.

Alamat kontrak: `0x18097A160477E49d52A5A637d51D6B831144aDDd` di chain 10143. [Receipt deploy](https://testnet.monadvision.com/tx/0x2ea47703572772f2f32ccb65421b921ebf728b62008fc41c0340d8deb879ed82). Receipt operan dan finalisasi belum tersedia. Untuk main: buka `/play`, pilih Mulai main, buat room, salin tautan/ID, lalu pemain lain membuka link dan memilih Gabung. Pastikan masing-masing memakai wallet berbeda, Monad Testnet, dan saldo testnet.

Aturan dan keadaan permainan ditujukan on-chain; UI dan animasi berjalan di browser. Kontribusi AI: Codex membantu implementasi, dokumentasi dan pengujian; tindakan wallet serta pengujian manusia tetap dibedakan pada catatan bukti.
