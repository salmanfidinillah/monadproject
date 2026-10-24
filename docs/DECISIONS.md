# Keputusan dan perubahan

Tabel ini memuat keputusan rencana dari pengguna/panduan dan status aktual fondasi. Implementasi game dan fallback belum dijalankan.

| Keputusan rencana | Alasan | Status |
|---|---|---|
| Satu ronde 2–4 pemain, creator holder pertama | Lingkup enam jam, tanpa kebutuhan randomness | Direncanakan |
| Aturan/hasil di kontrak Monad | Semua pemain memakai state bersama yang dapat diperiksa | Direncanakan |
| Frontend statis tanpa backend | Mengurangi komponen yang perlu dibangun/deploy | Direncanakan |
| Figma sebelum UI, sekitar20menit | Acuan visual konkret dan editable | Lima frame editable dibuat dan diperiksa pada Prompt 0 |
| Opening + loading nyata sebelum lobby | Sambutan game dan status persiapan yang mudah dipahami; tanpa menambah waktu buatan | Diminta pengguna, belum diimplementasikan |
| Commit/push tiap prompt bermakna | Riwayat pembangunan nyata dan pemulihan konteks | Diterapkan pada Prompt Induk; checkpoint fondasi terverifikasi |
| Dokumen sejak awal dan AGENTS sebagai pengarah | Codex di VS Code dapat melanjutkan dengan konteks berkas | Paket dokumen tersedia |
| EOA sementara testnet/sessionStorage10menit | Mengurangi popup saat demo; kompromi prototipe | Direncanakan, belum diuji |
| Fallback ekstensi+60detik | Jika wallet bermain belum stabil jam ketiga | Belum diaktifkan |
| Minimum demo dua pemain nyata | Jika empat konteks belum stabil | Belum diaktifkan |

Setiap perubahan berikutnya mencatat waktu aktual, pemicu, pilihan, alasan, dampak pada SPEC/UI/tes/jadwal, dan bukti. Jika pengguna mengubah lingkup, sinkronkan dokumen terkait. Jangan diam-diam mengganti aturan/durasi/identitas atau menyebut fallback sebagai target asli yang sudah selesai.

## 24 Oktober 2026 WIB — fondasi Prompt Induk

- Pemicu: pengguna mengirim Prompt Induk dan meminta fondasi dokumen serta checkpoint GitHub sebelum Prompt 0.
- Pilihan: gunakan folder dokumen ini sebagai root repository lokal pada branch main, pertahankan spesifikasi serta catatan awal, dan tambahkan .gitignore sebelum staging.
- Alasan: pemeriksaan awal membuktikan folder belum menjadi repository dan belum berisi implementasi. Tidak ada proyek, remote, atau deployment lama yang diubah.
- Tujuan remote menunggu input pengguna; profil GitHub yang terhubung tidak dianggap sebagai pilihan repository atau bukti izin push. Simpan checkpoint lokal sambil menunggu tujuan yang eksplisit.
- Dampak: aturan game, stack, UI rencana, dan urutan tahap tetap mengikuti SPEC serta BUILD-GUIDE. Prompt Induk belum selesai sampai push diverifikasi; desain Figma dan kode dikerjakan pada prompt berikutnya.
- Bukti: STATUS.md dan TEST-RESULTS.md mencatat perintah serta hasil pemeriksaan aktual; SHA commit dilaporkan di chat sesudah commit dijalankan.

Pembaruan: pengguna memilih salmanfidinillah/monadproject melalui URL repository. Metadata serta git ls-remote membuktikan remote awal kosong dan default branch main; origin lokal ditetapkan ke URL yang diberikan. Tidak ada perubahan pilihan stack atau aturan permainan.

Hasil: pada 24 Oktober 2026 pukul 09.19 WIB, push fondasi berhasil dan SHA lokal cocok dengan origin/main. Bukti commit yang sudah terbit tersimpan di STATUS.md dan TEST-RESULTS.md. Prompt Induk selesai; menunggu Prompt 0 sesuai urutan yang diminta.

## 24 Oktober 2026 WIB — Prompt 0, acuan visual

- Pengguna meminta lima frame editable sebelum frontend. Satu plan terdeteksi; create/read/write berhasil pada file baru BOM OPER — MVP, tanpa perubahan izin akun.
- Tidak ada codebase, Code Connect, screen lama atau library terpasang. Library komunitas diperiksa; fondasi game minimum dibuat lokal agar palet dan state mengikuti brief tanpa library besar.
- Font Space Grotesk Bold untuk judul/timer, Inter untuk isi/kontrol; nama font/style diverifikasi. Token aktual di docs/design/tokens.json.
- Auto-layout mengatur konten berkaitan; tombol/kartu memakai instance; bom berupa SVG vektor editable. Arena desktop melingkar, mobile 2 × 2 demi keterbacaan.
- Tidak mengubah SPEC, durasi, jatah panas, expectedTurn atau finalisasi. Mock berlabel tanpa receipt palsu. Consent/reduced motion/responsive/state transaksi perlu diuji pada tahap frontend.
- Bukti URL/node/preview di docs/design/README.md; audit JSON tersimpan. Checkpoint Git desain dicatat setelah commit/push dan pencocokan SHA dijalankan.

Checkpoint desain berhasil di-push pada 24 Oktober 2026 pukul 09.41 WIB, SHA lokal cocok dengan remote. Prompt 0 selesai; tahap berikutnya Prompt 1 sesuai instruksi pengguna. Belum ada perubahan stack, aturan, implementasi game atau deployment.
