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
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New Shipping Request Received')
            ->greeting('New Shipping Request!')
            ->line('A new shipping request has been successfully processed.')
            ->line('**Details:**')
            ->line('📋 Report Number: ' . ($this->paymentData['reportNumber'] ?? 'N/A'))
            ->line('🚗 Model: ' . ($this->paymentData['model'] ?? 'N/A'))
            ->line('📍 From: ' . ($this->paymentData['from'] ?? 'N/A'))
            ->line('🎯 To: ' . ($this->paymentData['to'] ?? 'N/A'))
            ->line('📦 Shipping Type: ' . ($this->paymentData['shippingType'] ?? 'N/A'))
            ->line('💰 Price: SAR ' . number_format($this->paymentData['price'] ?? 0, 2))
            ->line('📞 Phone: ' . ($this->paymentData['phoneNumber'] ?? 'N/A'))
            ->action('View Request Details', url('https://cashif.online/dashboard/shipping'))
            ->line('Thanks!');
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
