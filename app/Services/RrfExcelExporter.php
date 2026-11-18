<?php

namespace App\Services;

use App\Models\Rrf;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\MemoryDrawing;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

/**
 * Membuat file Excel untuk RRF yang sudah Completed (status "terverifikasi").
 *
 *  - formulir() : 1 RRF  -> 1 lembar berbentuk Repair Request Form (FM-101)
 *  - daftar()   : banyak -> 1 lembar tabel rekap
 */
class RrfExcelExporter
{
    /** Lebar tiap kolom A..L dalam piksel (dipakai juga untuk menghitung posisi foto). */
    private const KOLOM_PX = 110;

    /** Tinggi baris area isi (24 pt = 32 px). */
    private const BARIS_PT = 24;
    private const BARIS_PX = 32;

    private const MAKS_FOTO = 5;

    /* ================================================================
     | FORMULIR 1 RRF
     ================================================================ */

    public function formulir(Rrf $rrf): Spreadsheet
    {
        $rrf->loadMissing(['mtcRepair', 'parts', 'photos']);

        $d = $this->siapkan($rrf);

        $book = new Spreadsheet();
        $book->getProperties()
            ->setCreator('Maintenance Division')
            ->setTitle('Repair Request Form ' . ($d['rrf_no'] ?? ''));

        $s = $book->getActiveSheet();
        $s->setTitle('RRF');

        $s->setShowGridlines(false);

        foreach (range('A', 'L') as $kol) {
            $s->getColumnDimension($kol)->setWidth(self::KOLOM_PX, 'px');
        }

        // Palet warna
        $navy  = '0A1A4D';
        $biru  = '1E40AF';
        $muda  = 'E0E7FF';
        $fillLabel = 'F1F5F9';
        $garis = 'CBD5E1';
        $teks  = '0F172A';
        $abu   = '64748B';
        $hijau = '16A34A';

        $tengah = Alignment::HORIZONTAL_CENTER;
        $kanan  = Alignment::HORIZONTAL_RIGHT;
        $atas   = Alignment::VERTICAL_TOP;

        /** Isi + gaya satu sel / rentang gabungan. Nilai selalu ditulis sebagai teks/angka (bukan rumus). */
        $set = function (string $range, $nilai = null, array $o = []) use ($s, $garis, $teks) {
            if (str_contains($range, ':')) {
                $s->mergeCells($range);
            }

            $awal = explode(':', $range)[0];

            if ($nilai !== null) {
                if (is_int($nilai)) {
                    $s->setCellValueExplicit($awal, $nilai, DataType::TYPE_NUMERIC);
                } else {
                    $s->setCellValueExplicit($awal, (string) $nilai, DataType::TYPE_STRING);
                }
            }

            $st = $s->getStyle($range);

            if (($o['border'] ?? true) === true) {
                $st->getBorders()->getAllBorders()
                    ->setBorderStyle(Border::BORDER_THIN)
                    ->getColor()->setRGB($garis);
            }

            $st->getAlignment()
                ->setHorizontal($o['h'] ?? Alignment::HORIZONTAL_LEFT)
                ->setVertical($o['v'] ?? Alignment::VERTICAL_CENTER)
                ->setWrapText($o['wrap'] ?? true);

            if (isset($o['indent'])) {
                $st->getAlignment()->setIndent($o['indent']);
            }

            $st->getFont()
                ->setSize($o['size'] ?? 9)
                ->setBold($o['bold'] ?? false)
                ->setItalic($o['italic'] ?? false)
                ->getColor()->setRGB($o['warna'] ?? $teks);

            if (!empty($o['fill'])) {
                $st->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB($o['fill']);
            }
        };

        /** Judul bagian: latar biru muda + garis navy di bawah. */
        $judul = function (string $range, string $teksJudul, int $baris) use ($set, $s, $navy, $muda) {
            $set($range, $teksJudul, [
                'bold' => true, 'size' => 10, 'warna' => $navy, 'fill' => $muda, 'border' => false, 'indent' => 1,
            ]);
            $s->getStyle($range)->getBorders()->getBottom()
                ->setBorderStyle(Border::BORDER_MEDIUM)->getColor()->setRGB($navy);
            $s->getRowDimension($baris)->setRowHeight(22);
        };

        /** Pasangan label (kecil, abu) di atas nilai (tebal): 2 baris. */
        $kv = function (string $kolom, int $baris, string $label, $nilai) use ($set, $s, $abu, $fillLabel) {
            [$c1, $c2] = explode(':', $kolom);

            $set("{$c1}{$baris}:{$c2}{$baris}", $label, [
                'size' => 8, 'bold' => true, 'warna' => $abu, 'fill' => $fillLabel, 'indent' => 1,
            ]);

            $v = $baris + 1;
            $set("{$c1}{$v}:{$c2}{$v}", $nilai === null || $nilai === '' ? '-' : $nilai, [
                'size' => 10, 'bold' => true, 'indent' => 1,
            ]);

            $s->getRowDimension($baris)->setRowHeight(15);
            $s->getRowDimension($v)->setRowHeight(24);
        };

        /** Label kecil untuk blok isian. */
        $sub = fn (string $range, string $t) => $set($range, $t, [
            'size' => 8, 'bold' => true, 'warna' => $navy, 'fill' => $fillLabel, 'indent' => 1,
        ]);

        $spasi = fn (int $baris) => $s->getRowDimension($baris)->setRowHeight(8);

        /* ---------- BANNER ---------- */
        $s->getRowDimension(1)->setRowHeight(38);
        $s->getRowDimension(2)->setRowHeight(20);

        $set('A1:H1', 'REPAIR REQUEST FORM', [
            'bold' => true, 'size' => 20, 'warna' => 'FFFFFF', 'fill' => $navy, 'border' => false, 'wrap' => false, 'indent' => 1,
        ]);
        $set('I1:L1', 'RRF No. ' . ($d['rrf_no'] ?? '-'), [
            'bold' => true, 'size' => 13, 'warna' => 'FFFFFF', 'fill' => $navy, 'border' => false, 'h' => $kanan, 'indent' => 1,
        ]);
        $set('A2:H2', 'JI SEAT INDONESIA   |   Maintenance Division   |   Form FM-101 / FJI-PD-01   |   Rev ' . $d['rev'], [
            'size' => 9, 'warna' => 'C7D2FE', 'fill' => $biru, 'border' => false, 'indent' => 1,
        ]);
        $set('I2:L2', '✔ COMPLETED', [
            'bold' => true, 'size' => 10, 'warna' => 'FFFFFF', 'fill' => $hijau, 'border' => false, 'h' => $tengah,
        ]);
        $spasi(3);

        /* ---------- INFORMASI PERMINTAAN ---------- */
        $judul('A4:L4', 'INFORMASI PERMINTAAN', 4);

        $kv('A:C', 5, 'ID QMOS', $d['qmos_id']);
        $kv('D:F', 5, 'LOKASI', $d['lokasi']);
        $kv('G:I', 5, 'MESIN', $d['mesin_nama']);
        $kv('J:L', 5, 'NO. MESIN', $d['mesin_no']);

        $kv('A:C', 7, 'DIVISI PELAPOR', $d['divisi']);
        $kv('D:F', 7, 'CLASS', $d['class']);
        $kv('G:I', 7, 'JENIS PERMINTAAN',
            ($d['terencana'] ? '☑' : '☐') . ' Terencana    ' . ($d['troubleshooting'] ? '☑' : '☐') . ' Troubleshooting');
        $kv('J:L', 7, 'PEMOHON', $d['requested_by']);
        $spasi(9);

        /* ---------- JADWAL & DURASI ---------- */
        $judul('A10:L10', 'JADWAL & DURASI', 10);

        $kv('A:C', 11, 'MULAI PERMINTAAN', trim($d['req_tanggal'] . ' ' . $d['req_jam']));
        $kv('D:F', 11, 'SERV. SCHEDULE', trim($d['serv_tanggal'] . ' ' . $d['serv_jam']));
        $kv('G:I', 11, 'DOWN TIME', $d['downtime']);
        $kv('J:L', 11, 'STOP LINE', $d['downtime']);

        $kv('A:D', 13, 'MAN (PIC MTC)', $d['pic']);
        $kv('E:H', 13, 'SHIFT', $d['shift']);
        $kv('I:L', 13, 'TIME REPAIR', $d['downtime']);
        $spasi(15);

        /* ---------- DETAIL PENANGANAN (kiri) + FOTO (kanan) ---------- */
        $judul('A16:H16', 'DETAIL PENANGANAN', 16);
        $judul('I16:L16', 'FOTO PERUBAHAN', 16);

        $sub('A17:H17', '1. PROBLEM');
        $set('A18:H21', $d['problem'], ['v' => $atas, 'size' => 10, 'indent' => 1]);

        $sub('A22:H22', '2. CAUSE (PENYEBAB)');
        $set('A23:H26', $d['cause'], ['v' => $atas, 'size' => 10, 'indent' => 1]);

        $sub('A27:H27', '3. REQUEST ACTIVITY & COUNTER MEASURE');
        $set('A28:H31', $d['counter_measure'], ['v' => $atas, 'size' => 10, 'indent' => 1]);

        $sub('A32:H32', '4. REMARK');
        $set('A33:H35', $d['remark'], ['v' => $atas, 'size' => 10, 'indent' => 1]);

        // Tabel part
        $hdr = [
            ['A36:B36', 'PART NAME'],
            ['C36:D36', 'MODEL / TYPE'],
            ['E36:F36', 'MAKER'],
            ['G36', 'QTY'],
            ['H36', 'OTHER'],
        ];

        foreach ($hdr as [$rg, $t]) {
            $set($rg, $t, ['size' => 8, 'bold' => true, 'warna' => $navy, 'fill' => $muda, 'h' => $tengah]);
        }

        $jumlahPart = max(3, min(10, count($d['parts'])));

        for ($i = 0; $i < $jumlahPart; $i++) {
            $b = 37 + $i;
            $p = $d['parts'][$i] ?? null;

            $set("A{$b}:B{$b}", $p['part_name'] ?? '', ['indent' => 1, 'size' => 10]);
            $set("C{$b}:D{$b}", $p['model_type'] ?? '', ['indent' => 1, 'size' => 10]);
            $set("E{$b}:F{$b}", $p['maker'] ?? '', ['indent' => 1, 'size' => 10]);
            $set("G{$b}", isset($p['qty']) ? (int) $p['qty'] : '', ['h' => $tengah, 'size' => 10]);
            $set("H{$b}", $p['other'] ?? '', ['indent' => 1, 'size' => 10]);
        }

        $e = 36 + $jumlahPart; // baris terakhir bagian kiri

        /* ---------- area foto: kolom I:L, baris 17..$e ---------- */
        for ($b = 17; $b <= $e; $b++) {
            $s->getRowDimension($b)->setRowHeight(self::BARIS_PT);
        }

        $areaTotal   = ($e - 17 + 1) - 2;
        $barisBefore = intdiv($areaTotal, 2);
        $barisAfter  = $areaTotal - $barisBefore;

        $awalBefore  = 18;
        $akhirBefore = $awalBefore + $barisBefore - 1;
        $labelAfter  = $akhirBefore + 1;
        $awalAfter   = $labelAfter + 1;

        $sub('I17:L17', 'BEFORE');
        $set("I{$awalBefore}:L{$akhirBefore}", '');
        $sub("I{$labelAfter}:L{$labelAfter}", 'AFTER');
        $set("I{$awalAfter}:L{$e}", '');

        $this->tempelFoto($s, $rrf->photos->where('tipe', 'before')->values(), $awalBefore, $barisBefore);
        $this->tempelFoto($s, $rrf->photos->where('tipe', 'after')->values(), $awalAfter, $barisAfter);

        /* ---------- PENGESAHAN (kotak tanda tangan kosong, tanpa nama) ---------- */
        $spasi($e + 1);

        $h = $e + 2;
        $judul("A{$h}:L{$h}", 'PENGESAHAN', $h);

        $l  = $h + 1;
        $b1 = $l + 1;
        $b2 = $l + 2;
        $n  = $l + 3;

        $s->getRowDimension($l)->setRowHeight(18);
        $s->getRowDimension($b1)->setRowHeight(30);
        $s->getRowDimension($b2)->setRowHeight(30);
        $s->getRowDimension($n)->setRowHeight(16);

        $ttd = [
            ['A', 'C', 'SUPERVISOR (PRODUKSI)'],
            ['D', 'F', 'REQUESTED BY (PRODUKSI)'],
            ['G', 'I', 'SUPERVISOR (MAINTENANCE)'],
            ['J', 'L', 'RECEIVED BY (MAINTENANCE)'],
        ];

        foreach ($ttd as [$c1, $c2, $nama]) {
            $set("{$c1}{$l}:{$c2}{$l}", $nama, ['size' => 8, 'bold' => true, 'warna' => $navy, 'fill' => $fillLabel, 'h' => $tengah]);
            $set("{$c1}{$b1}:{$c2}{$b2}", '');
        }

        $set("A{$n}:L{$n}", 'Tanda tangan, nama jelas, dan tanggal diisi manual setelah dicetak.', [
            'size' => 7, 'italic' => true, 'warna' => $abu, 'h' => $tengah, 'border' => false,
        ]);

        /* ---------- KETERANGAN CLASS ---------- */
        $spasi($n + 1);

        $kh = $n + 2;
        $judul("A{$kh}:L{$kh}", 'KETERANGAN CLASS', $kh);

        $kr = $kh + 1;
        $s->getRowDimension($kr)->setRowHeight(24);

        $chips = [
            ['A', 'C', 'SA', 'SA : Super A, produksi stop'],
            ['D', 'F', 'A',  'A : hanya line / mesin tersebut yang stop'],
            ['G', 'I', 'B',  'B : mesin pendukung produksi'],
            ['J', 'L', 'C',  'C : perubahan / improvement'],
        ];

        foreach ($chips as [$c1, $c2, $kode, $teksChip]) {
            $aktif = $d['class_kode'] === $kode;

            $set("{$c1}{$kr}:{$c2}{$kr}", $teksChip, [
                'size'  => 8,
                'bold'  => $aktif,
                'indent' => 1,
                'fill'  => $aktif ? 'FEF3C7' : null,
                'warna' => $aktif ? '92400E' : $teks,
            ]);
        }

        /* ---------- footer ---------- */
        $f = $kr + 1;
        $s->getRowDimension($f)->setRowHeight(16);
        $set("A{$f}:L{$f}", 'FORM NO: FM-101  FJI-PD-01     |     Diekspor ' . now()->format('d/m/Y H:i'), [
            'size' => 7, 'warna' => $abu, 'h' => $kanan, 'border' => false,
        ]);

        /* ---------- pengaturan cetak ---------- */
        $s->getPageSetup()
            ->setOrientation(PageSetup::ORIENTATION_LANDSCAPE)
            ->setPaperSize(PageSetup::PAPERSIZE_A4)
            ->setFitToPage(true)
            ->setFitToWidth(1)
            ->setFitToHeight(1)
            ->setPrintArea("A1:L{$f}")
            ->setHorizontalCentered(true);

        $s->getPageMargins()->setTop(0.3)->setBottom(0.3)->setLeft(0.3)->setRight(0.3);

        return $book;
    }

