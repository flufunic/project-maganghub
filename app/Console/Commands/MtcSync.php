<?php

namespace App\Console\Commands;

use App\Services\MtcRepairSyncer;
use Illuminate\Console\Command;

class MtcSync extends Command
{
    protected $signature = 'mtc:sync';
    protected $description = 'Ambil data Repair terbaru dari API QMOS';

    public function handle(MtcRepairSyncer $syncer): int
    {
        try {
            $h = $syncer->jalankan();
        } catch (\Throwable $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }

        $this->info("API {$h['total_api']} | baru {$h['baru']} | diperbarui {$h['diperbarui']} | dilewati {$h['dilewati']}");

        return self::SUCCESS;
    }
}