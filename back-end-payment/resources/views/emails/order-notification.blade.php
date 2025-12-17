@php
    // Define colors based on service
    $primaryColor = '#174545'; // Default color

    if ($data['service'] == 'مرتاح') {
        $primaryColor = '#7431fa'; // Purple
    } elseif ($data['service'] == 'مرتاح+مخدوم') {
        $primaryColor = '#7431fa'; // Deep Orange
    } elseif ($data['service'] == 'مخدوم') {
        $primaryColor = '#174545'; // Green
    }
@endphp

<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f7fa;
            margin: 0;
            /* padding: 20px; */
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .header {
            color: white;
            padding: 25px;
            text-align: center;
            background: {{ $primaryColor }};
        }

        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }

        .header .subtitle {
            font-size: 16px;
            opacity: 0.9;
            margin-top: 8px;
        }

        .content {
            /* padding: 30px; */
        }

        .order-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            text-align: center;
            padding: 0;
        }

        .order-table tr {
            border-bottom: 1px solid #e8f5e9;
        }

        .order-table tr:last-child {
            border-bottom: none;
        }

        .order-table td {
            padding: 15px 10px;
            font-size: 16px;
            border: 1px solid {{ $primaryColor }};
        }

        .order-table .label {
            font-weight: 600;
            color: #2c3e50;
            width: 40%;
            background-color: #f8f9fa;
        }

        .order-table .value {
            color: #34495e;
            background-color: white;
        }

        .status-badge {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            text-align: center;
        }

        .status-paid {
            background-color: {{ $primaryColor }};
            color: white;
        }

        .status-unpaid {
            background-color: #e74c3c;
            color: white;
        }

        .action-button {
            display: block;
            text-align: center;
            background: {{ $primaryColor }};
            color: white;
            padding: 12px;
            border-radius: 6px;
            text-decoration: none;
        }

        .footer {
            text-align: center;
            padding: 20px;
            color: #7f8c8d;
            font-size: 14px;
            border-top: 1px solid #ecf0f1;
        }

        .important-note {
            background-color: #fff8e1;
            border-right: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 6px;
        }

        .important-note h3 {
            color: #ff9800;
            margin-top: 0;
        }

        .contact-info {
            background-color: #e3f2fd;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            text-align: center;
        }

        @media (max-width: 600px) {
            .content {
                padding: 0px;
            }

            .order-table td {
                padding: 12px 8px;
                font-size: 14px;
            }
        }
    </style>
</head>

<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1><span>طلب خدمة </span> <span>
                    @if (!empty($data['service']))
                        {{ $data['service'] }}
                    @elseif($data['plan'] === 'المسافر')
                        فحص المسافر
                    @else
                        فحص الشراء
                    @endif
                </span></h1>
        </div>

        <!-- Content -->
        <div dir="rtl" class="content">

            <!-- Order Details Table -->
            <table dir="rtl" class="order-table">
                <tr>
                    <td class="label">الخدمة:</td>
                    <td class="value">
                        @if (!empty($data['service']))
                            {{ $data['service'] }}
                        @elseif($data['plan'] === 'المسافر')
                            فحص المسافر
                        @else
                            فحص الشراء
                        @endif
                    </td>
                </tr>
                <tr>
                    <td class="label">الفحص:</td>
                    <td class="value">{{ $data['plan'] ?? 'غير محدد' }}</td>
                </tr>
                <tr>
                    <td class="label">الخدمات الإضافية:</td>
                    <td class="value">{{ $data['additionalServices'] ?? 'لا يوجد' }}</td>
                </tr>
                <tr>
                    <td class="label">الموديل:</td>
                    <td class="value">{{ $data['model'] ?? 'غير محدد' }}</td>
                </tr>
                <tr>
                    <td class="label">سنة الصنع:</td>
                    <td class="value">{{ $data['full_year'] ?? 'غير محدد' }}</td>
                </tr>
                {{-- Show reference number only for مرتاح or مرتاح+مخدوم services --}}
                @if (in_array($data['service'] ?? '', ['مرتاح', 'مرتاح+مخدوم']))
                    <tr>
                        <td class="label">عنوان العميل:</td>
                        <td class="value">{{ $data['address'] ?? 'غير محدد' }}</td>
                    </tr>
                @endif
                <tr>
                    <td class="label">الفرع:</td>
                    <td class="value">{{ $data['branch'] ?? 'غير محدد' }}</td>
                </tr>
                <tr>
                    <td class="label">الحالة:</td>
                    <td class="value">
                        <span class="status-badge {{ $data['status'] == 'Paid' ? 'status-paid' : 'status-unpaid' }}">
                            {{ $data['status'] ?? 'غير محدد' }}
                        </span>
                    </td>
                </tr>
                <tr>
                    <td class="label">طريقة الدفع:</td>
                    <td class="value">{{ $data['payment_method'] ?? 'غير محدد' }}</td>
                </tr>
                <tr>
                    <td class="label">المبلغ:</td>
                    <td class="value">
                        {{ $data['price'] ? 'SAR ' . number_format($data['price'], 2) : 'غير محدد' }}
                    </td>
                </tr>
                <tr>
                    <td class="label">كود الخصم:</td>
                    <td class="value">{{ $data['discountCode'] ?? 'لا يوجد' }}</td>
                </tr>
                <tr>
                    <td class="label">اسم العميل:</td>
                    <td class="value">{{ $data['full_name'] ?? 'غير محدد' }}</td>
                </tr>
                <tr>
                    <td class="label">رقم الهاتف:</td>
                    <td class="value">
                        <a href="tel:{{ $data['phone'] }}">
                            {{ $data['phone'] ?? 'غير متوفر' }}
                        </a>
                    </td>
                </tr>
                <tr>
                    <td class="label">تاريخ الطلب:</td>
                    <td dir="ltr" class="value">{{ now()->format('d/m/Y h:i A') }}</td>
                </tr>
            </table>

            {{-- Footer section --}}

            {{-- Footer section --}}
            @if (in_array($data['service'] ?? '', ['مرتاح', 'مرتاح+مخدوم']))
                <br>

                <a href="https://cashif.online/mertah-client/{{ $data['referenceNumber'] }}" class="action-button">
                    عرض تفاصيل الطلب
                </a>

                <!-- Fallback Link -->
                <p dir="rtl" style="text-align:center;margin-top:10px;font-size:14px;color:#555;">
                    إذا لم يعمل زر <strong>عرض تفاصيل الطلب</strong>،
                    يمكنك فتح الرابط مباشرة:
                    <br>
                    <a dir="ltr" href="https://cashif.online/mertah-client/{{ $data['referenceNumber'] }}" style="color:#007bff;word-break:break-all;">
                        https://cashif.online/mertah-client/{{ $data['referenceNumber'] }}
                    </a>
                </p>
            @endif

        </div>

    </div>
</body>

</html>
