// 1. CONFIGURATION
$gateway_url = "http://khqr.cc/api/payment/request";
$profile_id  = "haGru2UT5ULyqGlSTcnhrhpGELstAWih";
$secret_key  = "3hPD0QpxR1yMTKgJZuAGxV1d3H3F67fe";

// 2. TRANSACTION DETAILS
$payment_data = [
    "transaction_id" => "ORD_" . time(),
    "amount"         => 0.01,
    "success_url"    => "https://site.com/done",
    "remark"         => "Web Order #88"
];

// 3. SECURITY (HASHING)
$raw_string = $secret_key 
            . $payment_data['transaction_id'] 
            . $payment_data['amount'] 
            . $payment_data['success_url'] 
            . $payment_data['remark'];

$payment_data['hash'] = sha1($raw_string);

// 4. REDIRECT
$final_url = $gateway_url . "/" . $profile_id . "?" . http_build_query($payment_data);

header("Location: " . $final_url);
exit;
