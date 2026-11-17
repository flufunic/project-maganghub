<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class MtcRepairClient
{
    private const MAKS_HALAMAN = 200;

    /**
     * Ambil semua repair dari API QMOS (otomatis lintas halaman jika API memakai pagination).
     *
     * @param  bool   $fresh   true = lewati cache (dipakai tombol Sinkronkan)
     * @param  array  $filter  query tambahan, mis. ['all' => 1]
     * @return array{data: array, total: int, fetched: int, complete: bool}
     */
    public function repairs(bool $fresh = false, array $filter = []): array
    {
        $key = 'mtc.repairs.' . md5(json_encode($filter));

        if ($fresh) {
            Cache::forget($key);

            return $this->ambilSemua($filter);
        }

        return Cache::remember($key, 30, fn () => $this->ambilSemua($filter));
    }

    /** Kompatibilitas versi lama: hanya mengembalikan array data. */
    public function getRepairs(array $filter = []): array
    {
        return $this->repairs(true, $filter)['data'];
    }

    private function ambilSemua(array $filter): array
    {
        $semua    = [];
        $halaman  = 1;
        $totalApi = null;

        while ($halaman <= self::MAKS_HALAMAN) {
            $params = $halaman === 1 ? $filter : $filter + ['page' => $halaman];

            $json  = $this->panggil($params);
            $items = $this->ambilItems($json);

            $totalApi ??= (int) ($json['total'] ?? $json['meta']['total'] ?? count($items));

            $baru = 0;

            foreach ($items as $item) {
                $id = $item['qmos_repair_id'] ?? null;

                if ($id === null || isset($semua[$id])) {
                    continue;
                }

                $semua[$id] = $item;
                $baru++;
            }

            // Berhenti: halaman kosong, atau API mengabaikan "page" (tidak ada data baru)
            if ($items === [] || $baru === 0) {
                break;
            }

            if (! $this->adaHalamanBerikut($json, $halaman, count($semua), $totalApi)) {
                break;
            }

            $halaman++;
        }

        $data = array_values($semua);

        return [
            'data'     => $data,
            'total'    => $totalApi ?? count($data),
            'fetched'  => count($data),
            'complete' => $totalApi === null || count($data) >= $totalApi,
        ];
    }

    private function panggil(array $params): array
    {
        $baseUrl = trim((string) config('services.mtc.url'));
        $apiKey  = (string) config('services.mtc.key');

        if ($baseUrl === '') {
            throw new RuntimeException('MTC_API_URL belum dikonfigurasi.');
        }

        if ($apiKey === '') {
            throw new RuntimeException('MTC_API_KEY belum dikonfigurasi.');
        }

        try {
            $res = Http::acceptJson()
                ->withHeaders(['X-API-KEY' => $apiKey])
                ->connectTimeout(10)
                ->timeout(30)
                ->retry(2, 500, throw: false)
                ->get(rtrim($baseUrl, '/') . '/repairs', $params);
        } catch (ConnectionException $e) {
            throw new RuntimeException('Tidak bisa terhubung ke server Maintenance (QMOS).', 0, $e);
        }

        if (in_array($res->status(), [401, 403], true)) {
            throw new RuntimeException('API key QMOS ditolak. Periksa MTC_API_KEY.');
        }

        if ($res->failed()) {
            throw new RuntimeException("Server QMOS membalas HTTP {$res->status()}.");
        }

        $json = $res->json();

        if (! is_array($json) || ($json['status'] ?? null) !== 'success') {
            throw new RuntimeException($json['message'] ?? 'Format respons API QMOS tidak sesuai.');
        }

        return $json;
    }

    private function ambilItems(array $json): array
    {
        $data = $json['data'] ?? [];

        if (! is_array($data)) {
            return [];
        }

        // API mengembalikan satu objek, bukan daftar
        if (isset($data['qmos_repair_id'])) {
            return [$data];
        }

        // Pagination ala Laravel: data.data
        if (isset($data['data']) && is_array($data['data'])) {
            return $data['data'];
        }

        return array_values($data);
    }

    private function adaHalamanBerikut(array $json, int $halaman, int $terkumpul, int $totalApi): bool
    {
        $terakhir = $json['last_page']
            ?? $json['meta']['last_page']
            ?? $json['pagination']['last_page']
            ?? $json['pagination']['total_pages']
            ?? null;

        if ($terakhir !== null) {
            return $halaman < (int) $terakhir;
        }

        if (! empty($json['next_page_url']) || ! empty($json['links']['next'])) {
            return true;
        }

        return $terkumpul < $totalApi;
    }
}