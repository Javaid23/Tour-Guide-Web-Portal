import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { tourAPI } from "../services/api.js"
import TourCard from "../components/TourCard.jsx"

/**
 * Tours Page Component with Enhanced Filtering
 * Shows all tours with comprehensive filters
 */
const Tours = () => {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedPriceRange, setSelectedPriceRange] = useState("all")
  const [selectedDuration, setSelectedDuration] = useState("all")
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const location = useLocation();
  // Scroll to top when navigated to this page
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [location]);

  // Filter options
  const categories = [
    { id: "all", name: "All Categories" },
    { id: "adventure", name: "Adventure" },
    { id: "cultural", name: "Cultural" },
    { id: "historical", name: "Historical" },
    { id: "religious", name: "Religious" },
  ]

  const locations = [
    { id: "all", name: "All Locations" },
    { id: "gilgit-baltistan", name: "Gilgit-Baltistan" },
    { id: "punjab", name: "Punjab" },
    { id: "sindh", name: "Sindh" },
    { id: "khyber pakhtunkhwa", name: "Khyber Pakhtunkhwa" },
    { id: "balochistan", name: "Balochistan" },
    { id: "azad kashmir", name: "Azad Kashmir" },
    { id: "islamabad", name: "Islamabad" },
  ]

  const priceRanges = [
    { id: "all", name: "All Prices" },
    { id: "budget", name: "Budget (Under $200)", min: 0, max: 200 },
    { id: "mid", name: "Mid-Range ($200-500)", min: 200, max: 500 },
    { id: "premium", name: "Premium ($500-1000)", min: 500, max: 1000 },
    { id: "luxury", name: "Luxury ($1000+)", min: 1000, max: 9999 },
  ]

  const durations = [
    { id: "all", name: "Any Duration" },
    { id: "short", name: "Short (1-3 days)", min: 1, max: 3 },
    { id: "medium", name: "Medium (4-7 days)", min: 4, max: 7 },
    { id: "long", name: "Long (8-14 days)", min: 8, max: 14 },
    { id: "extended", name: "Extended (15+ days)", min: 15, max: 999 },
  ]

  useEffect(() => {
  sessionStorage.clear();
  const fetchTours = async () => {
      try {
        setLoading(true)
        setError(null)
        const params = {}
        
        // Apply filters
        if (selectedCategory !== "all") params.category = selectedCategory
        if (selectedLocation !== "all") params.location = selectedLocation
        
        const response = await tourAPI.getAllTours(params)
        let toursData = []
        
        if (response?.data?.tours && Array.isArray(response.data.tours)) {
          toursData = response.data.tours
        } else if (Array.isArray(response.data)) {
          toursData = response.data
        } else {
          toursData = []
        }
        
        // Apply client-side filters for price and duration
        if (selectedPriceRange !== "all") {
          const priceRange = priceRanges.find(p => p.id === selectedPriceRange)
          if (priceRange) {
            toursData = toursData.filter(tour => 
              tour.price >= priceRange.min && tour.price <= priceRange.max
            )
          }
        }
        
        if (selectedDuration !== "all") {
          const durationRange = durations.find(d => d.id === selectedDuration)
          if (durationRange) {
            toursData = toursData.filter(tour => {
              const tourDays = tour.duration?.days || tour.duration || 1
              return tourDays >= durationRange.min && tourDays <= durationRange.max
            })
          }
        }
        
        toursData = Array.isArray(toursData) ? toursData : []
        toursData = toursData.filter(t => typeof t._id === 'string' && t._id.length > 0)
        
        setTours(toursData)
      } catch (err) {
        setError("Failed to fetch tours.")
        setTours([])
        console.error('Tours fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTours()
  }, [selectedCategory, selectedLocation, selectedPriceRange, selectedDuration])

  const resetAllFilters = () => {
    setSelectedCategory("all")
    setSelectedLocation("all")
    setSelectedPriceRange("all")
    setSelectedDuration("all")
  }

  if (loading) {
    return (
      <div className="section">
        <div className="container text-center">
          <div style={{ padding: "80px 0" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "4px solid #f3f3f3",
                borderTop: "4px solid var(--primary-blue)",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 20px",
              }}
            />
            <p style={{ fontSize: "18px", color: "#64748b" }}>Loading amazing tours...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="section">
        <div className="container text-center">
          <div style={{ padding: "80px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>❌</div>
            <h2 style={{ color: "#ef4444", marginBottom: "16px" }}>Error Loading Tours</h2>
            <p style={{ fontSize: "18px", color: "#64748b", marginBottom: "32px" }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
              style={{
                padding: "12px 24px",
                fontSize: "16px",
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-tours">
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.95) 0%, rgba(59, 130, 246, 0.9) 100%), url("https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg") center/cover',
        padding: '120px 0 80px',
        position: 'relative',
        overflow: 'hidden'
      }}>
    <div className="container tours-hero" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
            {/* Removed badge '🗺️ Explore Pakistan' from hero section */}
            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '800',
              color: 'white',
              marginBottom: '24px',
              lineHeight: '1.1',
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
            }}>Tour Packages</h1>
            <p style={{
              fontSize: '1.25rem',
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: '1.6',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
            }}>
              Discover carefully crafted tours across Pakistan's stunning landscapes and rich cultural heritage
            </p>
          </div>
        </div>
      </section>

      {/* Enhanced Filter Section */}
      <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-blue-100">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Find Your Perfect Tour</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Location</label>
                <select
                  value={selectedLocation}
                  onChange={e => setSelectedLocation(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Price Range</label>
                <select
                  value={selectedPriceRange}
                  onChange={e => setSelectedPriceRange(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                >
                  {priceRanges.map(price => (
                    <option key={price.id} value={price.id}>{price.name}</option>
                  ))}
                </select>
              </div>

              {/* Duration Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Duration</label>
                <select
                  value={selectedDuration}
                  onChange={e => setSelectedDuration(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                >
                  {durations.map(dur => (
                    <option key={dur.id} value={dur.id}>{dur.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters Display & Reset */}
            {(selectedCategory !== "all" || selectedLocation !== "all" || selectedPriceRange !== "all" || selectedDuration !== "all") && (
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex flex-wrap items-center justify-between">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-sm font-medium text-blue-700">Active Filters:</span>
                    {selectedCategory !== "all" && (
                      <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full">
                        {categories.find(c => c.id === selectedCategory)?.name}
                      </span>
                    )}
                    {selectedLocation !== "all" && (
                      <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full">
                        {locations.find(l => l.id === selectedLocation)?.name}
                      </span>
                    )}
                    {selectedPriceRange !== "all" && (
                      <span className="px-3 py-1 bg-purple-500 text-white text-xs rounded-full">
                        {priceRanges.find(p => p.id === selectedPriceRange)?.name}
                      </span>
                    )}
                    {selectedDuration !== "all" && (
                      <span className="px-3 py-1 bg-orange-500 text-white text-xs rounded-full">
                        {durations.find(d => d.id === selectedDuration)?.name}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={resetAllFilters}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors duration-200"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tours Grid with Modern Design */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-7xl">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
              <p className="text-xl text-gray-600">Discovering amazing tours...</p>
            </div>
          ) : error ? (
            <div className="max-w-2xl mx-auto text-center py-20">
              <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-2xl p-8">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-2xl font-bold text-red-700 mb-4">Connection Error</h3>
                <p className="text-red-600 mb-6">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="modern-btn modern-btn-primary"
                >
                  <span>🔄 Try Again</span>
                </button>
              </div>
            </div>
          ) : tours.length === 0 ? (
            <div className="max-w-2xl mx-auto text-center py-20">
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">No tours found</h3>
              <p className="text-xl text-gray-600 mb-8">
                {(selectedCategory !== "all" || selectedLocation !== "all" || selectedPriceRange !== "all" || selectedDuration !== "all")
                  ? "Try adjusting your filters to see more results"
                  : "No tours are currently available"}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {(selectedCategory !== "all" || selectedLocation !== "all" || selectedPriceRange !== "all" || selectedDuration !== "all") && (
                  <button 
                    onClick={resetAllFilters}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors duration-200 font-semibold"
                  >
                    🔄 Reset All Filters
                  </button>
                )}
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors duration-200 font-semibold"
                >
                  🔄 Refresh Page
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {(selectedCategory !== "all" || selectedLocation !== "all" || selectedPriceRange !== "all" || selectedDuration !== "all")
                    ? "Filtered Tour Results"
                    : "Discover Amazing Pakistan"}
                </h2>
                <p className="text-xl text-gray-600">
                  {tours.length === 0 ? "No tours found matching your filters" : `Found ${tours.length} amazing tour${tours.length !== 1 ? 's' : ''} for you`}
                </p>
                
                {/* Quick filter summary */}
                {(selectedCategory !== "all" || selectedLocation !== "all" || selectedPriceRange !== "all" || selectedDuration !== "all") && (
                  <div className="mt-4 text-gray-500">
                    <p className="text-sm">
                      {selectedCategory !== "all" && `Category: ${categories.find(c => c.id === selectedCategory)?.name} • `}
                      {selectedLocation !== "all" && `Location: ${locations.find(l => l.id === selectedLocation)?.name} • `}
                      {selectedPriceRange !== "all" && `Price: ${priceRanges.find(p => p.id === selectedPriceRange)?.name} • `}
                      {selectedDuration !== "all" && `Duration: ${durations.find(d => d.id === selectedDuration)?.name}`}
                    </p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tours.map((tour, index) => (
                  <TourCard key={tour._id || index} tour={tour} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default Tours
