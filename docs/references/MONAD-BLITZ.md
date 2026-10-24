# Referensi Monad Blitz yang dipakai

Sumber pengguna: `blitz-slides-redesign.pdf`, 79 halaman, dibaca pada 24 Oktober 2026 WIB. Bagian workshop halaman 75–77 dibaca lengkap; halaman jaringan 76 juga dirender dan diperiksa. Ini referensi teknis/acara, bukan bukti deploy atau hasil tes BOM OPER. PDF utuh tidak disalin ke repository publik karena memuat informasi akses venue yang tidak dibutuhkan proyek.

## Penerapan ke BOM OPER

- Halaman 75–77: kunci dan konfirmasi deployment tetap ditangani pengguna. Pakai wallet khusus testnet dengan MON untuk gas; cukup bagikan alamat, hash receipt, chain, dan ABI. Helper BOM OPER `/setup` memakai artifact Hardhat dan wallet browser pengguna; tidak memerlukan keystore, Remix atau perpindahan stack.
- Halaman 76: Monad Testnet, chain 10143, MON, faucet `https://faucet.monad.xyz`. RPC dan explorer dicocokkan lagi dengan dokumentasi resmi, bukan hanya slide.
- Halaman 77 memakai explorer contoh lama. Proyek mempertahankan MonadVision Testnet yang masih tercantum pada dokumentasi resmi: `https://testnet.monadvision.com`.
- Halaman 10–12: repo publik, README yang akurat, app publik yang bekerja, kontrak Monad yang diterbitkan dalam waktu acara, dan alamat kontrak di README menjadi bukti penting. Belum boleh diklaim terpenuhi semuanya.
- Halaman 11 mencantumkan demo tiga menit dan batas submit 16.45; panduan proyek sebelumnya memakai jadwal contoh enam jam dan pitch dua menit. Pengguna meminta menjalankan Prompt 9 pada 24 Oktober 2026; tautan form resmi tetap belum tersedia, dan draft disiapkan tanpa mengklaim ada submission. Waktu/persyaratan perlu dicocokkan dengan form atau panitia.
- Instalasi skill tambahan, mainnet, token, mint, pembayaran, dan fitur contoh pada slide tidak dijalankan otomatis. Lingkup tetap SPEC.md, ethers v6, Hardhat, dan Monad Testnet.

## Dokumentasi resmi yang benar-benar diperiksa

- [Monad Testnet](https://docs.monad.xyz/developer-essentials/testnet.md): berhasil diambil melalui curl; chain 10143, MON, RPC `https://testnet-rpc.monad.xyz`, faucet dan MonadVision sesuai. Pembukaan URL tanpa `.md` melalui alat web gagal pada sesi ini.
- [ethers v6 providers](https://docs.ethers.org/v6/api/providers/): receipt, transaksi, `getCode`, blok dan `blockTag` untuk verifikasi/pembacaan konsisten.
- [Wrangler workers commands](https://developers.cloudflare.com/workers/wrangler/commands/workers/): deploy, dry-run dan static assets; dicocokkan dengan help Wrangler 4.152.0 milik proyek.

## Melanjutkan setelah pengguna deploy

1. Buka `/setup`; pilih **Hubungkan wallet**, **Pindah ke Monad Testnet** bila diperlukan, lalu **Periksa saldo & biaya**.
2. Tinjau estimasi dan pilih **Deploy dan minta persetujuan wallet**. Pengguna sendiri menyetujui transaksi pada wallet khusus testnet. Jika pernah mengirim deploy sebelumnya, gunakan bagian pemulihan dan jangan deploy ulang.
3. Jika refresh/koneksi terputus, pakai **Periksa receipt tanpa kirim ulang**, dengan hash dari aktivitas wallet bila belum tersimpan. Pembacaan ini tidak meminta signature.
4. Keberhasilan ditandai **Kontrak sudah terbit**, alamat, hash, runtime bytecode cocok, serta hasil view. Tombol **Unduh catatan deployments/10143.json** menyediakan bukti publik tanpa rahasia.
5. Berikan hash publik ke Codex. Jalankan `npm run deployment:verify -- <hash>` dari root untuk memeriksa ulang melalui RPC resmi dan menyimpan `deployments/10143.json`. Perintah ini tidak menandatangani/mengirim transaksi dan menolak menimpa deployment berbeda.
6. Setelah record nyata tersedia, lanjutkan konfigurasi frontend bersama, Prompt 5–8 secara berurutan. Prompt 4 masih belum lulus sebelum receipt/code/view nyata diverifikasi.
