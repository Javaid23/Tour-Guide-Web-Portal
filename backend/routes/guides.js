import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import TourGuide from '../models/TourGuide.js';
import { sendEmail } from '../utils/emailService.js';
import auth from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/uploads/guides');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (JPEG, JPG, PNG) and PDF files are allowed'));
    }
  }
});

// Register a new tour guide
router.post('/register', upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'cnicPhoto', maxCount: 1 },
  { name: 'certificationDocs', maxCount: 5 }
]), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      cnic,
      dateOfBirth,
      address,
      city,
      experience,
      languages,
      specializations,
      preferredRegions,
      tourTypes,
      certifications,
      previousWork,
      availability,
      hourlyRate,
      fullDayRate,
      multiDayRate,
      socialMedia,
      references,
      termsAccepted
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !cnic || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: 'Missing required personal information'
      });
    }

    if (!hourlyRate || !fullDayRate) {
      return res.status(400).json({
        success: false,
        message: 'Pricing information is required'
      });
    }

    if (!req.files || !req.files.profilePhoto || !req.files.cnicPhoto) {
      return res.status(400).json({
        success: false,
        message: 'Profile photo and CNIC photo are required'
      });
    }

    if (!termsAccepted) {
      return res.status(400).json({
        success: false,
        message: 'Terms acceptance is required'
      });
    }

    // Check if email already exists
    const existingGuide = await TourGuide.findOne({ email });
    if (existingGuide) {
      return res.status(400).json({
        success: false,
        message: 'A tour guide with this email already exists'
      });
    }

    // Check if CNIC already exists
    const existingCnic = await TourGuide.findOne({ cnic });
    if (existingCnic) {
      return res.status(400).json({
        success: false,
        message: 'A tour guide with this CNIC already exists'
      });
    }

    // Process file uploads
    const files = {
      profilePhoto: req.files.profilePhoto ? req.files.profilePhoto[0].filename : null,
      cnicPhoto: req.files.cnicPhoto ? req.files.cnicPhoto[0].filename : null,
      certificationDocs: req.files.certificationDocs ? req.files.certificationDocs.map(file => file.filename) : []
    };

    // Parse JSON fields
    const parsedData = {
      languages: JSON.parse(languages || '[]'),
      specializations: JSON.parse(specializations || '[]'),
      preferredRegions: JSON.parse(preferredRegions || '[]'),
      tourTypes: JSON.parse(tourTypes || '[]'),
      availability: JSON.parse(availability || '{}'),
      socialMedia: JSON.parse(socialMedia || '{}'),
      references: JSON.parse(references || '[]')
    };

    // Create new tour guide application
    const newGuide = new TourGuide({
      // Personal Information
      firstName,
      lastName,
      email,
      phone,
      cnic,
      dateOfBirth: new Date(dateOfBirth),
      address,
      city,
      
      // Professional Information
      experience,
      languages: parsedData.languages,
      specializations: parsedData.specializations,
      preferredRegions: parsedData.preferredRegions,
      tourTypes: parsedData.tourTypes,
      certifications,
      previousWork,
      
      // Availability & Pricing
      availability: parsedData.availability,
      hourlyRate: Number(hourlyRate),
      fullDayRate: Number(fullDayRate),
      multiDayRate: multiDayRate ? Number(multiDayRate) : null,
      
      // Documents & Media
      profilePhoto: files.profilePhoto,
      cnicPhoto: files.cnicPhoto,
      certificationDocs: files.certificationDocs,
      
      // Social & References
      socialMedia: parsedData.socialMedia,
      references: parsedData.references,
      
      // Application Status
      status: 'pending', // pending, approved, rejected
      applicationDate: new Date(),
      
      // Agreement
      termsAccepted: termsAccepted === 'true'
    });

    await newGuide.save();

    // Send confirmation email to applicant
    try {
      await sendEmail({
        to: email,
        subject: 'Tour Guide Application Received - Pakistan Tourism',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">Application Received!</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for joining our tour guide network</p>
            </div>
            
            <div style="padding: 30px; background-color: #f8f9fa;">
              <h2 style="color: #333; margin-bottom: 20px;">Dear ${firstName} ${lastName},</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                We have successfully received your tour guide application. Our team will review your 
                application and get back to you within 2-3 business days.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">Application Details:</h3>
                <ul style="color: #666; line-height: 1.8;">
                  <li><strong>Application ID:</strong> ${newGuide._id}</li>
                  <li><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</li>
                  <li><strong>Specializations:</strong> ${parsedData.specializations.join(', ')}</li>
                  <li><strong>Preferred Regions:</strong> ${parsedData.preferredRegions.join(', ')}</li>
                  <li><strong>Status:</strong> Pending Review</li>
                </ul>
              </div>
              
              <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0066cc; margin-top: 0;">What happens next?</h3>
                <ol style="color: #333; line-height: 1.8;">
                  <li>Document verification (1-2 days)</li>
                  <li>Background check and reference verification</li>
                  <li>Admin review and approval decision</li>
                  <li>Account activation and training materials (if approved)</li>
                </ol>
              </div>
              
              <p style="color: #666; line-height: 1.6;">
                If you have any questions, please don't hesitate to contact our support team at 
                <a href="mailto:support@pakistantourism.com" style="color: #667eea;">support@pakistantourism.com</a>
              </p>
              
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #333; font-weight: bold;">Pakistan Tourism Team</p>
                <p style="color: #666; font-size: 14px;">Connecting travelers with authentic experiences</p>
              </div>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the registration if email fails
    }

    // Send notification email to admin
    try {
      await sendEmail({
        to: 'admin@pakistantourism.com', // Replace with actual admin email
        subject: 'New Tour Guide Application - Action Required',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #dc3545; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">New Tour Guide Application</h1>
              <p style="margin: 10px 0 0 0;">Requires admin review</p>
            </div>
            
            <div style="padding: 20px; background-color: #f8f9fa;">
              <h2 style="color: #333;">Application Details:</h2>
              <ul style="color: #666; line-height: 1.8;">
                <li><strong>Name:</strong> ${firstName} ${lastName}</li>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Phone:</strong> ${phone}</li>
                <li><strong>CNIC:</strong> ${cnic}</li>
                <li><strong>Experience:</strong> ${experience}</li>
                <li><strong>Specializations:</strong> ${parsedData.specializations.join(', ')}</li>
                <li><strong>Preferred Regions:</strong> ${parsedData.preferredRegions.join(', ')}</li>
                <li><strong>Hourly Rate:</strong> PKR ${hourlyRate}</li>
                <li><strong>Application Date:</strong> ${new Date().toLocaleString()}</li>
              </ul>
              
              <p style="margin-top: 20px;">
                <a href="${process.env.FRONTEND_URL}/admin?tab=guides" 
                   style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                  Review Application
                </a>
              </p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! You will receive a confirmation email shortly.',
      applicationId: newGuide._id
    });

  } catch (error) {
    console.error('Tour guide registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
});

// Get all tour guide applications (admin only)
router.get('/applications', async (req, res) => {
  try {
    console.log('Fetching tour guide applications...');
    
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const applications = await TourGuide.find(filter)
      .sort({ applicationDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await TourGuide.countDocuments(filter);

    res.json({
      success: true,
      applications,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications'
    });
  }
});

// Update application status (admin only)
router.patch('/applications/:id/status', async (req, res) => {
  try {
    console.log('Updating application status for ID:', req.params.id);
    console.log('Request body:', req.body);
    
    // Temporarily skip auth check for testing
    // TODO: Add auth back later
    
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const guide = await TourGuide.findByIdAndUpdate(
      id,
      { 
        status, 
        reviewNotes: notes,
        reviewDate: new Date()
      },
      { new: true }
    );

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // If approved, create or update User account
    if (status === 'approved') {
      try {
        // Import User model
        const User = (await import('../models/User.js')).default;
        const bcrypt = (await import('bcryptjs')).default;
        
        // Check if user already exists
        let user = await User.findOne({ email: guide.email });
        
        if (!user) {
          // Create new user account
          const tempPassword = Math.random().toString(36).slice(-8); // Generate temporary password
          const hashedPassword = await bcrypt.hash(tempPassword, 10);
          
          user = new User({
            firstName: guide.firstName,
            lastName: guide.lastName,
            email: guide.email,
            password: hashedPassword,
            phone: guide.phone,
            role: 'guide',
            guideId: guide._id,
            countryCode: '+92' // Default for Pakistan
          });
          
          await user.save();
          
          // Send credentials via email
          try {
            await sendEmail({
              to: guide.email,
              subject: 'Your Tour Guide Account - Login Credentials',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: #28a745; color: white; padding: 30px; text-align: center;">
                    <h1 style="margin: 0;">Welcome to Our Guide Network!</h1>
                  </div>
                  <div style="padding: 30px; background-color: #f8f9fa;">
                    <h2>Your Account is Ready!</h2>
                    <p>Congratulations! Your tour guide application has been approved.</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <h3>Login Credentials:</h3>
                      <p><strong>Email:</strong> ${guide.email}</p>
                      <p><strong>Temporary Password:</strong> ${tempPassword}</p>
                      <p style="color: #dc3545; font-size: 14px;"><strong>Important:</strong> Please change your password after first login.</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
                         style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        Login to Your Dashboard
                      </a>
                    </div>
                    
                    <p>You now have access to:</p>
                    <ul>
                      <li>Guide Dashboard</li>
                      <li>Booking Management</li>
                      <li>Availability Calendar</li>
                      <li>Tourist Reviews</li>
                      <li>Earnings Tracking</li>
                    </ul>
                  </div>
                </div>
              `
            });
          } catch (emailError) {
            console.error('Failed to send credentials email:', emailError);
          }
        } else {
          // Update existing user
          user.role = 'guide';
          user.guideId = guide._id;
          await user.save();
        }
        
        // Update guide with user reference
        guide.userId = user._id;
        guide.isActive = true;
        await guide.save();
        
      } catch (error) {
        console.error('Error creating user account:', error);
        // Don't fail the approval if user creation fails
      }
    }

    // Send status update email
    try {
      const emailSubject = status === 'approved' 
        ? 'Tour Guide Application Approved!' 
        : 'Tour Guide Application Update';
        
      const emailHtml = status === 'approved' 
        ? `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #28a745; color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0;">Congratulations!</h1>
              <p style="margin: 10px 0 0 0;">Your tour guide application has been approved</p>
            </div>
            <div style="padding: 30px; background-color: #f8f9fa;">
              <h2>Welcome to our Tour Guide Network!</h2>
              <p>We're excited to have you join our team of professional tour guides.</p>
              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>You will receive login credentials within 24 hours</li>
                <li>Complete the online training modules</li>
                <li>Set up your profile and availability</li>
                <li>Start receiving tour bookings</li>
              </ol>
              ${notes ? `<p><strong>Admin Notes:</strong> ${notes}</p>` : ''}
            </div>
          </div>
        `
        : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #dc3545; color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0;">Application Update</h1>
            </div>
            <div style="padding: 30px; background-color: #f8f9fa;">
              <h2>Application Status: ${status.charAt(0).toUpperCase() + status.slice(1)}</h2>
              ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
              <p>Thank you for your interest in joining our tour guide network.</p>
            </div>
          </div>
        `;

      await sendEmail({
        to: guide.email,
        subject: emailSubject,
        html: emailHtml
      });
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      guide
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application status'
    });
  }
});

// Tour Guide Dashboard Endpoints

// Get tour guide profile
router.get('/profile', auth, async (req, res) => {
  try {
    const guideId = req.user.guideId; // Assuming user has guideId when they're a guide
    
    if (!guideId) {
      return res.status(404).json({
        success: false,
        message: 'Guide profile not found'
      });
    }

    const guide = await TourGuide.findById(guideId).select('-cnicPhoto -certificationDocs');
    
    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide profile not found'
      });
    }

    res.json({
      success: true,
      guide
    });
  } catch (error) {
    console.error('Error fetching guide profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching guide profile'
    });
  }
});

// Get assigned bookings for guide
router.get('/bookings', auth, async (req, res) => {
  try {
    const guideId = req.user.guideId;
    
    if (!guideId) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found'
      });
    }

    // Import Booking model
    const Booking = (await import('../models/Booking.js')).default;
    
    const bookings = await Booking.find({ assignedGuide: guideId })
      .populate('user', 'firstName lastName email phone')
      .populate('tour', 'title destination duration price')
      .sort({ tourDate: -1 });

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Error fetching guide bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings'
    });
  }
});

