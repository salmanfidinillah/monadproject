# BOM OPER — spesifikasi MVP

Status: spesifikasi rencana, belum diimplementasikan. Jadwal dan prompt: docs/BUILD-GUIDE.md. Kondisi aktual: STATUS.md.

## Pengguna dan permainan

Party game oper bom untuk teman yang membuka URL yang sama pada perangkat/profil browser terpisah. Pemain mengoper bom sampai waktu habis; pemegang terakhir yang sah kalah. Monad menyimpan dan menegakkan anggota, pemegang, giliran, deadline, jatah panas, serta hasil bersama. Ini memakai pola transaksi kecil berulang; performa demo harus diukur, bukan dijanjikan. Kebaruan/orisinalitas belum dibuktikan dengan riset kompetitor.

## Aturan kontrak yang dikunci

1. Kapasitas room dipilih 2, 3, atau 4 pemain. Durasi hanya 30 atau 60 detik; default 30, opsi 60/fallback terlihat jelas.
2. Pembuat room otomatis bergabung satu kali dan menjadi pemegang pertama saat mulai. Tidak ada keacakan.
3. Lifecycle Waiting → Active → Finished. Hanya anggota boleh memulai, saat jumlah pemain tepat memenuhi kapasitas. Tidak boleh join setelah mulai, join ganda, start ulang, atau settle ulang.
4. Oper biasa hanya mengubah holder dan menaikkan turn, tanpa mereset deadline.
5. Oper panas juga mengurangi deadline tepat 3 detik. Tiap pemain boleh memakai sekali per room, hanya jika deadline − block.timestamp > 6 detik.
6. Hanya holder boleh mengoper; penerima harus anggota lain. Setiap oper membawa expectedTurn yang harus sama dengan turn kontrak, agar transaksi lama tidak berlaku di giliran berikutnya.
7. Pada block.timestamp >= deadline, semua oper ditolak. Siapa pun boleh settleRoom ketika room Active dan deadline tercapai. Loser = holder terakhir, lainnya bertahan, status Finished. Satu ronde selesai; tidak ada eliminasi lanjutan.
8. Kontrak tidak berjalan sendiri saat timer habis; frontend mengirim settle sekali setelah memeriksa waktu chain, menunggu receipt, lalu membaca hasil. Sediakan finalisasi manual jika perlu.
9. Tolak room tak dikenal, kapasitas/durasi tidak valid, join penuh, oper diri sendiri/nonanggota, expectedTurn salah, settle dini/ganda. Room lain tidak saling mengubah state.
10. Tidak menerima taruhan/deposit, menyimpan dana permainan, atau menyediakan admin pengganti hasil. Emit event create/join/start/pass/finish dan sediakan pembacaan snapshot room.

Urutan transaksi chain menentukan aksi sah. Klik sebelum deadline tidak menjamin transaksi masuk sebelum deadline; koneksi dan gas dapat memengaruhi hasil. Jangan mengklaim bebas bot atau adil berdasarkan waktu klik.

## Wallet dan tampilan

- Alur layar: Opening → persiapan/loading → Lobby → Arena → Hasil. Landing opening menampilkan nama BOM OPER, ilustrasi/animasi bom ringan, aturan singkat, label Monad Testnet dan tombol Mulai Main/Cara Main. Responsif desktop/HP; tidak meminta koneksi atau tanda tangan wallet saat halaman pertama dibuka.
- Mulai Main menuju lobby; loading hanya ketika aset/konfigurasi/snapshot benar-benar disiapkan. Tampilkan pesan sesuai tahap, bukan persentase palsu atau penundaan buatan. Bedakan memuat game, menunggu persetujuan wallet, menunggu transaksi, dan menunggu finalisasi. Error memiliki pesan/tindakan yang tepat; tombol coba lagi untuk baca data tidak boleh mengirim ulang transaksi pending.
- Link room membuka room tujuan setelah persiapan tanpa dipaksa melewati opening lagi. Opening tidak memulai ronde/timer. Countdown pertandingan dimulai dari status Active kontrak. Animasi menghormati reduced motion dan tidak menahan akses ke tombol.
- Wallet utama hanya mengisi MON testnet ke wallet bermain baru melalui persetujuan wallet. Identitas pemain = alamat EOA bermain; belum ada pengikatan identitas permanen ke wallet utama.
- Pengguna menyetujui penggunaan wallet bermain otomatis. Secret hanya di sessionStorage tab yang sama, masa 10 menit; testnet saja. Tidak boleh mainnet/aset bernilai, server/log/URL/Git/analytics/VITE_. Ini kompromi prototipe, bukan keamanan wallet produksi.
- Aksi dibatasi ke chain 10143 dan kontrak game yang dikonfigurasi. Sesi hilang/kedaluwarsa berarti menonton; sesi baru untuk room baru, tanpa mengganti pemain di room aktif.
- Satu transaksi pending per pemain. Refresh memulihkan sesi/tab serta hash pending bila masih berlaku. Receipt sukses + snapshot resmi diperlukan; animasi pending ditandai terpisah.
- Lobby: connect/fund, create/join, link room, kapasitas/durasi, daftar pemain. Arena: holder, countdown perkiraan, recipient, oper biasa/panas, jatah, status dan riwayat. Hasil: loser/survivors dan bukti explorer.
- Jika wallet bermain belum stabil pada jam ketiga, pakai wallet ekstensi dengan konfirmasi tiap aksi serta durasi 60 detik. Catat keputusan dan labelnya.

## Di luar MVP

Backend API, database, WebSocket, taruhan/hadiah, NFT, token buatan, email login, profil, ranking global, chat, AI lawan, eliminasi multi-ronde. Desain Figma awal maksimal sekitar 20 menit; tidak membuat design system besar.

## Kriteria penerimaan

- URL Cloudflare publik dapat dibuka di perangkat lain, termasuk refresh link room.
- Minimum dua pemain dengan alamat bermain berbeda dari browser/perangkat terpisah menyelesaikan ronde nyata. Target dukungan kapasitas 2–4, semua aturan diuji lokal.
- Oper biasa, oper panas, deadline, expectedTurn, dan penolakan aksi tidak sah terbukti dengan tes serta pengujian publik yang relevan.
- Semua pemain membaca holder/turn/deadline/loser yang konsisten; hasil berstatus Finished on-chain, bukan state lokal.
- Ada alamat kontrak, deployment receipt, receipt operan/finalisasi, ABI yang sesuai, serta dokumentasi tes/build yang aktual.
- Desain Figma dan batas implementasinya dicatat; commit/push setiap prompt yang mengubah proyek terverifikasi; keterbatasan tersisa dilaporkan.
