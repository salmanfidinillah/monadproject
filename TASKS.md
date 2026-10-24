# Rundown enam jam dan checklist

Prompt Induk selesai dengan checkpoint GitHub terverifikasi; belum ada kode atau pengujian game. Tahap 0–9 masih belum dijalankan. Centang hanya setelah kriteria tahap terbukti. Jadwal relatif; contoh waktu 12.00–18.00 bukan konfirmasi panitia. Checkpoint GitHub 1–2 menit termasuk dalam slot yang sama.

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

- [x] Induk: baca/periksa dokumen, Git/remote tujuan, commit/push fondasi; SHA checkpoint cocok dengan origin/main (bukti di STATUS.md).
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
- [x] Commit/push fondasi berhasil; SHA fddf27fcf121c0cc8cca9b26526f1c65137a1c25 sama dengan refs/heads/main di origin, diverifikasi 24 Oktober 2026 pukul 09.19 WIB.
- [x] Fondasi lengkap; menunggu Prompt 0 untuk desain Figma.
