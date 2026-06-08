const BAKONG_API_URL = 'https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5';
const BAKONG_TOKEN = process.env.BAKONG_TOKEN; 

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: "Method មិនត្រឹមត្រូវទេ ត្រូវប្រើ POST" });
    }

    if (!BAKONG_TOKEN) {
        return res.status(500).json({ success: false, message: "អត់ទាន់បានកំណត់ BAKONG_TOKEN នៅក្នុង Vercel ទេ!" });
    }

    const { md5, expectedAmount, expectedCurrency } = req.body;

    if (!md5  !expectedAmount  !expectedCurrency) {
        return res.status(400).json({ 
            success: false, 
            message: "សូមបញ្ជូនទិន្នន័យឱ្យគ្រប់ (md5, expectedAmount, expectedCurrency)!" 
        });
    }

    const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });

    try {
        const response = await fetch(BAKONG_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': Bearer ${BAKONG_TOKEN},
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ md5: md5 })
        });

        const result = await response.json();

        // ករណីទី ១៖ មានការទូទាត់ជោគជ័យក្នុងប្រព័ន្ធ Bakong
        if (result.responseCode === 0 && result.data && result.data.status === "SUCCESS") {
            const actualAmount = parseFloat(result.data.amount);
            const actualCurrency = result.data.currency.toUpperCase();
            const targetAmount = parseFloat(expectedAmount);
            const targetCurrency = expectedCurrency.toUpperCase();

            if (actualAmount === targetAmount && actualCurrency === targetCurrency) {
                return res.status(200).json({
                    success: true,
                    md5: md5,
                    status: "VERIFIED_SUCCESS",
                    timestamp: currentTime,
                    message: "Transaction successfully verified and amount matches.",
                    note: "Payment completed successfully. You can now credit the user."
                });
            } else {
                return res.status(200).json({
                    success: false,
                    md5: md5,
                    status: "AMOUNT_MISMATCH",
                    timestamp: currentTime,
                    message: Amount mismatch. Expected ${targetAmount} ${targetCurrency} but received ${actualAmount} ${actualCurrency}.,
                    note: "Security alert: Potential payment alteration detected."
                });
            }
        } 
        
        // ករណីទី ២៖ មិនទាន់ឃើញលុយចូល ឬកំពុងរង់ចាំ (PENDING)
        return res.status(200).json({
            success: false,
            md5: md5,
            status: "PENDING",
            timestamp: currentTime,
            message: "Transaction not found or still pending",
            note: "This is normal for new transactions. Payment may still be processing."
        });

    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            md5: md5,
            status: "SERVER_ERROR",
            timestamp: currentTime,
            message: error.message,
            note: "Internal server error while connecting to Bakong API."
        });
    }
}
