<?php
$secret_key = "pqEiKngED53mgZCJkwwjXBfIZctQQd34"; 
$profile_id = "4D8E0d8r6OPzy1d2sJR8VziXjXHpMchS";

// ផ្នែកពិនិត្យលទ្ធផល (បន្ទាប់ពី User បង់ប្រាក់រួច)
$is_success = false;
$message = "";

if (isset($_GET['status']) && $_GET['status'] == 'success') {
    // ផ្ទៀងផ្ទាត់ Hash ដែលត្រលប់មកវិញ ដើម្បីសុវត្ថិភាព
    $tx_id = $_GET['transaction_id'] ?? '';
    $status = $_GET['status'] ?? '';
    $received_hash = $_GET['hash'] ?? '';
    
    if (sha1($secret_key . $tx_id . $status) === $received_hash) {
        $is_success = true;
        $message = "ការទូទាត់លេខ $tx_id ជោគជ័យ!";
    } else {
        $message = "ការផ្ទៀងផ្ទាត់មិនត្រឹមត្រូវ (Invalid Hash)!";
    }
}

// ផ្នែកដំណើរការទូទាត់ (ពេលចុចប៊ូតុង)
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['pay_now'])) {
    $payment_data = [
        "transaction_id" => "ORD_" . time(),
        "amount"         => $_POST['amount'],
        "success_url"    => "http://" . $_SERVER['HTTP_HOST'] . $_SERVER['PHP_SELF'], // ត្រលប់មកទំព័រដដែល
        "remark"         => $_POST['remark']
    ];

    $raw_string = $secret_key . $payment_data['transaction_id'] . $payment_data['amount'] . $payment_data['success_url'] . $payment_data['remark'];
    $payment_data['hash'] = sha1($raw_string);

    $final_url = "https://khqr.cc/api/payment/request/" . $profile_id . "?" . http_build_query($payment_data);
    header("Location: $final_url");
    exit;
}
?>

<!DOCTYPE html>
<html>
<body>
    <?php if ($is_success): ?>
        <h1 style="color: green;"><?php echo $message; ?></h1>
        <a href="index.php">ទូទាត់ថ្មី</a>
    <?php else: ?>
        <form method="POST">
            <input type="number" name="amount" placeholder="ទឹកប្រាក់" required>
            <input type="text" name="remark" placeholder="កំណត់សម្គាល់" required>
            <button type="submit" name="pay_now">បង់ប្រាក់ឥឡូវនេះ</button>
        </form>
    <?php endif; ?>
</body>
</html>
