<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ShippingTransferPaid extends Notification implements ShouldQueue
{
    use Queueable;

    public $paymentData;

    public function __construct($paymentData)
    {
        $this->paymentData = $paymentData;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('طلب نقل من الفرع الى شركة الشحن')
            ->view(
                'emails.shipping-table-transfer',
                ['data' => $this->paymentData]
            );
    }

    public function toArray(object $notifiable): array
    {
        return [
            'payment_id' => $this->paymentData['payment_id'],
            'report_number' => $this->paymentData['reportNumber'],
            'amount' => $this->paymentData['price'],
        ];
    }
}
