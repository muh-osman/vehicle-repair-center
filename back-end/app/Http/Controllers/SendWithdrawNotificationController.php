<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Mail\WithdrawNotificationMail;
use Illuminate\Support\Facades\Mail;


class SendWithdrawNotificationController extends Controller
{
    public function sendWithdrawNotification(Request $request)
    {
        $request->validate([
            'accountNumber' => 'nullable|string',
            'marketerId' => 'nullable|integer',
            'point' => 'nullable|numeric',
            'tranferPaymentTypeId' => 'nullable|integer',
        ]);

        // Example: Send email
        Mail::to(['omar.cashif@gmail.com', 'cashif.acct@gmail.com', 'cashif2020@gmail.com', 'talalmeasar55@gmail.com'])->send(
            new WithdrawNotificationMail(
                $request->accountNumber,
                $request->marketerId,
                $request->point,
                $request->tranferPaymentTypeId
            )
        );

        return response()->json(['status' => true, 'message' => 'Email sent']);
    }
}