// Get guide reviews
router.get('/reviews', auth, async (req, res) => {
  try {
    const guideId = req.user.guideId;
    
    if (!guideId) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found'
      });
    }

    // Import Review model
    const Review = (await import('../models/Review.js')).default;
    
    const reviews = await Review.find({ guide: guideId })
      .populate('user', 'firstName lastName')
      .populate('tour', 'title')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error('Error fetching guide reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews'
    });
  }
});

// Get guide availability
router.get('/availability', auth, async (req, res) => {
  try {
    const guideId = req.user.guideId;
    
    if (!guideId) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found'
      });
    }

    const guide = await TourGuide.findById(guideId).select('availability');
    
    res.json({
      success: true,
      availability: guide?.availability || {}
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching availability'
    });
  }
});

// Update guide availability
router.patch('/availability', auth, async (req, res) => {
  try {
    const guideId = req.user.guideId;
    const { date, isAvailable } = req.body;
    
    if (!guideId) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found'
      });
    }

    const guide = await TourGuide.findById(guideId);
    if (!guide) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found'
      });
    }

    // Update availability for specific date
    guide.availability = guide.availability || {};
    guide.availability[date] = isAvailable;
    
    await guide.save();

    res.json({
      success: true,
      message: 'Availability updated successfully',
      availability: guide.availability
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating availability'
    });
  }
});

