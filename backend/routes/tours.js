import express from "express"
import Tour from "../models/Tour.js"
import auth from "../middleware/auth.js"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import mongoose from "mongoose"

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Helper function to get Pakistan-specific real destination images
const getPakistanImage = (tourTitle, category, location, index = 0) => {
  // Specific Pakistani destination images mapped by tour title and location
  const specificDestinationImages = {
    // Northern Pakistan - Specific destinations (with common variations)
    'hunza valley': 'https://images.unsplash.com/photo-1544967082-d9759b6f88ed?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'hunza': 'https://images.unsplash.com/photo-1544967082-d9759b6f88ed?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'karimabad': 'https://images.unsplash.com/photo-1544967082-d9759b6f88ed?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'k2 base camp': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'k2': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'k-2': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'skardu': 'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'skardu valley': 'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'nanga parbat': 'https://images.unsplash.com/photo-1464822759844-d150ad6d1dde?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'fairy meadows': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'fairy meadow': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'swat valley': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'swat': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'chitral': 'https://images.unsplash.com/photo-1433838552652-f9a46b332c40?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'gilgit': 'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'baltistan': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'deosai': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'deosai plains': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    
    // Punjab - Historical and cultural sites (with variations)
    'lahore': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'lahore fort': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'shahi qila': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'badshahi mosque': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'badshahi masjid': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'shalimar gardens': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'shalimar bagh': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'murree': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'murree hills': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'islamabad': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'faisal mosque': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'faisal masjid': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    
    // Sindh - Coastal and historical (with variations)
    'karachi': 'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'clifton beach': 'https://images.unsplash.com/photo-1433838552652-f9a46b332c40?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'clifton': 'https://images.unsplash.com/photo-1433838552652-f9a46b332c40?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'mohenjo-daro': 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'mohenjodaro': 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'tharparkar': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'thar desert': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'hyderabad': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    
    // Balochistan - Desert and coastal (with variations)
    'quetta': 'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'gwadar': 'https://images.unsplash.com/photo-1433838552652-f9a46b332c40?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'gwadar port': 'https://images.unsplash.com/photo-1433838552652-f9a46b332c40?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'hingol national park': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'hingol': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'ziarat': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    
    // Kashmir (with variations)
    'muzaffarabad': 'https://images.unsplash.com/photo-1544967082-d9759b6f88ed?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'neelum valley': 'https://images.unsplash.com/photo-1433838552652-f9a46b332c40?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'neelum': 'https://images.unsplash.com/photo-1433838552652-f9a46b332c40?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'rawalakot': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'azad kashmir': 'https://images.unsplash.com/photo-1544967082-d9759b6f88ed?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    
    // Common tour naming patterns
    'northern areas': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'karakoram': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'karakoram highway': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'kkh': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'pakistan tour': 'https://images.unsplash.com/photo-1544967082-d9759b6f88ed?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'cultural tour': 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&w=500&h=300&fit=crop',
    'heritage tour': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&w=500&h=300&fit=crop'
  }
  
  // Region-based fallback images
  const regionImages = {
    'northern': [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // K2 Mountain
      'https://images.unsplash.com/photo-1544967082-d9759b6f88ed?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // Hunza Valley
      'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // Karakoram Range
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // Mountain landscape
      'https://images.unsplash.com/photo-1464822759844-d150ad6d1dde?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // Snow peaks
    ],
    
    'punjab': [
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // Traditional architecture
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // Mughal architecture
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // Mosque
      'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // Heritage site
    ],
    
    'sindh': [
      'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // Coastal city
      'https://images.unsplash.com/photo-1433838552652-f9a46b332c40?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // Coastal view
      'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // Ancient ruins
    ],
    
    'balochistan': [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // Desert landscape
      'https://images.unsplash.com/photo-1433838552652-f9a46b332c40?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // Coastal area
      'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // Rocky formations
    ],
    
    'kashmir': [
      'https://images.unsplash.com/photo-1544967082-d9759b6f88ed?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // Valley view
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // Mountain lake
      'https://images.unsplash.com/photo-1433838552652-f9a46b332c40?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // Alpine scenery
    ],
  }
  
  // Category-based fallback images
  const categoryImages = {
    'adventure': [
      'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // Mountain climbing
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // Rock climbing
      'https://images.unsplash.com/photo-1464822759844-d150ad6d1dde?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // Trekking
    ],
    
    'cultural': [
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // Traditional architecture
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // Palace
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // Cultural site
    ],
    
    'historical': [
      'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // Ancient ruins
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // Historical building
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // Heritage
    ],
    
    'nature': [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // Mountain landscape
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // Forest
      'https://images.unsplash.com/photo-1433838552652-f9a46b332c40?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // Lake
    ],
    
    'religious': [
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // Mosque
      'https://images.unsplash.com/photo-1597149434042-74998e4b3e85?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // Islamic architecture
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&w=500&h=300&fit=crop', // Religious building
    ]
  }
  
  // Step 1: Try to match specific destination by title (with flexible matching)
  const titleLower = (tourTitle || '').toLowerCase()
  console.log(`Checking tour title: "${tourTitle}" for image matching`)
  
  for (const [destination, imageUrl] of Object.entries(specificDestinationImages)) {
    if (titleLower.includes(destination)) {
      console.log(`✓ Matched specific destination: "${destination}" for tour: "${tourTitle}"`)
      return imageUrl
    }
  }
  
  // Step 2: Try to match by location keywords (with flexible matching)
  const locationLower = (location || '').toLowerCase()
  console.log(`Checking location: "${location}" for image matching`)
  
  for (const [destination, imageUrl] of Object.entries(specificDestinationImages)) {
    if (locationLower.includes(destination)) {
      console.log(`✓ Matched location: "${destination}" for location: "${location}"`)
      return imageUrl
    }
  }
  
  // Step 3: Determine region from location and title for region-specific images
  let region = 'nature' // default
  const searchText = `${titleLower} ${locationLower}`.toLowerCase()
  console.log(`Determining region from: "${searchText}"`)
  
  if (searchText.includes('gilgit') || searchText.includes('hunza') || searchText.includes('skardu') || 
      searchText.includes('k2') || searchText.includes('k-2') || searchText.includes('karakoram') || 
      searchText.includes('nanga parbat') || searchText.includes('fairy meadow') || 
      searchText.includes('swat') || searchText.includes('chitral') || searchText.includes('baltistan') ||
      searchText.includes('northern') || searchText.includes('deosai')) {
    region = 'northern'
  } else if (searchText.includes('punjab') || searchText.includes('lahore') || searchText.includes('murree') || 
             searchText.includes('islamabad') || searchText.includes('faisal') || searchText.includes('badshahi') ||
             searchText.includes('shalimar')) {
    region = 'punjab'
  } else if (searchText.includes('sindh') || searchText.includes('karachi') || searchText.includes('tharparkar') ||
             searchText.includes('mohenjo') || searchText.includes('hyderabad') || searchText.includes('clifton') ||
             searchText.includes('thar')) {
    region = 'sindh'
  } else if (searchText.includes('balochistan') || searchText.includes('quetta') || searchText.includes('gwadar') ||
             searchText.includes('hingol') || searchText.includes('ziarat')) {
    region = 'balochistan'
  } else if (searchText.includes('kashmir') || searchText.includes('muzaffarabad') || searchText.includes('neelum') ||
             searchText.includes('azad kashmir')) {
    region = 'kashmir'
  }
  
  console.log(`Detected region: ${region}`)
  
  // Step 4: Use region-specific images
  if (regionImages[region]) {
    const imageSet = regionImages[region]
    console.log(`✓ Using region "${region}" image for tour: "${tourTitle}"`)
    return imageSet[index % imageSet.length]
  }
  
  // Step 5: Fall back to category-based images
  const categoryImageSet = categoryImages[category] || categoryImages['nature']
  console.log(`✓ Using category "${category}" fallback image for tour: "${tourTitle}"`)
  return categoryImageSet[index % categoryImageSet.length]
}

// Helper function to load tours from JSON file as fallback
const loadToursFromJSON = () => {
  try {
    // Try enhanced tours first, fallback to basic tours
    let jsonPath = path.join(__dirname, '../data/enhanced-tours.json')
    let data, tours
    
    try {
      data = fs.readFileSync(jsonPath, 'utf8')
      const enhancedData = JSON.parse(data)
      tours = enhancedData.tours || []
      console.log('✅ Loaded enhanced tours:', tours.length)
    } catch (enhancedError) {
      console.log('⚠️ Enhanced tours not available, using basic tours')
      jsonPath = path.join(__dirname, '../data/tours.json')
      console.log('USING TOURS.JSON FALLBACK');
      data = fs.readFileSync(jsonPath, 'utf8')
      tours = JSON.parse(data)
    }
    
    // Transform JSON data to match database structure
    return tours.map((tour, tourIndex) => ({
      ...tour,
      destinations: [{ location: tour.location, _id: tour._id + '_dest' }],
      duration: { days: tour.duration, nights: Math.max(0, tour.duration - 1) },
      rating: { average: tour.rating || 4.5, count: tour.reviewCount || 0 },
      availability: { isActive: true },
      // Use only local images from JSON, do not use getPakistanImage fallback
      images: tour.images && tour.images.length > 0
        ? tour.images.map(img => (typeof img === 'object' ? img : { url: img, alt: tour.title }))
        : [{ url: '/images/tours/placeholder.jpeg', alt: tour.title }],
      highlights: tour.highlights || [],
      mainImage: tour.images && tour.images.length > 0
        ? (typeof tour.images[0] === 'object' ? tour.images[0] : { url: tour.images[0], alt: tour.title })
        : { url: '/images/tours/placeholder.jpeg', alt: tour.title }
    }))
  } catch (error) {
    console.error('Error loading tours from JSON:', error)
    return []
  }
}

// Optimized tours route with caching, pagination, and advanced filtering
router.get("/", async (req, res) => {
  try {
    const { category, location, search, page = 1, limit = 12 } = req.query;
    const query = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    if (location && location !== 'all') {
      query.location = { $regex: location, $options: 'i' };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    // Only active tours
    query['availability.isActive'] = { $ne: false };
    const skip = (page - 1) * limit;
    const tours = await Tour.find(query)
      .skip(skip)
      .limit(parseInt(limit));
    const totalCount = await Tour.countDocuments(query);
    return res.json({
      success: true,
      data: {
        tours,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNextPage: skip + parseInt(limit) < totalCount,
          hasPrevPage: page > 1,
          limit: parseInt(limit)
        },
        filters: {
          category: category || null,
          location: location || null
        },
        source: 'mongodb'
      }
    });
  } catch (error) {
    console.error('Error in /api/tours:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
})

// Location autocomplete endpoint - MUST BE BEFORE /:id route
router.get("/locations/autocomplete", async (req, res) => {
  try {
    const { query: searchQuery, limit = 10 } = req.query;
    
    if (!searchQuery || searchQuery.length < 2) {
      return res.json({ success: true, data: [] });
    }

    // Check if database is connected
    const isDatabaseConnected = mongoose.connection.readyState === 1
    
    if (!isDatabaseConnected) {
      console.log('Database not connected, using JSON fallback for autocomplete')
      const jsonTours = loadToursFromJSON()
      const searchLower = searchQuery.toLowerCase()
      
      // Get unique locations from JSON data
      const locations = [...new Set(jsonTours
        .filter(tour => tour.location.toLowerCase().includes(searchLower))
        .map(tour => tour.location))]
        .slice(0, Math.floor(parseInt(limit) / 3))
      
      // Get matching tour titles
      const tourTitles = jsonTours
        .filter(tour => tour.title.toLowerCase().includes(searchLower))
        .map(tour => tour.title)
        .slice(0, Math.floor(parseInt(limit) / 3))
      
      // Load destinations from JSON files for fallback
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');
      
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      
      let destinationSuggestions = []
      
      try {
        // Load all destination files
        const destFiles = [
          'destinations-ajk.json',
          'destinations-balochistan.json', 
          'destinations-gilgit-baltistan.json',
          'destinations-islamabad.json',
          'destinations-kp.json',
          'destinations-punjab.json',
          'destinations-sindh.json',
          'destinations-special.json'
        ]
        
        for (const file of destFiles) {
          const filePath = path.join(__dirname, '../data', file)
          if (fs.existsSync(filePath)) {
            const destData = JSON.parse(fs.readFileSync(filePath, 'utf8'))
            const matchingDests = destData
              .filter(dest => dest.name.toLowerCase().includes(searchLower))
              .slice(0, 2) // Limit per file
            destinationSuggestions.push(...matchingDests)
          }
        }
      } catch (error) {
        console.log('Error loading destination files for fallback:', error.message)
      }
      
      const suggestions = [
        ...locations.map(location => ({ type: 'location', value: location, label: location })),
        ...tourTitles.map(title => ({ type: 'tour', value: title, label: title })),
        ...destinationSuggestions.map(dest => ({ 
          type: 'destination', 
          value: dest.name, 
          label: dest.name,
          description: `${dest.category} in ${dest.location?.state || 'Pakistan'}`
        }))
      ]
      
  return res.json({ success: true, data: suggestions.slice(0, Math.floor(parseInt(limit))) })
    }

    // Database is connected - search both tours and destinations
    const suggestions = []

    // Get unique locations from tours
    const locations = await Tour.aggregate([
      { 
        $match: { 
          location: { $regex: new RegExp(searchQuery, "i") },
          "availability.isActive": { $ne: false }
        } 
      },
      { $group: { _id: "$location" } },
      { $sort: { _id: 1 } },
      { $limit: Math.floor(parseInt(limit) / 3) },
      { $project: { _id: 0, location: "$_id" } }
    ]);

    // Get tour titles that match
    const tourTitles = await Tour.find(
      { 
        title: { $regex: new RegExp(searchQuery, "i") },
        "availability.isActive": { $ne: false }
      },
      { title: 1, location: 1, _id: 0 }
    ).limit(Math.floor(parseInt(limit) / 3));

    // Search destinations from database if Destination model exists
    let destinations = []
    try {
      const Destination = (await import('../models/Destination.js')).default
      destinations = await Destination.find(
        { 
          $or: [
            { name: { $regex: new RegExp(searchQuery, "i") } },
            { description: { $regex: new RegExp(searchQuery, "i") } }
          ],
          isActive: { $ne: false }
        },
        { name: 1, category: 1, location: 1, _id: 0 }
      ).limit(Math.floor(parseInt(limit) / 3));
    } catch (error) {
      console.log('Destination model not available or error:', error.message)
    }

    // Combine and format suggestions
    suggestions.push(
      ...locations.map(loc => ({ 
        type: 'location', 
        value: loc.location, 
        label: loc.location 
      })),
      ...tourTitles.map(tour => ({ 
        type: 'tour', 
        value: tour.title, 
        label: tour.title,
        description: `Tour in ${tour.location}`
      })),
      ...destinations.map(dest => ({
        type: 'destination',
        value: dest.name,
        label: dest.name,
        description: `${dest.category} in ${dest.location?.state || 'Pakistan'}`
      }))
    );

    // Remove duplicates and limit results
    const uniqueSuggestions = suggestions
      .filter((suggestion, index, self) => 
        index === self.findIndex(s => s.value === suggestion.value && s.type === suggestion.type)
      )
      .slice(0, Math.floor(parseInt(limit)));

    res.json({
      success: true,
      data: uniqueSuggestions
    });

  } catch (error) {
    console.error("Error in location autocomplete:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch location suggestions",
      error: error.message
    });
  }
});

// Optimized single tour route with population
router.get("/:id", async (req, res) => {
  try {
    let tour = null;
    // Try to find by ObjectId if valid
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      tour = await Tour.findById(req.params.id)
        .select('+seoMetadata')
        .lean();
    }
    // If not found by ID, try by slug
    if (!tour) {
      tour = await Tour.findOne({ slug: req.params.id }).select('+seoMetadata').lean();
    }
    // If still not found, and DB is not connected, try JSON fallback
    if (!tour && mongoose.connection.readyState !== 1) {
      const jsonTours = loadToursFromJSON();
      tour = jsonTours.find(t => t._id === req.params.id);
      if (tour) {
        // Only block if tour is inactive
        if (tour.availability && tour.availability.isActive === false) {
          return res.status(404).json({
            success: false,
            message: "Tour is no longer available"
          });
        }
        return res.json({
          success: true,
          data: tour
        });
      }
    }
    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found"
      });
    }
    // Only block if tour is inactive
    if (tour.availability && tour.availability.isActive === false) {
      return res.status(404).json({
        success: false,
        message: "Tour is no longer available"
      });
    }
    // Always use images and mainImage from MongoDB as-is (local images)
    const enhancedTour = {
      ...tour,
      images: Array.isArray(tour.images) ? tour.images : [],
      mainImage: tour.mainImage || (Array.isArray(tour.images) && tour.images.length > 0 ? tour.images[0] : null)
    };
    res.set({
      'Cache-Control': 'public, max-age=600',
      'ETag': `"tour-${tour._id}-${tour.updatedAt}"`
    });
    res.json({
      success: true,
      data: enhancedTour
    });
  } catch (error) {
    console.error("Error fetching tour:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tour",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
})

