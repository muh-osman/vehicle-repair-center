<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class WithdrawNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $accountNumber;
    public $marketerId;
    public $point;
    public $tranferPaymentTypeId;

    /**
     * Create a new message instance.
     */
    public function __construct($accountNumber, $marketerId, $point, $tranferPaymentTypeId)
    {
        $this->accountNumber = $accountNumber;
        $this->marketerId = $marketerId;
        $this->point = $point;
        $this->tranferPaymentTypeId = $tranferPaymentTypeId;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('طلب سحب ارباح فالك')
            ->view('emails.withdraw_notification');
    }
}
