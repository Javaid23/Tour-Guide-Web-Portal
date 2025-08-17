import express from 'express';
import Destination from '../models/Destination.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all destinations with optional filtering
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      city, 
      state, 
      search, 
      minRating, 
      page = 1, 
      limit = 20, 
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build query object
    const query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }

    if (state) {
      // Flexible province/state filtering: match 'location.state' OR 'province' field
      const stateLower = state.toLowerCase();
      query.$or = [
        { 'location.state': { $regex: `^${state}$`, $options: 'i' } },
        { province: { $regex: `^${state}$`, $options: 'i' } }
      ];
      if (stateLower.includes('islamabad')) {
        query.$or = [
          { 'location.state': { $regex: 'islamabad', $options: 'i' } },
          { province: { $regex: 'islamabad', $options: 'i' } }
        ];
      }
      console.log('[DEBUG] Destinations API state param:', state);
      console.log('[DEBUG] MongoDB query:', JSON.stringify(query));
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (minRating) {
      query['ratings.average'] = { $gte: parseFloat(minRating) };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const destinations = await Destination.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('nearbyDestinations', 'name category location');

    const total = await Destination.countDocuments(query);

    // Debug logging for query and results
    console.log('[DEBUG] Final MongoDB query:', JSON.stringify(query));
    console.log('[DEBUG] Number of destinations found:', destinations.length, '| Total matching:', total);

    res.json({
      destinations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    res.status(500).json({ error: 'Failed to fetch destinations' });
  }
});

// Get destination categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Destination.distinct('category', { isActive: true });
    res.json(categories.sort());
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get destination states/provinces
router.get('/meta/provinces', async (req, res) => {
  try {
    const provinces = await Destination.distinct('location.state', { isActive: true });
    res.json(provinces.sort());
  } catch (error) {
    console.error('Error fetching provinces:', error);
    res.status(500).json({ error: 'Failed to fetch provinces' });
  }
});

// Get complete metadata including featured destinations
router.get("/meta/complete", async (req, res) => {
  try {
    // Load complete metadata from enhanced-tours.json
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const jsonPath = path.join(__dirname, '../data/enhanced-tours.json');
    
    const data = fs.readFileSync(jsonPath, 'utf8');
    const enhancedData = JSON.parse(data);
    
    // Extract just the metadata (excluding tours array for performance)
    const { meta } = enhancedData;
    
    // Cache for longer period as this changes infrequently
    res.set('Cache-Control', 'public, max-age=1800'); // 30 minutes

    res.json({
      success: true,
      data: meta
    });

  } catch (error) {
    console.error("Error fetching complete metadata:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch metadata",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get destination by ID
router.get('/:id', async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id)
      .populate('nearbyDestinations', 'name category location ratings images');

    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    res.json(destination);
  } catch (error) {
    console.error('Error fetching destination:', error);
    res.status(500).json({ error: 'Failed to fetch destination' });
  }
});

// Get destinations by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    const destinations = await Destination.find({ 
      category: { $regex: category, $options: 'i' }, 
      isActive: true 
    })
      .sort({ 'ratings.average': -1, name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Destination.countDocuments({ 
      category: { $regex: category, $options: 'i' }, 
      isActive: true 
    });

    res.json({
      destinations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching destinations by category:', error);
    res.status(500).json({ error: 'Failed to fetch destinations by category' });
  }
});

// Get destinations by state/province
router.get('/province/:state', async (req, res) => {
  try {
    const { state } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    // Use exact match for province/state filtering (case-insensitive)
    const destinations = await Destination.find({ 
      $and: [
        { isActive: true },
        { 'location.state': { $regex: `^${state}$`, $options: 'i' } }
      ]
    })
      .sort({ 'ratings.average': -1, name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Destination.countDocuments({ 
      $and: [
        { isActive: true },
        { 'location.state': { $regex: `^${state}$`, $options: 'i' } }
      ]
    });

    res.json({
      destinations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching destinations by province:', error);
    res.status(500).json({ error: 'Failed to fetch destinations by province' });
  }
});

// Get top-rated destinations
router.get('/featured/top-rated', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const destinations = await Destination.find({ 
      isActive: true,
      'ratings.count': { $gte: 5 } // At least 5 ratings
    })
      .sort({ 'ratings.average': -1, 'ratings.count': -1 })
      .limit(parseInt(limit));

    res.json(destinations);
  } catch (error) {
    console.error('Error fetching top-rated destinations:', error);
    res.status(500).json({ error: 'Failed to fetch top-rated destinations' });
  }
});

// Get destination categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Destination.distinct('category', { isActive: true });
    res.json(categories.sort());
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get destination states/provinces
router.get('/meta/provinces', async (req, res) => {
  try {
    const provinces = await Destination.distinct('location.state', { isActive: true });
    res.json(provinces.sort());
  } catch (error) {
    console.error('Error fetching provinces:', error);
    res.status(500).json({ error: 'Failed to fetch provinces' });
  }
});

// Get complete metadata including featured destinations
router.get("/meta/complete", async (req, res) => {
  try {
    // Load complete metadata from enhanced-tours.json
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const jsonPath = path.join(__dirname, '../data/enhanced-tours.json');
    
    const data = fs.readFileSync(jsonPath, 'utf8');
    const enhancedData = JSON.parse(data);
    
    // Extract just the metadata (excluding tours array for performance)
    const { meta } = enhancedData;
    
    // Cache for longer period as this changes infrequently
    res.set('Cache-Control', 'public, max-age=1800'); // 30 minutes

    res.json({
      success: true,
      data: meta
    });

  } catch (error) {
    console.error("Error fetching complete metadata:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch metadata",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Simple PATCH endpoint for admin panel to update destination status
router.patch('/:id', async (req, res) => {
  try {
    console.log(`Updating destination ${req.params.id} with:`, req.body);
    
    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!destination) {
      console.log(`Destination ${req.params.id} not found`);
      return res.status(404).json({ error: 'Destination not found' });
    }

    console.log(`Successfully updated destination: ${destination.name} - isActive: ${destination.isActive}`);
    res.json({ success: true, destination });
  } catch (error) {
    console.error('Error updating destination:', error);
    res.status(400).json({ error: 'Failed to update destination' });
  }
});

// Create new destination (admin only)
router.post('/', async (req, res) => {
  try {
    console.log('Creating new destination:', req.body);
    
    const destination = new Destination(req.body);
    await destination.save();

    console.log('Successfully created destination:', destination.name);
    res.status(201).json({ success: true, destination });
  } catch (error) {
    console.error('Error creating destination:', error);
    res.status(400).json({ error: 'Failed to create destination', details: error.message });
  }
});

// Update destination (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    res.json(destination);
  } catch (error) {
    console.error('Error updating destination:', error);
    res.status(400).json({ error: 'Failed to update destination' });
  }
});

// Delete destination (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!destination) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    res.json({ message: 'Destination deactivated successfully' });
  } catch (error) {
    console.error('Error deleting destination:', error);
    res.status(500).json({ error: 'Failed to delete destination' });
  }
});

export default router;
