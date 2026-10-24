# Pemulihan deploy ketika RPC wallet membatasi pengiriman

Status 24 Oktober 2026 WIB: pengguna melaporkan Aktivitas MetaMask **Gagal**. Error yang diberikan memuat `eth_sendRawTransaction: Request is being rate limited` di dalam `eth_sendTransaction`, bukan error aturan Solidity. Tidak ada hash receipt deploy yang diberikan.

Pemeriksaan read-only pada RPC QuickNode dan Monad Foundation menunjukkan chain 10143, saldo akun deploy 5 MON, nonce latest 0 dan pending 0, serta code kosong pada alamat CREATE nonce 0. Ini pengamatan pada saat pemeriksaan, bukan jaminan antrean lokal wallet kosong. Kontrak testnet belum diklaim terbit.

## Langkah pengguna

1. Pastikan Aktivitas MetaMask menunjukkan percobaan **Gagal**, bukan tertunda. Jika ada hash/pending, gunakan **Periksa receipt tanpa kirim ulang**; jangan memakai jalur tanpa hash.
2. Bila RPC wallet masih dibatasi, buka menu MetaMask → **Networks/Jaringan**, pilih tiga titik pada **Monad Testnet** lalu edit.
3. Pada **Default RPC URL**, pilih **Add RPC URL**, masukkan `https://rpc-testnet.monadinfra.com`, beri nama pengenal dan simpan. Pilih sebagai RPC default; jaringan tetap Monad Testnet chain 10143. Nama tombol mengikuti [panduan resmi MetaMask](https://support.metamask.io/configure/networks/how-to-add-a-custom-network-rpc); terjemahan dapat berbeda.
4. Refresh [helper BOM OPER](https://bom-oper.salmansegaf52.workers.dev/setup). Di bagian pemulihan, centang pernyataan sudah memeriksa Aktivitas: percobaan gagal dan tidak ada deploy tertunda.
5. Tekan **Periksa akun & siapkan coba ulang**. Ini hanya membaca dua RPC resmi, tidak membuka signature atau mengirim transaksi.
6. Bila pemeriksaan cocok, tekan **Periksa saldo & biaya** di panel atas. Setelah pra-deploy lulus, tekan **Deploy dan minta persetujuan wallet** satu kali. Pengguna sendiri meninjau/menyetujui transaksi.
7. Tunggu receipt dan verifikasi bytecode/view, lalu berikan hash publik dari **Kontrak sudah terbit**. Jika status belum jelas, periksa hash yang sama; jangan kirim otomatis lagi.

RPC Foundation tercantum pada [dokumentasi resmi Monad Testnet](https://docs.monad.xyz/developer-essentials/testnet.md), tanpa dukungan batch. Helper memakai `batchMaxCount: 1` pada kedua provider pemeriksaan. Penggantian RPC pembacaan aplikasi saja tidak mengubah RPC pengiriman yang dipilih MetaMask.

## Pengaman implementasi

- Jurnal lama tanpa hash/nonce hanya dapat dipersiapkan jika dua RPC sepakat latest/pending nonce 0 dan code CREATE pertama kosong, ditambah konfirmasi pemeriksaan Aktivitas pengguna.
- Jurnal baru mencatat nonce sebelum wallet diminta mengirim. Percobaan manual mengunci nonce/pengirim yang sama; tidak menaikkan nonce agar request lama yang terlambat tidak membuat kontrak kedua.
- Nonce/pending berbeda, code terlihat, chain salah, provider gagal, atau hash sudah tersedia memblokir jalur coba ulang. Hash tersedia wajib diperiksa melalui receipt.
- Memeriksa kesiapan, refresh atau membuka halaman tidak mengirim transaksi. Tombol deploy melakukan pemeriksaan lagi dan tetap meminta konfirmasi wallet.
- Penolakan atas konfirmasi coba ulang mempertahankan nonce percobaan asal. Jurnal tidak dihapus untuk sekadar membuka tombol deploy.
- Error UI ditulis singkat; payload/bytecode mentah tidak ditampilkan sebagai pesan pengguna. Ini bukan penghapusan bukti transaksi.

Peringatan reputasi domain MetaMask sebelumnya tetap belum dijelaskan. Pengguna secara eksplisit memilih melanjutkan sendiri; agen tidak mematikan perlindungan atau mengklaim klasifikasi sudah diperbaiki. Draf peninjauan tetap tersedia di `references/METAMASK-REVIEW.md`.
