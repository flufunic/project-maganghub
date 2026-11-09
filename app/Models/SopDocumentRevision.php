<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SopDocumentRevision extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'sop_document_id', 'revisi_ke', 'tanggal_revisi',
        'catatan', 'file_path', 'file_name',
    ];

    protected $casts = ['tanggal_revisi' => 'date'];

    public function document()
    {
        return $this->belongsTo(SopDocument::class, 'sop_document_id');
    }
}
