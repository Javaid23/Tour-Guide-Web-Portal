"use client"

import { useState } from "react"
import { X, Plus, Minus, CreditCard, Banknote } from "lucide-react"
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { Link } from "react-router-dom";
import TermsModal from "./TermsModal";
import api from '../services/api';
import AuthCheck from './AuthCheck';

const BookingForm = ({ tour, isOpen, onClose, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    travelers: [{ type: "adult", firstName: "", lastName: "", age: "", passport: "" }],
    contactInfo: {
      email: "",
      phone: "",
      address: "",
      emergencyContact: { name: "", phone: "" },
    },
    preferences: {
      dietaryRequirements: "",
      medicalConditions: "",
      specialRequests: "",
      roomPreference: "shared",
    },
    paymentMethod: "stripe",
    cardholderName: "", // NEW FIELD
    agreeToTerms: false,
    dateOfTravel: "",
  })

  const [pricing, setPricing] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  })

  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentError, setPaymentError] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [dateError, setDateError] = useState("");

  const stripe = useStripe();
  const elements = useElements();

  // Calculate pricing in $
  const calculatePricing = () => {
    const basePrice = tour?.price || 0
    const adultPrice = basePrice
    const childPrice = basePrice * 0.7 // 30% discount for children
    const infantPrice = basePrice * 0.1 // 90% discount for infants

    // Room preference extra charges
    let roomExtra = 0;
    switch (formData.preferences.roomPreference) {
      case "single":
        roomExtra = 50; // example extra amount for single room
        break;
      case "double":
        roomExtra = 80; // example extra amount for double room
        break;
      case "family":
        roomExtra = 120; // example extra amount for family room
        break;
      default:
        roomExtra = 0;
    }

    const subtotal = pricing.adults * adultPrice + pricing.children * childPrice + pricing.infants * infantPrice + roomExtra;
    const gst = subtotal * 0.17 // 17% GST in Pakistan
    const total = subtotal + gst

    return {
      subtotal,
      gst,
      total,
      breakdown: {
        adults: { count: pricing.adults, price: adultPrice, total: pricing.adults * adultPrice },
        children: { count: pricing.children, price: childPrice, total: pricing.children * childPrice },
        infants: { count: pricing.infants, price: infantPrice, total: pricing.infants * infantPrice },
        roomExtra,
      },
    }
  }

  const priceCalculation = calculatePricing()

  const updateTravelerCount = (type, increment) => {
    setPricing(prev => {
      const newCount = Math.max(0, prev[type] + increment);
      if (type === "adults" && newCount === 0) return prev; // At least 1 adult required
      return { ...prev, [type]: newCount };
    });
  }

  const addTraveler = () => {
    setFormData((prev) => ({
      ...prev,
      travelers: [...prev.travelers, { type: "adult", firstName: "", lastName: "", age: "", passport: "" }],
    }))
  }

  const removeTraveler = (index) => {
    if (formData.travelers.length > 1) {
      setFormData((prev) => ({
        ...prev,
        travelers: prev.travelers.filter((_, i) => i !== index),
      }))
    }
  }

  const updateTraveler = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      travelers: prev.travelers.map((traveler, i) => (i === index ? { ...traveler, [field]: value } : traveler)),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDateError("");
    if (currentStep === 1) {
      // Validate date is in the future
      if (!formData.dateOfTravel) {
        setDateError("Please select a date of travel.");
        return;
      }
      const selectedDate = new Date(formData.dateOfTravel);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (selectedDate <= today) {
        setDateError("Date of travel must be in the future.");
        return;
      }
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      return;
    }
    // Step 4: Payment
    if (formData.paymentMethod === "stripe") {
      // Stripe payment logic (was in handleStripePayment)
      setIsPaying(true);
      setPaymentError(null);
      setPaymentStatus(null);
      setSuccessMessage("");
      try {
        // Improved logic to determine if this is a destination or tour booking
        const isDestination = 
          tour.type === 'destination' || 
          tour.category === 'destination' || 
          tour.category === 'Destination' ||
          tour.destinationType || 
          tour.location || 
          tour.region;
          
        const response = await axios.post('/api/payments/create-payment-intent', {
          amount: priceCalculation.total, // amount in dollars
          currency: 'usd',
          metadata: {
            email: formData.contactInfo.email,
            name: formData.travelers[0]?.firstName + ' ' + formData.travelers[0]?.lastName,
            ...(isDestination ? { destinationId: tour._id } : { tourId: tour._id })
          }
        });
        const clientSecret = response.data.clientSecret;
        const cardElement = elements.getElement(CardElement);
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: formData.travelers[0]?.firstName + ' ' + formData.travelers[0]?.lastName,
              email: formData.contactInfo.email,
            },
          },
        });
        if (result.error) {
          setPaymentError(typeof result.error.message === "string" ? result.error.message : JSON.stringify(result.error.message));
          setIsPaying(false);
        } else if (result.paymentIntent.status === 'succeeded') {
          setPaymentStatus('success');
          setIsPaying(false);
          setSuccessMessage('Payment successful! Booking confirmed. You can view your booking in your profile.');
          // Save booking in backend
          try {
            const bookingPayload = {
              ...(isDestination ? { destinationId: tour._id } : { tourId: tour._id }),
              participants: pricing.adults + pricing.children + pricing.infants,
              date: formData.dateOfTravel,
              name: formData.travelers[0]?.firstName + ' ' + formData.travelers[0]?.lastName,
              email: formData.contactInfo.email,
              phone: formData.contactInfo.phone,
              paymentStatus: 'paid',
              paymentMethod: 'stripe',
              paymentReference: result.paymentIntent.id,
              stripePaymentIntentId: result.paymentIntent.id,
              amount: priceCalculation.total,
              currency: 'usd'
            };
            
            console.log('💳 Saving Stripe booking:', bookingPayload);
            const response = await api.post('/bookings', bookingPayload);
            console.log('✅ Stripe booking saved:', response.data);
            
            // Auto-close modal after 3 seconds and refresh parent component
            setTimeout(() => {
              if (onSubmit) onSubmit(formData);
              // Trigger a custom event to refresh profile data
              window.dispatchEvent(new CustomEvent('bookingCreated', { detail: response.data }));
            }, 3000);
          } catch (bookingErr) {
            setPaymentError('Payment succeeded, but booking could not be saved. Please contact support.');
          }
          if (onSubmit) onSubmit(formData);
        }
      } catch (err) {
        let errorMsg = err.response?.data?.error || err.message || err.toString();
        if (typeof errorMsg !== "string") errorMsg = JSON.stringify(errorMsg);
        setPaymentError(errorMsg);
        setIsPaying(false);
      }
      return;
    }
    if (formData.paymentMethod === "cash") {
      setIsPaying(true);
      setPaymentError(null);
      setPaymentStatus(null);
      setSuccessMessage("");
      try {
        // Improved logic to determine if this is a destination or tour booking
        // Since both tours and destinations can have duration, focus on other indicators
        const isDestination = 
          tour.type === 'destination' || 
          tour.category === 'destination' || 
          tour.category === 'Destination' ||
          tour.destinationType || // if destinations have this field
          tour.location || // destinations might have location field
          tour.region; // destinations might have region field
        
        // Check authentication
        const token = localStorage.getItem('token');
        console.log('Auth token present:', !!token);
        console.log('Token value:', token);
        
        if (!token) {
          setPaymentError('Please login to complete your booking. You will be redirected to login page.');
          setTimeout(() => {
            window.location.href = '/auth';
          }, 2000);
          setIsPaying(false);
          return;
        }
        
        // Log tour/destination information for debugging
        console.log('Item object:', tour);
        console.log('Item ID:', tour._id);
        console.log('Item category:', tour.category);
        console.log('Item type:', tour.type);
        console.log('Item duration:', tour.duration);
        console.log('Item location:', tour.location);
        console.log('Item region:', tour.region);
        console.log('Is destination?', isDestination);
        
        const bookingPayload = {
          ...(isDestination ? { destinationId: tour._id } : { tourId: tour._id }),
          participants: pricing.adults + pricing.children + pricing.infants,
          date: formData.dateOfTravel,
          name: formData.travelers[0]?.firstName + ' ' + formData.travelers[0]?.lastName,
          email: formData.contactInfo.email,
          phone: formData.contactInfo.phone,
          paymentStatus: 'pending',
          paymentMethod: 'cash',
          amount: priceCalculation.total,
          currency: 'usd'
        };
        
        console.log('💰 Creating cash booking:', bookingPayload);
        console.log('🔐 Auth token:', !!token);
        
        const response = await api.post('/bookings', bookingPayload);
        console.log('✅ Cash booking saved:', response.data);
        setPaymentStatus('success');
        setIsPaying(false);
        setSuccessMessage('Booking successful! Please pay in cash at our office. You can view your booking in your profile.');
        
        // Auto-close modal after 3 seconds and refresh parent component
        setTimeout(() => {
          if (onSubmit) onSubmit(formData);
          // Trigger a custom event to refresh profile data
          window.dispatchEvent(new CustomEvent('bookingCreated', { detail: response.data }));
        }, 3000);
      } catch (bookingErr) {
        console.error('Booking error:', bookingErr);
        console.error('Error response:', bookingErr.response?.data);
        console.error('Error status:', bookingErr.response?.status);
        console.error('Full error object:', bookingErr);
        console.error('Request config:', bookingErr.config);
        let errorMsg = bookingErr.response?.data?.message || bookingErr.response?.data?.error || bookingErr.message || 'Unknown error';
        if (typeof errorMsg !== "string") errorMsg = JSON.stringify(errorMsg);
        setPaymentError(`Booking failed: ${errorMsg}`);
  setIsPaying(false);
      }
      return;
    }
    // fallback for other payment methods
    const isDestination = 
      tour.type === 'destination' || 
      tour.category === 'destination' || 
      tour.category === 'Destination' ||
      tour.destinationType || 
      tour.location || 
      tour.region;
      
    onSubmit({
      ...formData,
      pricing: priceCalculation,
      ...(isDestination ? { destinationId: tour._id } : { tourId: tour._id })
    });
  }

  // handleStripePayment logic is now merged into handleSubmit

  if (!isOpen) return null

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "800px",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <AuthCheck requireAuth={true}>
          {/* Header */}
          <div
            style={{
              padding: "24px",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h2 style={{ margin: 0, color: "var(--primary-blue)" }}>Book Your Tour</h2>
              <p style={{ margin: "4px 0 0 0", color: "#64748b" }}>{tour?.name}</p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Steps */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {["Travelers", "Contact", "Preferences", "Payment"].map((step, index) => (
              <div key={step} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background:
                      currentStep > index + 1
                        ? "#10b981"
                        : currentStep === index + 1
                          ? "var(--primary-blue)"
                          : "#e2e8f0",
                    color: currentStep >= index + 1 ? "white" : "#64748b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  {index + 1}
                </div>
                <span
                  style={{
                    marginLeft: "8px",
                    fontSize: "14px",
                    color: currentStep >= index + 1 ? "var(--primary-blue)" : "#64748b",
                    fontWeight: currentStep === index + 1 ? "600" : "400",
                  }}
                >
                  {step}
                </span>
                {index < 3 && (
                  <div
                    style={{
                      flex: 1,
                      height: "2px",
                      background: currentStep > index + 1 ? "#10b981" : "#e2e8f0",
                      margin: "0 16px",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: "24px" }}>
            {/* Step 1: Travelers, Date of Travel, Room Preference */}
            {currentStep === 1 && (
              <div>
                <h3 style={{ marginBottom: "20px" }}>Traveler Information</h3>

                {/* Traveler Count */}
                <div style={{ marginBottom: "24px", padding: "16px", background: "#f8fafc", borderRadius: "8px" }}>
                  <h4 style={{ marginBottom: "16px" }}>Number of Travelers</h4>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    {/* ...existing code for traveler count... */}
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600" }}>
                        Adults (12+ years)
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button type="button" onClick={() => updateTravelerCount("adults", -1)} style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #d1d5db", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Minus size={16} /></button>
                        <span style={{ fontSize: "18px", fontWeight: "600", minWidth: "20px", textAlign: "center" }}>{pricing.adults}</span>
                        <button type="button" onClick={() => updateTravelerCount("adults", 1)} style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #d1d5db", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Plus size={16} /></button>
                      </div>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600" }}>
                        Children (2-11 years)
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button type="button" onClick={() => updateTravelerCount("children", -1)} style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #d1d5db", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Minus size={16} /></button>
                        <span style={{ fontSize: "18px", fontWeight: "600", minWidth: "20px", textAlign: "center" }}>{pricing.children}</span>
                        <button type="button" onClick={() => updateTravelerCount("children", 1)} style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #d1d5db", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Plus size={16} /></button>
                      </div>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600" }}>
                        Infants (0-1 years)
                      </label>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <button type="button" onClick={() => updateTravelerCount("infants", -1)} style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #d1d5db", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Minus size={16} /></button>
                        <span style={{ fontSize: "18px", fontWeight: "600", minWidth: "20px", textAlign: "center" }}>{pricing.infants}</span>
                        <button type="button" onClick={() => updateTravelerCount("infants", 1)} style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #d1d5db", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Plus size={16} /></button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date of Travel */}
                <div style={{ marginBottom: "24px" }}>
                  <label className="form-label">Date of Travel *</label>
                  <input
                    type="date"
                    className="form-input"
                    required
                    value={formData.dateOfTravel}
                    onChange={e => setFormData(prev => ({ ...prev, dateOfTravel: e.target.value }))}
                  />
                  {dateError && (
                    <div style={{ color: 'red', marginTop: 4 }}>{dateError}</div>
                  )}
                </div>

                {/* Room Preference */}
                <div style={{ marginBottom: "24px" }}>
                  <label className="form-label">Room Preference</label>
                  <select
                    className="form-input"
                    value={formData.preferences.roomPreference}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, roomPreference: e.target.value },
                    }))}
                  >
                    <option value="shared">Shared accommodation</option>
                    <option value="single">Single room (+$50)</option>
                    <option value="double">Double room (+$80)</option>
                    <option value="family">Family room (+$120)</option>
                  </select>
                </div>

                {/* Price Breakdown */}
                <div
                  style={{
                    marginBottom: "24px",
                    padding: "16px",
                    background: "#f0f9ff",
                    borderRadius: "8px",
                    border: "1px solid #0ea5e9",
                  }}
                >
                  <h4 style={{ marginBottom: "12px", color: "var(--primary-blue)" }}>Price Breakdown</h4>
                  <div style={{ fontSize: "14px", lineHeight: "1.6" }}>
                    {priceCalculation.breakdown.adults.count > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span>
                          Adults ({priceCalculation.breakdown.adults.count} × $ {priceCalculation.breakdown.adults.price.toLocaleString()})
                        </span>
                        <span>$ {priceCalculation.breakdown.adults.total.toLocaleString()}</span>
                      </div>
                    )}
                    {priceCalculation.breakdown.children.count > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span>
                          Children ({priceCalculation.breakdown.children.count} × $ {priceCalculation.breakdown.children.price.toLocaleString()})
                        </span>
                        <span>$ {priceCalculation.breakdown.children.total.toLocaleString()}</span>
                      </div>
                    )}
                    {priceCalculation.breakdown.infants.count > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span>
                          Infants ({priceCalculation.breakdown.infants.count} × $ {priceCalculation.breakdown.infants.price.toLocaleString()})
                        </span>
                        <span>$ {priceCalculation.breakdown.infants.total.toLocaleString()}</span>
                      </div>
                    )}
                    {priceCalculation.breakdown.roomExtra > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", color: "#0ea5e9" }}>
                        <span>Room Preference Extra</span>
                        <span>$ {priceCalculation.breakdown.roomExtra.toLocaleString()}</span>
                      </div>
                    )}
                    <hr style={{ margin: "8px 0", border: "none", borderTop: "1px solid #cbd5e1" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span>Subtotal</span>
                      <span>$ {priceCalculation.subtotal.toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span>GST (17%)</span>
                      <span>$ {priceCalculation.gst.toLocaleString()}</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "16px",
                        fontWeight: "700",
                        color: "var(--primary-blue)",
                      }}
                    >
                      <span>Total</span>
                      <span>$ {priceCalculation.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 2 && (
              <div>
                <h3 style={{ marginBottom: "20px" }}>Contact Information</h3>
                <div
                  style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}
                >
                  <div>
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      className="form-input"
                      required
                      value={formData.contactInfo.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, email: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <label className="form-label">Phone Number *</label>
                    <div style={{ display: 'flex', gap: 0, alignItems: 'stretch', width: '100%' }}>
                      {/* Country code dropdown placeholder (for future use) */}
                      {/* <div style={{ flex: 1, minWidth: 0 }}>
                        <Select ... />
                      </div> */}
                      <input
                        type="tel"
                        className="form-input"
                        required
                        value={formData.contactInfo.phone}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            contactInfo: { ...prev.contactInfo, phone: e.target.value },
                          }))
                        }
                        style={{
                          flex: 1,
                          minWidth: 0,
                          height: '40px',
                          fontSize: '16px',
                          boxSizing: 'border-box',
                          padding: '0 8px',
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">Address</label>
                    <textarea
                      className="form-input"
                      rows="3"
                      value={formData.contactInfo.address}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, address: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="form-label">Emergency Contact Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.contactInfo.emergencyContact.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          contactInfo: {
                            ...prev.contactInfo,
                            emergencyContact: { ...prev.contactInfo.emergencyContact, name: e.target.value },
                          },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="form-label">Emergency Contact Phone</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={formData.contactInfo.emergencyContact.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          contactInfo: {
                            ...prev.contactInfo,
                            emergencyContact: { ...prev.contactInfo.emergencyContact, phone: e.target.value },
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Preferences (without room preference) */}
            {currentStep === 3 && (
              <div>
                <h3 style={{ marginBottom: "20px" }}>Travel Preferences</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label className="form-label">Dietary Requirements</label>
                    <textarea
                      className="form-input"
                      rows="2"
                      placeholder="Any dietary restrictions or preferences..."
                      value={formData.preferences.dietaryRequirements}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          preferences: { ...prev.preferences, dietaryRequirements: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="form-label">Medical Conditions</label>
                    <textarea
                      className="form-input"
                      rows="2"
                      placeholder="Any medical conditions we should be aware of..."
                      value={formData.preferences.medicalConditions}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          preferences: { ...prev.preferences, medicalConditions: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="form-label">Special Requests</label>
                    <textarea
                      className="form-input"
                      rows="3"
                      placeholder="Any special requests or requirements for your tour..."
                      value={formData.preferences.specialRequests}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          preferences: { ...prev.preferences, specialRequests: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Payment */}
            {currentStep === 4 && (
              <div>
                <h3 style={{ marginBottom: "20px" }}>Payment Method</h3>

                {/* Payment Options */}
                <div style={{ marginBottom: "24px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "16px",
                        border: "2px solid #e2e8f0",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="stripe"
                        checked={formData.paymentMethod === "stripe"}
                        onChange={(e) => setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                      />
                      <CreditCard size={20} style={{ color: "var(--primary-blue)" }} />
                      <div>
                        <div style={{ fontWeight: "600" }}>Credit/Debit Card</div>
                        <div style={{ fontSize: "14px", color: "#64748b" }}>Secure payment via Stripe</div>
                      </div>
                    </label>

                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "16px",
                        border: "2px solid #e2e8f0",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={formData.paymentMethod === "cash"}
                        onChange={(e) => setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                      />
                      <Banknote size={20} style={{ color: "var(--primary-blue)" }} />
                      <div>
                        <div style={{ fontWeight: "600" }}>Cash Payment</div>
                        <div style={{ fontSize: "14px", color: "#64748b" }}>Pay in cash at our office</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Card Payment Form */}
                {formData.paymentMethod === "stripe" && (
                  <div style={{ marginBottom: "24px" }}>
                    <label htmlFor="cardholder-name" style={{ fontWeight: 'bold', display: 'block', marginBottom: 8 }}>Cardholder Name</label>
                    <input
                      id="cardholder-name"
                      type="text"
                      className="form-input"
                      placeholder="Name on card"
                      value={formData.cardholderName}
                      onChange={e => setFormData(prev => ({ ...prev, cardholderName: e.target.value }))}
                      style={{ marginBottom: 12 }}
                    />
                    <label htmlFor="card-element" style={{ fontWeight: 'bold' }}>Card Details</label>
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px', marginTop: '8px' }}>
                      <CardElement id="card-element" options={{ hidePostalCode: true }} />
                    </div>
                    {paymentError && <div style={{ color: 'red', marginTop: 8 }}>{paymentError}</div>}
                    {paymentStatus === 'success' && <div style={{ color: 'green', marginTop: 8 }}>{successMessage || 'Payment successful! Booking confirmed.'}</div>}
                  </div>
                )}

                {/* Final Price Summary */}
                <div
                  style={{
                    marginBottom: "24px",
                    padding: "20px",
                    background: "#f8fafc",
                    borderRadius: "8px",
                    border: "2px solid var(--primary-blue)",
                  }}
                >
                  <h4 style={{ marginBottom: "16px", color: "var(--primary-blue)" }}>Booking Summary</h4>
                  <div style={{ marginBottom: "12px" }}>
                    <strong>{tour?.name}</strong>
                  </div>
                  <div style={{ fontSize: "14px", marginBottom: "12px", color: "#64748b" }}>
                    {pricing.adults + pricing.children + pricing.infants} travelers • {tour?.duration?.days} days
                  </div>
                  <div style={{ fontSize: "24px", fontWeight: "700", color: "var(--primary-blue)" }}>
                    Total: $ {priceCalculation.total.toLocaleString()}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Includes GST and all taxes</div>
                </div>

                {/* Terms and Conditions */}
                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", cursor: "pointer", fontSize: "15px", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                    <input
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={(e) => setFormData((prev) => ({ ...prev, agreeToTerms: e.target.checked }))}
                      style={{ width: "18px", height: "18px", accentColor: "var(--primary-blue)", verticalAlign: "middle", marginTop: 0, marginBottom: 0, marginRight: 8 }}
                      required
                    />
                    <span style={{ fontSize: "15px", lineHeight: 1.6, verticalAlign: "middle" }}>
                      I agree to the{' '}
                      <a
                        href="/terms-and-conditions"
                        style={{ color: "var(--primary-blue)", textDecoration: "underline" }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Terms and Conditions
                      </a>{' '}and{' '}
                      <a
                        href="/cancellation-policy"
                        style={{ color: "var(--primary-blue)", textDecoration: "underline" }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Cancellation Policy
                      </a>.
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div
            style={{
              padding: "24px",
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              alignItems: "stretch",
            }}
          >
            {/* Processing message */}
            {isPaying && (
              <div style={{ color: '#0066cc', marginBottom: 8, textAlign: 'center', fontWeight: 600, fontSize: 15, backgroundColor: '#eff6ff', padding: '12px', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                {formData.paymentMethod === 'cash' ? 'Creating booking...' : 'Processing payment...'}
              </div>
            )}
            {/* Success message (global, for booking success) */}
            {paymentStatus === 'success' && successMessage && (
              <div style={{ color: 'green', marginBottom: 8, textAlign: 'center', fontWeight: 600, fontSize: 15, backgroundColor: '#f0f9ff', padding: '12px', borderRadius: '8px', border: '1px solid #10b981' }}>
                {successMessage}
              </div>
            )}
            {/* Error message (global, for booking/network/auth errors) */}
            {paymentError && (
              <div style={{ color: 'red', marginBottom: 8, textAlign: 'center', fontWeight: 600, fontSize: 15 }}>
                {typeof paymentError === "string" ? paymentError : JSON.stringify(paymentError)}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                {currentStep > 1 && (
                  <button type="button" onClick={() => setCurrentStep(currentStep - 1)} className="btn btn-secondary">
                    Previous
                  </button>
                )}
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button type="button" onClick={onClose} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={currentStep === 4 && !formData.agreeToTerms || isPaying || paymentStatus === 'success'}
                >
                  {paymentStatus === 'success' ? 'Booking Completed!' : 
                   isPaying ? (formData.paymentMethod === 'cash' ? 'Creating Booking...' : 'Processing Payment...') :
                   currentStep === 4 ? "Complete Booking" : "Next Step"}
                </button>
              </div>
            </div>
          </div>
        </form>
        </AuthCheck>
      </div>
    </div>
  )
}

export default BookingForm
