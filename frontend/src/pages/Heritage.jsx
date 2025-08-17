"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { MapPin, Star, Clock, Users, Search, Calendar, Award, Book, Camera, Shield, ChevronDown, Eye, Map, Filter, SortAsc } from "lucide-react"
import { tourAPI } from "../services/api.js" // Import the destination API service
import { Link } from "react-router-dom"
import HeritageMap from "../components/HeritageMap" // Import the new HeritageMap component
import HeritageTimeline from "../components/HeritageTimeline" // Import the HeritageTimeline component
import HeritageFacts from "../components/HeritageFacts" // Import the HeritageFacts component
import HeritageGallery from "../components/HeritageGallery" // Import the HeritageGallery component

/**
 * Enhanced Heritage Page Component - Optimized for Performance
 * Showcases UNESCO World Heritage sites, historical monuments, and cultural heritage of Pakistan
 * with improved interactivity, filtering, and rich historical context
 */
import { useLocation } from "react-router-dom"
const Heritage = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [location]);
  const [searchTerm, setSearchTerm] = useState("")
  const [heritageSites, setHeritageSites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState("name")
  const [viewMode, setViewMode] = useState("grid") // grid or list
  const [expandedCards, setExpandedCards] = useState(new Set())

  // Memoized static data for better performance
  const categories = useMemo(() => [
    { id: "all", name: "All Heritage", icon: "🏛️", description: "Complete collection of heritage sites" },
    { id: "unesco", name: "UNESCO Sites", icon: "🏆", description: "World Heritage recognized by UNESCO" },
    { id: "ancient", name: "Ancient Sites", icon: "🏺", description: "Pre-Islamic archaeological sites" },
    { id: "mughal", name: "Mughal Heritage", icon: "🕌", description: "Mughal era architecture and monuments" },
    { id: "religious", name: "Religious Sites", icon: "🙏", description: "Sacred places of all faiths" },
    { id: "forts", name: "Forts & Palaces", icon: "🏰", description: "Military architecture and royal residences" },
    { id: "colonial", name: "Colonial Era", icon: "🏢", description: "British colonial period architecture" },
    { id: "modern", name: "Modern Heritage", icon: "🏗️", description: "Post-independence monuments" },
  ], [])

  const eras = useMemo(() => [
    { id: "all", name: "All Periods", period: "All Time", description: "Complete timeline of Pakistani heritage" },
    { id: "indus", name: "Indus Valley", period: "3300-1300 BC", description: "World's earliest urban civilization" },
    { id: "gandhara", name: "Gandhara", period: "1st-5th Century AD", description: "Buddhist art and culture center" },
    { id: "islamic", name: "Early Islamic", period: "7th-15th Century", description: "Islamic conquest and early sultanates" },
    { id: "mughal", name: "Mughal Empire", period: "1526-1857 AD", description: "Peak of Islamic architecture in subcontinent" },
    { id: "sikh", name: "Sikh Period", period: "1799-1849 AD", description: "Sikh empire and architecture" },
    { id: "colonial", name: "British Era", period: "1858-1947 AD", description: "Colonial rule and Victorian architecture" },
    { id: "modern", name: "Pakistan Era", period: "1947-Present", description: "Independence and modern monuments" },
  ], [])

  // Fetch heritage sites from API with enhanced filtering and caching
  const fetchHeritageSites = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = {
        category: "Heritage",
        limit: 100,
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim()
      }
      const response = await tourAPI.getAllTours(params)
      if (response.success && response.data) {
        setHeritageSites(response.data.tours || [])
      } else {
        setError(response.message || "Failed to fetch heritage sites.")
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching data.")
      console.error("Error fetching heritage sites:", err)
    } finally {
      setLoading(false)
    }
  }, [searchTerm])

  useEffect(() => {
  sessionStorage.clear();
  fetchHeritageSites()
  }, [fetchHeritageSites])

  // Memoized filtered and sorted sites for performance
  const sortedSites = useMemo(() => {
    return [...heritageSites].sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name)
      } else if (sortBy === "rating") {
        return (b.rating?.average || 0) - (a.rating?.average || 0)
      } else if (sortBy === "price") {
        return (a.price || 0) - (b.price || 0)
      }
      return 0
    })
  }, [heritageSites, sortBy])

  const toggleCardExpansion = useCallback((id) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading Heritage Sites...</p>
        </div>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-red-50">
        <div className="text-center text-red-700">
          <h2 className="text-2xl font-bold mb-2">Failed to Load Data</h2>
          <p>{error}</p>
          <button 
            onClick={fetchHeritageSites} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="heritage-page">
      {/* Hero Section */}
      <section
    className="heritage-hero relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-24 md:pt-32"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.95) 0%, rgba(59, 130, 246, 0.9) 100%), url("https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg") center/cover',
          padding: '120px 0 80px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight">
            Pakistan’s UNESCO World Heritage Sites
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed" style={{ marginTop: '40px' }}>
            Explore the history, beauty, and global significance of Pakistan’s protected heritage.
          </p>
        </div>
      </section>

      {/* UNESCO Sites Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-blue-900">UNESCO World Heritage Sites of Pakistan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Site Cards */}
            {[
              {
                name: 'Takht-i-Bahi & Sehr-i-Bahlol',
                slug: 'takht-i-bahi',
                location: 'Khyber Pakhtunkhwa',
                year: 1980,
                image: '/images/heritage/takht-i-bahi.jpeg',
                description: 'A Buddhist monastic complex dating to the 1st century CE, renowned for its state of preservation and historical significance.',
                blogUrl: 'https://en.wikipedia.org/wiki/Takht-i-Bahi',
              },
              {
                name: 'Taxila Buddhist Ruins of Gandhara',
                slug: 'taxila',
                location: 'Punjab',
                year: 1980,
                image: '/images/heritage/taxila.jpeg',
                description: 'Ancient city and center of Buddhist learning, with ruins spanning several centuries and dynasties.',
                blogUrl: 'https://en.wikipedia.org/wiki/Taxila',
              },
              {
                name: 'Rohtas Fort',
                slug: 'rohtas-fort',
                location: 'Punjab',
                year: 1997,
                image: '/images/heritage/rohtas-fort.jpeg',
                description: 'A formidable 16th-century fortress built by Sher Shah Suri, representing military architecture of the Muslim world.',
                blogUrl: 'https://en.wikipedia.org/wiki/Rohtas_Fort',
              },
              {
                name: 'Shalimar Gardens',
                slug: 'shalimar-gardens',
                location: 'Lahore, Punjab',
                year: 1981,
                image: '/images/heritage/shalimar-gardens.jpeg',
                description: 'A masterpiece of Mughal garden design, built by Emperor Shah Jahan in 1641.',
                blogUrl: 'https://en.wikipedia.org/wiki/Shalimar_Gardens,_Lahore',
              },
              {
                name: 'Thatta Necropolis (Makli)',
                slug: 'thatta-makli',
                location: 'Sindh',
                year: 1981,
                image: '/images/heritage/thatta-makli.jpeg',
                description: 'One of the largest necropolises in the world, with elaborate tombs and monuments from the 14th to 18th centuries.',
                blogUrl: 'https://en.wikipedia.org/wiki/Makli_Necropolis',
              },
              {
                name: 'Mohenjo-Daro',
                slug: 'mohenjo-daro',
                location: 'Sindh',
                year: 1980,
                image: '/images/heritage/mohenjo-daro.jpeg',
                description: 'The ancient city of the Indus Valley Civilization, known as the “city of the dead”, dating back to 2500 BCE.',
                blogUrl: 'https://en.wikipedia.org/wiki/Mohenjo-daro',
              },
            ].map(site => (
              <div key={site.name} className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
                <img src={site.image} alt={site.name} className="w-full h-56 object-cover" />
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold text-blue-800 mb-2">{site.name}</h3>
                  <div className="flex items-center text-sm text-blue-500 mb-2">
                    <MapPin className="w-4 h-4 mr-1" /> {site.location}
                    <span className="ml-4"><Award className="w-4 h-4 mr-1 inline" /> UNESCO {site.year}</span>
                  </div>
                  <p className="text-gray-700 mb-4 flex-1">{site.description}</p>
                  <a
                    href={site.blogUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-auto modern-btn modern-btn-primary"
                  >
                    Read Blog
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="py-10 bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-blue-900">UNESCO Sites Map</h2>
          <div className="flex justify-center">
            <HeritageMap />
          </div>
        </div>
      </section>

      {/* Timeline/History Section */}
      <section className="py-10 bg-gradient-to-br from-blue-100 via-white to-blue-50">
        <div className="container mx-auto px-4">
          <HeritageTimeline />
        </div>
      </section>

      {/* Did You Know / Facts Section - now under Timeline */}
      <section className="py-10 bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="container mx-auto px-4">
          <HeritageFacts />
        </div>
      </section>

      {/* Gallery/Carousel Section */}
      <section className="py-10 bg-gradient-to-br from-blue-100 via-white to-blue-50">
        <div className="container mx-auto px-4">
          <HeritageGallery />
        </div>
      </section>
    </div>
  )
}

// Heritage Card Component
const HeritageCard = ({ site, viewMode, isExpanded, onToggleExpand }) => {
  const { name, description, location, images, rating, price, category, highlights } = site

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col md:flex-row">
        <div className="md:w-1/3">
          <img src={images[0]?.url} alt={name} className="w-full h-48 md:h-full object-cover" />
        </div>
        <div className="p-6 flex-grow flex flex-col justify-between md:w-2/3">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{name}</h3>
            <div className="flex items-center text-gray-500 text-sm mb-3">
              <MapPin size={14} className="mr-1.5" /> {location.city}, {location.province}
              <span className="mx-2">|</span>
              <Star size={14} className="mr-1.5 text-yellow-500" /> {rating?.average || 'N/A'} ({rating?.count || 0} reviews)
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              {description.substring(0, 150)}...
            </p>
          </div>
          <div className="flex justify-between items-center mt-4">
            <p className="text-xl font-bold text-blue-600">Rs {price.toLocaleString()}</p>
            <Link
              to={`/destinations/${site._id}`}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl">
      <div className="relative">
        <img src={images[0]?.url} alt={name} className="w-full h-56 object-cover" />
        <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {category}
        </div>
        <div className="absolute bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent w-full p-4">
          <h3 className="text-white text-2xl font-bold">{name}</h3>
          <div className="flex items-center text-blue-200 text-sm mt-1">
            <MapPin size={14} className="mr-1.5" /> {location.city}, {location.province}
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Star size={20} className="text-yellow-500 mr-1.5" />
            <span className="text-lg font-bold text-gray-700">{rating?.average || 'N/A'}</span>
            <span className="text-gray-500 ml-1">({rating?.count || 0} reviews)</span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">Rs {price.toLocaleString()}</p>
            <p className="text-sm text-gray-500">entry fee</p>
          </div>
        </div>
        <p className="text-gray-600 leading-relaxed mb-4">
          {isExpanded ? description : `${description.substring(0, 100)}...`}
        </p>
        {description.length > 100 && (
          <button onClick={onToggleExpand} className="text-blue-600 font-semibold mb-4">
            {isExpanded ? 'Read Less' : 'Read More'}
          </button>
        )}
        
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-semibold text-gray-700 mb-2">Key Features</h4>
          <ul className="space-y-2">
            {highlights.slice(0, 3).map((highlight, index) => (
              <li key={index} className="flex items-center text-gray-600 text-sm">
                <CheckCircle size={16} className="text-green-500 mr-2" />
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        <Link
          to={`/destinations/${site._id}`}
          className="w-full mt-6 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Explore Site
        </Link>
      </div>
    </div>
  )
}

export default Heritage
