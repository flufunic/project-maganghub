<?php

namespace App\Http\Middleware;

use App\Models\CheckSheet;
use App\Models\Line;
use Closure;
use Illuminate\Http\Request;

class EnsureLineUnlocked
{
    public function handle(Request $request, Closure $next)
    {
        $line = $this->resolveLine($request);

        $expires = $line ? (session('line_akses', [])[$line->kode] ?? null) : null;

        if (! $expires || $expires < now()->timestamp) {
            return redirect()->route('check-sheets.index')->withErrors([
                'kode' => 'Scan barcode mesin terlebih dahulu.',
            ]);
        }

        return $next($request);
    }

    private function resolveLine(Request $request): ?Line
    {
        // halaman /check-sheets/line/{kode}
        if ($kode = $request->route('kode')) {
            return Line::where('kode', $kode)->first();
        }

        $checkSheet = $request->route('checkSheet') ?? $request->route('check_sheet');

        if ($checkSheet && ! $checkSheet instanceof CheckSheet) {
            $checkSheet = CheckSheet::find($checkSheet);
        }

        // check sheet milik mesin tertentu -> harus mesin itu yang di-scan
        if ($checkSheet?->line_id) {
            return Line::find($checkSheet->line_id);
        }

        // check sheet bersama (Headrest) -> line dari request atau scan terakhir
        $line = $request->filled('line_id')
            ? Line::find($request->input('line_id'))
            : Line::where('kode', session('last_line'))->first();

        if ($line && $checkSheet && (int) $line->divisi_id !== (int) $checkSheet->divisi_id) {
            return null;
        }

        return $line;
    }
}