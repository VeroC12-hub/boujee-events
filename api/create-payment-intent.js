export default async function handler(req, res) {
	res.setHeader('Access-Control-Allow-Credentials', true);
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
	res.setHeader(
		'Access-Control-Allow-Headers',
		'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
	);

	if (req.method === 'OPTIONS') {
		return res.status(200).end();
	}

	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const { amount, currency = 'usd', event_id, user_id, metadata = {} } = req.body || {};

		if (!amount || amount <= 0) {
			return res.status(400).json({ error: 'Invalid amount' });
		}

		// In production, call your server with Stripe Secret to create PaymentIntent
		// Here we return a mock PaymentIntent-like payload for dev
		const id = `pi_mock_${Date.now()}`;
		return res.status(200).json({
			id,
			client_secret: `${id}_secret_${Math.random().toString(36).slice(2)}`,
			amount,
			currency,
			status: 'requires_payment_method',
			metadata: { eventId: event_id, userId: user_id, ...metadata }
		});
	} catch (e) {
		console.error('create-payment-intent error:', e);
		return res.status(500).json({ error: 'Internal server error' });
	}
}