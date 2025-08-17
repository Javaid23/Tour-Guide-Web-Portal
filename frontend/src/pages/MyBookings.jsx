import React, { useEffect, useState } from 'react';
import { bookingAPI } from '../services/api';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        console.log('📋 Fetching user bookings...');
        const res = await bookingAPI.getUserBookings();
        console.log('✅ Bookings fetched:', res.data);
        setBookings(res.data.bookings || res.data || []);
      } catch (e) {
        console.error('❌ Failed to load bookings:', e);
        setMessage('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
    
    // Listen for booking creation events
    const handleBookingCreated = () => {
      console.log('🔄 New booking created, refreshing list...');
      fetchBookings();
    };
    
    window.addEventListener('bookingCreated', handleBookingCreated);
    
    return () => {
      window.removeEventListener('bookingCreated', handleBookingCreated);
    };
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await bookingAPI.cancelBooking(id);
      setBookings(bookings.filter(b => b._id !== id));
      setMessage('Booking cancelled.');
    } catch (e) {
      setMessage(e.message);
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="flex justify-center items-center min-h-[70vh] bg-gradient-to-br from-blue-50 to-blue-100 py-10 px-2">
      <div className="w-full max-w-3xl">
        <h2 className="text-3xl font-bold mb-8 text-blue-800">My Bookings</h2>
        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-blue-600 font-medium">No bookings found.</div>
        ) : (
          <ul className="space-y-6">
            {bookings.map(b => (
              <li key={b._id} className="bg-white border border-blue-100 rounded-2xl shadow-lg p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-lg text-blue-700 flex items-center gap-2">
                    <CheckCircle className="text-green-500" size={18} />
                    {b.tour?.name || b.destination?.name || b.tourName || b.destinationName || 'Booking'}
                  </div>
                  <div className="text-gray-500 flex items-center gap-2 mt-1">
                    <Calendar size={16} />
                    Date: {b.startDate ? b.startDate.slice(0,10) : b.date || b.createdAt?.slice(0,10)}
                  </div>
                  <div className="text-sm mt-1">
                    Status: <span className={b.status === 'cancelled' ? 'text-red-500' : 'text-green-600'}>{b.status}</span>
                  </div>
                  {/* Show type */}
                  <div className="text-xs text-gray-400 mt-1">
                    {b.tour ? 'Tour Booking' : b.destination ? 'Destination Booking' : ''}
                  </div>
                </div>
                {b.status !== 'cancelled' && (
                  <button onClick={() => handleCancel(b._id)} className="w-full md:w-auto mt-4 md:mt-0 py-2 px-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-semibold text-base transition-all duration-300 hover:from-blue-700 hover:to-blue-800 shadow-md flex items-center justify-center gap-2">
                    <XCircle size={18} className="inline-block mr-1" /> Cancel
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        {message && <div className="mt-6 text-center text-blue-600 font-medium">{message}</div>}
      </div>
    </div>
  );
};

export default MyBookings;
