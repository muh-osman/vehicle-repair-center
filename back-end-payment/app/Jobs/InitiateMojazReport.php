<?php

namespace App\Jobs;

use App\Models\MojazOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class InitiateMojazReport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 10;
    public int $timeout = 60;

    public function __construct(public MojazOrder $order) {}

    public function handle(): void
    {
        $order = $this->order;

        $endpoint = $order->lookup_type === 'sequence'
            ? '/pdfReportV2/sequence'
            : '/pdfReportV2/vin';

        $queryParam = $order->lookup_type === 'sequence'
            ? ['sequence' => $order->lookup_value]
            : ['vin'      => $order->lookup_value];

        $url = config('services.mojaz.base_url') . $endpoint;

        $response = Http::withHeaders($this->headers())->get($url, $queryParam);
        $data = $response->json();

        Log::channel('daily')->info('Mojaz API Response', [
            'order_id' => $order->id,
            'lookup_type' => $order->lookup_type,
            'lookup_value' => $order->lookup_value,
            'response_data' => $data,
            'body'    => $response->body()
        ]);

        if (($data['resultCode'] ?? 1) === 0 && ($data['resultObject'] ?? false) === true) {
            $requestId = $data['requestId'];

            $order->update([
                'mojaz_request_id' => $requestId,
                'status'           => 'processing',
            ]);

            // Dispatch the PDF fetcher with a 4-minute delay (API takes ~3 min)
            FetchMojazPdf::dispatch($order)->delay(now()->addMinutes(4));
        } else {
            $order->update([
                'status'         => 'failed',
                'failure_reason' => $data['resultMessage'] ?? 'Initiate failed',
            ]);
        }
    }

    private function headers(): array
    {
        return [
            'Client-key' => config('services.mojaz.client_key'),
            'app-id'     => config('services.mojaz.app_id'),
            'app-key'    => config('services.mojaz.app_key'),
            'language'   => 'AR',
        ];
    }
}
