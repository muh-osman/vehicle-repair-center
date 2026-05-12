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
use Illuminate\Support\Facades\Storage;

class FetchMojazPdf implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 10;        // retry up to 10 times
    public int $timeout = 60;
    public int $backoff = 60;     // wait 60s between retries

    public function __construct(public MojazOrder $order) {}

    public function handle(): void
    {
        $order = $this->order;
        $url = config('services.mojaz.base_url') . '/pdfReportV2/request';

        $response = Http::withHeaders($this->headers())->get($url, [
            'request' => $order->mojaz_request_id,
        ]);

        $data = $response->json();

        // Build full URL with query parameters
        Log::channel('daily')->info('FetchMojazPdf attempt', [
            'order_id'    => $order->id,
            'request_id'  => $order->mojaz_request_id,
            'result_code' => $data['resultCode'] ?? null,
        ]);

        // ── Success ──────────────────────────────────────────────────────────
        if (($data['resultCode'] ?? 1) === 0 && !empty($data['resultObject'])) {
            $pdfBytes = base64_decode($data['resultObject']);
            // $filename = 'mojaz/' . $order->payment_id . '.pdf';
            // Storage::disk('public')->put($filename, $pdfBytes);

            // AFTER
            $filename = 'mojaz/' . $order->payment_id . '.pdf';
            $fullPath = public_path($filename);

            if (!is_dir(public_path('mojaz'))) {
                mkdir(public_path('mojaz'), 0755, true);
            }

            file_put_contents($fullPath, $pdfBytes);

            $order->update([
                'pdf_path' => $filename,
                'status'   => 'ready',
            ]);

            Log::channel('daily')->info('Mojaz PDF ready', ['order_id' => $order->id]);
            return;
        }

        // ── Not ready yet → let Laravel retry automatically ──────────────────
        $message = $data['resultMessage'] ?? '';
        $notReady = 'التقرير غير جاهز';

        if (str_contains($message, $notReady)) {
            // Throwing releases the job back to the queue after $backoff seconds
            throw new \RuntimeException('PDF not ready yet, will retry.');
        }

        // ── Time limit exceeded (24h window passed) or unknown error ─────────
        $order->update([
            'status'         => 'failed',
            'failure_reason' => $message ?: 'Unexpected response from Mojaz',
        ]);
    }

    public function failed(\Throwable $e): void
    {
        // Called only after ALL retries are exhausted
        $this->order->update([
            'status'         => 'failed',
            'failure_reason' => 'PDF fetch failed after all retries: ' . $e->getMessage(),
        ]);
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
