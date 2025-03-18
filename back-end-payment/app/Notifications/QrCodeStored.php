<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class QrCodeStored extends Notification
{
    use Queueable;

    protected $qrCodeData;

    public function __construct($qrCodeData)
    {
        $this->qrCodeData = $qrCodeData;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {

        // Determine the year value to display
        $yearDisplay = match ($this->qrCodeData['year'] ?? null) {
            '1' => '2014 أو أدنى',
            '2' => '2015 أو أعلى',
            default => 'N/A', // Default value if year is not 1 or 2
        };

        // Determine the status based on the length of the Reference Number
        $referenceNumber = $this->qrCodeData['paid_qr_code'] ?? $this->qrCodeData['un_paid_qr_code'];
        $status = (strlen($referenceNumber) === 14) ? 'Unpaid' : 'Paid';



        return (new MailMessage)
            ->subject('New Order')
            ->line('A new order has been created.')
            ->line('Payment method used: ' . ($this->qrCodeData['payment_method'] ?? 'N/A'));
        // ->line('Reference Number: ' . $referenceNumber)
        // ->line('Status: ' . $status) // Add the status line
        // ->line('Full Name: ' . ($this->qrCodeData['full_name'] ?? 'N/A'))
        // ->line('Phone: ' . ($this->qrCodeData['phone'] ?? 'N/A'))
        // ->line('Branch: ' . ($this->qrCodeData['branch'] ?? 'N/A'))
        // ->line('Plan: ' . ($this->qrCodeData['plan'] ?? 'N/A'))
        // ->line('Price: ' . ($this->qrCodeData['price'] ?? 'N/A'))
        // ->line('Model: ' . ($this->qrCodeData['model'] ?? 'N/A'))
        // ->line('Year: ' . $yearDisplay)
        // ->line('Service: ' . ($this->qrCodeData['service'] ?? 'N/A'))
        // ->line('Additional Services: ' . ($this->qrCodeData['additionalServices'] ?? 'N/A'));
    }
}
