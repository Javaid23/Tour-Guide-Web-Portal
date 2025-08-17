"use client"

import React, { useState, useEffect } from "react";
import { Users, Calendar, DollarSign, TrendingUp, Eye, Edit, Trash2, Plus, User, Star, CreditCard, Shield, Bell, UserX, Camera, Phone, Lock, LogOut, Menu, X } from "lucide-react";
import { Dialog } from "@headlessui/react";
import DestinationModal from "../components/DestinationModal";
import AddDestinationForm from "../components/AddDestinationForm";
import AddTourForm from "../components/AddTourForm";

const AdminPanel = () => {
   const [activeTab, setActiveTab] = useState("dashboard");
   const [loading, setLoading] = useState(true);
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
   const [profileData, setProfileData] = useState({
     name: "Javaid Butt",
     email: "javaidbutt009@gmail.com",
     phone: "+92-300-1234567",
     profilePicture: null,
     role: "Administrator"
   });
   const [showProfileEditModal, setShowProfileEditModal] = useState(false);
   const [profileEditForm, setProfileEditForm] = useState({});
   const [profileActionLoading, setProfileActionLoading] = useState(false);
   // Password change states
   const [showPasswordModal, setShowPasswordModal] = useState(false);
   const [passwordForm, setPasswordForm] = useState({
     currentPassword: "",
     newPassword: "",
     confirmPassword: ""
   });
   const [passwordActionLoading, setPasswordActionLoading] = useState(false);
   // Admin management states
   const [guideApplications, setGuideApplications] = useState([]);
   const [pendingReviews, setPendingReviews] = useState([]);
   const [allPayments, setAllPayments] = useState([]);
   const [announcements, setAnnouncements] = useState([]);
   const [showReviewModal, setShowReviewModal] = useState(false);
   const [selectedReview, setSelectedReview] = useState(null);
   const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
   const [announcementForm, setAnnouncementForm] = useState({});
   const [adminActionLoading, setAdminActionLoading] = useState(false);
   const [showDestinationModal, setShowDestinationModal] = useState(false);
   const [selectedDestination, setSelectedDestination] = useState(null);
   const [showAddDestinationModal, setShowAddDestinationModal] = useState(false);
   const [destinationSearch, setDestinationSearch] = useState("");
   const [destinationCategoryFilter, setDestinationCategoryFilter] = useState("");
   const [tourSearch, setTourSearch] = useState("");
   const [tourCategoryFilter, setTourCategoryFilter] = useState("");
   const [userSearch, setUserSearch] = useState("");
   const [userRoleFilter, setUserRoleFilter] = useState("");
   const [stats, setStats] = useState({
     totalUsers: 0,
     totalBookings: 0,
     totalRevenue: 0,
     monthlyGrowth: 0
   });
   const [bookings, setBookings] = useState([]);
   const [users, setUsers] = useState([]);
   const [destinations, setDestinations] = useState([]);
   const [allDestinations, setAllDestinations] = useState([]);
   const [showTourModal, setShowTourModal] = useState(false);
   const [editTour, setEditTour] = useState(null);
   const [tourForm, setTourForm] = useState({});

  useEffect(() => {
    console.log("🚀 AdminPanel useEffect triggered")
    const initializeAdminPanel = async () => {
      try {
        console.log("🔐 Checking authentication...")
        const token = localStorage.getItem("token")
        if (!token) {
          console.error("❌ No authentication token found")
          setLoading(false)
          return
        }
        
        console.log("✅ Token found, fetching admin data...")
        await fetchAdminData()
        await fetchAdminManagementData()
      } catch (error) {
        console.error("💥 Error in AdminPanel initialization:", error)
        setLoading(false)
      }
    }
    
    initializeAdminPanel()
  }, [])

  const checkBackendConnection = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/health", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      return response.ok
    } catch (error) {
      console.error("Backend connection failed:", error)
      return false
    }
  }

  const fetchAdminManagementData = async () => {
    try {
      const token = localStorage.getItem("token")
      console.log("🔑 Token for guide apps:", token ? "EXISTS" : "MISSING")

      // Fetch guide applications from real API (all applications, not just pending)
      console.log("📡 Fetching guide applications from: http://localhost:5000/api/guide/applications")
      const guideAppsResponse = await fetch("http://localhost:5000/api/guide/applications", {
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
      })
      
      console.log("📥 Guide applications response status:", guideAppsResponse.status)
      console.log("📥 Guide applications response ok:", guideAppsResponse.ok)
      
      if (!guideAppsResponse.ok) {
        const errorText = await guideAppsResponse.text()
        console.error("❌ Guide applications error response:", errorText)
        throw new Error(`HTTP ${guideAppsResponse.status}: ${errorText}`)
      }
      
      const guideAppsData = await guideAppsResponse.json()
      console.log('📋 Guide applications full response:', guideAppsData)
      console.log('📋 Applications array:', guideAppsData.applications)
      
      if (guideAppsData.success && guideAppsData.applications) {
        // Transform the API data to match frontend expectations
        const transformedApplications = guideAppsData.applications.map(app => ({
          id: app._id || app.id,
          name: `${app.firstName || ''} ${app.lastName || ''}`.trim() || 'Name not provided',
          email: app.email || 'Email not provided',
          phone: app.phone || 'Phone not provided',
          experience: app.experience || 'Experience not provided',
          specialization: (app.specializations || []).join(', ') || 'Not specified',
          status: app.status || 'pending',
          appliedDate: app.applicationDate ? new Date(app.applicationDate).toLocaleDateString() : 'Unknown',
          documents: app.certificationDocs || [],
          hourlyRate: app.hourlyRate || 'Not specified',
          fullDayRate: app.fullDayRate || 'Not specified',
          multiDayRate: app.multiDayRate || 'Not specified',
          profilePhoto: app.profilePhoto,
          cnicPhoto: app.cnicPhoto,
          originalData: app // Keep original data for reference
        }))
        
        setGuideApplications(transformedApplications)
        console.log(`✅ Successfully loaded and transformed ${transformedApplications.length} guide applications`)
        console.log("📋 Transformed applications:", transformedApplications)
        setAnnouncements([
          {
            id: "ANN001",
            title: "New Safety Guidelines",
            message: "All guides must follow updated COVID-19 safety protocols during tours.",
            type: "guideline",
            createdDate: "2025-08-01",
            isActive: true
          },
          {
            id: "ANN002",
            title: "Summer Special Discounts",
            message: "Enjoy 20% off on all mountain tours this summer season!",
            type: "promotion",
            createdDate: "2025-07-15",
            isActive: true
          }
        ]);
      } else {
        console.log("🔄 No guide applications found or API returned empty data");
        setGuideApplications([]);
      }

      // Fetch pending reviews from real API
      const reviewsResponse = await fetch("http://localhost:5000/api/admin/reviews?status=pending", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const reviewsData = await reviewsResponse.json()
      if (reviewsData.reviews) {
        setPendingReviews(reviewsData.reviews || [])
      }

      // Fetch all payments/bookings from real API
      const paymentsResponse = await fetch("http://localhost:5000/api/admin/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const paymentsData = await paymentsResponse.json()
      if (paymentsData.success) {
        // Map bookings to payment-like objects for Payment Oversight tab
        const mappedPayments = (paymentsData.data?.bookings || []).map(b => {
          // Prefer paymentStatus for Stripe and other payments
          const status = b.paymentStatus || b.status || 'N/A';
          return {
            id: b._id,
            tourist: b.user?.name || 'N/A',
            tour: b.tour?.name || b.destination?.name || 'N/A',
            guide: b.guide?.name || 'N/A',
            amount: b.amount || b.totalPrice || 0,
            stripeTransactionId: b.stripePaymentIntentId || b.paymentReference || 'N/A',
            status,
            paymentStatus: b.paymentStatus || 'N/A',
            date: b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'N/A',
            refundStatus: b.refundStatus || 'none',
          };
        });
        setAllPayments(mappedPayments);
      }

      // Set sample announcements (TODO: Replace with real API when endpoint is available)
      setAnnouncements([
        {
          id: "ANN001",
          title: "New Safety Guidelines",
          message: "All guides must follow updated COVID-19 safety protocols during tours.",
          type: "guideline",
          createdDate: "2025-08-01",
          isActive: true
        },
        {
          id: "ANN002",
          title: "Summer Special Discounts",
          message: "Enjoy 20% off on all mountain tours this summer season!",
          type: "promotion",
          createdDate: "2025-07-15",
          isActive: true
        }
      ]);

    } catch (error) {
      console.error("Error fetching admin management data:", error)
      // Set empty arrays if API fails
      setGuideApplications([]);
      setPendingReviews([]);
      setAllPayments([]);
      setAnnouncements([]);
    }
  }

  const fetchAdminData = async () => {
    try {
      console.log("🔄 Starting fetchAdminData...")
      const token = localStorage.getItem("token")
      console.log("Fetching admin data with token:", token ? "Token exists" : "No token")

      // Fetch admin stats from real API
      try {
        const statsResponse = await fetch("http://localhost:5000/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log("Stats response status:", statsResponse.status)
        const statsData = await statsResponse.json()
        console.log("Stats data:", statsData)
        if (statsData.success) {
          setStats(statsData.stats)
        }
      } catch (statsError) {
        console.error("Error fetching stats:", statsError)
        // Set default stats to prevent undefined errors
        setStats({
          totalUsers: 0,
          totalBookings: 0,
          totalRevenue: 0,
          monthlyGrowth: 0
        })
      }

      // Fetch bookings from real API
      try {
        const bookingsResponse = await fetch("http://localhost:5000/api/admin/bookings", {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log("Bookings response status:", bookingsResponse.status)
        const bookingsData = await bookingsResponse.json()
        console.log("Bookings data:", bookingsData)
        if (bookingsData.success) {
          setBookings(bookingsData.data.bookings || [])
        }
      } catch (bookingsError) {
        console.error("Error fetching bookings:", bookingsError)
        setBookings([]) // Set empty array to prevent undefined errors
      }

      // Fetch users from real API
      try {
        const usersResponse = await fetch("http://localhost:5000/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log("Users response status:", usersResponse.status)
        const usersData = await usersResponse.json()
        console.log("Users data:", usersData)
        if (usersData.success) {
          setUsers(usersData.data.users || [])
        }
      } catch (usersError) {
        console.error("Error fetching users:", usersError)
        setUsers([]) // Set empty array to prevent undefined errors
      }

      // Fetch tours from real API
      try {
        const toursResponse = await fetch("http://localhost:5000/api/admin/tours", {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log("Tours response status:", toursResponse.status)
        const toursData = await toursResponse.json()
        console.log("Tours data:", toursData)
        if (toursData.success && toursData.tours) {
          setDestinations(toursData.tours) // Using destinations state for tours
        }
      } catch (toursError) {
        console.error("Error fetching tours:", toursError)
      }

      // Fetch destinations from real API (no auth required) - Get all destinations
      try {
        console.log("Attempting to fetch all destinations from:", "http://localhost:5000/api/destinations?limit=1000")
        const destinationsResponse = await fetch("http://localhost:5000/api/destinations?limit=1000")
        console.log("Destinations response status:", destinationsResponse.status)
        
        if (destinationsResponse.ok) {
          const destinationsData = await destinationsResponse.json()
          console.log("Destinations data structure:", destinationsData)
          console.log("Destinations array length:", destinationsData.destinations?.length)
          
          if (destinationsData.destinations && Array.isArray(destinationsData.destinations)) {
            setAllDestinations(destinationsData.destinations)
            console.log(`✅ Successfully loaded ${destinationsData.destinations.length} destinations`)
          } else if (destinationsData.data && Array.isArray(destinationsData.data)) {
            setAllDestinations(destinationsData.data)
            console.log(`✅ Successfully loaded ${destinationsData.data.length} destinations`)
          } else if (Array.isArray(destinationsData)) {
            setAllDestinations(destinationsData)
            console.log(`✅ Successfully loaded ${destinationsData.length} destinations`)
          } else {
            console.warn("⚠️ Unexpected destinations data structure:", destinationsData)
            setAllDestinations([])
          }
        } else {
          console.error("❌ Failed to fetch destinations. Status:", destinationsResponse.status)
          const errorText = await destinationsResponse.text()
          console.error("Error response:", errorText)
          setAllDestinations([])
        }
      } catch (destError) {
        console.error("❌ Error fetching destinations:", destError)
        setAllDestinations([])
        console.error("This could indicate the backend server is not running or there's a network issue")
      }

      // Fetch current user profile data
      try {
        const profileResponse = await fetch("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.success && profileData.data) {
            const user = profileData.data;
            setProfileData({
              name: user.name || `${user.firstName} ${user.lastName}`.trim() || "Admin User",
              email: user.email || "javaidbutt009@gmail.com",
              phone: user.phone || "+92-300-1234567",
              profilePicture: user.avatar || null,
              role: user.role === "admin" ? "Administrator" : user.role || "Administrator"
            });
          } else {
            // Fallback to default admin profile data
            setProfileData({
              name: "Javaid Butt",
              email: "javaidbutt009@gmail.com",
              phone: "+92-300-1234567",
              profilePicture: null,
              role: "Administrator"
            });
          }
        } else {
          // Fallback to default admin profile data
          setProfileData({
            name: "Javaid Butt",
            email: "javaidbutt009@gmail.com",
            phone: "+92-300-1234567",
            profilePicture: null,
            role: "Administrator"
          });
        }
      } catch (profileError) {
        console.error("❌ Error fetching profile data:", profileError);
        // Set default admin profile data
        setProfileData({
          name: "Javaid Butt",
          email: "javaidbutt009@gmail.com",
          phone: "+92-300-1234567",
          profilePicture: null,
          role: "Administrator"
        });
      }

    } catch (error) {
      console.error("Error fetching admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: "#f59e0b",
      confirmed: "#10b981",
      cancelled: "#ef4444",
      completed: "#6366f1",
    }
    return colors[status] || "#64748b"
  }

  // Handler functions for admin actions
  // Test function to verify backend connectivity
  const testBackendConnection = async () => {
    try {
      console.log('🧪 Testing backend connection...');
      const response = await fetch('http://localhost:5000/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('🧪 Health check response:', response.status);
      const data = await response.text();
      console.log('🧪 Health check data:', data);
      alert(`Backend test result: ${response.status} - ${data}`);
    } catch (error) {
      console.error('🧪 Backend test failed:', error);
      alert(`Backend test failed: ${error.message}`);
    }
  };

  const handleGuideApplicationAction = async (applicationId, action, notes = '') => {
    try {
      console.log(`🔄 Starting ${action} action for application ${applicationId}`);
      console.log('🔍 Application ID type:', typeof applicationId, 'Value:', applicationId);
      setAdminActionLoading(true)
      const token = localStorage.getItem("token")
      
      if (!token) {
        alert('Authentication token not found. Please login again.');
        return;
      }

      console.log(`📡 Making request to: http://localhost:5000/api/guide/applications/${applicationId}/status`);
      console.log('📤 Request data:', { status: action, notes });
      console.log('🔑 Token exists:', !!token);
      
      // Test if backend is reachable first
      try {
        const healthCheck = await fetch('http://localhost:5000/api/health');
        console.log('🏥 Health check status:', healthCheck.status);
      } catch (healthError) {
        console.error('❌ Backend health check failed:', healthError);
        throw new Error('Backend server is not reachable');
      }
      
      const response = await fetch(`http://localhost:5000/api/guide/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: action, notes })
      }).catch(fetchError => {
        console.error('🚨 Fetch failed completely:', fetchError);
        throw new Error(`Network error: ${fetchError.message}`);
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error text:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json()
      console.log('📥 Response data:', data);

      if (data.success) {
        // Refresh guide applications
        await fetchAdminManagementData()
        alert('Email has been sent to guide');
      } else {
        alert(`Error: ${data.message}`)
      }
    } catch (error) {
      console.error('❌ Error updating guide application:', error)
      alert('Error updating guide application: ' + error.message)
    } finally {
      setAdminActionLoading(false)
    }
  }

  const handleViewDestination = (destination) => {
    console.log("🏔️ View destination clicked:", destination)
    console.log("🏔️ Destination name:", destination?.name)
    console.log("🏔️ Modal state before:", showDestinationModal)
    
    try {
      setSelectedDestination(destination)
      setShowDestinationModal(true)
      
      console.log("🏔️ Modal should be opening now...")
    } catch (error) {
      console.error("❌ Error in handleViewDestination:", error)
      alert(`Error: ${error.message}`)
    }
  }

  const handleReviewAction = async (reviewId, action) => {
    try {
      setAdminActionLoading(true)
      const token = localStorage.getItem("token")
      
      const response = await fetch(`http://localhost:5000/api/admin/reviews/${reviewId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: action })
      })

      const data = await response.json()
      if (data) {
        // Refresh pending reviews
        fetchAdminManagementData()
        setShowReviewModal(false)
        alert(`Review ${action} successfully!`)
      } else {
        alert('Error updating review status')
      }
    } catch (error) {
      console.error('Error updating review:', error)
      alert('Error updating review')
    } finally {
      setAdminActionLoading(false)
    }
  }

  const handleBookingStatusUpdate = async (bookingId, newStatus) => {
    try {
      setAdminActionLoading(true)
      const token = localStorage.getItem("token")
      
      const response = await fetch(`http://localhost:5000/api/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await response.json()
      if (data) {
        // Refresh bookings
        fetchAdminData()
        alert(`Booking status updated to ${newStatus}!`)
      } else {
        alert('Error updating booking status')
      }
    } catch (error) {
      console.error('Error updating booking:', error)
      alert('Error updating booking')
    } finally {
      setAdminActionLoading(false)
    }
  }

  // Close mobile menu when tab is selected
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              border: "4px solid #e2e8f0",
              borderTop: "4px solid #3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          ></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // Check if user is authenticated
  const token = localStorage.getItem("token")
  if (!token) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h2>Authentication Required</h2>
          <p>Please log in to access the admin panel.</p>
          <button 
            onClick={() => window.location.href = '/'}
            style={{ padding: "10px 20px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "5px" }}
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  console.log("🎨 AdminPanel about to render main content")

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <style>
        {`
          .mobile-container {
            padding: 16px;
          }
          
          .desktop-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
          }

          .mobile-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
          }

          .mobile-menu-button {
            display: none;
            background: none;
            border: none;
            padding: 8px;
            cursor: pointer;
            border-radius: 8px;
            background-color: #f1f5f9;
          }

          .mobile-sidebar-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 998;
          }

          .mobile-sidebar {
            position: fixed;
            top: 0;
            left: -100%;
            width: 280px;
            height: 100vh;
            background: white;
            z-index: 999;
            transition: left 0.3s ease;
            overflow-y: auto;
          }

          .mobile-sidebar.open {
            left: 0;
          }

          .mobile-sidebar-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px;
            border-bottom: 1px solid #e2e8f0;
          }

          .desktop-layout {
            display: grid;
            grid-template-columns: 250px 1fr;
            gap: 40px;
          }

          .mobile-stats-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
            margin-bottom: 24px;
          }

          .mobile-card {
            background: white;
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
          }

          .mobile-form-controls {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 16px;
          }

          .mobile-table-container {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .mobile-table {
            min-width: 600px;
          }

          .mobile-application-card {
            background: #fafafa;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 16px;
          }

          .mobile-application-header {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 12px;
          }

          .mobile-application-details {
            display: grid;
            grid-template-columns: 1fr;
            gap: 8px;
            margin-bottom: 12px;
          }

          .mobile-application-actions {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 12px;
          }

          .mobile-action-button {
            padding: 10px 16px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            font-size: 14px;
            width: 100%;
          }

          @media (max-width: 768px) {
            .mobile-container {
              padding: 12px;
            }
            
            .desktop-container {
              padding: 0 12px;
            }

            .mobile-menu-button {
              display: block;
            }

            .desktop-layout {
              display: block;
            }

            .mobile-sidebar-overlay.open {
              display: block;
            }

            .mobile-stats-grid {
              grid-template-columns: 1fr 1fr;
              gap: 12px;
            }

            .mobile-form-controls {
              gap: 8px;
            }

            .mobile-form-controls input,
            .mobile-form-controls select {
              font-size: 16px;
            }

            .mobile-application-details {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 480px) {
            .mobile-stats-grid {
              grid-template-columns: 1fr;
            }

            .mobile-card {
              padding: 12px;
            }

            .mobile-application-card {
              padding: 12px;
            }
          }
        `}
      </style>

      {/* Header */}
      <div style={{ backgroundColor: "white", borderBottom: "1px solid #e2e8f0", padding: "20px 0" }}>
        <div className="desktop-container">
          <div className="mobile-header">
            <div>
              <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: "600" }}>Admin Panel</h1>
              <p style={{ margin: "4px 0 0 0", color: "#64748b" }}>Manage your Tour Guide platform</p>
            </div>
            <button 
              className="mobile-menu-button"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div 
        className={`mobile-sidebar-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      {/* Mobile Sidebar */}
      <div className={`mobile-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-sidebar-header">
          <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "600" }}>Menu</h2>
          <button 
            style={{ background: "none", border: "none", padding: "4px", cursor: "pointer" }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <nav>
          {[
            { id: "dashboard", label: "Dashboard", icon: TrendingUp },
            { id: "profile", label: "My Profile", icon: User },
            { id: "guide-applications", label: "Guide Applications", icon: Users },
            { id: "destinations-management", label: "Destinations Management", icon: Eye },
            { id: "tour-management", label: "Tour Management", icon: Calendar },
            { id: "booking-oversight", label: "Booking Oversight", icon: Calendar },
            { id: "user-management", label: "User Management", icon: Users },
            { id: "payment-oversight", label: "Payment Oversight", icon: CreditCard },
            { id: "announcements", label: "Announcements", icon: Bell },
            { id: "review-moderation", label: "Review Moderation", icon: Star },
          ].map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  border: "none",
                  backgroundColor: activeTab === item.id ? "#eff6ff" : "transparent",
                  color: activeTab === item.id ? "#2563eb" : "#64748b",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "14px",
                  fontWeight: activeTab === item.id ? "600" : "400",
                  borderLeft: activeTab === item.id ? "3px solid #2563eb" : "3px solid transparent",
                }}
              >
                <Icon size={18} />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="mobile-container">
        <div className="desktop-layout">
          {/* Desktop Sidebar */}
          <div style={{ display: window.innerWidth <= 768 ? 'none' : 'block' }}>
            <div className="mobile-card">
              <div style={{ padding: "0" }}>
                <nav>
                  {[
                    { id: "dashboard", label: "Dashboard", icon: TrendingUp },
                    { id: "profile", label: "My Profile", icon: User },
                    { id: "guide-applications", label: "Guide Applications", icon: Users },
                    { id: "destinations-management", label: "Destinations Management", icon: Eye },
                    { id: "tour-management", label: "Tour Management", icon: Calendar },
                    { id: "booking-oversight", label: "Booking Oversight", icon: Calendar },
                    { id: "user-management", label: "User Management", icon: Users },
                    { id: "payment-oversight", label: "Payment Oversight", icon: CreditCard },
                    { id: "announcements", label: "Announcements", icon: Bell },
                    { id: "review-moderation", label: "Review Moderation", icon: Star },
                  ].map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabChange(item.id)}
                        style={{
                          width: "100%",
                          padding: "16px 20px",
                          border: "none",
                          backgroundColor: activeTab === item.id ? "#eff6ff" : "transparent",
                          color: activeTab === item.id ? "#2563eb" : "#64748b",
                          textAlign: "left",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          fontSize: "14px",
                          fontWeight: activeTab === item.id ? "600" : "400",
                          borderLeft: activeTab === item.id ? "3px solid #2563eb" : "3px solid transparent",
                        }}
                      >
                        <Icon size={18} />
                        {item.label}
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div>
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div>
                {/* Stats Cards */}
                <div className="mobile-stats-grid">
                  {[
                    {
                      title: "Monthly Growth",
                      value: "37.7%",
                      icon: TrendingUp,
                      color: "#3b82f6",
                      bg: "#eff6ff",
                    },
                    {
                      title: "Total Revenue",
                      value: allPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0).toLocaleString(),
                      icon: DollarSign,
                      color: "#10b981",
                      bg: "#ecfdf5",
                    },
                    {
                      title: "Total Bookings",
                      value: stats.totalBookings || 0,
                      icon: Calendar,
                      color: "#8b5cf6",
                      bg: "#faf5ff",
                    },
                    {
                      title: "Total Users",
                      value: stats.totalUsers || 0,
                      icon: Users,
                      color: "#f59e0b",
                      bg: "#fffbeb",
                    },
                  ].map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className="mobile-card">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div>
                            <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>{stat.title}</p>
                            <p style={{ margin: "8px 0 0 0", fontSize: "1.5rem", fontWeight: "600", color: "#1e293b" }}>
                              {stat.value}
                            </p>
                          </div>
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "12px",
                              backgroundColor: stat.bg,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Icon size={20} style={{ color: stat.color }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Recent Activity */}
                <div className="mobile-card">
                  <h3 style={{ margin: "0 0 20px 0", fontSize: "1.25rem", fontWeight: "600" }}>Recent Platform Activity</h3>
                  <div style={{ display: "grid", gridTemplateColumns: window.innerWidth <= 768 ? "1fr" : "repeat(2, 1fr)", gap: "20px" }}>
                    {/* Recent Guide Applications */}
                    <div>
                      <h4 style={{ margin: "0 0 15px 0", fontSize: "1rem", fontWeight: "600", color: "#f59e0b" }}>
                        Latest Guide Applications
                      </h4>
                      <div style={{ display: "grid", gap: "10px" }}>
                        {guideApplications.slice(0, 3).map(application => (
                          <div key={application.id} style={{ 
                            padding: "12px", 
                            border: "1px solid #fbbf24", 
                            borderRadius: "8px", 
                            backgroundColor: "#fffbeb" 
                          }}>
                            <p style={{ margin: "0 0 4px 0", fontWeight: "600", fontSize: "14px" }}>{application.name}</p>
                            <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#92400e" }}>{application.specialization}</p>
                            <p style={{ margin: 0, fontSize: "11px", color: "#78716c" }}>Applied: {application.appliedDate}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Pending Reviews */}
                    <div>
                      <h4 style={{ margin: "0 0 15px 0", fontSize: "1rem", fontWeight: "600", color: "#8b5cf6" }}>
                        Pending Review Approvals
                      </h4>
                      <div style={{ display: "grid", gap: "10px" }}>
                        {pendingReviews.slice(0, 3).map(review => (
                          <div key={review.id} style={{ 
                            padding: "12px", 
                            border: "1px solid #c084fc", 
                            borderRadius: "8px", 
                            backgroundColor: "#faf5ff" 
                          }}>
                            <p style={{ margin: "0 0 4px 0", fontWeight: "600", fontSize: "14px" }}>{review.tour}</p>
                            <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#7c3aed" }}>by {review.tourist}</p>
                            <p style={{ margin: 0, fontSize: "11px", color: "#78716c" }}>Rating: {review.rating}/5</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Guide Applications Tab */}
            {activeTab === "guide-applications" && (
              <div className="mobile-card">
                <h3 style={{ margin: "0 0 20px 0", fontSize: "1.25rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Users size={20} style={{ color: "#2563eb" }} />
                  Guide Applications Management
                </h3>
                <div style={{ display: "grid", gap: "20px" }}>
                  {guideApplications.map(application => (
                    <div key={application.id} className="mobile-application-card">
                      <div className="mobile-application-header">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <h4 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#1e293b" }}>{application.name}</h4>
                          <span style={{
                            padding: "4px 12px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "500",
                            backgroundColor: application.status === 'pending' ? "#fef3c7" : 
                                           application.status === 'approved' ? "#dcfce7" : "#fef2f2",
                            color: application.status === 'pending' ? "#92400e" : 
                                   application.status === 'approved' ? "#166534" : "#dc2626"
                          }}>{application.status.toUpperCase()}</span>
                        </div>
                      </div>
                      
                      <div className="mobile-application-details">
                        <div>
                          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Email</span>
                          <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#1e293b" }}>{application.email}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Phone</span>
                          <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#1e293b" }}>{application.phone}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Experience</span>
                          <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#1e293b" }}>{application.experience}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Specialization</span>
                          <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#1e293b" }}>{application.specialization}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Documents</span>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
                            {application.documents.map(doc => (
                              <span key={doc} style={{
                                padding: "2px 8px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                backgroundColor: "#eff6ff",
                                color: "#2563eb"
                              }}>{doc}</span>
                            ))}
                          </div>
                        </div>
                        <p style={{ margin: "12px 0 0 0", fontSize: "12px", color: "#64748b" }}>Applied on: {application.appliedDate}</p>
                      </div>
                      
                      {application.status === 'pending' && (
                        <div className="mobile-application-actions">
                          <button 
                            className="mobile-action-button"
                            style={{ backgroundColor: "#10b981", color: "white" }}
                            onClick={() => handleGuideApplicationAction(application.id, 'approved')}
                            disabled={adminActionLoading}
                          >
                            {adminActionLoading ? 'Processing...' : 'Approve'}
                          </button>
                          <button 
                            className="mobile-action-button"
                            style={{ backgroundColor: "#dc2626", color: "white" }}
                            onClick={() => handleGuideApplicationAction(application.id, 'rejected')}
                            disabled={adminActionLoading}
                          >
                            {adminActionLoading ? 'Processing...' : 'Reject'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Destinations Management Tab */}
            {activeTab === "destinations-management" && (
              <div className="mobile-card">
                <div style={{ display: "flex", flexDirection: window.innerWidth <= 768 ? "column" : "row", justifyContent: "space-between", alignItems: window.innerWidth <= 768 ? "flex-start" : "center", marginBottom: 20, gap: window.innerWidth <= 768 ? "12px" : "0" }}>
                  <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Eye size={20} style={{ color: "#2563eb" }} />
                    Destinations Management ({(allDestinations || []).length} destinations)
                  </h3>
                  <button 
                    className="mobile-action-button"
                    style={{ 
                      backgroundColor: "#3b82f6", 
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      width: window.innerWidth <= 768 ? "100%" : "auto",
                      padding: "10px 20px"
                    }} 
                    onClick={() => setShowAddDestinationModal(true)}
                  >
                    <Plus size={16} />
                    Add New Destination
                  </button>
                </div>
                
                {/* Search and Filter Controls */}
                <div className="mobile-form-controls">
                  <input
                    type="text"
                    placeholder="Search destinations by name..."
                    value={destinationSearch}
                    onChange={e => setDestinationSearch(e.target.value)}
                    style={{ 
                      padding: "12px", 
                      borderRadius: "8px", 
                      border: "1px solid #e2e8f0",
                      width: "100%",
                      fontSize: "16px"
                    }}
                  />
                  <select
                    value={destinationCategoryFilter}
                    onChange={e => setDestinationCategoryFilter(e.target.value)}
                    style={{ 
                      padding: "12px", 
                      borderRadius: "8px", 
                      border: "1px solid #e2e8f0",
                      width: "100%",
                      fontSize: "16px"
                    }}
                  >
                    <option value="">All Categories</option>
                    {Array.from(new Set((allDestinations || []).map(d => d.category).filter(Boolean))).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {showAddDestinationModal && (
                  <AddDestinationForm
                    onClose={() => setShowAddDestinationModal(false)}
                    onSuccess={() => {
                      setShowAddDestinationModal(false);
                    }}
                  />
                )}
                  
                {(!allDestinations || allDestinations.length === 0) ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    <Eye size={48} style={{ color: "#cbd5e1", margin: "0 auto 16px" }} />
                    <p>No destinations found. Check your database connection.</p>
                    <p style={{ fontSize: "12px", marginTop: "8px" }}>
                      Backend Status: {typeof allDestinations === 'undefined' ? 'Not loaded' : 'Empty response'}
                    </p>
                    <button 
                      onClick={() => {
                        console.log("Manual refresh clicked. Current allDestinations:", allDestinations);
                        fetchAdminData();
                      }}
                      className="mobile-action-button"
                      style={{
                        backgroundColor: "#3b82f6",
                        color: "white",
                        marginTop: "16px"
                      }}
                    >
                      Refresh Data
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "16px" }}>
                    {(allDestinations || [])
                      .filter(destination =>
                        (!destinationSearch || (destination.name && destination.name.toLowerCase().includes(destinationSearch.toLowerCase()))) &&
                        (!destinationCategoryFilter || destination.category === destinationCategoryFilter)
                      )
                      .slice(0, 20)
                      .map((destination, index) => (
                      <div key={destination?._id || index} className="mobile-application-card">
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <h4 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#1e293b" }}>
                              {destination?.name || 'Unknown Destination'}
                            </h4>
                            <span style={{
                              padding: "4px 12px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: "500",
                              backgroundColor: destination?.isActive ? "#dcfce7" : "#fee2e2",
                              color: destination?.isActive ? "#166534" : "#dc2626"
                            }}>
                              {destination?.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </div>
                          
                          <div style={{ display: "grid", gap: "8px" }}>
                            <div>
                              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Category</span>
                              <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#1e293b" }}>{destination?.category || 'N/A'}</p>
                            </div>
                            <div>
                              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Location</span>
                              <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#1e293b" }}>
                                {destination?.location?.city || destination?.city || 'N/A'}, {destination?.location?.state || destination?.state || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Rating</span>
                              <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#1e293b" }}>
                                ⭐ {
                                  typeof destination?.rating === 'object' 
                                    ? destination.rating.average || destination.rating.value || 'N/A'
                                    : typeof destination?.averageRating === 'object'
                                    ? destination.averageRating.average || destination.averageRating.value || 'N/A'
                                    : destination?.rating || destination?.averageRating || 'N/A'
                                } 
                                {(destination?.reviewCount || (destination?.rating?.count) || (destination?.averageRating?.count)) && 
                                  ` (${destination?.reviewCount || destination?.rating?.count || destination?.averageRating?.count} reviews)`
                                }
                              </p>
                            </div>
                            <div>
                              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Description</span>
                              <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#1e293b" }}>
                                {destination?.description ? destination.description.substring(0, 150) + '...' : 'No description available'}
                              </p>
                            </div>
                            {destination?.tags && destination.tags.length > 0 && (
                              <div>
                                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Tags</span>
                                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px" }}>
                                  {destination.tags.slice(0, 3).map((tag, i) => (
                                    <span key={i} style={{
                                      padding: "4px 8px",
                                      backgroundColor: "#eff6ff",
                                      color: "#2563eb",
                                      borderRadius: "6px",
                                      fontSize: "12px"
                                    }}>
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <button 
                            className="mobile-action-button"
                            style={{ 
                              backgroundColor: "#3b82f6", 
                              color: "white",
                              marginTop: "8px"
                            }}
                            onClick={() => handleViewDestination(destination)}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                    {(allDestinations || []).length > 20 && (
                      <div style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>
                        <p>Showing first 20 destinations. Total: {allDestinations.length}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tour Management Tab */}
            {activeTab === "tour-management" && (
              <div className="mobile-card">
                <div style={{ display: "flex", flexDirection: window.innerWidth <= 768 ? "column" : "row", justifyContent: "space-between", alignItems: window.innerWidth <= 768 ? "flex-start" : "center", marginBottom: 20, gap: window.innerWidth <= 768 ? "12px" : "0" }}>
                  <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Calendar size={20} style={{ color: "#2563eb" }} />
                    Tour Management
                  </h3>
                  <button 
                    className="mobile-action-button"
                    style={{ 
                      backgroundColor: "#2563eb", 
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      width: window.innerWidth <= 768 ? "100%" : "auto",
                      padding: "10px 20px"
                    }}
                    onClick={() => { setEditTour(null); setTourForm({}); setShowTourModal(true); }}
                  >
                    <Plus size={16} />
                    Add New Tour
                  </button>
                </div>
                
                <div className="mobile-form-controls">
                  <input
                    type="text"
                    placeholder="Search tours..."
                    value={tourSearch}
                    onChange={e => setTourSearch(e.target.value)}
                    style={{ 
                      padding: "12px", 
                      borderRadius: "8px", 
                      border: "1px solid #e2e8f0",
                      width: "100%",
                      fontSize: "16px"
                    }}
                  />
                  <select
                    value={tourCategoryFilter}
                    onChange={e => setTourCategoryFilter(e.target.value)}
                    style={{ 
                      padding: "12px", 
                      borderRadius: "8px", 
                      border: "1px solid #e2e8f0",
                      width: "100%",
                      fontSize: "16px"
                    }}
                  >
                    <option value="">All Categories</option>
                    <option value="adventure">Adventure</option>
                    <option value="cultural">Cultural</option>
                    <option value="historical">Historical</option>
                    <option value="nature">Nature</option>
                    <option value="religious">Religious</option>
                    <option value="heritage">Heritage</option>
                  </select>
                </div>
                
                <div className="mobile-table-container">
                  <table className="mobile-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={tableHeaderStyle}>Tour Name</th>
                        <th style={tableHeaderStyle}>Category</th>
                        <th style={tableHeaderStyle}>Price</th>
                        <th style={tableHeaderStyle}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {destinations
                        .filter(tour =>
                          (!tourSearch || tour.name?.toLowerCase().includes(tourSearch.toLowerCase())) &&
                          (!tourCategoryFilter || tour.category === tourCategoryFilter)
                        )
                        .map(tour => (
                          <tr key={tour._id} style={tableRowStyle}>
                            <td style={tableCellStyle}>{tour.name}</td>
                            <td style={tableCellStyle}>{tour.category}</td>
                            <td style={tableCellStyle}>${tour.price?.toLocaleString()}</td>
                            <td style={tableCellStyle}>
                              <span style={{
                                padding: "4px 12px",
                                borderRadius: "9999px",
                                fontSize: 12,
                                fontWeight: 500,
                                color: tour.availability?.isActive ? "#10b981" : "#ef4444",
                                background: tour.availability?.isActive ? "#ecfdf5" : "#fef2f2"
                              }}>{tour.availability?.isActive ? "Active" : "Inactive"}</span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                {/* Add Tour Modal */}
                {showTourModal && (
                  <AddTourForm
                    onClose={() => setShowTourModal(false)}
                    onTourAdded={() => {
                      // Optionally refresh tours list here
                    }}
                  />
                )}
              </div>
            )}

            {/* Booking Oversight Tab */}
            {activeTab === "booking-oversight" && (
              <div className="mobile-card">
                <h3 style={{ margin: "0 0 20px 0", fontSize: "1.25rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Calendar size={20} style={{ color: "#2563eb" }} />
                  Booking Oversight & Management
                </h3>
                <div className="mobile-table-container">
                  <table className="mobile-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={tableHeaderStyle}>Booking ID</th>
                        <th style={tableHeaderStyle}>Tourist</th>
                        <th style={tableHeaderStyle}>Tour</th>
                        <th style={tableHeaderStyle}>Destination</th>
                        <th style={tableHeaderStyle}>Date</th>
                        <th style={tableHeaderStyle}>Amount</th>
                        <th style={tableHeaderStyle}>Payment Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking._id} style={tableRowStyle}>
                          <td style={tableCellStyle}>{booking._id}</td>
                          <td style={tableCellStyle}>{booking.user?.name || "N/A"}</td>
                          <td style={tableCellStyle}>{booking.tour?.name || "N/A"}</td>
                          <td style={tableCellStyle}>{booking.destination?.name || "N/A"}</td>
                          <td style={tableCellStyle}>
                            {booking.startDate && !isNaN(new Date(booking.startDate))
                              ? new Date(booking.startDate).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td style={tableCellStyle}>$ {booking.totalPrice}</td>
                          <td style={tableCellStyle}>
                            <span
                              style={{
                                padding: "4px 12px",
                                borderRadius: "9999px",
                                fontSize: "12px",
                                fontWeight: "500",
                                color: booking.paymentStatus === 'paid' ? '#10b981' : '#ef4444',
                                background: booking.paymentStatus === 'paid' ? '#ecfdf5' : '#fef2f2',
                              }}
                            >
                              {booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Review Moderation Tab */}
            {activeTab === "review-moderation" && (
              <div className="mobile-card">
                <h3 style={{ margin: "0 0 20px 0", fontSize: "1.25rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Star size={20} style={{ color: "#2563eb" }} />
                  ⭐ Review Moderation
                </h3>
                <div style={{ display: "grid", gap: "20px" }}>
                  {pendingReviews.map(review => (
                    <div key={review.id} className="mobile-application-card" style={{ borderLeft: "4px solid #fbbf24" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <h4 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#1e293b" }}>{review.tour}</h4>
                          <span style={{
                            padding: "4px 12px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "500",
                            backgroundColor: "#fef3c7",
                            color: "#92400e"
                          }}>PENDING</span>
                        </div>
                        
                        <div style={{ display: "grid", gap: "8px" }}>
                          <div>
                            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Tourist</span>
                            <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#1e293b" }}>{review.tourist}</p>
                          </div>
                          <div>
                            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Guide</span>
                            <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#1e293b" }}>{review.guide}</p>
                          </div>
                          <div>
                            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Rating</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={14} 
                                  style={{ 
                                    color: i < review.rating ? "#f59e0b" : "#e5e7eb",
                                    fill: i < review.rating ? "#f59e0b" : "#e5e7eb"
                                  }} 
                                />
                              ))}
                              <span style={{ marginLeft: "4px", fontSize: "14px", color: "#1e293b" }}>({review.rating}/5)</span>
                            </div>
                          </div>
                          <div>
                            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Comment</span>
                            <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#1e293b", fontStyle: "italic" }}>"{review.comment}"</p>
                          </div>
                          <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#64748b" }}>Submitted: {review.submittedDate}</p>
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                          <button 
                            className="mobile-action-button"
                            style={{ backgroundColor: "#3b82f6", color: "white" }}
                            onClick={() => { setSelectedReview(review); setShowReviewModal(true); }}
                          >
                            Review Details
                          </button>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                            <button 
                              className="mobile-action-button"
                              style={{ backgroundColor: "#10b981", color: "white" }}
                              onClick={() => handleReviewAction(review._id, 'approved')}
                              disabled={adminActionLoading}
                            >
                              {adminActionLoading ? 'Processing...' : 'Approve'}
                            </button>
                            <button 
                              className="mobile-action-button"
                              style={{ backgroundColor: "#dc2626", color: "white" }}
                              onClick={() => handleReviewAction(review._id, 'hidden')}
                              disabled={adminActionLoading}
                            >
                              {adminActionLoading ? 'Processing...' : 'Hide'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Review Details Modal */}
                <Dialog open={showReviewModal} onClose={() => setShowReviewModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
                  <div className="flex items-center justify-center min-h-screen px-4">
                    <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg relative z-10 mx-4" style={{ borderTop: "6px solid #2563eb" }}>
                      <Dialog.Title className="text-xl font-bold mb-4 text-blue-700">Review Moderation</Dialog.Title>
                      {selectedReview && (
                        <div style={{ display: "grid", gap: "20px" }}>
                          <div>
                            <h4 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "600" }}>{selectedReview.tour}</h4>
                            <p style={{ margin: "0 0 8px 0", color: "#64748b" }}>Tourist: {selectedReview.tourist}</p>
                            <p style={{ margin: "0 0 12px 0", color: "#64748b" }}>Guide: {selectedReview.guide}</p>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                              <span>Rating:</span>
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={16} 
                                  style={{ 
                                    color: i < selectedReview.rating ? "#f59e0b" : "#e5e7eb",
                                    fill: i < selectedReview.rating ? "#f59e0b" : "#e5e7eb"
                                  }} 
                                />
                              ))}
                            </div>
                            <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "8px", marginBottom: "20px" }}>
                              <p style={{ margin: 0, fontStyle: "italic" }}>"{selectedReview.comment}"</p>
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: window.innerWidth <= 768 ? "column" : "row", gap: "12px", justifyContent: "flex-end" }}>
                            <button
                              className="mobile-action-button"
                              style={{ backgroundColor: "#10b981", color: "white" }}
                              disabled={adminActionLoading}
                            >
                              {adminActionLoading ? "Processing..." : "Approve Review"}
                            </button>
                            <button
                              className="mobile-action-button"
                              style={{ backgroundColor: "#dc2626", color: "white" }}
                              disabled={adminActionLoading}
                            >
                              {adminActionLoading ? "Processing..." : "Reject Review"}
                            </button>
                            <button
                              onClick={() => setShowReviewModal(false)}
                              className="mobile-action-button"
                              style={{ backgroundColor: "#f1f5f9", color: "#2563eb", border: "1px solid #e2e8f0" }}
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Dialog>
              </div>
            )}

            {/* User Management Tab */}
            {activeTab === "user-management" && (
              <div className="mobile-card">
                <h3 style={{ margin: "0 0 20px 0", fontSize: "1.25rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Users size={20} style={{ color: "#2563eb" }} />
                  User Management
                </h3>
                
                <div className="mobile-form-controls">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    style={{ 
                      padding: "12px", 
                      borderRadius: "8px", 
                      border: "1px solid #e2e8f0",
                      width: "100%",
                      fontSize: "16px"
                    }}
                  />
                  <select
                    value={userRoleFilter}
                    onChange={e => setUserRoleFilter(e.target.value)}
                    style={{ 
                      padding: "12px", 
                      borderRadius: "8px", 
                      border: "1px solid #e2e8f0",
                      width: "100%",
                      fontSize: "16px"
                    }}
                  >
                    <option value="">All Roles</option>
                    <option value="user">Tourist</option>
                    <option value="admin">Admin</option>
                    <option value="guide">Guide</option>
                  </select>
                </div>
                
                <div className="mobile-table-container">
                  <table className="mobile-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={tableHeaderStyle}>ID</th>
                        <th style={tableHeaderStyle}>Name</th>
                        <th style={tableHeaderStyle}>Email</th>
                        <th style={tableHeaderStyle}>Role</th>
                        <th style={tableHeaderStyle}>Join Date</th>
                        <th style={tableHeaderStyle}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users
                        .filter(u =>
                          (!userSearch || u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase())) &&
                          (!userRoleFilter || u.role === userRoleFilter)
                        )
                        .map(user => (
                          <tr key={user._id} style={tableRowStyle}>
                            <td style={tableCellStyle}>{user._id}</td>
                            <td style={tableCellStyle}>{user.name}</td>
                            <td style={tableCellStyle}>{user.email}</td>
                            <td style={tableCellStyle}>
                              <span style={{
                                padding: "2px 8px",
                                borderRadius: "12px",
                                fontSize: "12px",
                                fontWeight: "500",
                                backgroundColor: user.role === 'admin' ? "#dcfce7" : user.role === 'guide' ? "#eff6ff" : "#fef3c7",
                                color: user.role === 'admin' ? "#166534" : user.role === 'guide' ? "#2563eb" : "#92400e"
                              }}>{user.role}</span>
                            </td>
                            <td style={tableCellStyle}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</td>
                            <td style={tableCellStyle}>
                              <span style={{
                                padding: "4px 12px",
                                borderRadius: "9999px",
                                fontSize: "12px",
                                fontWeight: "500",
                                color: user.isActive ? "#10b981" : "#ef4444",
                                background: user.isActive ? "#ecfdf5" : "#fef2f2"
                              }}>{user.isActive ? "Active" : "Blocked"}</span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Payment Oversight Tab */}
            {activeTab === "payment-oversight" && (
              <div className="mobile-card">
                <h3 style={{ margin: "0 0 20px 0", fontSize: "1.25rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                  <CreditCard size={20} style={{ color: "#2563eb" }} />
                  💳 Payment Oversight & Monitoring
                </h3>
                <div style={{ marginBottom: "16px", fontSize: "14px", color: "#64748b", lineHeight: "1.5" }}>
                  Total Revenue: <span style={{ color: "#10b981", fontWeight: 600 }}>$ {allPayments.reduce((sum, payment) => sum + payment.amount, 0).toLocaleString()}</span><br />
                  Successful Payments: <span style={{ color: "#2563eb", fontWeight: 600 }}>{allPayments.filter(p => p.paymentStatus === 'paid').length}</span><br />
                  Failed/Refunds: <span style={{ color: "#dc2626", fontWeight: 600 }}>{allPayments.filter(p => p.paymentStatus === 'failed' || p.refundStatus !== 'none').length}</span>
                </div>
                <div className="mobile-table-container">
                  <table className="mobile-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={tableHeaderStyle}>Payment ID</th>
                        <th style={tableHeaderStyle}>Tourist</th>
                        <th style={tableHeaderStyle}>Tour</th>
                        <th style={tableHeaderStyle}>Guide</th>
                        <th style={tableHeaderStyle}>Amount</th>
                        <th style={tableHeaderStyle}>Stripe Transaction</th>
                        <th style={tableHeaderStyle}>Status</th>
                        <th style={tableHeaderStyle}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allPayments.map(payment => (
                        <tr key={payment.id} style={tableRowStyle}>
                          <td style={tableCellStyle}>{payment.id}</td>
                          <td style={tableCellStyle}>{payment.tourist}</td>
                          <td style={tableCellStyle}>{payment.tour}</td>
                          <td style={tableCellStyle}>{payment.guide}</td>
                          <td style={tableCellStyle}>$ {payment.amount.toLocaleString()}</td>
                          <td style={tableCellStyle}>{payment.stripeTransactionId}</td>
                          <td style={tableCellStyle}>
                            <span style={{
                              padding: "4px 12px",
                              borderRadius: "9999px",
                              fontSize: "12px",
                              fontWeight: "500",
                              color: "white",
                              backgroundColor: payment.paymentStatus === 'paid' ? "#10b981" : 
                                             payment.paymentStatus === 'pending' ? "#f59e0b" : "#dc2626"
                            }}>
                              {payment.paymentStatus}
                            </span>
                          </td>
                          <td style={tableCellStyle}>{payment.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Announcements Tab */}
            {activeTab === "announcements" && (
              <div className="mobile-card">
                <div style={{ display: "flex", flexDirection: window.innerWidth <= 768 ? "column" : "row", justifyContent: "space-between", alignItems: window.innerWidth <= 768 ? "flex-start" : "center", marginBottom: 20, gap: window.innerWidth <= 768 ? "12px" : "0" }}>
                  <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Bell size={20} style={{ color: "#2563eb" }} />
                    📢 Platform Announcements
                  </h3>
                  <button 
                    className="mobile-action-button"
                    style={{ 
                      backgroundColor: "#2563eb", 
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      width: window.innerWidth <= 768 ? "100%" : "auto",
                      padding: "10px 20px"
                    }}
                    onClick={() => { setAnnouncementForm({}); setShowAnnouncementModal(true); }}
                  >
                    <Plus size={16} />
                    Create Announcement
                  </button>
                </div>
                <div style={{ display: "grid", gap: "20px" }}>
                  {announcements.map(announcement => (
                    <div key={announcement.id} className="mobile-application-card" style={{ 
                      borderLeft: `4px solid ${announcement.type === 'guideline' ? '#2563eb' : announcement.type === 'promotion' ? '#10b981' : '#f59e0b'}`
                    }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ display: "flex", flexDirection: window.innerWidth <= 768 ? "column" : "row", alignItems: window.innerWidth <= 768 ? "flex-start" : "center", justifyContent: "space-between", gap: "8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                            <h4 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#1e293b" }}>{announcement.title}</h4>
                            <span style={{
                              padding: "2px 8px",
                              borderRadius: "12px",
                              fontSize: "12px",
                              fontWeight: "500",
                              backgroundColor: announcement.type === 'guideline' ? "#eff6ff" : 
                                             announcement.type === 'promotion' ? "#ecfdf5" : "#fef3c7",
                              color: announcement.type === 'guideline' ? "#2563eb" : 
                                     announcement.type === 'promotion' ? "#10b981" : "#f59e0b"
                            }}>{announcement.type}</span>
                          </div>
                          <span style={{
                            padding: "4px 12px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "500",
                            backgroundColor: announcement.isActive ? "#dcfce7" : "#fef2f2",
                            color: announcement.isActive ? "#166534" : "#dc2626"
                          }}>{announcement.isActive ? "ACTIVE" : "INACTIVE"}</span>
                        </div>
                        
                        <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>{announcement.message}</p>
                        <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>Created: {announcement.createdDate}</p>
                        
                        <div style={{ display: "flex", flexDirection: window.innerWidth <= 768 ? "column" : "row", gap: "8px", marginTop: "8px" }}>
                          <button className="mobile-action-button" style={{ backgroundColor: "#3b82f6", color: "white" }}>
                            Edit
                          </button>
                          <button className="mobile-action-button" style={{ backgroundColor: announcement.isActive ? "#ef4444" : "#10b981", color: "white" }}>
                            {announcement.isActive ? "Deactivate" : "Activate"}
                          </button>
                          <button className="mobile-action-button" style={{ backgroundColor: "#dc2626", color: "white" }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Create Announcement Modal */}
                <Dialog open={showAnnouncementModal} onClose={() => setShowAnnouncementModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
                  <div className="flex items-center justify-center min-h-screen px-4">
                    <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg relative z-10 mx-4" style={{ borderTop: "6px solid #2563eb" }}>
                      <Dialog.Title className="text-xl font-bold mb-4 text-blue-700">Create Platform Announcement</Dialog.Title>
                      <form onSubmit={async e => {
                        e.preventDefault();
                        setAdminActionLoading(true);
                        // API call would go here
                        setTimeout(() => {
                          setAdminActionLoading(false);
                          setShowAnnouncementModal(false);
                          setAnnouncementForm({});
                        }, 1000);
                      }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                          <input
                            type="text"
                            value={announcementForm.title || ""}
                            onChange={e => setAnnouncementForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="Announcement Title"
                            style={{ padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "16px" }}
                            required
                          />
                          <select
                            value={announcementForm.type || ""}
                            onChange={e => setAnnouncementForm(f => ({ ...f, type: e.target.value }))}
                            style={{ padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "16px" }}
                            required
                          >
                            <option value="">Select Type</option>
                            <option value="guideline">Guideline</option>
                            <option value="promotion">Promotion</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="general">General</option>
                          </select>
                          <textarea
                            value={announcementForm.message || ""}
                            onChange={e => setAnnouncementForm(f => ({ ...f, message: e.target.value }))}
                            placeholder="Announcement Message"
                            style={{ padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", minHeight: 100, fontSize: "16px" }}
                            required
                          />
                          <button
                            type="submit"
                            className="mobile-action-button"
                            style={{ 
                              background: "#2563eb", 
                              color: "white", 
                              marginTop: 8
                            }}
                            disabled={adminActionLoading}
                          >
                            {adminActionLoading ? "Creating..." : "Create Announcement"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAnnouncementModal(false)}
                            className="mobile-action-button"
                            style={{ 
                              background: "#f1f5f9", 
                              color: "#2563eb",
                              border: "1px solid #e2e8f0"
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </Dialog>
              </div>
            )}

            {/* My Profile Tab */}
            {activeTab === "profile" && (
              <div className="mobile-card">
                <h3 style={{ 
                  margin: "0 0 20px 0", 
                  fontSize: "1.25rem", 
                  fontWeight: "600", 
                  color: "#1e293b",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <User size={20} style={{ color: "#2563eb" }} />
                  My Profile
                </h3>
                
                <div style={{ 
                  backgroundColor: "#f8fafc", 
                  border: "1px solid #e2e8f0", 
                  borderRadius: "12px", 
                  padding: "16px",
                  marginBottom: "20px"
                }}>
                  {/* Profile Avatar */}
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px", flexDirection: window.innerWidth <= 480 ? "column" : "row", textAlign: window.innerWidth <= 480 ? "center" : "left" }}>
                    <div style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      backgroundColor: "#2563eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "20px",
                      fontWeight: "600"
                    }}>
                      {profileData.name ? profileData.name.charAt(0).toUpperCase() : "A"}
                    </div>
                    <div>
                      <h4 style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: "600", color: "#1e293b" }}>
                        {profileData.name || "Admin User"}
                      </h4>
                      <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#64748b" }}>
                        {profileData.email || "admin@example.com"}
                      </p>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "16px",
                        fontSize: "12px",
                        fontWeight: "500",
                        backgroundColor: "#dcfce7",
                        color: "#166534"
                      }}>
                        Administrator
                      </span>
                    </div>
                  </div>
                  
                  {/* Profile Details */}
                  <div style={{ display: "grid", gridTemplateColumns: window.innerWidth <= 480 ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", display: "block", marginBottom: "4px" }}>
                        Phone Number
                      </label>
                      <p style={{ margin: 0, fontSize: "14px", color: "#1e293b" }}>
                        {profileData.phone || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", display: "block", marginBottom: "4px" }}>
                        Role
                      </label>
                      <p style={{ margin: 0, fontSize: "14px", color: "#1e293b" }}>
                        {profileData.role || "Administrator"}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div style={{ display: "flex", flexDirection: window.innerWidth <= 480 ? "column" : "row", gap: "12px" }}>
                  <button 
                    className="mobile-action-button"
                    style={{
                      backgroundColor: "#2563eb",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px"
                    }}
                    onClick={() => {
                      setProfileEditForm({
                        name: profileData.name || "",
                        phone: profileData.phone || ""
                      });
                      setShowProfileEditModal(true);
                    }}
                  >
                    <Edit size={16} />
                    Edit Profile
                  </button>
                  
                  <button 
                    className="mobile-action-button"
                    style={{
                      backgroundColor: "#3b82f6",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px"
                    }}
                    onClick={() => {
                      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                      setShowPasswordModal(true);
                    }}
                  >
                    <Lock size={16} />
                    Change Password
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Edit Modal */}
        {showProfileEditModal && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px"
          }}>
            <div style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              width: "100%",
              maxWidth: "400px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              borderTop: "6px solid #2563eb"
            }}>
              <h2 style={{ 
                margin: "0 0 24px 0", 
                fontSize: "1.5rem", 
                fontWeight: "700", 
                color: "#2563eb" 
              }}>Edit Profile</h2>
              <form onSubmit={async e => {
                e.preventDefault();
                setProfileActionLoading(true);
                
                try {
                  // Update admin profile using the correct API endpoint
                  const token = localStorage.getItem("token");
                  console.log("🔄 Attempting to update profile...");
                  console.log("📤 Profile data being sent:", {
                    name: profileEditForm.name,
                    phone: profileEditForm.phone
                  });
                  
                  const response = await fetch("http://localhost:5000/api/users/profile", {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                      name: profileEditForm.name,
                      phone: profileEditForm.phone
                    })
                  });
                  
                  console.log("📥 Response status:", response.status);
                  console.log("📥 Response ok:", response.ok);
                  
                  const data = await response.json();
                  console.log("📥 Response data:", data);
                  
                  if (response.ok && data.success) {
                    // Update profile data with the returned user data if available
                    if (data.data) {
                      const user = data.data;
                      setProfileData({
                        name: user.name || `${user.firstName} ${user.lastName}`.trim() || "Admin User",
                        email: user.email || profileData.email,
                        phone: user.phone || profileData.phone,
                        profilePicture: user.avatar || profileData.profilePicture,
                        role: user.role || profileData.role
                      });
                    }
                    alert("Profile updated successfully");
                    setShowProfileEditModal(false);
                  } else {
                    alert("❌ Backend error: " + (data.message || "Failed to update profile"));
                  }
                } catch (error) {
                  console.error("❌ Profile update API error:", error);
                  alert("❌ Failed to connect to backend. Please check if the server is running.");
                } finally {
                  setProfileActionLoading(false);
                }
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <input
                    type="text"
                    value={profileEditForm.name || ""}
                    onChange={e => setProfileEditForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Full Name"
                    style={{ 
                      padding: "12px", 
                      borderRadius: "8px", 
                      border: "1px solid #e2e8f0",
                      fontSize: "16px"
                    }}
                    required
                  />
                  <input
                    type="tel"
                    value={profileEditForm.phone || ""}
                    onChange={e => setProfileEditForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="Phone Number"
                    style={{ 
                      padding: "12px", 
                      borderRadius: "8px", 
                      border: "1px solid #e2e8f0",
                      fontSize: "16px"
                    }}
                  />
                  <button
                    type="submit"
                    className="mobile-action-button"
                    style={{ 
                      background: "#2563eb", 
                      color: "white", 
                      marginTop: "8px"
                    }}
                    disabled={profileActionLoading}
                  >
                    {profileActionLoading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProfileEditModal(false)}
                    className="mobile-action-button"
                    style={{ 
                      background: "#f1f5f9", 
                      color: "#2563eb",
                      border: "1px solid #e2e8f0"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px"
          }}>
            <div style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              width: "100%",
              maxWidth: "400px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              borderTop: "6px solid #3b82f6"
            }}>
              <h2 style={{ 
                margin: "0 0 24px 0", 
                fontSize: "1.5rem", 
                fontWeight: "700", 
                color: "#3b82f6" 
              }}>Change Password</h2>
              <form onSubmit={async e => {
                e.preventDefault();
                
                // Validate passwords match
                if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                  alert("New passwords don't match!");
                  return;
                }
                
                if (passwordForm.newPassword.length < 6) {
                  alert("Password must be at least 6 characters long!");
                  return;
                }
                
                setPasswordActionLoading(true);
                
                try {
                  // Change password using the correct API endpoint
                  const token = localStorage.getItem("token");
                  console.log("🔄 Attempting to change password...");
                  
                  const response = await fetch("http://localhost:5000/api/users/password", {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                      currentPassword: passwordForm.currentPassword,
                      newPassword: passwordForm.newPassword
                    })
                  });
                  
                  console.log("📥 Password change response status:", response.status);
                  console.log("📥 Password change response ok:", response.ok);
                  
                  const data = await response.json();
                  console.log("📥 Password change response data:", data);
                  
                  if (response.ok && data.success) {
                    alert("Password changed successfully!");
                    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                    setShowPasswordModal(false);
                  } else {
                    // Log full error details for debugging
                    console.error("Password change failed:", {
                      status: response.status,
                      statusText: response.statusText,
                      data: data
                    });
                    
                    // Handle specific error messages
                    let errorMessage = data.message || "Failed to change password";
                    if (response.status === 400) {
                      if (errorMessage.includes("Current password is incorrect")) {
                        errorMessage = "Current password is incorrect. Please try again.";
                      } else if (errorMessage.includes("required")) {
                        errorMessage = "Please fill in all password fields.";
                      }
                    } else if (response.status === 404) {
                      errorMessage = "User not found. Please try logging in again.";
                    } else if (response.status === 500) {
                      errorMessage = "Server error. Please try again later.";
                    }
                    alert("❌ " + errorMessage);
                  }
                } catch (error) {
                  console.error("❌ Password change API error:", error);
                  alert("❌ Failed to connect to backend. Please check if the server is running.");
                } finally {
                  setPasswordActionLoading(false);
                }
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))}
                    placeholder="Current Password"
                    style={{ 
                      padding: "12px", 
                      borderRadius: "8px", 
                      border: "1px solid #e2e8f0",
                      fontSize: "16px"
                    }}
                    required
                  />
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                    placeholder="New Password (min 6 characters)"
                    style={{ 
                      padding: "12px", 
                      borderRadius: "8px", 
                      border: "1px solid #e2e8f0",
                      fontSize: "16px"
                    }}
                    required
                    minLength="6"
                  />
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    placeholder="Confirm New Password"
                    style={{ 
                      padding: "12px", 
                      borderRadius: "8px", 
                      border: "1px solid #e2e8f0",
                      fontSize: "16px"
                    }}
                    required
                    minLength="6"
                  />
                  <button
                    type="submit"
                    className="mobile-action-button"
                    style={{ 
                      background: "#3b82f6", 
                      color: "white", 
                      marginTop: "8px"
                    }}
                    disabled={passwordActionLoading}
                  >
                    {passwordActionLoading ? "Changing..." : "Change Password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowPasswordModal(false); setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); }}
                    className="mobile-action-button"
                    style={{ 
                      background: "#f1f5f9", 
                      color: "#3b82f6",
                      border: "1px solid #e2e8f0"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Destination Details Modal */}
      <DestinationModal 
        isOpen={showDestinationModal}
        onClose={() => setShowDestinationModal(false)}
        destination={selectedDestination}
      />

      {/* Add CSS Animations */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
}

const tableHeaderStyle = {
  padding: "12px 16px",
  textAlign: "left",
  backgroundColor: "#f1f5f9",
  color: "#64748b",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
}

const tableRowStyle = {
  borderBottom: "1px solid #e2e8f0",
}

const tableCellStyle = {
  padding: "12px 16px",
  fontSize: "14px",
  color: "#334155",
}

const actionButtonStyle = {
  background: "none",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  padding: "6px",
  cursor: "pointer",
  marginRight: "4px",
  color: "#64748b",
}

const addButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "10px 16px",
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontWeight: "500",
  cursor: "pointer",
}

export default AdminPanel