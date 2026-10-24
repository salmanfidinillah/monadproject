# Draft presentasi dan submission BOM OPER

Status: **DRAFT — belum dikirim**. Disusun 24 Oktober 2026 WIB untuk Prompt 9. Panduan acara yang tersedia meminta formulir resmi panitia; tautan form, nama tim terdaftar, video ronde nyata, bukti screenshot Finished/explorer, dan receipt game belum tersedia. Jangan menandai isian sebagai terkirim atau demo sebagai selesai sebelum bukti ada.

## Isian dasar yang sudah terverifikasi

| Kolom | Nilai draft | Status |
|---|---|---|
| Nama proyek | BOM OPER | Siap |
| Satu kalimat | Game oper-bom multiplayer di Monad Testnet; kontrak menyimpan holder, giliran, waktu, jatah oper panas, dan hasil ronde. | Siap |
| Repository | https://github.com/salmanfidinillah/monadproject | Publik |
| Demo | https://bom-oper.salmansegaf52.workers.dev/play | Deploy aktif; ronde dua wallet belum dibuktikan |
| Network | Monad Testnet, chain ID 10143 | Terverifikasi |
| Alamat kontrak | `0x18097A160477E49d52A5A637d51D6B831144aDDd` | Receipt/code/view terverifikasi |
| Receipt deploy | https://testnet.monadvision.com/tx/0x2ea47703572772f2f32ccb65421b921ebf728b62008fc41c0340d8deb879ed82 | Tersedia |
| Receipt operan | Belum ada | Perlu ronde nyata |
| Receipt finalisasi | Belum ada | Perlu ronde nyata |
| Video/screenshot ronde | Belum ada | Rekam setelah ronde nyata |
| Nama tim/kontak | Belum diisi | Cocokkan dengan pendaftaran dan isi hanya jika form meminta |
| Tautan submission | Belum diketahui | Minta link/form resmi dari pengguna atau panitia |

## Deskripsi proyek

BOM OPER adalah party game multiplayer untuk 2–4 pemain di Monad Testnet. Pemain membuat room berkapasitas 2–4 dengan ronde 30 atau 60 detik, lalu mengoper bom kepada pemain lain. Kontrak Solidity menetapkan anggota room, holder, urutan giliran, deadline, penggunaan oper panas, dan siapa yang kalah saat ronde difinalisasi. Oper panas boleh sekali per pemain dan mengurangi waktu tiga detik jika waktu tersisa lebih dari enam detik. Frontend React/Vite membaca snapshot kontrak dan menunjukkan perubahan resmi setelah transaksi mendapat receipt. Tampilan, timer perkiraan, dan animasi tetap berjalan di browser; bukan seluruh UI yang on-chain.

## Naskah presentasi Indonesia — sekitar dua menit

“Kalau satu bom terus berpindah di antara teman-teman, siapa yang masih memegangnya saat waktunya habis? Itulah BOM OPER, party game kecil untuk dua sampai empat pemain di Monad Testnet.

Pemain membuat room dengan waktu 30 atau 60 detik. Pembuat room memulai sebagai pemegang pertama. Pemegang dapat mengoper bom kepada pemain lain. Setiap pemain punya satu kesempatan oper panas untuk memangkas tiga detik, tetapi hanya kalau sisa waktunya masih lebih dari enam detik. Saat deadline tercapai, room difinalisasi dan pemegang terakhir menjadi pihak yang kalah.

Aturan itu bukan hasil simulasi di browser: satu kontrak Solidity di Monad Testnet menyimpan anggota room, holder, giliran, deadline, jatah oper panas, dan hasil. Aplikasi membaca snapshot yang sama. Setelah transaksi mendapat receipt, UI membaca ulang state kontrak. Animasi hanya membantu menunjukkan perpindahan; animasi bukan sumber kebenaran.

Kami memilih Monad karena game ini membutuhkan banyak aksi on-chain kecil yang berulang dan perlu diproses dengan cepat. Namun setiap aksi tetap transaksi yang memerlukan saldo testnet dan persetujuan wallet. Urutan transaksi dan kapan transaksi masuk ke chain berpengaruh; klik sebelum timer habis tidak menjamin receipt akan tiba sebelum deadline. Wallet bermain yang sekarang disediakan bersifat sementara dan hanya disimpan di sessionStorage tab selama paling lama sepuluh menit. Ini prototipe testnet, bukan wallet produksi, dan tidak gasless.

Sekarang kami akan menunjukkan dua wallet berbeda membuat dan bergabung ke room, mengoper bom, lalu memfinalisasi hasil. Pemegang dan hasil akhir akan kami cocokkan dengan receipt MonadVision. Terima kasih.”

**Catatan pemakaian:** paragraf demo terakhir hanya dibacakan setelah ronde nyata dua pemain berhasil direkam. Sebelum itu, sebut demo belum lengkap. Aplikasi hanya menampilkan alur gameplay live; receipt ronde tetap harus dikumpulkan.

## Short English pitch

“BOM OPER is a multiplayer hot-potato game for two to four players on Monad Testnet. Players pass a bomb in a 30- or 60-second round. Each player can use one hot pass to subtract three seconds when more than six seconds remain. A Solidity contract stores the room, holder, turn, deadline, hot-pass usage, and final loser; the interface updates from confirmed receipts and contract snapshots. The animations run in the browser and are not the source of game truth. Each action still needs testnet gas and wallet approval, and transaction ordering can affect the outcome. The current temporary play wallet lasts at most ten minutes in the browser tab and is a testnet prototype, not a production wallet. We will show the two-player round and its pass and finish receipts on MonadVision.”

## Urutan demo dan bukti

1. Tunjukkan `/play` dan Monad Testnet 10143. Jangan hubungkan wallet otomatis.
2. Siapkan dua wallet EOA berbeda pada browser/perangkat terpisah, keduanya mempunyai saldo MON testnet.
3. Wallet pertama membuat room 2 pemain/30 detik; pemain kedua membuka invite dan bergabung.
4. Mulai ronde, tunjukkan pass biasa dan pass panas yang mendapat receipt; cocokkan snapshot holder/turn di kedua browser.
5. Setelah deadline chain, finalisasi sekali; tunjukkan status `Finished`, loser, receipt pass, dan receipt finalisasi di MonadVision.
6. Rekam video pendek serta screenshot layar hasil dan explorer hanya setelah alur tersebut sungguh selesai.

**Prasyarat yang belum dipenuhi:** belum ada dua wallet terpisah, transaksi game, receipt pass/finalisasi, dan rekaman bukti. Transaksi on-chain perlu pengguna meninjau dan menyetujui setiap popup wallet. Jangan meminta atau mengirim seed phrase/private key.

## Checklist sebelum mengirim

- [ ] Tautan/form submission resmi dikonfirmasi pengguna/panitia.
- [ ] Nama tim cocok dengan pendaftaran; kontak diisi hanya bila diminta.
- [ ] Dua alamat wallet terpisah menyelesaikan ronde; hash pass dan finalisasi dicatat.
- [ ] Video/screenshot menunjukkan game nyata, receipt dan state `Finished`.
- [ ] Link demo, repo, chain ID, dan alamat kontrak cocok.
- [ ] Pengguna meninjau final isian; kirim sesuai petunjuk panitia.
- [ ] Simpan bukti penerimaan setelah pengguna/pengirim melihat submission berhasil.
