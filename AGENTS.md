# Arahan proyek BOM OPER untuk Codex

## Mulai dari konteks yang benar

- Pada awal sesi atau saat melanjutkan pekerjaan, baca SPEC.md, TASKS.md, dan STATUS.md. Cocokkan dengan berkas proyek dan status Git. Paket awal hanya dokumen; jangan menganggap aplikasi sudah dibuat.
- Kerjakan tahap yang diminta pengguna. Baca bagian tahap tersebut di docs/BUILD-GUIDE.md; jangan menjalankan semua prompt sekaligus.
- Baca docs/ARCHITECTURE.md sebelum kontrak/wallet/integrasi/deploy, docs/design/README.md dan docs/design/MOTION.md sebelum desain/UI/animasi, TEST-RESULTS.md sebelum tes/perbaikan/rilis, dan docs/DECISIONS.md saat melanjutkan atau mengubah pendekatan.
- Sebutkan singkat sumber yang benar-benar dibaca dan tahap berikutnya; jangan mengaku membaca dokumen yang hilang. Lengkapi berkas yang belum ada dari spesifikasi tanpa menghapus catatan nyata.
- Instruksi pengguna terbaru berlaku; jika mengubah spesifikasi, sinkronkan dokumen yang terdampak dan jelaskan dampaknya. Jangan memperluas fitur sendiri.

## Cara bekerja

- Bahasa Indonesia sederhana. Kerjakan file dan pemeriksaan yang diperlukan, bukan berhenti pada saran.
- Satu kontrak Solidity di Monad Testnet; React/Vite/TypeScript, ethers v6, Hardhat; Cloudflare Workers Static Assets. Tidak perlu backend/database.
- Buat desain Figma yang dapat diedit pada Prompt 0 memakai plugin/skill yang tersedia. Catat URL/frame/tokens dan kendala nyata; jangan menyebut screenshot atau HTML sebagai file Figma jadi.
- Aturan dan hasil mengikuti kontrak; pindah bom/finalisasi resmi menunggu receipt sukses dan pembacaan ulang. Mock harus diberi label jelas.
- Wallet bermain EOA sementara khusus testnet, persetujuan pengguna, sessionStorage maksimal 10 menit. Ini bukan gasless atau delegated session key. Jangan meminta seed/private key wallet utama atau memasukkan rahasia ke log, Git, URL, server, analytics, maupun VITE_.
- Jangan mengganti identitas pemain di room aktif jika sesi hilang/kedaluwarsa. Baca kembali receipt pending; jangan otomatis mengirim ulang transaksi yang belum jelas.
- Jangan memasang versi/dependency atau memakai API berdasarkan ingatan saja; cocokkan dokumentasi resmi dan lockfile. Jangan menulis perintah berhasil dalam README sebelum benar-benar dijalankan.

## Selesai satu tahap

1. Jalankan pemeriksaan yang sesuai perubahan, perbaiki kegagalan, simpan hasil aktual di TEST-RESULTS.md. Jangan menandai tes lulus jika belum dijalankan.
2. Perbarui TASKS.md dan STATUS.md, serta catatan desain/keputusan jika relevan. Bedakan rencana, lokal, simulasi, dan hasil testnet publik.
3. Periksa diff dan rahasia. Commit perubahan bermakna lalu push ke repository/branch tujuan yang sama. Pengguna menghendaki checkpoint pada setiap prompt yang mengubah proyek.
4. Cocokkan git rev-parse HEAD dengan hasil git ls-remote origin refs/heads/<branch-aktif>. Laporkan pesan, SHA, branch, link commit, serta status push sebenarnya. Jangan force-push, membuat commit kosong, mengubah tanggal, atau mengarang bukti. SHA commit yang sedang dibuat dilaporkan di chat setelah commit, bukan disisipkan ke commit itu sendiri.
5. Jika remote/login belum tersedia, simpan pekerjaan, jelaskan status push yang belum selesai, minta input yang spesifik, dan lanjutkan pekerjaan independen. Jangan menebak repository atau mengganti remote proyek lain.

## Ketika membutuhkan bantuan pengguna

Jelaskan: apa yang dibutuhkan; alasannya; URL/layar/berkas yang sudah disiapkan; langkah bernomor dengan tombol yang benar-benar terlihat/terverifikasi; tanda berhasil; balasan yang diperlukan; dan pekerjaan berikutnya. Jangan meminta rahasia. Login interaktif serta konfirmasi wallet dilakukan pengguna. Jangan meminta ulang izin yang sudah diberikan.

## Bukti selesai

MVP selesai jika URL publik dapat dimainkan minimal dua pemain terpisah, dengan oper biasa/panas dan Finished yang konsisten dari kontrak, disertai receipt nyata. Tidak ada klaim deploy, desain, submit, push, atau tes sukses tanpa bukti. Jangan menghapus tes aturan inti untuk mengejar jadwal.
