<?php

namespace App\Http\Controllers\Mtc;

use App\Http\Controllers\Controller;
use App\Models\Rrf;
use App\Services\RrfExcelExporter;
use Illuminate\Http\Request;

class MtcRrfExportController extends Controller
{
    /** Hanya RRF yang sudah diverifikasi Pimpinan (tampil sebagai "Completed"). */
    private const STATUS_COMPLETED = 'terverifikasi';

    public function __construct(private readonly RrfExcelExporter $exporter)
    {
    }

    /**
     * Export 1 RRF dalam bentuk Repair Request Form.
     * GET /mtc/rrf/{rrf}/export
     */
    public function formulir(Request $request, Rrf $rrf)
    {
        abort_unless(in_array($request->user()?->role, ['admin', 'pimpinan'], true), 403);

        if ($rrf->status !== self::STATUS_COMPLETED) {
            return back()->with('error', 'Hanya RRF berstatus Completed yang bisa diexport ke Excel.');
        }

        @set_time_limit(120);

        $book = $this->exporter->formulir($rrf);

        return $this->exporter->unduh($book, RrfExcelExporter::namaFile($rrf));
    }
}
