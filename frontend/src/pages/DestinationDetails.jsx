import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BookingForm from "../components/BookingForm.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const DestinationDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const fetchDestination = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_URL}/destinations/${id}`);
        const data = await res.json();
        if (res.ok && data.destinations) {
          setDestination(data.destinations);
        } else if (res.ok && data) {
          setDestination(data);
        } else {
          setError(data.error || "Destination not found");
        }
      } catch (err) {
        setError("Failed to fetch destination details");
      } finally {
        setLoading(false);
      }
    };
    fetchDestination();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!destination) return <div className="p-8 text-center">No details found.</div>;

  // If API returns an array, use the first item
  const dest = Array.isArray(destination) ? destination[0] : destination;

  return (
    <div className="max-w-5xl mx-auto p-6">
  {/* ...existing code... */}
  {/* Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {dest.images && dest.images.length > 0 ? (
          dest.images.slice(0, 4).map((img, i) => (
            <img
              key={i}
              src={img.url}
              alt={img.caption || dest.name}
              className="w-full h-64 object-cover rounded-xl"
              style={{ objectPosition: 'center top' }}
            />
          ))
        ) : (
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-xl text-gray-400">
            No Image
          </div>
        )}
      </div>
      {/* Title & Quick Facts */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">{dest.name}</h1>
          <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
            <span><strong>Category:</strong> {dest.category}</span>
            <span><strong>Location:</strong> {dest.location?.city}, {dest.location?.state}</span>
            <span><strong>Duration:</strong> {dest.duration?.days || 'N/A'} days</span>
            <span><strong>Max Group Size:</strong> {dest.maxGroupSize || 'N/A'}</span>
            <span><strong>Rating:</strong> {dest.rating?.average?.toFixed(1) || 'N/A'} ({dest.rating?.count || 0} reviews)</span>
          </div>
        </div>
  {/* Removed price from top for mobile UX */}
      </div>
  {/* ...existing code... */}
      {/* Overview */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Overview</h2>
        <p className="text-gray-700">{dest.description}</p>
      </div>
      {/* Highlights */}
      {dest.highlights && dest.highlights.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Highlights</h2>
          <ul className="list-disc pl-6 text-gray-700">
            {dest.highlights.map((h, i) => <li key={i}>{h}</li>)}
          </ul>
        </div>
      )}
      {/* Inclusions */}
      {dest.facilities && dest.facilities.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">What's Included</h2>
          <ul className="list-disc pl-6 text-gray-700">
            {dest.facilities.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
      )}
      {/* Itinerary */}
      {dest.itinerary && dest.itinerary.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Itinerary</h2>
          <ul className="list-decimal pl-6 text-gray-700">
            {dest.itinerary.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      )}
      {/* Reviews (placeholder) */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Reviews</h2>
        <div className="text-gray-500">Reviews coming soon.</div>
      </div>

      {/* Book Now and Back buttons at the end for mobile UX */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex flex-row gap-4 w-full justify-center items-end">
          <div className="flex flex-col items-center" style={{ width: '180px' }}>
            <button
              className="w-full h-12 px-5 py-3 rounded-lg font-semibold text-base shadow transition bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center"
              style={{ letterSpacing: 1, fontSize: '1.1rem', textAlign: 'center' }}
              onClick={() => navigate(-1)}
            >
              <span className="flex items-center justify-center w-full">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                <span>Back</span>
              </span>
            </button>
          </div>
          <div className="flex flex-col items-center" style={{ width: '180px' }}>
            <div className="text-2xl font-bold text-green-700 mb-2 ml-2">$ {dest.price?.toLocaleString() || 'N/A'} <span className="text-base font-normal text-gray-500">per person</span></div>
            <button
              className="w-full h-12 px-5 py-3 rounded-lg font-semibold text-base shadow transition bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-800 text-white flex items-center justify-center"
              style={{ letterSpacing: 1, fontSize: '1.1rem' }}
              onClick={() => setShowBooking(true)}
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
      {/* Reservation Modal */}
      <BookingForm 
        tour={dest} 
        isOpen={showBooking} 
        onClose={() => setShowBooking(false)} 
        onSubmit={() => setShowBooking(false)} 
      />
    </div>
  );
};

export default DestinationDetails;
