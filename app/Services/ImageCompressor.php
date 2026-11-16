<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Kompres foto jadi JPEG maksimal ~1 MB memakai ekstensi GD bawaan PHP
 * (tidak butuh paket composer tambahan).
 */
class ImageCompressor
{
    // batas ukuran hasil (di bawah 1 MB) dan sisi terpanjang awal (piksel)
    private int $maxBytes = 1_000_000;
    private int $maxSisi  = 1920;

    /**
     * Kompres lalu simpan. Mengembalikan path file (sama seperti ->store()).
     */
    public function simpan(UploadedFile $file, string $folder, string $disk = 'public'): string
    {
        $path = trim($folder, '/') . '/' . Str::uuid() . '.jpg';

        Storage::disk($disk)->put($path, $this->kompres($file));

        return $path;
    }

    /**
     * Hasil kompres berupa isi file JPEG (string), maksimal ~1 MB.
     */
    public function kompres(UploadedFile $file): string
    {
        if (! extension_loaded('gd')) {
            throw new \RuntimeException('Ekstensi GD belum aktif di PHP.');
        }

        $asli = @imagecreatefromstring((string) file_get_contents($file->getRealPath()));

        if ($asli === false) {
            throw new \RuntimeException('File gambar tidak dapat dibaca.');
        }

        // Foto HP sering "miring" karena info rotasi (EXIF): betulkan dulu.
        $asli = $this->perbaikiOrientasi($asli, $file);

        $lebarAsli  = imagesx($asli);
        $tinggiAsli = imagesy($asli);
        $sisi       = $this->maxSisi;
        $hasil      = '';

        while (true) {
            // Perkecil hanya kalau lebih besar dari $sisi (foto kecil tidak di-zoom).
            $skala  = min(1, $sisi / max($lebarAsli, $tinggiAsli));
            $lebar  = max(1, (int) round($lebarAsli * $skala));
            $tinggi = max(1, (int) round($tinggiAsli * $skala));

            $gambar = imagecreatetruecolor($lebar, $tinggi);

            // Latar putih (PNG transparan tidak jadi hitam saat jadi JPEG).
            imagefill($gambar, 0, 0, imagecolorallocate($gambar, 255, 255, 255));

            imagecopyresampled(
                $gambar, $asli,
                0, 0, 0, 0,
                $lebar, $tinggi,
                $lebarAsli, $tinggiAsli
            );

            // turunkan kualitas bertahap
            foreach ([85, 75, 65, 55] as $kualitas) {
                ob_start();
                imagejpeg($gambar, null, $kualitas);
                $hasil = (string) ob_get_clean();

                if (strlen($hasil) <= $this->maxBytes) {
                    imagedestroy($gambar);
                    imagedestroy($asli);

                    return $hasil;
                }
            }

            imagedestroy($gambar);

            // masih kebesaran: kecilkan dimensi 20% lalu ulangi
            if ($sisi <= 640) {
                imagedestroy($asli);

                return $hasil;
            }

            $sisi = (int) ($sisi * 0.8);
        }
    }

    /**
     * Putar gambar sesuai tag Orientation pada EXIF (hanya JPEG).
     */
    private function perbaikiOrientasi($gambar, UploadedFile $file)
    {
        if (
            ! function_exists('exif_read_data')
            || $file->getMimeType() !== 'image/jpeg'
        ) {
            return $gambar;
        }

        $exif = @exif_read_data($file->getRealPath());
        $orientasi = (int) ($exif['Orientation'] ?? 1);

        $sudut = match ($orientasi) {
            3 => 180,
            6 => -90,
            8 => 90,
            default => 0,
        };

        if ($sudut === 0) {
            return $gambar;
        }

        $putar = imagerotate($gambar, $sudut, 0);

        if ($putar === false) {
            return $gambar;
        }

        imagedestroy($gambar);

        return $putar;
    }
}
