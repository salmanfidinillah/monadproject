# Arsitektur rencana

Belum diimplementasikan. Aturan kanonis: SPEC.md. Versi dependency, perintah, jaringan dan deployment aktual harus diverifikasi saat pembangunan; jangan mengisi bukti dari perkiraan.

## Komponen dan struktur

- app/: React/Vite/TypeScript, ethers v6, UI Opening/Lobby/Arena/Hasil, loading/error sesuai operasi nyata, snapshot/polling dan pengelolaan wallet.
- contracts/: satu BomOper.sol; test/: tes perilaku Hardhat.
- deployments/: catatan deployment publik per chain; rencana deployments/10143.json.
- docs/: panduan, arsitektur, keputusan dan acuan desain.
- Root scripts mengarah ke folder yang benar; app build terpisah dari artifact kontrak, dependency kompatibel disimpan dalam lockfile.
- Cloudflare Workers Static Assets menyajikan hasil build dengan fallback SPA. Tidak ada API backend/database pada MVP.

## Jalur transaksi

URL utama → Opening (Mulai Main/Cara Main) → persiapan aset/konfigurasi/data jika diperlukan → Lobby → Arena → Hasil. Link room menuju room yang dimaksud langsung setelah persiapan. Opening tidak memicu koneksi wallet atau memulai waktu pertandingan. Loading mengikuti operasi nyata, tanpa delay/persentase palsu; bedakan dari konfirmasi wallet dan receipt pending. Retry pembacaan data tidak boleh menyiarkan ulang transaksi.

Wallet utama → pengguna menyetujui funding MON testnet → wallet bermain browser → transaksi game ke satu kontrak Monad Testnet → receipt → snapshot kontrak → UI semua pemain diperbarui.

Wallet bermain baru = identitas on-chain per pemain. Consent harus terlihat; rahasia sessionStorage tab yang sama maksimal 10 menit, tidak disalin ke perangkat lain. Bukan delegated session key, bukan gasless, belum terikat permanen dengan wallet utama. Batasi chain/tujuan kontrak; jangan menerima private key wallet utama.

Jika jalur ini belum stabil jam ketiga, gunakan signer wallet ekstensi, konfirmasi per aksi, dan durasi 60 detik yang terlihat. Catat fallback di DECISIONS dan STATUS.

## Pembacaan dan waktu

Mulai polling sekitar 2 detik dengan cleanup/backoff; satu snapshot konsisten pada blok yang sama. Hindari polling/event listener ganda. Countdown UI berasal dari timestamp blok/deadline ditambah estimasi animasi perangkat. Kontrak memakai block.timestamp; hasil ditetapkan chain, bukan timer lokal.

Satu transaksi pending per pemain, simpan hash untuk pemulihan refresh. Oper menyertakan expectedTurn. Tidak ada retry transaksi otomatis tanpa memeriksa receipt/status. Pada waktu habis cek waktu chain, settle sekali jika memungkinkan atau tombol manual; hasil resmi hanya Finished setelah konfirmasi.

## Deploy dan konfigurasi

1. Verifikasi informasi resmi Monad, RPC eth_chainId = 10143, dukungan compiler/EVM target, compile/test, dan biaya gas aktual.
2. Deploy melalui antarmuka setup minimal yang memakai ethers ContractFactory dan wallet browser pengguna; pengguna menyetujui transaksi. Jangan meminta private key di chat/.env.
3. Verifikasi receipt sukses dan code di alamat kontrak. Catat chain, address, tx hash, blok, compiler/source dan artifact/ABI yang tepat di deployments/10143.json setelah bukti tersedia.
4. Ekspor ABI sesuai artifact ke app; masukkan chain/address sebagai konfigurasi publik build yang sama untuk semua pemain. Jangan mengandalkan localStorage satu perangkat sebagai satu-satunya konfigurasi kontrak.
5. .env.example hanya contoh publik; VITE_ masuk bundle browser dan tidak boleh berisi rahasia. Estimasi gas berdasarkan pengukuran/RPC, bukan gasLimit besar atau biaya pasti yang dikarang.
6. Build/deploy Cloudflare, uji perangkat lain dan link room, catat URL/receipt aktual di STATUS dan tes.

Snapshot minimal memuat status, anggota/kapasitas, holder, turn, deadline, jatah panas dan loser; event mendukung riwayat. Tidak perlu scan semua event dari genesis setiap render.
