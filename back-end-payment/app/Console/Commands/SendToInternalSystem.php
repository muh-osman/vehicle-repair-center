<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\UnPaidQrCodeController;

class SendToInternalSystem extends Command
{
    protected $signature = 'cashif:send-to-internal';
    protected $description = 'Send the next unsent record to the internal Cashif system';

    public function handle()
    {
        $controller = new UnPaidQrCodeController();
        $response = $controller->sendToInternalSystem();

        $this->info('Status: ' . $response->getStatusCode());
        $this->info('Response: ' . $response->getContent());

        return Command::SUCCESS;
    }
}
