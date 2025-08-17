import { useState } from "react";
import { bookingAPI } from "../services/api.js";

const BookingModal = ({ tour, open, onClose }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    participants: 1,
    date: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Helper: get safe duration in days (fallback to 1 if missing)
  const getDurationDays = () => {
    if (tour?.duration?.days && typeof tour.duration.days === 'number') return tour.duration.days;
    if (typeof tour?.duration === 'number') return tour.duration;
    return 1;
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Validate date is in the future
      const selectedDate = new Date(form.date);
      const now = new Date();
      if (!form.date || selectedDate <= now) {
        setError("Please select a future date for your tour.");
        setLoading(false);
        return;
      }
      // Validate all fields
      if (!form.name || !form.email || !form.phone || !form.participants) {
        setError("All fields are required.");
        setLoading(false);
        return;
      }
      // Send booking
      await bookingAPI.createBooking({
        ...form,
        tourId: tour._id,
        durationDays: getDurationDays(), // for debugging
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Booking failed");
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-blue-600" onClick={onClose}>×</button>
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Book {tour.title}</h2>
        {success ? (
          <div className="text-green-600 font-semibold text-lg">Booking successful! We’ll contact you soon.</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="name" type="text" required placeholder="Full Name" className="input" value={form.name} onChange={handleChange} />
            <input name="email" type="email" required placeholder="Email" className="input" value={form.email} onChange={handleChange} />
            <input name="phone" type="tel" required placeholder="Phone" className="input" value={form.phone} onChange={handleChange} />
            <input name="date" type="date" required className="input" value={form.date} onChange={handleChange} />
            <input name="participants" type="number" min="1" max="50" required className="input" value={form.participants} onChange={handleChange} />
            {error && <div className="text-red-600">{error}</div>}
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-lg" disabled={loading}>
              {loading ? "Booking..." : "Book Now"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
