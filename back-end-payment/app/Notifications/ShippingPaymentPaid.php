<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ShippingPaymentPaid extends Notification
{
    use Queueable;

    public $paymentData;

    /**
     * Create a new notification instance.
     */
    public function __construct($paymentData)
    {
        $this->paymentData = $paymentData;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('طلب خدمة شحن سيارة جديد')
            ->view(
                'emails.shipping-table',
                ['data' => $this->paymentData]
            );
    }


    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'payment_id' => $this->paymentData['payment_id'],
            'report_number' => $this->paymentData['reportNumber'],
            'amount' => $this->paymentData['price'],
        ];
    }
}
