# Permintaan peninjauan peringatan MetaMask

24 Oktober 2026 WIB. Status: **draf; belum dikirim; penyebab belum terkonfirmasi**. Screenshot pengguna memperlihatkan peringatan domain saat menghubungkan wallet, sebelum persetujuan deploy. Ini bukan error saldo gas atau bukti transaksi gagal.

## Langkah pengguna sekarang

1. Pada layar peringatan pilih **Kembali ke keamanan**. Hentikan koneksi/deploy dari domain yang ditandai.
2. Buka [panduan resmi security alerts MetaMask](https://support.metamask.io/configure/wallet/security-alerts/). Bagian pelaporan menjelaskan bahwa peringatan URL perlu peninjauan support, sedangkan tombol report pada alert hanya tersedia untuk transaksi.
3. Gunakan bagian **Contact support** dan **Continue without wallet** bila ditampilkan. Kirim draf di bawah bersama screenshot peringatan yang sudah dipotong agar tidak memuat rahasia. Tidak perlu seed/private key, password atau ekspor state wallet.
4. Simpan nomor kasus/tautan balasan support dan berikan ke Codex. Tanda peninjauan selesai adalah jawaban resmi tentang klasifikasi domain dan, bila dikoreksi, koneksi baru tidak lagi memunculkan label berbahaya. Waktu/hasil review belum diketahui.
5. Setelah masalah domain selesai, kembali ke pra-deploy Prompt 4. Jika sudah pernah mengirim transaksi, periksa receipt hash yang sama; jangan otomatis deploy ulang.

## Draf untuk support

Subject: Request for manual review of MetaMask unsafe website classification — BOM OPER testnet project

Hello MetaMask Support,

I maintain the BOM OPER hackathon project at https://bom-oper.salmansegaf52.workers.dev. MetaMask displays the Indonesian warning "Berbahaya—ditandai sebagai tidak aman" when attempting to connect Account 1 to this origin. Please review the classification and tell us the reason or required remediation. We have not established that this is a false positive.

Public project repository: https://github.com/salmanfidinillah/monadproject

Deployment helper: https://bom-oper.salmansegaf52.workers.dev/setup

Intended network: Monad Testnet, chain ID 10143. No successful contract deployment or deployment transaction hash has been provided yet. The helper is intended to deploy the compiled BomOper contract through an explicitly approved browser-wallet transaction. Source: contracts/BomOper.sol and app/src/DeploySetup.tsx in the public repository.

Initial investigation on 24 October 2026 found no exact or parent-domain match for bom-oper.salmansegaf52.workers.dev in the public MetaMask eth-phishing-detect configuration fetched from main. This check does not cover fuzzy matching, live lists, cached client state, or other security providers. All 12 files served by the public deployment matched the local build byte-for-byte after following the canonical /index.html redirect. These limited checks do not establish website safety or explain the warning.

We have stopped the connection/deployment flow pending review. Please see the attached screenshot of the warning. Let us know what additional non-secret project information you need.

## Batas pemeriksaan dan sumber

- [MetaMask security alerts](https://support.metamask.io/configure/wallet/security-alerts/): klasifikasi memakai analisis dan beberapa penyedia; peringatan malicious berarti hentikan koneksi/signature. Laporan URL ditujukan ke support. Jangan mengklaim seluruh workers.dev diblokir atau bahwa domain baru pasti menyebabkan warning.
- [MetaMask deceptive site guidance](https://support.metamask.io/stay-safe/safety-in-web3/deceptive-site-ahead-when-trying-to-connect-to-a-site): merekomendasikan tidak menghubungkan wallet ke domain yang memperlihatkan peringatan dan menyediakan jalur review.
- [Konfigurasi publik eth-phishing-detect](https://raw.githubusercontent.com/MetaMask/eth-phishing-detect/main/src/config.json): version 2 pada waktu pemeriksaan; exact/parent match di blacklist, whitelist dan fuzzylist kosong. Algoritme fuzzy dan API klasifikasi live tidak diperiksa. Salinan pemeriksaan disimpan sementara di tmp/, tidak masuk Git.
- SHA-256 salinan config saat diperiksa: `219882f9f5a2e89acd44b076277b9d45f5ac7a5b13c39b7898a39966dfb40ef3`. Ini fingerprint bahan triase pada saat pemeriksaan, bukan hasil penilaian keamanan domain.
- [Source checkpoint yang dibandingkan](https://github.com/salmanfidinillah/monadproject/commit/c24500b93aef836f7f8b45a9dce081074c7fd411). Tidak ada perubahan source/dependency/kontrak atau deployment baru saat investigasi ini. Tidak mematikan perlindungan wallet dan tidak mengganti domain untuk menghindari peringatan.

Tidak ada laporan yang dikirim, koreksi klasifikasi yang diterima, koneksi berhasil, atau deploy yang diklaim. Pengiriman pesan ke support memerlukan tindakan eksplisit pengguna.
