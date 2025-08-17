import express from "express";
import Stripe from "stripe";
import auth from "../middleware/auth.js";
import Booking from "../models/Booking.js";

const router = express.Router();

// Load Stripe secret key from environment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * POST /api/payments/create-payment-intent
 * Body: { amount: number (in USD), currency: string (default: 'usd'), metadata: object (optional) }
 * Returns: { clientSecret }
 */
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount, currency = "usd", metadata = {} } = req.body;
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ message: "Amount is required and must be a number." });
    }

    // Stripe expects amount in cents
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      payment_method_types: ["card"],
      metadata,
      // Optionally, you can add receipt_email, description, etc.
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe payment intent error:", error);
    res.status(500).json({ message: "Failed to create payment intent", error: error.message });
  }
});

/**
 * GET /api/payments/history
 * Returns user's payment history from bookings
 */
router.get("/history", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.userId })
      .populate("tour", "name")
      .populate("destination", "name")
      .sort({ createdAt: -1 });

    const payments = bookings
      .filter(booking => booking.paymentStatus === 'paid' || booking.stripePaymentIntentId)
      .map(booking => ({
        id: booking._id,
        tourName: booking.tour?.name || booking.destination?.name || 'Unknown Tour',
        amount: booking.amount || 0,
        currency: booking.currency || 'USD',
        date: booking.createdAt,
        status: booking.paymentStatus || 'completed',
        transactionId: booking.stripePaymentIntentId || `booking_${booking._id}`,
        bookingId: booking._id
      }));

    res.json({ success: true, data: payments });
  } catch (error) {
    console.error("Payment history error:", error);
    res.status(500).json({ message: "Failed to fetch payment history" });
  }
});

export default router;