// Optimized search endpoint
router.get("/search/:searchTerm", async (req, res) => {
  try {
    const { searchTerm } = req.params;
    const { limit = 10 } = req.query;

    // Use the static method we defined in the model
    const tours = await Tour.searchTours(searchTerm)
      .limit(Number(limit))
      .select('name title price duration destinations.location category rating images')
      .lean();

    res.json({
      success: true,
      data: tours,
      searchTerm,
      resultCount: tours.length
    });

  } catch (error) {
    console.error("Error searching tours:", error);
    res.status(500).json({
      success: false,
      message: "Search failed",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get tour categories and statistics
router.get("/meta/categories", async (req, res) => {
  try {
    const categories = await Tour.aggregate([
      { $match: { "availability.isActive": true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgPrice: { $avg: "$price" },
          avgRating: { $avg: "$rating.average" }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Cache for longer period as this changes infrequently
    res.set('Cache-Control', 'public, max-age=3600'); // 1 hour

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories"
    });
  }
});

// Create tour (admin only) - Optimized with validation
router.post("/", auth, async (req, res) => {
  try {
    // Validate required fields
    const { name, title, description, price, duration, destinations, category } = req.body;
    
    if (!name || !title || !description || !price || !duration || !destinations || !category) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        required: ["name", "title", "description", "price", "duration", "destinations", "category"]
      });
    }

    // Create tour with optimized structure
    const tourData = {
      ...req.body,
      // Ensure proper duration structure
      duration: typeof duration === 'object' ? duration : { days: Number(duration) },
      // Ensure destinations is array
      destinations: Array.isArray(destinations) ? destinations : [{ location: destinations }],
      // Set availability
      availability: { isActive: true, ...req.body.availability }
    };

    const tour = new Tour(tourData);
    await tour.save();

    res.status(201).json({
      success: true,
      data: tour,
      message: "Tour created successfully"
    });

  } catch (error) {
    console.error("Error creating tour:", error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create tour",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
})

// Update tour (admin only) - Optimized with proper validation
router.put("/:id", auth, async (req, res) => {
  try {
    // Validate ObjectId
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tour ID format"
      });
    }

    // Prevent updating certain system fields
    const { _id, createdAt, updatedAt, __v, ...updateData } = req.body;

    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      { 
        ...updateData,
        updatedAt: new Date() // Explicit timestamp update
      },
      {
        new: true,
        runValidators: true, // Run schema validations
        lean: false // We need the full document for virtuals
      }
    );

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found"
      });
    }

    res.json({
      success: true,
      data: tour,
      message: "Tour updated successfully"
    });

  } catch (error) {
    console.error("Error updating tour:", error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update tour",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
})

// Delete tour (admin only) - Soft delete for data integrity
router.delete("/:id", auth, async (req, res) => {
  try {
    // Validate ObjectId
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tour ID format"
      });
    }

    // Soft delete by setting active to false instead of actual deletion
    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      { 
        "availability.isActive": false,
        deletedAt: new Date()
      },
      { new: true }
    );

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found"
      });
    }

    res.json({
      success: true,
      message: "Tour deleted successfully",
      data: { id: tour._id, deletedAt: tour.deletedAt }
    });

  } catch (error) {
    console.error("Error deleting tour:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete tour",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
})

