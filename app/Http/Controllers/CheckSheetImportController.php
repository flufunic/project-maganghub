<?php

namespace App\Http\Controllers;

use App\Models\CheckSheet;
use App\Services\CheckSheetImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CheckSheetImportController extends Controller
{
    public function __construct(private CheckSheetImportService $svc)
    {
    }

    /**
     * Step 1: baca file, kirim header + tebakan mapping + contoh data (JSON).
     * Tidak ada data yang disimpan di tahap ini.
     */
    public function preview(Request $request, CheckSheet $checkSheet): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240',
        ]);

        try {
            $rows = $this->svc->readRows($request->file('file'));
        } catch (\Throwable $e) {
            Log::error(
                'Gagal membaca Excel CheckSheet: ' . $e->getMessage(),
                ['exception' => $e]
            );

            return response()->json([
                'message' => 'File tidak bisa dibaca.',
                'debug' => config('app.debug') ? $e->getMessage() : null,
            ], 422);
        }

        if (empty($rows)) {
            return response()->json([
                'message' => 'File Excel tidak memiliki data.',
            ], 422);
        }

        $headerRow = $this->svc->detectHeaderRow($rows);
        $headers = $rows[$headerRow - 1] ?? [];

        $mapping = $this->svc->guessMapping($headers);

        $dataRows = array_values(array_filter(
            array_slice($rows, $headerRow),
            fn ($row) => collect($row)->contains(
                fn ($cell) => trim((string) ($cell ?? '')) !== ''
            )
        ));

        return response()->json([
            'header_row' => $headerRow,
            'headers' => $headers,
            'mapping' => $mapping,
            'rows' => array_slice($dataRows, 0, 5),
            'total_rows' => count($dataRows),
        ]);
    }

    /** Step 2: parse + simpan. */
    public function store(Request $request, CheckSheet $checkSheet)
    {
        $request->validate([
            'file'                     => 'required|file|mimes:xlsx,xls,csv|max:10240',
            'mapping.inspection_point' => 'required|array|min:1',
            'mapping.condition'        => 'nullable|array',
            'mapping.method'           => 'nullable|array',
            'shifts'                   => 'required|array|min:1',
            'shifts.*'                 => 'in:A,B',
        ]);

        $rows      = $this->svc->readRows($request->file('file'));
        $headerRow = $this->svc->detectHeaderRow($rows);
        $parsed    = $this->svc->parse(
            $rows,
            $request->mapping,
            $headerRow
        );

        if (count($parsed['items']) === 0) {
            return back()->withErrors([
                'file' => 'Tidak ada baris valid yang bisa diimport. Cek mapping kolom Inspection Point.',
            ]);
        }

        $shifts = array_values(array_unique($request->shifts));
        $total  = $this->svc->import($checkSheet, $parsed['items'], $shifts);

        // Nomor setelah import dibuat berurutan lagi
        $checkSheet->susunUlangNomorItem();

        $message = count($parsed['items']) . ' inspection point diimport (' . $total . ' item untuk semua shift).';

        if ($parsed['skipped']) {
            $message .= ' Baris dilewati (inspection point kosong): '
                . implode(', ', array_slice($parsed['skipped'], 0, 10)) . '.';
        }

        return back()->with('success', $message);
    }
}