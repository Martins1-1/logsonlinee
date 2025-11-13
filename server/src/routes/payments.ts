import express from 'express';
import Ercaspay from '@capitalsage/ercaspay-nodejs';

const router = express.Router();

// Validate Ercaspay configuration
const ECRS_SECRET_KEY = process.env.ECRS_SECRET_KEY;
if (!ECRS_SECRET_KEY || ECRS_SECRET_KEY.trim() === '') {
  console.error('FATAL: ECRS_SECRET_KEY is not set in environment variables!');
}

// Initialize Ercaspay client - MUST use baseURL (uppercase) not baseUrl
const ercaspay = new Ercaspay({
  baseURL: 'https://api.ercaspay.com',
  secretKey: ECRS_SECRET_KEY || '',
});

/**
 * POST /api/payments/create-session
 * Creates a new payment checkout session with Ercaspay
 */
router.post('/create-session', async (req, res) => {
  try {
    const { amount, currency, userId, email, callbackUrl } = req.body;

    // Validate required fields
    if (!amount || !currency || !userId || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: amount, currency, userId, email',
      });
    }

    // Generate unique payment reference
    const paymentReference = ercaspay.generatePaymentReferenceUuid();

    // Build redirect URL to return customer to /shop with our paymentReference in query
    const baseRedirect = (callbackUrl || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/shop`).toString();
    const redirectUrlWithRef = baseRedirect.includes('?')
      ? `${baseRedirect}&pref=${encodeURIComponent(paymentReference)}`
      : `${baseRedirect}?pref=${encodeURIComponent(paymentReference)}`;

    // Prepare transaction data
    const transactionData = {
      amount: String(amount),
      paymentReference,
      paymentMethods: 'card,bank-transfer,ussd',
      customerName: 'Customer', // You can enhance this by getting actual customer name
      customerEmail: email,
      currency: currency.toUpperCase(),
      customerPhoneNumber: '', // Optional - can be added to frontend form
      redirectUrl: redirectUrlWithRef,
      description: `Wallet top-up for user ${userId}`,
      feeBearer: 'customer',
      metadata: {
        userId,
        type: 'wallet-topup',
      },
    };

    // Optional: light debug for transaction (avoid logging secrets)
    console.log('Ercaspay initiateTransaction called', {
      paymentReference,
      amount: String(amount),
      currency: currency.toUpperCase(),
      hasSecretKey: Boolean(ECRS_SECRET_KEY && ECRS_SECRET_KEY.length > 0)
    });

    // Initiate transaction with Ercaspay
    const response = await ercaspay.initiateTransaction(transactionData);

    // Check if transaction was successful
    if (response.requestSuccessful && response.responseBody) {
      const { checkoutUrl } = response.responseBody;
      // Ercaspay may return its own transaction reference field; attempt to resolve it
      const transactionReference = response.responseBody.transactionReference
        || response.responseBody.transactionRef
        || response.responseBody.reference
        || null;

      return res.status(200).json({
        success: true,
        checkoutUrl,
        paymentReference, // our internally generated UUID
        transactionReference, // gateway provided reference for verification
      });
    } else {
      return res.status(400).json({
        success: false,
        error: response.responseMessage || 'Failed to create payment session',
      });
    }
  } catch (error: any) {
    console.error('Error creating payment session:', error);
    console.error('Error details:', {
      message: error.message,
      responseData: error.responseData,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    });
    return res.status(500).json({
      success: false,
      error: error.responseData?.responseMessage || error.message || 'Internal server error',
    });
  }
});

/**
 * GET /api/payments/verify
 * Verifies a payment transaction status
 */
router.get('/verify', async (req, res) => {
  try {
    const { reference } = req.query;

    if (!reference || typeof reference !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Payment reference is required',
      });
    }

    // Verify transaction with Ercaspay
    const response = await ercaspay.verifyTransaction(reference);

    // Check verification response
    if (response.requestSuccessful && response.responseBody) {
      const transactionData = response.responseBody;

      // Map Ercaspay response codes to our status
      let status = 'pending';
      if (response.responseCode === 'success') {
        status = 'success';
      } else if (response.responseCode === 'failed') {
        status = 'failed';
      }

      return res.status(200).json({
        success: true,
        status,
        amount: transactionData.amount || 0,
        reference,
        data: transactionData,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: response.responseMessage || 'Failed to verify payment',
        status: 'failed',
      });
    }
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      success: false,
      error: error.responseData?.responseMessage || error.message || 'Internal server error',
      status: 'failed',
    });
  }
});

/**
 * GET /api/payments/status/:reference
 * Fetches detailed transaction status (alternative to verify)
 */
router.get('/status/:reference', async (req, res) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({
        success: false,
        error: 'Payment reference is required',
      });
    }

    // Fetch transaction details
    const response = await ercaspay.fetchTransactionDetails(reference);

    if (response.requestSuccessful && response.responseBody) {
      return res.status(200).json({
        success: true,
        data: response.responseBody,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: response.responseMessage || 'Failed to fetch transaction status',
      });
    }
  } catch (error: any) {
    console.error('Error fetching transaction status:', error);
    return res.status(500).json({
      success: false,
      error: error.responseData?.responseMessage || error.message || 'Internal server error',
    });
  }
});

export default router;
