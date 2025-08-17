import { useState, useEffect, useRef, useCallback } from "react"
import { Search } from "lucide-react"
import { destinationsAPI, tourAPI } from "../services/api.js"

const AutocompleteSearch = ({ 
  value, 
  onChange, 
  placeholder = "Search for destinations, activities, or locations...",
  className = "",
  onSuggestionSelect
}) => {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)
  const debounceRef = useRef(null)

  // Enhanced debounced function to fetch suggestions from both tours and destinations
  const fetchSuggestions = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setLoading(true)
    try {
      console.log('🔍 Fetching suggestions for:', query)
      
      // Search both destinations and tours in parallel
      const [destinationsResponse, toursResponse, locationsResponse] = await Promise.allSettled([
        destinationsAPI.getSuggestions(query, 4),
        tourAPI.searchTours(query, 4),
        tourAPI.getLocationSuggestions(query, 4)
      ])
      
      let suggestions = []
      
      // Process destinations suggestions
      if (destinationsResponse.status === 'fulfilled') {
        const destData = destinationsResponse.value
        console.log('📍 Destinations response:', destData)
        
        let destSuggestions = []
        if (Array.isArray(destData)) {
          destSuggestions = destData
        } else if (destData?.data && Array.isArray(destData.data)) {
          destSuggestions = destData.data
        }
        
        destSuggestions.forEach(item => {
          suggestions.push({
            type: 'destination',
            label: item.label || item.name || 'Unknown',
            value: item.value || item.label || item.name || 'Unknown',
            description: item.description || `Destination in ${item.province || 'Pakistan'}`
          })
        })
      }
      
      // Process tours suggestions
      if (toursResponse.status === 'fulfilled' && toursResponse.value?.data?.tours) {
        const tours = toursResponse.value.data.tours
        console.log('🎯 Tours response:', tours)
        
        tours.forEach(tour => {
          suggestions.push({
            type: 'tour',
            label: tour.title || tour.name || 'Unknown',
            value: tour.title || tour.name || 'Unknown',
            description: `Tour in ${tour.location || 'Pakistan'} - ${tour.duration || 'N/A'} days`
          })
        })
      }
      
      // Process location suggestions  
      if (locationsResponse.status === 'fulfilled' && locationsResponse.value?.data) {
        const locations = locationsResponse.value.data
        console.log('📍 Locations response:', locations)
        
        locations.forEach(loc => {
          if (!suggestions.some(s => s.value.toLowerCase() === loc.value.toLowerCase())) {
            suggestions.push({
              type: 'location',
              label: loc.label || loc.value || 'Unknown',
              value: loc.value || loc.label || 'Unknown',
              description: `Location in Pakistan`
            })
          }
        })
      }
      
      console.log('✅ Combined suggestions:', suggestions)
      
      setSuggestions(suggestions.slice(0, 8)) // Limit to 8 total suggestions
      setShowSuggestions(suggestions.length > 0)
    } catch (error) {
      console.error('❌ Error fetching suggestions:', error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setLoading(false)
    }
  }, [])

  // Handle input change with debouncing and improved search logic
  const handleInputChange = (e) => {
    const newValue = e.target.value
    onChange(newValue)
    setSelectedIndex(-1)

    // Clear previous debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Set new debounce timer with shorter delay for better UX
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(newValue)
    }, 200)
  }

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    onChange(suggestion.value)
    setShowSuggestions(false)
    setSuggestions([])
    setSelectedIndex(-1)
    
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion)
    }
    
    // Focus back to input
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Enhanced icon function with better styling
  const getSuggestionIcon = (type) => null // Remove all icons from suggestions

  return (
    <div className={`relative ${className}`}>
      <div className="relative group">
        {/* Removed left-side search icon for simplicity */}
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          className="w-full pl-4 pr-24 py-4 text-base bg-white/95 backdrop-blur-sm border-2 border-gray-200 rounded-xl 
                   shadow-md hover:shadow-lg focus:shadow-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                   transition-all duration-300 placeholder-gray-400
                   hover:bg-white hover:border-gray-300
                   focus:bg-white focus:outline-none"
        />
        
        {/* Enhanced Right Side Elements */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
          {loading ? (
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200/50">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-blue-700 text-sm font-medium">Searching...</span>
            </div>
          ) : (
            <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
                             text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg 
                             transition-all duration-300 flex items-center gap-2
                             hover:scale-105 active:scale-95">
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          )}
        </div>

        {/* Subtle gradient border effect on focus */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 
                      group-focus-within:opacity-20 transition-opacity duration-300 pointer-events-none -z-10 blur-xl"></div>
      </div>

      {/* Enhanced Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-3 bg-white/95 backdrop-blur-md border border-gray-200/50 
                   rounded-2xl shadow-2xl max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 
                   scrollbar-track-transparent animate-in slide-in-from-top-2 duration-200"
        >
          <div className="p-2">
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.type}-${suggestion.value}-${index}`}
                onClick={() => handleSuggestionSelect(suggestion)}
                className={`px-4 py-4 cursor-pointer flex items-center gap-4 transition-all duration-200 
                          rounded-xl mx-1 my-1 group hover:scale-[1.02] ${
                  index === selectedIndex 
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 shadow-md transform scale-[1.02]' 
                    : 'hover:bg-gray-50/80 hover:shadow-md'
                }`}
              >
                <div className={`p-2 rounded-lg transition-all duration-200 ${
                  index === selectedIndex 
                    ? 'bg-blue-100 scale-110' 
                    : 'bg-gray-100 group-hover:bg-gray-200 group-hover:scale-105'
                }`}>
                  {getSuggestionIcon(suggestion.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold truncate transition-colors duration-200 ${
                    index === selectedIndex ? 'text-blue-700' : 'text-gray-800 group-hover:text-gray-900'
                  }`}>
                    {suggestion.label}
                  </div>
                  {suggestion.description && (
                    <div className={`text-xs font-medium truncate transition-colors duration-200 ${
                      index === selectedIndex ? 'text-blue-500' : 'text-gray-500 group-hover:text-gray-600'
                    }`}>
                      {suggestion.description}
                    </div>
                  )}
                  <div className={`text-xs font-medium capitalize truncate transition-colors duration-200 ${
                    index === selectedIndex ? 'text-blue-500' : 'text-gray-500 group-hover:text-gray-600'
                  }`}>
                    {/* Removed all emojis for a cleaner look */}
                    {suggestion.type}
                  </div>
                </div>

                {/* Subtle arrow indicator */}
                <div className={`transition-all duration-200 ${
                  index === selectedIndex ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-70 group-hover:translate-x-0'
                }`}>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Footer with Tips */}
          <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-3 rounded-b-2xl">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs font-mono">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs font-mono">Enter</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs font-mono">Esc</kbd>
                  Close
                </span>
              </div>
              <span className="text-gray-400">{suggestions.length} results</span>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced No Results Message */}
      {showSuggestions && suggestions.length === 0 && !loading && value.length >= 2 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-3 bg-white/95 backdrop-blur-md border border-gray-200/50 
                   rounded-2xl shadow-2xl animate-in slide-in-from-top-2 duration-200"
        >
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full 
                          flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No destinations found</h3>
            <p className="text-gray-500 mb-4">
              We couldn't find any matches for "<span className="font-medium text-gray-700">{value}</span>"
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-700 font-medium mb-2">💡 Try searching for:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['Lahore', 'Northern Pakistan', 'Hunza', 'Karachi', 'Heritage'].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => onChange(suggestion)}
                    className="px-3 py-1 bg-white border border-blue-300 rounded-lg text-sm text-blue-600 
                             hover:bg-blue-50 hover:border-blue-400 transition-all duration-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AutocompleteSearch
