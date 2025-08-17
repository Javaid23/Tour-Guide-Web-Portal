"use client"

// - Hero image gallery
// - Title, rating, location, quick facts
// - Price & sticky booking widget
// - Tabs/accordions for Overview, Itinerary, Inclusions/Exclusions, Meeting Point, Cancellation Policy, Reviews, FAQs
// - Responsive, modern layout with Tailwind and glass/gradient effects

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Star, Clock, MapPin, Calendar, Check, X, Heart, Share2, Users } from "lucide-react"
import WeatherWidget from "../components/WeatherWidget.jsx"
import ReviewsSection from "../components/ReviewsSection.jsx"
import BookingForm from "../components/BookingForm.jsx"
import ErrorBoundary from "../components/ErrorBoundary.jsx"
import { tourAPI } from "../services/api.js"

const TourDetails = () => {
  const navigate = useNavigate();
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  const { id } = useParams()
  const [tour, setTour] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showBookingForm, setShowBookingForm] = useState(false)

  console.log("🔧 TourDetails component starting...")
  console.log("🆔 Tour ID from params:", id)
  console.log("🆔 useParams() result:", useParams())

  useEffect(() => {
  console.log("🔄 useEffect triggered with ID:", id)
  sessionStorage.clear();
  fetchTourDetails()
    // eslint-disable-next-line
  }, [id])

  const fetchTourDetails = async () => {
    try {
      console.log("🔍 Fetching tour details for ID:", id)
      console.log("🔍 ID type:", typeof id, "ID value:", id)
      console.log("🔍 API base URL:", import.meta.env.VITE_API_URL || "http://localhost:5000/api")
      
      setLoading(true)
      setError(null)
      
      // Validate the tour ID
      if (!id || id === 'undefined' || id === 'null') {
        throw new Error("Invalid tour ID")
      }
      
      // Test if API is reachable
      console.log("🧪 Testing API connectivity...")
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const testResponse = await fetch(`${apiUrl}/tours?limit=1`)
        console.log("🧪 API test response status:", testResponse.status)
        if (!testResponse.ok) {
          throw new Error(`API not reachable: ${testResponse.status}`)
        }
      } catch (apiError) {
        console.error("🚨 API connectivity test failed:", apiError)
        throw new Error("Backend server is not responding")
      }
      
      console.log("📡 Calling tourAPI.getTour...")
      const data = await tourAPI.getTour(id)
      console.log("✅ Raw API response:", data)
      
      if (!data) {
        throw new Error("No response from server")
      }
      
      if (!data.success) {
        throw new Error(data.message || "Server returned error")
      }
      
      if (!data.data) {
        throw new Error("No tour data in response")
      }
      
      console.log("✅ Setting tour data:", data.data)
      setTour(data.data)
      setLoading(false)
    } catch (error) {
      console.error("❌ Error fetching tour details:", error)
      console.error("❌ Error stack:", error.stack)
      setError(error.message || "Failed to load tour details")
      setLoading(false)
    }
  }

  // Use image path directly (no backend URL prefix)
  const getImageSrc = (img) => {
    if (!img) return null;
    if (typeof img === 'string') return img;
    if (typeof img === 'object' && img.url) return img.url;
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <span className="ml-4 text-blue-700 font-semibold text-lg">Loading tour details...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-700 mb-4">Error Loading Tour</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Tour Not Found</h2>
          <p className="text-gray-600 mb-6">The tour you're looking for doesn't exist.</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const {
    title,
    description,
    category,
    duration,
    price,
    originalPrice,
    maxGroupSize,
    difficulty,
    rating,
    location,
    images = [],
    highlights = [],
    itinerary = [],
    bestTimeToVisit,
    whatToBring = [],
    cancellationPolicy,
    groupDiscounts,
    meetingPoint,
    // Support both MongoDB and JSON fallback formats
    inclusions = tour.inclusions || tour.included || [],
    exclusions = tour.exclusions || [],
  } = tour

  console.log("🎨 About to render TourDetails JSX")
  console.log("🎨 Tour data for rendering:", { title, images: images?.length, price, location })

  try {
    return (
      <ErrorBoundary showDetails={true}>
        <div className="bg-gradient-to-br from-blue-50 to-white min-h-screen">
          <div className="max-w-6xl mx-auto px-4 pt-6">
            {/* Back Button for mobile navigation */}
            <button
              className="mb-4 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold flex items-center"
              onClick={() => navigate(-1)}
              style={{ display: 'inline-flex', alignItems: 'center' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Back
            </button>
          </div>
      {/* Booking Form */}
      <BookingForm tour={tour} isOpen={showBookingForm} onClose={() => setShowBookingForm(false)} onSubmit={() => setShowBookingForm(false)} />
      {/* Hero Gallery */}
      <div className="relative w-full max-w-6xl mx-auto pt-8">
        <div className="rounded-3xl overflow-hidden shadow-2xl relative h-[350px] md:h-[500px] bg-gray-200">
          {images.length > 0 && (
            <img
              src={getImageSrc(images[selectedImage])}
              alt={title}
              className="w-full h-full object-cover transition-all duration-500"
            />
          )}
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-white/60 rounded-full px-4 py-2 shadow-lg">
              {images.slice(0, 6).map((img, i) => (
                <img
                  key={i}
                  src={getImageSrc(img)}
                  alt={title}
                  className={`w-14 h-14 object-cover rounded-xl border-2 cursor-pointer transition-all duration-200 ${selectedImage === i ? 'border-blue-600' : 'border-white hover:border-blue-400'}`}
                  onClick={() => setSelectedImage(i)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left/Main */}
        <div className="lg:col-span-2">
          {/* Title & Quick Facts */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-blue-900">{title}</h1>
              <div className="flex flex-wrap gap-4 text-gray-600 text-base items-center">
                <span className="flex items-center"><MapPin size={18} className="mr-1" /> {location?.city}, {location?.province}</span>
                <span className="flex items-center"><Calendar size={18} className="mr-1" /> {duration?.days || 'N/A'} days</span>
                <span className="flex items-center"><Users size={18} className="mr-1" /> {maxGroupSize || 'N/A'} people</span>
                <span className="flex items-center"><Star size={18} className="mr-1 text-yellow-400" /> {rating?.average?.toFixed(1) || 'New'} ({rating?.count || 0} reviews)</span>
                <span className="flex items-center"><Clock size={18} className="mr-1" /> {difficulty || 'All Levels'}</span>
              </div>
            </div>
            {/* Remove price from main section, keep only in sidebar */}
            {/* <div className="text-3xl font-bold text-green-700 mb-2">$ {price?.toLocaleString() || 'N/A'} <span className="text-base font-normal text-gray-500">per person</span></div> */}
            {/* {originalPrice && <div className="text-lg text-gray-500 line-through">$ {originalPrice.toLocaleString()}</div>} */}
          </div>

          {/* Tabs/Accordions */}
          <div className="mb-8">
            <div className="flex gap-4 border-b border-blue-100 mb-4">
              {/* You can implement tab state if you want, or use accordions for mobile */}
              <button className="tab-btn">Overview</button>
              <button className="tab-btn">Itinerary</button>
              <button className="tab-btn">Inclusions</button>
              <button className="tab-btn">Exclusions</button>
              <button className="tab-btn">Meeting Point</button>
              <button className="tab-btn">FAQs</button>
              <button className="tab-btn">Reviews</button>
            </div>
            {/* Overview */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Overview</h2>
              <p className="text-gray-700 text-lg leading-relaxed">{description}</p>
              {highlights && highlights.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-xl font-semibold mb-2">Highlights</h3>
                  <ul className="list-disc pl-6 text-gray-700 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {highlights.map((h, i) => <li key={i}>{h}</li>)}
                  </ul>
                </div>
              )}
            </div>
            {/* Itinerary */}
            {itinerary && itinerary.length > 0 && (
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">Itinerary</h2>
                <ul className="list-decimal pl-6 text-gray-700 space-y-2">
                  {itinerary.map((item, i) => (
                    <li key={i}>
                      <span className="font-semibold">{item.day ? `Day ${item.day}: ` : ''}</span>{item.title && <span className="font-semibold">{item.title} - </span>}{item.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Inclusions/Exclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">What's Included</h3>
                <ul className="list-disc pl-6 text-gray-700">
                  {inclusions.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">What's Not Included</h3>
                <ul className="list-disc pl-6 text-gray-700">
                  {exclusions.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            </div>
            {/* Meeting Point */}
            {meetingPoint && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Meeting Point</h3>
                <p className="text-gray-700">{meetingPoint}</p>
              </div>
            )}
            {/* Cancellation Policy */}
            {cancellationPolicy && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Cancellation Policy</h3>
                <p className="text-gray-700 text-sm">{cancellationPolicy}</p>
              </div>
            )}
            {/* What to Bring */}
            {whatToBring && whatToBring.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">What to Bring</h3>
                <ul className="list-disc pl-6 text-gray-700">
                  {whatToBring.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            )}
            {/* Group Discounts */}
            {groupDiscounts && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Group Discounts</h3>
                <p className="text-gray-700">{groupDiscounts}</p>
              </div>
            )}
          </div>

          {/* Reviews Section */}
          <div className="mb-8">
            <ReviewsSection tourId={tour._id} />
          </div>
        </div>

        {/* Right/Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl mb-6 border-t-4 border-blue-500">
              <div className="flex justify-between items-baseline mb-4">
                <div>
                  <span className="text-3xl font-bold text-blue-900">$ {price?.toLocaleString() || 'N/A'}</span>
                  <span className="text-gray-600"> / person</span>
                </div>
                {originalPrice && (
                  <span className="text-lg text-gray-500 line-through">$ {originalPrice.toLocaleString()}</span>
                )}
              </div>
              <button
                onClick={() => setShowBookingForm(!showBookingForm)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition duration-300 text-lg shadow"
              >
                {showBookingForm ? "Hide Booking Form" : "Book Now"}
              </button>
              <div className="flex justify-center mt-4 space-x-4">
                <button className="flex items-center text-gray-600 hover:text-blue-600">
                  <Heart size={20} className="mr-2" />
                  Save
                </button>
                <button className="flex items-center text-gray-600 hover:text-blue-600">
                  <Share2 size={20} className="mr-2" />
                  Share
                </button>
              </div>
            </div>
            {/* Weather Widget */}
            <WeatherWidget city={location?.city} />
            {/* Additional Info */}
            <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-xl mt-6">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">Good to Know</h3>
              <div className="space-y-4">
                {bestTimeToVisit && (
                  <div>
                    <h4 className="font-semibold text-gray-700">Best Time to Visit</h4>
                    <p className="text-gray-600">{bestTimeToVisit}</p>
                  </div>
                )}
                {cancellationPolicy && (
                  <div>
                    <h4 className="font-semibold text-gray-700">Cancellation Policy</h4>
                    <p className="text-gray-600 text-sm">{cancellationPolicy}</p>
                  </div>
                )}
                {groupDiscounts && (
                  <div>
                    <h4 className="font-semibold text-gray-700">Group Discounts</h4>
                    <p className="text-gray-600">{groupDiscounts}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  ) } catch (renderError) {
    console.error("🚨 TourDetails render error:", renderError)
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🚨</div>
          <h2 className="text-2xl font-bold text-red-700 mb-4">Render Error</h2>
          <p className="text-red-600 mb-6">Failed to render tour details: {renderError.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }
}

export default TourDetails