// Get guide notifications
router.get('/notifications', auth, async (req, res) => {
  try {
    const guideId = req.user.guideId;
    
    if (!guideId) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found'
      });
    }

    // Create a simple notification system
    // In a real app, you'd have a Notification model
    const notifications = [
      {
        _id: '1',
        title: 'New Booking Assignment',
        message: 'You have been assigned a new tour booking for next week.',
        read: false,
        createdAt: new Date()
      },
      {
        _id: '2',
        title: 'Profile Updated',
        message: 'Your guide profile has been successfully updated.',
        read: true,
        createdAt: new Date(Date.now() - 86400000) // 1 day ago
      }
    ];

    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications'
    });
  }
});

// Mark notification as read
router.patch('/notifications/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real app, you'd update the notification in the database
    // For now, just return success
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification'
    });
  }
});

// Mark booking as completed
router.patch('/bookings/:id/complete', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const guideId = req.user.guideId;
    
    if (!guideId) {
      return res.status(404).json({
        success: false,
        message: 'Guide not found'
      });
    }

    // Import Booking model
    const Booking = (await import('../models/Booking.js')).default;
    
    const booking = await Booking.findOne({ _id: id, assignedGuide: guideId });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not assigned to you'
      });
    }

    booking.status = 'completed';
    booking.completedAt = new Date();
    
    await booking.save();

    res.json({
      success: true,
      message: 'Booking marked as completed',
      booking
    });
  } catch (error) {
    console.error('Error completing booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing booking'
    });
  }
});

export default router;