    /* ================================================================
     | UNDUH
     ================================================================ */

    public function unduh(Spreadsheet $book, string $namaFile): StreamedResponse
    {
        return response()->streamDownload(function () use ($book) {
            $writer = new Xlsx($book);
            $writer->save('php://output');
            $book->disconnectWorksheets();
        }, $namaFile, [
            'Content-Type'  => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0, no-cache, must-revalidate',
        ]);
    }

    public static function namaFile(Rrf $rrf): string
    {
        $dasar = $rrf->rrf_no ?: 'RRF-' . $rrf->id;

        return preg_replace('/[^A-Za-z0-9._-]+/', '-', $dasar) . '.xlsx';
    }

    /* ================================================================
     | PEMBANTU
     ================================================================ */

    /** Mengubah data RRF + Repair QMOS menjadi array siap tulis. */
    private function siapkan(Rrf $rrf): array
    {
        $r = $rrf->mtcRepair;

        $req  = $this->tgl($r?->req_start_at);
        $serv = $this->tgl($rrf->serv_schedule_at);

        $menit = $rrf->downtime_detik !== null
            ? intdiv((int) $rrf->downtime_detik, 60)
            : null;

        $supervisor = $rrf->approvals
            ->where('status', 'disetujui')
            ->sortBy('id')
            ->last()?->user?->name;

        $jenis = strtolower((string) ($rrf->jenis_permintaan ?: $r?->jenis_permintaan));

        $counter = filled($rrf->counter_measure)
            ? $rrf->counter_measure
            : collect([$r?->request_activity, $r?->counter_measure])->filter()->implode("\n");

        return [
            'rrf_no'  => $rrf->rrf_no,
            'rev'     => (string) ($rrf->rev ?? 0),
            'qmos_id' => $r?->qmos_repair_id ? 'QMOS-' . $r->qmos_repair_id : null,

            'lokasi'         => (string) ($r?->location ?? '-'),
            'mesin'          => trim(($r?->machine ?? '-') . ' ' . ($r?->machine_no ?? '')),
            'mesin_nama'     => (string) ($r?->machine ?? ''),
            'mesin_no'       => (string) ($r?->machine_no ?? $r?->asset_no ?? ''),
            'divisi'         => (string) ($r?->division_pelapor ?? '-'),
            'repair_tanggal' => $r?->repair_date ? Carbon::parse($r->repair_date)->format('d/m/Y') : '',

            'class' => trim(
                ($r?->machine_class ?? '-')
                . ($r?->machine_class_description ? ' - ' . $r->machine_class_description : '')
            ),

            'class_kode' => \strtoupper(trim(preg_replace('/\s*class.*$/i', '', (string) ($r?->machine_class ?? '')))),

            'terencana'       => str_contains($jenis, 'rencana') || str_contains($jenis, 'plan'),
            'troubleshooting' => str_contains($jenis, 'trouble'),
            'jenis_label'     => (string) ($rrf->jenis_permintaan ?: $r?->jenis_permintaan ?: ''),

            'req_tanggal'  => $req?->format('d/m/Y') ?? '',
            'req_jam'      => $req?->format('H:i') ?? '',
            'serv_tanggal' => $serv?->format('d/m/Y') ?? '',
            'serv_jam'     => $serv?->format('H:i') ?? '',

            'menit'    => $menit,
            'downtime' => $menit !== null ? $menit . ' Minutes' : '-',

            'problem'         => (string) ($rrf->problem ?: $r?->problem ?: ''),
            'cause'           => (string) ($rrf->cause ?? ''),
            'counter_measure' => (string) $counter,
            'remark'          => (string) ($rrf->remark ?? ''),

            'pic'          => $rrf->pic_nama,
            'shift'        => $rrf->shift_kerja,
            'supervisor'   => $supervisor,
            'requested_by' => $r?->requested_by,

            'parts' => $rrf->parts->map(fn ($p) => [
                'part_name'  => (string) $p->part_name,
                'model_type' => (string) ($p->model_type ?? ''),
                'maker'      => (string) ($p->maker ?? ''),
                'qty'        => $p->qty,
                'other'      => (string) ($p->other ?? ''),
            ])->values()->all(),

            'callback' => match ($r?->callback_status) {
                'sent'    => 'Terkirim',
                'failed'  => 'Gagal',
                'pending' => 'Menunggu',
                default   => '-',
            },
        ];
    }

