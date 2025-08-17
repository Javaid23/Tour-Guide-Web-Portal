import express from "express";
import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";
import Destination from "../models/Destination.js";
import auth from "../middleware/auth.js";
import { sendBookingConfirmation } from "../utils/emailService.js";

const router = express.Router();

// Create a booking (tour or destination)
router.post("/", auth, async (req, res) => {
  try {
    console.log('📝 POST /bookings - Creating booking');
    console.log('📝 User from token:', req.user);
    console.log('📝 Request body:', req.body);
    
    const { 
      tourId, 
      destinationId, 
      participants, 
      date, 
      name, 
      email, 
      phone, 
      paymentStatus, 
      paymentMethod, 
      paymentReference, 
      paymentIntentId,
      amount,
      currency,
      stripePaymentIntentId
    } = req.body;
    
    let basePrice = 0;
    let numberOfPeople = Number(participants) || 1;
    let startDate = date ? new Date(date) : new Date();
    let endDate = startDate ? new Date(startDate) : new Date(); 
    let bookingReference = `TG-${Date.now()}-${Math.floor(Math.random()*10000)}`;
    let customerInfo = { contactPerson: name, phone, email };
    let bookingData = {
      user: req.user.userId,
      startDate,
      endDate,
      numberOfPeople,
      bookingReference,
      customerInfo,
      // Add payment fields
      paymentStatus: paymentStatus || 'pending',
      paymentMethod: paymentMethod || 'cash',
      paymentReference: paymentReference || paymentIntentId || stripePaymentIntentId,
      // Add amount and currency fields
      amount: amount || 0,
      currency: currency || 'usd',
      stripePaymentIntentId: stripePaymentIntentId || paymentIntentId
    };

    if (tourId) {
      const tour = await Tour.findById(tourId);
      if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });
      basePrice = tour.price || 0;
      let durationDays = 1;
      if (tour.duration && typeof tour.duration.days === 'number' && tour.duration.days > 0) {
        durationDays = tour.duration.days;
      }
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + durationDays);
      bookingData.tour = tourId;
      console.log('[BOOKING] TOUR:', { startDate, endDate, durationDays });
    } else if (destinationId) {
      const destination = await Destination.findById(destinationId);
      if (!destination) return res.status(404).json({ success: false, message: "Destination not found" });
      basePrice = destination.price && typeof destination.price === 'number' ? destination.price : 0;
      let durationDays = 1;
      if (destination.duration && typeof destination.duration.days === 'number' && destination.duration.days > 0) {
        durationDays = destination.duration.days;
      }
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + durationDays);
      bookingData.destination = destinationId;
      console.log('[BOOKING] DESTINATION:', { startDate, endDate, durationDays });
    } else {
      return res.status(400).json({ success: false, message: "tourId or destinationId is required" });
    }

    const totalPrice = amount || (basePrice * numberOfPeople);
    bookingData.basePrice = basePrice;
    bookingData.totalPrice = totalPrice;
    bookingData.startDate = startDate;
    bookingData.endDate = endDate;

    console.log('💾 Saving booking:', bookingData);
    
    const booking = new Booking(bookingData);
    await booking.save();

    console.log('✅ Booking saved successfully:', booking._id);

    // Send confirmation email
    try {
      await sendBookingConfirmation(
        customerInfo.email,
        {
          userName: customerInfo.contactPerson,
          tourTitle: (booking.tour ? (await Tour.findById(booking.tour)).name : (booking.destination ? (await Destination.findById(booking.destination)).name : "")),
          startDate: booking.startDate,
          numberOfPeople: booking.numberOfPeople,
          totalPrice: booking.totalPrice
        }
      );
    } catch (emailErr) {
      console.error("Booking confirmation email failed:", emailErr);
    }

    res.json({ success: true, booking });
  } catch (error) {
    console.error('❌ Booking creation failed:', error);
    res.status(500).json({ success: false, message: error.message || "Booking failed" });
  }
});

// Get user's bookings
router.get("/my", auth, async (req, res) => {
  try {
    console.log('📋 GET /bookings/my - Request received');
    console.log('📋 User from token:', req.user);
    console.log('📋 Fetching bookings for user:', req.user.userId);
    
    const bookings = await Booking.find({ user: req.user.userId })
      .populate("tour", "name price duration location")
      .populate("destination", "name price duration location")
      .sort({ createdAt: -1 }); // Most recent first
    
    console.log('✅ Found', bookings.length, 'bookings for user');
    console.log('✅ Bookings details:', bookings.map(b => ({
      _id: b._id,
      tour: b.tour?.name,
      destination: b.destination?.name,
      status: b.status,
      createdAt: b.createdAt
    })));
    
    res.json({ success: true, bookings });
  } catch (error) {
    console.error('❌ Error fetching user bookings:', error);
    res.status(500).json({ success: false, message: error.message || "Failed to fetch bookings" });
  }
});

export default router;
