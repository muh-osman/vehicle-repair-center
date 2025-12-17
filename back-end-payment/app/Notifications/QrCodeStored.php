<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

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
            '1' => '2016 أو أدنى',
            '2' => '2017 أو أعلى',
            default => 'غير محدد',
        };

        // Determine the status based on the length of the Reference Number
        $referenceNumber = $this->qrCodeData['paid_qr_code'] ?? $this->qrCodeData['un_paid_qr_code'] ?? null;
        $status = $referenceNumber && (strlen($referenceNumber) === 14) ? 'Unpaid' : 'Paid';

        // Prepare data for the view
        $mailData = [
            'payment_method' => $this->qrCodeData['payment_method'] ?? 'غير محدد',
            'discountCode' => $this->qrCodeData['discountCode'] ?? 'لا يوجد',
            'plan' => $this->qrCodeData['plan'] ?? 'غير محدد',
            'service' => $this->qrCodeData['service'] ?? null,
            'additionalServices' => $this->qrCodeData['additionalServices'] ?? 'لا يوجد',
            'branch' => $this->qrCodeData['branch'] ?? 'غير محدد',
            'model' => $this->qrCodeData['model'] ?? 'غير محدد',
            'full_name' => $this->qrCodeData['full_name'] ?? 'غير محدد',
            'phone' => $this->qrCodeData['phone'] ?? 'غير متوفر',
            'yearDisplay' => $yearDisplay,
            'referenceNumber' => $referenceNumber,
            'status' => $status,
            'price' => $this->qrCodeData['price'] ?? null,
            'full_year' => $this->qrCodeData['full_year'] ?? 'غير محدد',
            'address' => $this->qrCodeData['address'] ?? 'غير محدد',
        ];

        return (new MailMessage)
            ->subject('طلب خدمة جديد')
            ->view('emails.order-notification', ['data' => $mailData])
            ->from('noreply@yourdomain.com', 'Cashif')
            ->replyTo('support@yourdomain.com', 'Support Team');
    }
}
