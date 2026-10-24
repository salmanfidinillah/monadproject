# Rundown enam jam dan checklist

Semua kotak tahap awalnya kosong: belum ada kode atau pengujian game. Progres fondasi lokal dicatat di bawah; Prompt Induk belum lulus sebelum push diverifikasi. Centang hanya setelah kriteria tahap terbukti. Jadwal relatif; contoh waktu 12.00–18.00 bukan konfirmasi panitia. Checkpoint GitHub 1–2 menit termasuk dalam slot yang sama.

| Tahap | Slot | Syarat lulus |
|---|---|---|
| Induk + 0 | 00:00–00:20 | Dokumen/remote siap, Figma editable dan referensi tersimpan |
| 1 | 00:20–00:40 | Halaman awal publik dapat dibuka dari HP |
| 2 | 00:40–01:10 | Kontrak aturan inti berhasil compile |
| 3 | 01:10–01:30 | Tes perilaku/batas kontrak lulus dan gas tercatat |
| 4 | 01:30–02:00 | Deploy testnet dibuktikan receipt/code dan ABI sesuai |
| 5 | 02:00–03:00 | Wallet serta pengiriman aksi dua pemain berjalan |
| 6 | 03:00–04:00 | Lobby/arena/hasil dan satu ronde URL publik berjalan |
| 7 | 04:00–05:00 | Tes multiplayer, kasus gagal, refresh dan sinkronisasi tercatat |
| 8 | 05:00–05:30 | Build final, ronde final, README dan bukti demo |
| 9 | 05:30–06:00 | Presentasi, submission, dan bukti penerimaan |

- [ ] Induk: baca/periksa dokumen, Git/remote tujuan, commit/push fondasi.
- [ ] 0: Figma Opening/Lobby/Arena/Hasil desktop + Arena mobile, anotasi opening mobile/loading, URL/frame/tokens/preview.
- [ ] 1: app scaffold, lockfile, .gitignore, .env.example, SPA hosting, URL awal.
- [ ] 2: kontrak state machine/event/snapshot, expectedTurn, panas, deadline.
- [ ] 3: tes aturan dan batas (lihat TEST-RESULTS.md); bukan sleep dunia nyata.
- [ ] 4: deploy 10143 lewat wallet pengguna, receipt/code/ABI/record deploy.
- [ ] 5: persetujuan wallet bermain, funding gas, pending/recovery; fallback bila perlu.
- [ ] 6: Opening/Mulai Main, loading/error nyata, link room langsung, UI sesuai Figma, polling konsisten, settle, ronde publik.
- [ ] 7: dua sampai empat konteks nyata, kasus gagal, hasil sama, perbaikan terbukti.
- [ ] 8: build/deploy final, cek HP/room link, ronde final, dokumentasi/video.
- [ ] 9: pitch dua menit, form resmi, bukti submission.

Pada tiap tahap: perbarui STATUS/tes, cek diff/rahasia, commit/push, verifikasi SHA remote dan laporkan di chat. Jangan mencentang hanya karena kode telah ditulis. Jika terlambat, kurangi pemolesan/target demo ke dua pemain; jangan hapus tes inti.

## Progres Prompt Induk — 24 Oktober 2026 WIB

- [x] Baca dokumen dan cocokkan dengan berkas aktual: paket awal berisi 10 Markdown tanpa kode game.
- [x] Inisialisasi repository lokal pada main; verifikasi root dan identitas author Git yang sudah tersedia.
- [x] Tambahkan .gitignore; periksa tautan dokumen, code fence, aturan ignore, dan pola kredensial (hasil aktual: TEST-RESULTS.md).
- [x] Periksa koneksi profil GitHub: akun terhubung salmanfidinillah.
- [x] Tetapkan repository tujuan dari jawaban pengguna: salmanfidinillah/monadproject; metadata plugin melaporkan izin push, origin dipasang dan git ls-remote berhasil (remote awal kosong).
- [ ] Selesaikan checkpoint commit/push dan buktikan SHA HEAD lokal sama dengan refs/heads/main di origin; hasil commit lokal dilaporkan di chat.
- [ ] Setelah fondasi lengkap, tunggu Prompt 0 untuk desain Figma.
