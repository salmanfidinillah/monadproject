# Catatan deployment publik

Folder ini menyimpan bukti deployment publik yang benar-benar dilakukan.

## Landing page Tahap 1

- Platform: Cloudflare Workers Static Assets (Vite build dari `app/dist`).
- Worker: `bom-oper`.
- URL yang dikembalikan Cloudflare pada 24 Oktober 2026: https://bom-oper.salmansegaf52.workers.dev
- Version ID: `0b0c8d8a-350d-442f-a44f-1246795488a5`.
- HTTP GET `/` dan `/room/example`: 200 dari pemeriksaan jaringan.
- Buka melalui koneksi HP: menunggu konfirmasi pengguna.

## BomOper Monad Testnet

- Chain ID: `10143`.
- Alamat: `0x18097A160477E49d52A5A637d51D6B831144aDDd`.
- Transaksi deploy: `0x2ea47703572772f2f32ccb65421b921ebf728b62008fc41c0340d8deb879ed82`.
- Blok: `73761560`.
- Status: receipt, init bytecode, runtime bytecode, blok kanonis, dan panggilan view diverifikasi lewat `npm run deployment:verify`. Source explorer belum diverifikasi.
- Record lengkap: [`10143.json`](10143.json).

## Verifikasi ulang

Periksa ulang dengan `npm run deployment:verify -- 0x2ea47703572772f2f32ccb65421b921ebf728b62008fc41c0340d8deb879ed82`.

Verifikasi membaca RPC dan tidak mengirim transaksi. Record menjadi sumber konfigurasi alamat publik untuk build frontend; exporter menghentikan build bila source/compiler tidak cocok. Transaksi belum ditambang, revert, ordinary transfer, chain salah atau bytecode berbeda tidak menjadi record sukses.
