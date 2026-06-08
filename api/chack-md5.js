const BAKONG_API_URL = 'https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5';
const BAKONG_TOKEN = process.env.BAKONG_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoiZmU4NjJhYTU3YjJmNGZkOSJ9LCJpYXQiOjE3ODA2NjEwMjgsImV4cCI6MTc4ODQzNzAyOH0.eiRIXYA5-g3E8gnlsvhNEyvreoOhFGI5gPgHfx2IacM'; 

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ status: "failed", message: "Method មិនត្រឹមត្រូវទេ ត្រូវប្រើ POST" });
    }

    const { md5, expectedAmount, expectedCurrency, webhookUrl } = req.body;

    if (!md5 || !expectedAmount || !expectedCurrency) {
        return res.status(400).json({ 
            status: "failed", 
            message: "សូមបញ្ជូនទិន្នន័យឱ្យគ្រប់ (md5, expectedAmount, expectedCurrency)!" 
        });
    }

    try {
        const response = await fetch(BAKONG_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${BAKONG_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ md5: md5 })
        });

        const result = await response.json();

        if (result.responseCode === 0 && result.data && result.data.status === "SUCCESS") {
            const actualAmount = parseFloat(result.data.amount);
            const actualCurrency = result.data.currency.toUpperCase();
            const targetAmount = parseFloat(expectedAmount);
            const targetCurrency = expectedCurrency.toUpperCase();

            if (actualAmount === targetAmount && actualCurrency === targetCurrency) {
                if (webhookUrl) {
                    await fetch(webhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            status: "VERIFIED_SUCCESS",
                            md5: md5,
                            amount: actualAmount,
                            currency: actualCurrency
                        })
                    }).catch(e => console.log("Webhook fail:", e.message));
                }

                return res.status(200).json({
                    status: "VERIFIED_SUCCESS",
                    message: "ការទូទាត់ត្រឹមត្រូវទាំងស្រុង",
                    data: { amount: actualAmount, currency: actualCurrency }
                });
            } else {
                return res.status(200).json({
                    status: "AMOUNT_MISMATCH",
                    message: "ចំនួនលុយដែលបានទូទាត់មិនត្រូវគ្នានឹង Invoice ទេ!",
                    expected: { amount: targetAmount, currency: targetCurrency },
                    actual: { amount: actualAmount, currency: actualCurrency }
                });
            }
        } 
        
        return res.status(200).json({
            status: "PENDING",
            message: "មិនទាន់មានការទូទាត់ ឬកំពុងរង់ចាំលុយចូល..."
        });

    } catch (error) {
        return res.status(500).json({ status: "error", message: error.message });
    }
}
