# BOM OPER — paket dokumen awal untuk Codex di VS Code

Paket ini berisi rencana pembangunan dan tempat mencatat bukti. **Game belum dibangun.** Tidak ada kontrak terbit, desain Figma jadi, atau URL game yang dapat dibuka dari paket ini. Repository tujuan: [salmanfidinillah/monadproject](https://github.com/salmanfidinillah/monadproject).

Pada 24 Oktober 2026 WIB, Prompt Induk diselesaikan di folder ini: dokumen diverifikasi, Git lokal dibuat pada branch main, dan .gitignore ditambahkan. Checkpoint fondasi berhasil di-push ke repository pilihan pengguna; SHA lokal cocok dengan origin/main. Bukti dicatat di [status aktual](STATUS.md) dan [hasil pemeriksaan fondasi](TEST-RESULTS.md). Tahap berikutnya adalah Prompt 0 Figma. Kode game serta perintah build/test belum tersedia.

## Cara memakai

1. Ekstrak seluruh ZIP. Buka folder yang langsung berisi AGENTS.md memakai File → Open Folder di VS Code.
2. Untuk proyek yang sudah berjalan, gabungkan berkas yang relevan; jangan menimpa AGENTS.md, spesifikasi, atau progres yang sudah ada. Sesuaikan petunjuk jika ada aturan proyek lain.
3. Mulai sesi Codex dari akar folder ini setelah dokumen tersedia. Jika sesi sudah terbuka, minta baca ulang atau mulai sesi baru. AGENTS.md dikenali sebagai arahan; dokumen lainnya tidak otomatis dibaca seluruhnya. [Sumber resmi OpenAI](https://learn.chatgpt.com/docs/agent-configuration/agents-md).
4. Buka [panduan enam jam](docs/BUILD-GUIDE.md). Kirim Prompt Induk sekali, lalu Prompt 0 Figma, kemudian Prompt 1–9 satu per satu. Prompt Induk meminta dokumen dibaca dan diperiksa sebelum kode/desain.
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

## Jika pindah chat atau komputer

Bawa folder proyek lengkap atau clone repository yang sudah di-push, termasuk dokumennya. Buka akar proyek di VS Code, lalu kirim prompt pemulihan di panduan. Codex perlu membaca kondisi berkas, status Git, dan bukti aktual; riwayat chat lama tidak otomatis ikut.

Jika ingin kalimat pembuka singkat sebelum menempelkan Prompt Induk: “Baca AGENTS.md dan dokumen yang dirujuk. Laporkan tujuan, aturan inti, serta kondisi nyata proyek, kemudian laksanakan Prompt Induk di docs/BUILD-GUIDE.md saja. Jangan mulai tahap berikutnya sebelum aku kirim.”

## Menjaga konteks tetap akurat

Perbarui TASKS dan STATUS pada tiap tahap; catat tes saat dijalankan; isi URL/alamat/hash hanya setelah terverifikasi. Sebelum menutup prompt, commit/push dokumen bersama perubahan terkait. Jangan memasukkan password, token akses, private key, seed phrase, data sessionStorage, atau .env rahasia ke dokumentasi.
