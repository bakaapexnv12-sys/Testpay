<?php
// ការកំណត់សម្រាប់បង្កើត Hash
$profile_id  = "4D8E0d8r6OPzy1d2sJR8VziXjXHpMchS";
$secret_key  = "YOUR_SECRET_KEY"; // ដាក់ Key ពិតប្រាកដរបស់អ្នក

$payment_data = [
    "transaction_id" => "ORD_" . time(),
    "amount"         => 0.01,
    "success_url"    => "http://localhost/success.php", // ផ្លាស់ប្តូរតាមតំណភ្ជាប់ពិតរបស់អ្នក
    "remark"         => "Web Order #88"
];

$raw_string = $secret_key . $payment_data['transaction_id'] . $payment_data['amount'] . $payment_data['success_url'] . $payment_data['remark'];
$payment_data['hash'] = sha1($raw_string);

$checkout_url = "https://khqr.cc/api/payment/request/" . $profile_id . "?" . http_build_query($payment_data);
?>

<!DOCTYPE html>
<html lang="km">
<head>
    <meta charset="UTF-8">
    <title>ទំព័រដើម</title>
    <script src="https://khqr.cc/khqrcc-plugin.js"></script>
    <style>
        .btn { padding: 15px 30px; background: #28a745; color: white; border: none; cursor: pointer; border-radius: 5px; font-size: 18px; }
    </style>
</head>
<body>
    <h1>សូមស្វាគមន៍មកកាន់ហាងរបស់យើង</h1>
    <button class="btn" onclick="payWithKhqr()">បង់ប្រាក់ឥឡូវនេះ</button>

    <script>
    function payWithKhqr() {
        KhqrPayway.openCheckout({
            checkout_url: "<?php echo $checkout_url; ?>",
            onSuccess: function(res) { window.location.href = "success.php"; },
            onError: function(err) { alert("មានកំហុស៖ " + err); }
        });
    }
    </script>
</body>
</html>
