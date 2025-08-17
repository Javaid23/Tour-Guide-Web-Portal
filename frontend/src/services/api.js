import axios from "axios"

// Enhanced API configuration with better error handling and caching
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000, // Increased timeout for better reliability
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor with retry logic and caching
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add request timestamp for performance monitoring
    config.metadata = { requestStartTime: Date.now() }

    // Enable caching for GET requests
    if (config.method === 'get') {
      config.headers['Cache-Control'] = 'max-age=300' // 5 minutes
    }

    return config
  },
  (error) => {
    console.error("Request interceptor error:", error)
    return Promise.reject(error)
  },
)

// Enhanced response interceptor with retry logic
api.interceptors.response.use(
  (response) => {
    // Calculate request duration for performance monitoring
    if (response.config.metadata) {
      const duration = Date.now() - response.config.metadata.requestStartTime
      if (duration > 5000) {
        console.warn(`Slow API request: ${response.config.url} took ${duration}ms`)
      }
    }

    // Transform response to consistent format
    // Only wrap if the response doesn't already have the expected structure
    if (response.data && !response.data.hasOwnProperty('success') && !response.data.hasOwnProperty('data')) {
      response.data = {
        success: true,
        data: response.data
      }
    }

    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = "/"
      }
      return Promise.reject(error)
    }

    // Retry logic for network errors
    if (!error.response && !originalRequest._retry && originalRequest.method === 'get') {
      originalRequest._retry = true
      
      // Wait 1 second before retry
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      try {
        return await api(originalRequest)
      } catch (retryError) {
        console.error("Retry failed:", retryError)
      }
    }

    // Enhanced error logging
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    })

    return Promise.reject(error)
  },
)

// Enhanced Auth API calls with better error handling
export const authAPI = {
  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Registration failed")
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials)
      
      // Store token and user data
      if (response.data.success && response.data.token) {
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("user", JSON.stringify(response.data.user))
      }
      
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Login failed")
    }
  },

  logout: () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "/"
  },

  getProfile: async () => {
    try {
      const response = await api.get("/auth/me")
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch profile")
    }
  },

  refreshToken: async () => {
    try {
      const response = await api.post("/auth/refresh")
      if (response.data.token) {
        localStorage.setItem("token", response.data.token)
      }
      return response.data
    } catch (error) {
      authAPI.logout()
      throw error
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to send reset email");
    }
  }
}