    private function tgl($nilai): ?Carbon
    {
        if (empty($nilai)) {
            return null;
        }

        try {
            return Carbon::parse($nilai);
        } catch (Throwable) {
            return null;
        }
    }

    /**
     * Menempel foto ke area gambar (kolom I:L) dalam kisi 1 atau 2 kolom.
     * $barisAwal = nomor baris sel kiri-atas area, $jumlahBaris = tinggi area dalam baris.
     */
    private function tempelFoto(Worksheet $s, Collection $fotos, int $barisAwal, int $jumlahBaris): void
    {
        $fotos = $fotos->take(self::MAKS_FOTO)->values();
        $n     = $fotos->count();

        if ($n === 0 || $jumlahBaris < 1) {
            return;
        }

        $lebar  = self::KOLOM_PX * 4;
        $tinggi = self::BARIS_PX * $jumlahBaris;

        $kolom = $n === 1 ? 1 : 2;
        $baris = (int) ceil($n / $kolom);

        $selW = intdiv($lebar, $kolom);
        $selH = intdiv($tinggi, $baris);

        foreach ($fotos as $i => $foto) {
            $this->satuFoto(
                $s,
                (string) $foto->file_path,
                $barisAwal,
                ($i % $kolom) * $selW,
                intdiv($i, $kolom) * $selH,
                $selW,
                $selH
            );
        }
    }

    private function satuFoto(Worksheet $s, string $filePath, int $barisAwal, int $x0, int $y0, int $selW, int $selH): void
    {
        if (!function_exists('imagecreatefromstring')) {
            return; // ekstensi GD tidak aktif
        }

        try {
            $path = Storage::disk('public')->path(ltrim($filePath, '/'));

            if (!is_file($path)) {
                return;
            }

            $biner = @file_get_contents($path);
            $src   = $biner ? @imagecreatefromstring($biner) : false;

            if (!$src) {
                return;
            }

            $ow = imagesx($src);
            $oh = imagesy($src);

            $skala = min(($selW - 8) / $ow, ($selH - 8) / $oh, 1);
            $w     = max(1, (int) floor($ow * $skala));
            $h     = max(1, (int) floor($oh * $skala));

            // Resolusi sumber 2x ukuran tampil supaya tetap tajam, tapi file Excel tidak membengkak.
            $rw = min($ow, $w * 2);
            $rh = min($oh, $h * 2);

            $dst   = imagecreatetruecolor($rw, $rh);
            $putih = imagecolorallocate($dst, 255, 255, 255);
            imagefilledrectangle($dst, 0, 0, $rw, $rh, $putih);
            imagecopyresampled($dst, $src, 0, 0, 0, 0, $rw, $rh, $ow, $oh);

            if (PHP_VERSION_ID < 80000) {
                imagedestroy($src);
            }

            // Pusatkan di dalam sel kisi
            $x = $x0 + intdiv($selW - $w, 2);
            $y = $y0 + intdiv($selH - $h, 2);

            $gambar = new MemoryDrawing();
            $gambar->setName('Foto');
            $gambar->setImageResource($dst);
            $gambar->setRenderingFunction(MemoryDrawing::RENDERING_JPEG);
            $gambar->setMimeType(MemoryDrawing::MIMETYPE_DEFAULT);
            $gambar->setResizeProportional(false);
            $gambar->setWidth($w);
            $gambar->setHeight($h);

            $idxKolom = 9 + intdiv($x, self::KOLOM_PX); // 9 = kolom I
            $barisSel = $barisAwal + intdiv($y, self::BARIS_PX);

            $gambar->setCoordinates(Coordinate::stringFromColumnIndex($idxKolom) . $barisSel);
            $gambar->setOffsetX($x % self::KOLOM_PX);
            $gambar->setOffsetY($y % self::BARIS_PX);
            $gambar->setWorksheet($s);
        } catch (Throwable $e) {
            report($e); // satu foto gagal tidak menggagalkan seluruh export
        }
    }
}
