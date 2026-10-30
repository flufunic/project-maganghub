<?php

namespace App\Http\Controllers;

use App\Models\ScheduleBaris;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Tambah / ubah (zona atau nama) / hapus (soft delete) baris Plan-Act pada jadwal.
 * Kalau baris dihubungkan ke zona, nama baris mengikuti Nama Line zona itu.
 */
class ScheduleBarisController extends Controller
{
    private function rules(): array
    {
        return [
            'nama' => ['nullable', 'string', 'max:100'],
            // zona harus ada dan belum dihapus
            'zona_id' => [
                'nullable',
                'integer',
                Rule::exists('schedule_zonas', 'id')->whereNull('deleted_at'),
            ],
        ];
    }

    /** Satu zona hanya boleh dipakai satu baris dalam tahun yang sama. */
    private function pastikanZonaBelumDipakai(int $tahun, ?int $zonaId, ?int $abaikanBarisId = null): void
    {
        if (! $zonaId) {
            return;
        }

        $dipakai = ScheduleBaris::where('tahun', $tahun)
            ->where('zona_id', $zonaId)
            ->when($abaikanBarisId, fn ($q) => $q->where('id', '!=', $abaikanBarisId))
            ->exists();

        if ($dipakai) {
            throw ValidationException::withMessages([
                'zona_id' => 'Zona ini sudah dipakai baris lain pada tahun yang sama.',
            ]);
        }
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules() + [
            'tahun' => ['required', 'integer', 'between:2000,2100'],
        ]);

        $zonaId = $data['zona_id'] ?? null;

        $this->pastikanZonaBelumDipakai((int) $data['tahun'], $zonaId);

        $urutan = (int) ScheduleBaris::where('tahun', $data['tahun'])->max('urutan') + 1;

        ScheduleBaris::create([
            'tahun' => $data['tahun'],
            'urutan' => $urutan,
            'zona_id' => $zonaId,
            // kalau memakai zona, nama manual tidak dipakai
            'nama' => $zonaId ? null : ($data['nama'] ?? null),
        ]);

        return back()->with('success', 'Baris jadwal berhasil ditambahkan.');
    }

    public function update(Request $request, ScheduleBaris $baris)
    {
        $data = $request->validate($this->rules());

        $zonaId = $data['zona_id'] ?? null;

        $this->pastikanZonaBelumDipakai((int) $baris->tahun, $zonaId, $baris->id);

        $baris->update([
            'zona_id' => $zonaId,
            'nama' => $zonaId ? null : ($data['nama'] ?? null),
        ]);

        return back()->with('success', 'Baris jadwal berhasil diperbarui.');
    }

    public function destroy(ScheduleBaris $baris)
    {
        // tahun yang sama harus tetap punya minimal 1 baris
        if (ScheduleBaris::where('tahun', $baris->tahun)->count() <= 1) {
            throw ValidationException::withMessages([
                'baris' => 'Minimal harus ada 1 baris jadwal.',
            ]);
        }

        $baris->delete();   // soft delete

        return back()->with('success', 'Baris jadwal berhasil dihapus.');
    }
}
