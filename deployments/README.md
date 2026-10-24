# Catatan deployment publik

Folder ini menyimpan bukti deployment publik yang benar-benar dilakukan.

## Landing page Tahap 1

- Platform: Cloudflare Workers Static Assets (Vite build dari `app/dist`).
- Worker: `bom-oper`.
- URL yang dikembalikan Cloudflare pada 24 Oktober 2026: https://bom-oper.salmansegaf52.workers.dev
- Version ID: `0b0c8d8a-350d-442f-a44f-1246795488a5`.
- HTTP GET `/` dan `/room/example`: 200 dari pemeriksaan jaringan.
- Buka melalui koneksi HP: menunggu konfirmasi pengguna.

Belum ada kontrak atau deployment kontrak Monad Testnet.

## Pemeriksaan kontrak setelah persetujuan pengguna

Gunakan [helper `/setup`](https://bom-oper.salmansegaf52.workers.dev/setup). Jika transaksi sudah dikirim, gunakan bagian pemulihan hash dan **Periksa receipt tanpa kirim ulang**. Setelah receipt sukses dan bytecode/view cocok, kirim hash publik ke Codex atau unduh catatan JSON.

`npm run deployment:verify -- <hash>` membangun ulang artifact lalu membaca receipt/transaction/code/view dari RPC resmi 10143. Keberhasilan menulis `10143.json` di folder ini. Transaksi belum ditambang, revert, ordinary transfer, chain salah atau bytecode berbeda tidak menjadi record sukses. Jangan menulis alamat contoh atau hasil simulasi di folder ini.
