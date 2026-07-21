# Cara pasang

1. **`tsconfig.node.json`** → replace file yang lama (ini yang fix error `babel__core`).
2. **`src/components/ScrollVideoExperience.tsx`** → replace file yang lama.
3. **`src/App.tsx`** → replace file yang lama.
4. **`kamera-hero.mp4`** → taruh di folder `public/` (video baru Anda, sudah saya rename).
5. **`camera-front.png`** → taruh di folder `public/` (ini `image-removebg-preview.png` Anda, sudah saya rename).

Kalau `npm run dev` masih error TS soal `babel__core` setelah ganti tsconfig.node.json, hapus `node_modules` + `package-lock.json` lalu `npm install` ulang sekali — kadang installnya kepotong di tengah jalan dan itu bikin folder `@types` korup.

## Yang saya asumsikan (tolong dicek pas preview)
- Total scroll section = **900vh**. Kalau kerasa masih kecepetan/lambat pas discroll, tinggal ubah angka `SECTION_VH` di baris atas file.
- Breakpoint fase (intro → zoom-in → **label** → rotate-balik → docking) saya set di `P_INTRO_END / P_ZOOM_IN_END / P_LABELS_END / P_ROTATE_BACK_END` — semua dalam skala 0–1 (persen scroll), bukan detik, sesuai permintaan Anda yang mau full scroll-controlled + reversible.
- 25 pin nama tombol saya ambil koordinatnya langsung dari `detail.png` (deteksi titik secara presisi, bukan kira-kira), tapi kalau ada 1-2 yang masih agak geser dari tombol aslinya di video, tinggal edit angka `x` / `y` di array `HUD_SPECS` — satu baris per tombol, nggak perlu ubah logic lain.
- Posisi `camera-front.png` pas docking saya hitung dari overlay yang saya cocokkan sebelumnya (skala ±1.038×) — kalau masih ada gap kecil pas transisi terakhir, kabari saya, tinggal saya geser angka `DOCK_RECT`.

## Belum saya kerjakan — mesin_terbuka.png
Gambar exploded-view (26 label Bahasa Indonesia) itu belum saya masukkan ke section manapun, karena itu bukan bagian dari video 10 detik ini (itu render terpisah). Kalau maunya itu jadi section baru setelah kamera "landing" di section berikutnya (mirip section anatomy di project versi lama), bilang aja — saya buatkan sebagai section statis baru (bukan video-driven, tapi scroll-reveal biasa) pakai gambar itu + 26 titiknya.
