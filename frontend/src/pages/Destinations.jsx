import { useState, useEffect, useMemo, useCallback } from "react"
import { MapPin, Star, Clock, Users, Search } from "lucide-react"
import { destinationsAPI } from "../services/api.js"
import { renderOptimizer } from "../utils/performance.js"
import AutocompleteSearch from "../components/AutocompleteSearch.jsx"
import { Link, useLocation } from "react-router-dom"

/**
 * Destinations Page Component
 * Showcases popular tourist destinations from all provinces of Pakistan
 */
const Destinations = () => {
  // Scroll to top immediately on mount/location change unless coming from details
  useEffect(() => {
    if (!location.state?.fromDestinations) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [location.key, location.state]);
  const [selectedProvince, setSelectedProvince] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Only one declaration of location

  // Pakistani provinces and regions
  const provinces = [
    { id: "all", name: "All Pakistan" },
    { id: "gilgit-baltistan", name: "Gilgit-Baltistan" },
    { id: "khyber pakhtunkhwa", name: "Khyber Pakhtunkhwa" },
    { id: "punjab", name: "Punjab" },
    { id: "sindh", name: "Sindh" },
    { id: "balochistan", name: "Balochistan" },
    { id: "azad kashmir", name: "Azad Kashmir" },
    { id: "islamabad", name: "Islamabad" }, // changed from 'federal capital'
  ]

  // Fetch destinations from API with debounced search
  const debouncedFetchDestinations = useCallback(
    renderOptimizer.debounce(async (params) => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await destinationsAPI.getAllDestinations(params)
        // Handle various response shapes
        let destinations = [];
        if (response?.data?.destinations) {
          destinations = response.data.destinations;
        } else if (response?.data?.data?.destinations) {
          destinations = response.data.data.destinations;
        } else if (Array.isArray(response?.data?.data)) {
          destinations = response.data.data;
        } else if (Array.isArray(response?.data)) {
          destinations = response.data;
        } else if (Array.isArray(response)) {
          destinations = response;
        } else {
          destinations = [];
        }
        setDestinations(destinations)
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "Failed to fetch destinations"
        setError(errorMessage)
        if (process.env.NODE_ENV === 'development') {
          console.error("Error fetching destinations:", err)
        }
        setDestinations([])
      } finally {
        setLoading(false)
      }
    }, 300),
    []
  )

  // Province mapping
  const mapProvinceToBackend = useCallback((frontendProvince) => {
    const provinceMap = {
      'punjab': 'Punjab',
      'sindh': 'Sindh',
      'balochistan': 'Balochistan',
      'gilgit-baltistan': 'Gilgit-Baltistan',
      'khyber pakhtunkhwa': 'Khyber Pakhtunkhwa',
      'azad kashmir': 'Azad Kashmir',
      'islamabad': 'Islamabad', // changed from 'Islamabad Capital Territory'
    }
    return provinceMap[frontendProvince] || frontendProvince
  }, [])

  useEffect(() => {
    const params = {}
    if (selectedProvince !== "all") {
      params.state = mapProvinceToBackend(selectedProvince)  // Backend expects 'state' parameter
    }
    if (searchTerm) {
      params.search = searchTerm
    }
    params.limit = 1000 // Always fetch all destinations
    debouncedFetchDestinations(params)
  }, [selectedProvince, searchTerm, debouncedFetchDestinations, mapProvinceToBackend])

  // Restore scroll position after destinations are loaded, or scroll to top if coming from other pages
  const [restoringScroll, setRestoringScroll] = useState(false);
  useEffect(() => {
    if (!loading) {
      const savedScroll = sessionStorage.getItem("destinationsScroll");
      const savedDestId = sessionStorage.getItem("destinationsScrollId");
      if (savedDestId || savedScroll) {
        setRestoringScroll(true);
        setTimeout(() => {
          if (savedDestId) {
            const el = document.getElementById("dest-card-" + savedDestId);
            if (el) {
              el.scrollIntoView({ behavior: "auto", block: "start" });
            }
          } else if (savedScroll) {
            window.scrollTo({ top: parseInt(savedScroll, 10), left: 0, behavior: "auto" });
          }
          sessionStorage.removeItem("destinationsScroll");
          sessionStorage.removeItem("destinationsScrollId");
          setRestoringScroll(false);
        }, 0);
      } else if (!location.state?.fromDestinations) {
        // Navigated from other pages, scroll to top instantly
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
    }
  }, [loading, location.state]);

  // Memoized utility functions for performance
  const getDifficultyColor = useCallback((difficulty) => {
    const normalizedDifficulty = difficulty?.toLowerCase()
    switch (normalizedDifficulty) {
      case "easy":
        return "#10b981"
      case "moderate":
        return "#f59e0b"
      case "difficult":
      case "challenging":
        return "#ef4444"
      default:
        return "#6b7280"
    }
  }, [])

  const getTypeColor = useCallback((category) => {
    switch (category) {
      case "adventure":
        return "#dc2626"
      case "cultural":
        return "#7c3aed"
      case "historical":
        return "#059669"
      case "nature":
        return "#10b981"
      case "religious":
        return "#d97706"
      default:
        return "#374151"
    }
  }, [])

  // Simplified memoized filtered destinations since backend now handles province filtering
  const filteredDestinations = useMemo(() => {
    // Since province filtering is now handled by the backend,
    // we just return the destinations as-is
    // Additional frontend filtering can be added here if needed for specific UI requirements
    
    let filtered = destinations;
    
    return filtered;
  }, [destinations, selectedProvince])

  // Remove duplicates by name before rendering
  const uniqueDestinations = useMemo(() => {
    const seen = new Set();
    return filteredDestinations.filter(dest => {
      if (!dest.name) return true;
      const name = dest.name.trim().toLowerCase();
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });
  }, [filteredDestinations])

  if (restoringScroll) return null;
  return (
    <div style={{ position: 'relative' }}>
      {/* Hero Section with Modern Design */}
      <section
        className="destinations-hero relative min-h-screen flex items-center justify-center overflow-hidden pt-24 md:pt-32"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.95) 0%, rgba(59, 130, 246, 0.9) 100%), url("https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg") center/cover',
          padding: '120px 0 80px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          {/* Removed hero-badge 'Discover Amazing Destinations' */}
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight">
            Explore Pakistan's
            <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              Hidden Gems
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
            From the towering peaks of the Karakoram to ancient civilizations, from Punjab's cultural richness to Balochistan's coastal beauty - explore incredible diversity.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button className="modern-btn modern-btn-primary group">
              <span>Start Exploring</span>
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <button className="modern-btn modern-btn-secondary" onClick={() => {
              const el = document.getElementById('destinations-grid');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}>
              <span>View Destinations</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="glass-card p-6 text-center rounded-full">
              <MapPin className="w-8 h-8 mb-4 mx-auto text-blue-400" />
              <h3 className="text-xl font-bold mb-2">150+ Destinations</h3>
              <p className="text-blue-200">Across all provinces</p>
            </div>
            <div className="glass-card p-6 text-center rounded-full">
              <Star className="w-8 h-8 mb-4 mx-auto text-blue-400" />
              <h3 className="text-xl font-bold mb-2">4.9/5 Rating</h3>
              <p className="text-blue-200">From 1000+ travelers</p>
            </div>
            <div className="glass-card p-6 text-center rounded-full">
              <Users className="w-8 h-8 mb-4 mx-auto text-blue-400" />
              <h3 className="text-xl font-bold mb-2">Expert Guides</h3>
              <p className="text-blue-200">Local professionals</p>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Search and Filters with Modern Design */}
      <section className="pt-20 pb-12 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Find Your Perfect Adventure
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Use our province filter to discover destinations that match your interests and travel style
            </p>
          </div>

          {/* Enhanced Compact Search Bar */}
          <div className="mb-12 relative">
            <div className="max-w-3xl mx-auto relative group">
              <AutocompleteSearch
                value={searchTerm}
                onChange={(value) => {
                  console.log("Search term changed:", value)
                  setSearchTerm(value)
                }}
                placeholder=" Search destinations in Pakistan..."
                className="relative z-10"
                onSuggestionSelect={(suggestion) => {
                  console.log("Selected suggestion:", suggestion)
                  setSearchTerm(suggestion.value || suggestion.label)
                  // Add a subtle success feedback
                  const event = new CustomEvent('searchSelected', { detail: suggestion })
                  window.dispatchEvent(event)
                }}
              />
              
              {/* Popular searches hint */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500 mb-2">Popular searches:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Badshahi Mosque', 'Northern Mountains', 'Karachi Sea View', 'Punjab', 'Skardu'].map((term, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSearchTerm(term)}
                      className="px-3 py-1 bg-white/80 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 
                               rounded-full text-xs text-gray-600 hover:text-blue-600 transition-all duration-200
                               hover:scale-105 hover:shadow-md"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Province Filter with Modern Cards */}
          <div className="mb-2">
            <h3 className="text-2xl font-bold text-center mb-4 text-gray-800">
              Explore by Province & Region
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {provinces.map((province) => (
                <button
                  key={province.id}
                  onClick={() => setSelectedProvince(province.id)}
                  className={`modern-filter-btn ${
                    selectedProvince === province.id ? 'active' : ''
                  }`}
                >
                  {province.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Grid with Modern Design */}
      <section id="destinations-grid" className="pt-8 pb-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
              <p className="text-xl text-gray-600">Discovering amazing destinations...</p>
            </div>
          ) : error ? (
            <div className="max-w-2xl mx-auto text-center py-20">
              <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-2xl p-8">
                <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4 mx-auto">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.96-.833-2.73 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-red-700 mb-4">Connection Error</h3>
                <p className="text-red-600 mb-6">{error}</p>
                <div className="bg-white rounded-lg p-6 mb-6 text-left">
                  <p className="font-semibold mb-3 text-gray-800">Troubleshooting Steps:</p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600">
                    <li>Make sure backend server is running on port 5000</li>
                    <li>Check if MongoDB is connected</li>
                    <li>Verify API endpoint: <a href={`${import.meta.env.VITE_API_URL}/health`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{`${import.meta.env.VITE_API_URL}/health`}</a></li>
                  </ol>
                </div>
                <button 
                  onClick={() => {
                    const params = {};
                    if (selectedProvince !== "all") params.location = selectedProvince;
                    if (searchTerm) params.search = searchTerm;
                    debouncedFetchDestinations(params);
                  }}
                  className="modern-btn modern-btn-primary"
                >
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          ) : destinations.length === 0 ? (
            <div className="max-w-2xl mx-auto text-center py-20">
              <div className="flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6 mx-auto">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">No destinations found</h3>
              <p className="text-xl text-gray-600 mb-8">Try adjusting your filters or search terms</p>
              
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-8">
                <p className="font-semibold mb-4 text-gray-800">Debug Information:</p>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>Raw destinations: {destinations.length}</div>
                  <div>After filtering: {filteredDestinations.length}</div>
                  <div>Province: {selectedProvince}</div>
                  <div className="col-span-2">Search: "{searchTerm}"</div>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  setSelectedProvince("all");
                  setSearchTerm("");
                }}
                className="modern-btn modern-btn-secondary"
              >
                <span>🔄 Reset All Filters</span>
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-4">
                <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {selectedProvince !== "all"
                    ? `Destinations in ${provinces.find((p) => p.id === selectedProvince)?.name}`
                    : "Discover Amazing Pakistan"}
                </h2>
                <p className="text-xl text-gray-600">
                  Found {uniqueDestinations.length} unique destinations waiting for you
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {uniqueDestinations.map((destination, index) => {
                  // Robust destination image selection logic:
                  // 1. If images is an array, use first string or .url
                  let destImg = null;
                  if (Array.isArray(destination.images) && destination.images.length > 0) {
                    const firstImg = destination.images[0];
                    if (typeof firstImg === 'string') destImg = firstImg;
                    else if (firstImg && typeof firstImg === 'object' && firstImg.url) destImg = firstImg.url;
                  } else if (destination.mainImage) {
                    if (typeof destination.mainImage === 'string') destImg = destination.mainImage;
                    else if (typeof destination.mainImage === 'object' && destination.mainImage.url) destImg = destination.mainImage.url;
                  } else if (destination.image) {
                    destImg = destination.image;
                  }
                  return (
                  <div key={destination._id || index} className="modern-card group" id={destination._id ? `dest-card-${destination._id}` : undefined}>
                    {/* Destination Image */}
                    <div className="relative overflow-hidden rounded-t-2xl">
                      {destImg ? (
                        <img
                          src={destImg}
                          alt={destination.name || destination.title || 'Destination'}
                          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      {/* Rating Badge */}
                      <div className="absolute top-4 right-4 glass-card px-3 py-2 text-white">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold">
                            {destination.rating?.average ? destination.rating.average.toFixed(1) : "New"}
                          </span>
                        </div>
                      </div>
                      {/* Province Badge */}
                      <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-medium">
                        {(() => {
                          if (destination.destinations && destination.destinations[0] && destination.destinations[0].location) {
                            const loc = destination.destinations[0].location;
                            return typeof loc === 'object' ? (loc.city || loc.state || loc.address || 'Pakistan') : loc;
                          } else if (destination.location) {
                            const loc = destination.location;
                            return typeof loc === 'object' ? (loc.city || loc.state || loc.address || 'Pakistan') : loc;
                          } else if (destination.province) {
                            return destination.province;
                          } else {
                            return 'Pakistan';
                          }
                        })()}
                      </div>
                      {/* Category Badge */}
                      <div className="absolute bottom-4 left-4">
                        <span 
                          className="inline-block px-3 py-1 rounded-full text-white text-sm font-medium"
                          style={{ backgroundColor: getTypeColor(destination.category) }}
                        >
                          {destination.category || 'General'}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {destination.name || destination.title || 'Untitled Tour'}
                        </h3>
                      </div>

                      <div className="flex items-center text-gray-500 text-sm mb-3">
                        <MapPin className="w-4 h-4 mr-1" />
                        {(() => {
                          if (destination.destinations && destination.destinations[0] && destination.destinations[0].location) {
                            const loc = destination.destinations[0].location;
                            return typeof loc === 'object' ? (loc.city || loc.state || loc.address || 'Pakistan') : loc;
                          } else if (destination.location) {
                            const loc = destination.location;
                            return typeof loc === 'object' ? (loc.city || loc.state || loc.address || 'Pakistan') : loc;
                          } else if (destination.province) {
                            return destination.province;
                          } else {
                            return 'Pakistan';
                          }
                        })()}
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {destination.description ? destination.description.substring(0, 120) + '...' : 'No description available.'}
                      </p>

                      {/* Trip Details */}
                      <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {destination.duration?.days ? `${destination.duration.days} days` : 'TBD'}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          Max {destination.maxGroupSize || 'N/A'}
                        </div>
                      </div>

                      {/* Highlights */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {destination.highlights && destination.highlights.slice(0, 2).map((highlight, index) => (
                            <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium">
                              {typeof highlight === 'object' ? JSON.stringify(highlight) : highlight}
                            </span>
                          ))}
                          {destination.highlights && destination.highlights.length > 2 && (
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs font-medium">
                              +{destination.highlights.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price and Action */}
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <div>
                          <span className="text-2xl font-bold text-blue-600">
                            ${typeof destination.price === 'object' && destination.price?.amount 
                              ? destination.price.amount 
                              : destination.price || 'TBD'}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">per person</span>
                        </div>
                        <Link
                          to={`/destinations/${destination._id}`}
                          state={{ fromDestinations: true }}
                          className="modern-btn-sm modern-btn-primary"
                          onClick={() => {
                            sessionStorage.setItem("destinationsScroll", window.scrollY);
                            if (destination._id) sessionStorage.setItem("destinationsScrollId", destination._id);
                          }}
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Pakistan Provinces Info with Modern Design */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
              Explore Pakistan by Region
            </h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Each province offers unique experiences and cultural treasures waiting to be discovered
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Removed the first card (🏔️ Northern Areas) as requested */}
            {/*
            <div className="glass-card p-8 text-center group hover:scale-105 transition-all duration-300">
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300" style={{ width: 96, height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', borderRadius: '50%' }}>🏔️</div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Northern Areas
              </h3>
              <p className="text-blue-200 leading-relaxed">
                Gilgit-Baltistan and KPK offer world-class mountain adventures, including K2, Hunza Valley, and Swat's pristine beauty.
              </p>
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex justify-center space-x-4 text-sm">
                  <span className="bg-green-500/20 px-3 py-1 rounded-full" style={{ minWidth: 80, minHeight: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>K2 Base Camp</span>
                  <span className="bg-blue-500/20 px-3 py-1 rounded-full" style={{ minWidth: 80, minHeight: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>Hunza Valley</span>
                </div>
              </div>
            </div>
            */}
            <div className="glass-card p-8 text-center group hover:scale-105 transition-all duration-300 rounded-2xl bg-blue-600 text-white">
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300 bg-white/20 rounded-2xl" style={{ width: 96, height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>🏛️</div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Cultural Heritage
              </h3>
              <p className="text-blue-100 leading-relaxed">
                Punjab and Sindh showcase Pakistan's rich history with Mughal architecture, ancient civilizations, and vibrant cities.
              </p>
              {/* Removed bottom border and extra gap */}
            </div>

            <div className="glass-card p-8 text-center group hover:scale-105 transition-all duration-300 rounded-2xl bg-blue-600 text-white">
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300 bg-white/20 rounded-2xl" style={{ width: 96, height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>🏖️</div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Coastal & Desert
              </h3>
              <p className="text-blue-100 leading-relaxed">
                Balochistan offers unique landscapes from Arabian Sea coastlines to dramatic desert formations and diverse wildlife.
              </p>
              {/* Removed bottom border and extra gap */}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action with Modern Design */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Ready to Explore Pakistan?
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              From the peaks of the Himalayas to the shores of the Arabian Sea, Pakistan offers incredible diversity. 
              Let our experts help you plan your perfect adventure.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="modern-btn modern-btn-white group">
              <span>Contact Our Travel Experts</span>
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
            <button className="modern-btn modern-btn-primary" onClick={() => window.location.href = '/tours'}>
              <span>View Popular Tours</span>
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Destinations

