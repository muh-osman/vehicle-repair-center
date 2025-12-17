<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="UTF-8">
    <style>
        .table-title {
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 0px;
            color: #fff;
            padding: 10px;
            background-color: #27ae60;
            border-radius: 5px;
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-family: Arial, sans-serif;
            text-align: center;
        }

        td {
            border: 1px solid #27ae60;
            padding: 10px;
            background: #f7f7f7;
            font-size: 16px;
            width: 50%;
        }

        .label {
            background: #ffffff;
            font-weight: bold;
        }

        .value {
            background: #f2f2f2;
        }

        /* .status-paid {
            background: #3a7f2f;
            color: white;
            font-weight: bold;
            text-align: center;
        } */

        .from,
        .to {
            background: #d32f2f;
            color: white;
            font-weight: bold;
            text-align: center;
        }
    </style>
</head>

<body>

    <!-- Add the title here -->
    <div class="table-title">طلب خدمة شحن سيارة</div>

    <table dir="rtl">
        <tr>
            <td class="label">الخدمة:</td>
            <td class="value">شحن سيارة</td>
        </tr>

        <tr>
            <td class="label">نوع الشحن:</td>
            <td class="value">{{ $data['shippingType'] }}</td>
        </tr>

        <tr>
            <td class="label">المبلغ:</td>
            <td class="value">SAR {{ number_format($data['price'], 2) }}</td>
        </tr>

        <tr>
            <td class="label">الحالة:</td>
            {{-- <td class="value">Paid</td> --}}
            <td class="value">{{ $data['status'] }}</td>
        </tr>

        <tr>
            <td class="label">موديل:</td>
            <td class="value">{{ $data['model'] }}</td>
        </tr>

        <tr>
            <td class="label">رقم اللوحة:</td>
            <td class="value">{{ $data['plateNumber'] }}</td>
        </tr>

        <tr>
            <td class="label">من فرع:</td>
            <td class="value from">{{ $data['from'] }}</td>
        </tr>

        <tr>
            <td class="label">إلى مدينة:</td>
            <td class="value to">{{ $data['to'] }}</td>
        </tr>

        <tr>
            <td class="label">اسم العميل:</td>
            <td class="value">{{ $data['name'] }}</td>
        </tr>

        <tr>
            <td class="label">رقم الجوال:</td>
            <td class="value">
                @if (isset($data['phoneNumber']) && $data['phoneNumber'])
                    <a href="tel:{{ $data['phoneNumber'] }}">{{ $data['phoneNumber'] }}</a>
                @else
                    غير متوفر
                @endif
            </td>
        </tr>

        {{-- <tr>
            <td class="label">رقم التقرير:</td>
            <td class="value">{{ $data['reportNumber'] }}</td>
        </tr> --}}

        <tr>
            <td class="label">التاريخ:</td>
            <td dir="ltr" class="value">{{ now()->format('d/m/Y h:i a') }}</td>
        </tr>

        {{-- <tr>
            <td class="label">رقم المرجع:</td>
            <td class="value">{{ $data['payment_id'] }}</td>
        </tr> --}}
    </table>

    <br>

    <a href="https://cashif.online/shipping-client/{{ $data['payment_id'] }}" style="display:block;text-align:center;background:#7431fa;color:white;
          padding:12px;border-radius:6px;text-decoration:none;">
        عرض تفاصيل الطلب
    </a>

    <!-- Fallback Link -->
    <p dir="rtl" style="text-align:center;margin-top:10px;font-size:14px;color:#555;">
        إذا لم يعمل زر <strong>عرض تفاصيل الطلب</strong>،
        يمكنك فتح الرابط مباشرة:
        <br>
        <a dir="ltr" href="https://cashif.online/shipping-client/{{ $data['payment_id'] }}" style="color:#007bff;word-break:break-all;">
            https://cashif.online/shipping-client/{{ $data['payment_id'] }}
        </a>
    </p>

</body>

</html>