// Bulk operations for admin efficiency
router.post("/bulk/activate", auth, async (req, res) => {
  try {
    const { tourIds } = req.body;
    
    if (!Array.isArray(tourIds) || tourIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "tourIds must be a non-empty array"
      });
    }

    const result = await Tour.updateMany(
      { _id: { $in: tourIds } },
      { "availability.isActive": true }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} tours activated`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error("Error in bulk activation:", error);
    res.status(500).json({
      success: false,
      message: "Bulk activation failed"
    });
  }
})

// Get single tour by slug (SEO-friendly)
router.get("/slug/:slug", async (req, res) => {
  try {
    const tour = await Tour.findOne({ slug: req.params.slug }).lean();
    if (!tour) {
      return res.status(404).json({ success: false, message: "Tour not found" });
    }
    // Enhance images for frontend
    const enhancedTour = {
      ...tour,
      images: tour.images && tour.images.length > 0 ? tour.images.map((img, imgIndex) => ({
        url: (img && img.url && (img.url.startsWith('http://') || img.url.startsWith('https://')))
          ? img.url
          : getPakistanImage(tour.title || tour.name, tour.category, tour.destinations?.[0]?.location, imgIndex),
        alt: img?.alt || tour.title || tour.name
      })) : [{
        url: getPakistanImage(tour.title || tour.name, tour.category, tour.destinations?.[0]?.location, 0),
        alt: tour.title || tour.name
      }],
      mainImage: {
        url: (tour.mainImage && tour.mainImage.url && (tour.mainImage.url.startsWith('http://') || tour.mainImage.url.startsWith('https://')))
          ? tour.mainImage.url
          : getPakistanImage(tour.title || tour.name, tour.category, tour.destinations?.[0]?.location, 0),
        alt: tour.mainImage?.alt || tour.title || tour.name
      }
    };
    res.json({ success: true, data: enhancedTour });
  } catch (error) {
    console.error("Error fetching tour by slug:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DEBUG: List all tour IDs, titles, and slugs
router.get("/debug/all-ids", async (req, res) => {
  try {
    const tours = await Tour.find({}, { _id: 1, title: 1, slug: 1 }).lean();
    res.json({
      success: true,
      count: tours.length,
      tours
    });
  } catch (error) {
    console.error("Error fetching tour IDs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tour IDs"
    });
  }
});

export default router