// Enhanced User API calls
export const userAPI = {
  getProfile: async () => {
    try {
      const response = await api.get("/users/profile")
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch profile")
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await api.put("/users/profile", userData)
      
      // Update stored user data
      if (response.data.success && response.data.data) {
        localStorage.setItem("user", JSON.stringify(response.data.data))
      }
      
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Profile update failed")
    }
  },

  changePassword: async (passwordData) => {
    try {
      const response = await api.put("/users/password", passwordData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Password change failed")
    }
  },

  deleteAccount: async () => {
    try {
      const response = await api.delete("/users/profile")
      authAPI.logout() // Auto logout after account deletion
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Account deletion failed")
    }
  },

  uploadAvatar: async (file) => {
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      
      const response = await api.put("/users/profile/avatar", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // Update stored user data
      if (response.data.success && response.data.data) {
        localStorage.setItem("user", JSON.stringify(response.data.data))
      }
      
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Avatar upload failed")
    }
  }
}

// Enhanced Tour API calls with caching and advanced filtering
export const tourAPI = {
  // Get all tours with advanced filtering and caching
  getAllTours: async (params = {}) => {
    try {
      // Create cache key from parameters
      const cacheKey = `tours_${JSON.stringify(params)}`
      const cachedData = sessionStorage.getItem(cacheKey)
      
      // Return cached data if recent (2 minutes - reduced for better filter responsiveness)
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData)
        if (Date.now() - timestamp < 120000) { // 2 minutes
          console.log('Using cached tour data for params:', params)
          return { data }
        }
      }

      console.log('Fetching fresh tour data for params:', params)
      // Use /tours endpoint which has working data from JSON
      const response = await api.get("/tours", { params })
      
      // Cache successful responses (tours API returns data with success flag)
      if (response.data && response.data.success) {
        sessionStorage.setItem(cacheKey, JSON.stringify({
          data: response.data,
          timestamp: Date.now()
        }))
      }
      
      // Return data in expected format for tours API
      if (response.data.success && response.data.data.tours) {
        // Tours API returns { success: true, data: { tours: [...], pagination: {...} } }
        // Transform to match expected format
        return {
          success: true,
          data: {
            tours: response.data.data.tours, // <-- FIX: use 'tours' not 'destinations'
            pagination: response.data.data.pagination
          }
        }
      }
      
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch tours")
    }
  },

  // Get single tour with caching
  getTour: async (id) => {
    try {
      const cacheKey = `tour_${id}`
      const cachedData = sessionStorage.getItem(cacheKey)
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData)
        if (Date.now() - timestamp < 600000) { // 10 minutes for single tour
          // Always return { success, data } for consistency
          return data
        }
      }
      const response = await api.get(`/tours/${id}`)
      if (response.data.success) {
        sessionStorage.setItem(cacheKey, JSON.stringify({
          data: response.data,
          timestamp: Date.now()
        }))
      }
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch tour details")
    }
  },

  // Get single tour by slug
  getTourBySlug: async (slug) => {
    try {
      const cacheKey = `tour_slug_${slug}`;
      const cachedData = sessionStorage.getItem(cacheKey);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < 600000) {
          return data.data;
        }
      }
      const response = await api.get(`/tours/slug/${slug}`);
      if (response.data.success) {
        sessionStorage.setItem(cacheKey, JSON.stringify({
          data: response.data,
          timestamp: Date.now()
        }));
        return response.data.data;
      }
      throw new Error("Tour not found");
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch tour details");
    }
  },

  // Search tours
  searchTours: async (searchTerm, limit = 10) => {
    try {
      const response = await api.get(`/tours/search/${encodeURIComponent(searchTerm)}`, {
        params: { limit }
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Search failed")
    }
  },

  // Get tour categories and stats
  getCategories: async () => {
    try {
      const cacheKey = 'tour_categories'
      const cachedData = sessionStorage.getItem(cacheKey)
      
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData)
        if (Date.now() - timestamp < 3600000) { // 1 hour
          return { data }
        }
      }

      const response = await api.get("/tours/meta/categories")
      
      if (response.data.success) {
        sessionStorage.setItem(cacheKey, JSON.stringify({
          data: response.data,
          timestamp: Date.now()
        }))
      }
      
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch categories")
    }
  },

  // Get location autocomplete suggestions
  getLocationSuggestions: async (query, limit = 10) => {
    try {
      if (!query || query.length < 2) {
        return { data: [] }
      }

      const response = await api.get("/tours/locations/autocomplete", {
        params: { query, limit }
      })
      
      return response.data
    } catch (error) {
      console.error("Autocomplete error:", error)
      return { data: [] } // Return empty array on error instead of throwing
    }
  },

  // Clear tour cache
  clearCache: () => {
    const keys = Object.keys(sessionStorage)
    keys.forEach(key => {
      if (key.startsWith('tours_') || key.startsWith('tour_')) {
        sessionStorage.removeItem(key)
      }
    })
  },

  // Utility function to clear tour cache
  clearToursCache: () => {
    const keys = Object.keys(sessionStorage)
    keys.forEach(key => {
      if (key.startsWith('tours_')) {
        sessionStorage.removeItem(key)
      }
    })
    console.log('Tours cache cleared')
  },

  // Get blog post by slug
  getBlogBySlug: async (slug) => {
    try {
      const response = await api.get(`/blogs/slug/${slug}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch blog post")
    }
  },
}

// Booking API calls
export const bookingAPI = {
  createBooking: async (bookingData) => {
    try {
      const response = await api.post("/bookings", bookingData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Booking failed")
    }
  },

  getUserBookings: async () => {
    try {
      console.log('📡 Making request to /bookings/my');
      console.log('📡 Base URL:', api.defaults.baseURL);
      console.log('📡 Auth token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      
      const response = await api.get("/bookings/my")
      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response data:', response.data);
      
      return response.data
    } catch (error) {
      console.error('📡 API Request failed:', error);
      console.error('📡 Error response:', error.response?.data);
      console.error('📡 Error status:', error.response?.status);
      throw new Error(error.response?.data?.message || "Failed to fetch bookings")
    }
  },

  cancelBooking: async (bookingId) => {
    try {
      const response = await api.put(`/bookings/${bookingId}/cancel`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Cancellation failed")
    }
  }
}

// Payment API calls
export const paymentAPI = {
  createPaymentIntent: async (amount, currency = 'usd', metadata = {}) => {
    try {
      const response = await api.post("/payments/create-payment-intent", {
        amount,
        currency,
        metadata
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Payment intent creation failed")
    }
  },

  getPaymentHistory: async () => {
    try {
      const response = await api.get("/payments/history")
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch payment history")
    }
  }
}

// Review API calls
export const reviewAPI = {
  getTourReviews: async (tourId) => {
    try {
      const response = await api.get(`/reviews/tour/${tourId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch reviews")
    }
  },

  createReview: async (reviewData) => {
    try {
      console.log("📤 API: Sending review data:", reviewData)
      console.log("🔑 API: Using token:", localStorage.getItem("token") ? "EXISTS" : "MISSING")
      
      const response = await api.post("/reviews", reviewData)
      console.log("✅ API: Review response:", response.data)
      
      return response.data
    } catch (error) {
      console.error("❌ API: Review submission failed:", error.response?.data || error.message)
      throw new Error(error.response?.data?.message || "Review submission failed")
    }
  },

  getUserReviews: async () => {
    try {
      const response = await api.get("/reviews/my")
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch user reviews")
    }
  },

  updateReview: async (reviewId, reviewData) => {
    try {
      const response = await api.put(`/reviews/${reviewId}`, reviewData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Review update failed")
    }
  },

  deleteReview: async (reviewId) => {
    try {
      const response = await api.delete(`/reviews/${reviewId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Review deletion failed")
    }
  }
}

// Health check utility
export const healthAPI = {
  checkStatus: async () => {
    try {
      const response = await api.get("/health")
      return response.data
    } catch (error) {
      return { status: "unhealthy", error: error.message }
    }
  }
}

// Destinations API for fetching all destinations from /destinations endpoint
export const destinationsAPI = {
  getAllDestinations: async (params = {}) => {
    try {
      // Always request a high limit to get all destinations
      params.limit = params.limit || 1000
      const response = await api.get("/destinations", { params })
      if (response.data && response.data.destinations) {
        return response.data
      }
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch destinations")
    }
  },

  // Suggestion API for destinations
  getSuggestions: async (query, limit = 5) => {
    try {
      const params = { search: query, limit };
      const response = await api.get("/destinations", { params });
      if (response.data && response.data.destinations) {
        // Return a simplified suggestion list
        return response.data.destinations.map(dest => ({
          type: 'destination',
          label: dest.name,
          value: dest.name,
          province: dest.location?.state,
          description: dest.description?.substring(0, 80) || '',
        }));
      }
      return [];
    } catch (error) {
      return [];
    }
  },
}

// Utility functions
export const apiUtils = {
  isOnline: () => navigator.onLine,
  
  clearAllCache: () => {
    sessionStorage.clear()
    // Cache cleared silently
  },
  
  getApiStatus: async () => {
    try {
      const health = await healthAPI.checkStatus()
      return {
        status: health.status,
        online: apiUtils.isOnline(),
        lastCheck: new Date().toISOString()
      }
    } catch (error) {
      return {
        status: "error",
        online: apiUtils.isOnline(),
        error: error.message,
        lastCheck: new Date().toISOString()
      }
    }
  }
}

export default api
