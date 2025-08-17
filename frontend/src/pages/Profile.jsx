import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, bookingAPI, reviewAPI, paymentAPI } from '../services/api';
import { 
  UserCircle, Mail, Phone, Calendar, Star, CreditCard, Shield, 
  Bell, Trash2, MapPin, Clock, CheckCircle, XCircle, 
  Eye, Edit, AlertTriangle, Download, LogOut, Users, Settings 
} from 'lucide-react';

// Simple Dialog component for modals
const Dialog = ({ open, onClose, children, className }) => {
  if (!open) return null;
  
  return (
    <div className={className || "fixed z-50 inset-0 overflow-y-auto"}>
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full max-h-[90vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: '', email: '', contact: '', role: 'tourist' });
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    checkUserRoleAndRedirect();
    
    // Listen for booking creation events to refresh data
    const handleBookingCreated = () => {
      console.log('New booking created, refreshing profile data...');
      fetchAllData();
    };
    
    // Listen for review creation events to refresh reviews
    const handleReviewCreated = () => {
      console.log('New review created, refreshing reviews...');
      fetchUserReviews();
    };
    
    window.addEventListener('bookingCreated', handleBookingCreated);
    window.addEventListener('reviewCreated', handleReviewCreated);
    
    // Cleanup event listeners
    return () => {
      window.removeEventListener('bookingCreated', handleBookingCreated);
      window.removeEventListener('reviewCreated', handleReviewCreated);
    };
  }, []);

  const checkUserRoleAndRedirect = async () => {
    try {
      // First, check stored user data
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.role === 'admin') {
          navigate('/admin');
          return;
        }
      }

      // If no stored user or not admin, fetch fresh data
      await fetchAllData();
    } catch (error) {
      console.error('Error checking user role:', error);
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const userRes = await userAPI.getProfile();
      const userData = userRes.data || userRes;
      
      // Check if user is admin and redirect
      if (userData.role === 'admin') {
        navigate('/admin');
        return;
      }

      // Map phone to contact for compatibility
      setUser({ 
        ...userData, 
        contact: userData.phone || userData.contact || '',
        role: userData.role || 'tourist'
      });
      
      console.log('👤 User profile loaded:', userData);
      
      // Fetch bookings
      try {
        console.log('🔍 Starting to fetch bookings...');
        console.log('Auth token exists:', !!localStorage.getItem('token'));
        
        const bookingsRes = await bookingAPI.getUserBookings();
        console.log('📋 Profile: Raw bookings response:', bookingsRes);
        console.log('📋 Profile: Response structure:', Object.keys(bookingsRes || {}));
        
        const bookingsData = bookingsRes.data?.bookings || bookingsRes.bookings || bookingsRes.data || [];
        console.log('📋 Profile: Processed bookings data:', bookingsData);
        console.log('📋 Profile: Bookings array length:', bookingsData.length);
        
        setBookings(bookingsData);
      } catch (e) {
        console.error('❌ Failed to fetch bookings:', e);
        console.error('❌ Error details:', e.response?.data);
        console.error('❌ Error status:', e.response?.status);
        setBookings([]);
      }
      
      // Fetch user's reviews
      try {
        const reviewsRes = await reviewAPI.getUserReviews();
        setReviews(reviewsRes.data || []);
      } catch (e) {
        console.error('Failed to fetch reviews:', e);
        setReviews([]);
      }

      // Fetch payment history
      try {
        const paymentsRes = await paymentAPI.getPaymentHistory();
        setPayments(paymentsRes.data || []);
      } catch (e) {
        console.error('Failed to fetch payments:', e);
        setPayments([]);
      }

      // Mock notifications for all users
      setNotifications([
        {
          id: "ANN001",
          title: "New Safety Guidelines",
          message: "All guides must follow updated COVID-19 safety protocols during tours.",
          type: "guideline",
          date: "2025-08-01",
          read: false
        },
        {
          id: "ANN002",
          title: "Summer Special Discounts",
          message: "Enjoy 20% off on all mountain tours this summer season!",
          type: "promotion",
          date: "2025-07-15",
          read: false
        }
      ]);

    } catch (e) {
      setMessage('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh only user reviews
  const fetchUserReviews = async () => {
    try {
      console.log('Fetching user reviews...');
      const reviewsRes = await reviewAPI.getUserReviews();
      setReviews(reviewsRes.data || []);
      console.log('Reviews refreshed successfully');
    } catch (e) {
      console.error('Failed to refresh reviews:', e);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      // Map contact to phone for backend compatibility
      const updateData = {
        name: user.name,
        contact: user.contact,
        phone: user.contact // Send both for compatibility
      };
      await userAPI.updateProfile(updateData);
      setMessage('Profile updated successfully!');
    } catch (e) {
      setMessage(e.message);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    try {
      await userAPI.changePassword(passwordForm);
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage('Password changed successfully!');
    } catch (e) {
      setMessage(e.message);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Set preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Upload the image
      try {
        console.log('🖼️ Uploading avatar image...');
        const response = await userAPI.uploadAvatar(file);
        console.log('✅ Avatar upload response:', response);
        
        if (response.success && response.data) {
          // Update user state with new avatar
          const avatarPath = response.data.avatar;
          console.log('🔄 New avatar path:', avatarPath);
          
          const updatedUser = {
            ...user,
            avatar: avatarPath
          };
          
          // Update localStorage immediately
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            parsedUser.avatar = avatarPath;
            localStorage.setItem('user', JSON.stringify(parsedUser));
            console.log('💾 Updated localStorage with avatar:', avatarPath);
          }
          
          // Update state
          setUser(updatedUser);
          console.log('� Updated user state:', updatedUser);
          
          // Clear the preview after upload to show server image
          setTimeout(() => {
            setProfileImagePreview(null);
            console.log('🖼️ Cleared preview, showing server image');
            console.log('🔗 Final avatar URL will be:', avatarPath.startsWith('http') ? avatarPath : `${import.meta.env.VITE_API_URL.replace('/api','')}${avatarPath}`);
            setMessage('Profile picture updated successfully!');
            
            // Force component re-render to show new image
            setUser(prev => ({ ...prev, avatarTimestamp: Date.now() }));
            
            // Also refresh user data from server to ensure consistency
            setTimeout(() => {
              fetchAllData();
            }, 500);
          }, 1500);
        } else {
          console.error('❌ Invalid response structure:', response);
          setMessage('Upload failed. Please try again.');
          setProfileImagePreview(null);
        }
      } catch (error) {
        console.error('❌ Avatar upload failed:', error);
        setMessage(`Failed to upload profile picture: ${error.message}`);
        setProfileImagePreview(null);
        setProfileImage(null);
      }
    }
  };

  const handleAccountDeletion = async () => {
    try {
      await userAPI.deleteAccount();
      setMessage('Account deletion requested successfully');
    } catch (e) {
      setMessage(e.message);
    }
  };

  // const upcomingTours = bookings.filter(booking => {
  //   const bookingDate = booking.startDate || booking.date;
  //   return bookingDate && new Date(bookingDate) > new Date() && booking.status === 'confirmed';
  // });

  if (loading) return <div className="text-center py-20">Loading...</div>;

  // If somehow an admin reaches this page, show redirect message
  if (user.role === 'admin') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <Settings className="w-16 h-16 mx-auto mb-4 text-blue-500" />
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Admin Account Detected</h2>
          <p className="text-gray-600 mb-6">
            You have admin privileges. Please use the Admin Panel to manage your account and the platform.
          </p>
          <button 
            onClick={() => navigate('/admin')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Admin Panel
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'personal', name: 'Personal Info', icon: UserCircle },
    { id: 'bookings', name: 'My Bookings', icon: Calendar },
    { id: 'reviews', name: 'My Reviews', icon: Star },
    { id: 'payments', name: 'Payment History', icon: CreditCard },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell }
  ];

  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-6 px-4" style={{overflowX: 'hidden'}}>
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.name || 'Welcome'}</h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                {user.role === 'guide' ? 'Tour Guide' : user.role === 'admin' ? 'Administrator' : 'Tourist'} Account
              </p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav
              className="flex space-x-8 overflow-x-auto p-4 hide-scrollbar"
              style={{ scrollbarWidth: 'none' }}
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.includes('success') || message.includes('updated') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <UserCircle className="text-blue-500" />
                Personal Information
              </h2>
              <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-lg">
                <div>
                  <label className="block mb-2 font-medium text-gray-800">Full Name</label>
                  <div className="relative">
                    <input 
                      name="name" 
                      value={user.name || ''} 
                      onChange={(e) => setUser({...user, name: e.target.value})}
                      className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                      placeholder="Enter your full name"
                    />
                    <UserCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                </div>
                
                <div>
                  <label className="block mb-2 font-medium text-gray-800">Email Address</label>
                  <div className="relative">
                    <input 
                      name="email" 
                      value={user.email || ''} 
                      disabled 
                      className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg bg-gray-100 text-gray-500"
                    />
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Email cannot be changed for security reasons</p>
                </div>
                
                <div>
                  <label className="block mb-2 font-medium text-gray-800">Phone Number</label>
                  <div className="relative">
                    <input 
                      name="contact" 
                      value={user.contact || ''} 
                      onChange={(e) => setUser({...user, contact: e.target.value})}
                      className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                      placeholder="Enter your phone number"
                    />
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                </div>
                
                <div>
                  <label className="block mb-2 font-medium text-gray-800">Account Role</label>
                  <div className={`p-3 rounded-lg border ${
                    user.role === 'admin' ? 'bg-red-50 border-red-200' :
                    user.role === 'guide' ? 'bg-green-50 border-green-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <span className={`font-medium ${
                      user.role === 'admin' ? 'text-red-700' :
                      user.role === 'guide' ? 'text-green-700' :
                      'text-blue-700'
                    }`}>
                      {user.role === 'guide' ? 'Tour Guide' : user.role === 'admin' ? 'Administrator' : 'Tourist'}
                    </span>
                  </div>
                </div>
                
                <button type="submit" className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all">
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* My Bookings Tab */}
          {activeTab === 'bookings' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="text-blue-500" />
                My Bookings ({bookings.length})
              </h2>
              
              {bookings.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No bookings found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking, index) => (
                    <div key={booking._id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {booking.tour?.name || booking.destination?.name || `Booking #${index + 1}`}
                          </h3>
                          <p className="text-gray-600 flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {(() => {
                              const location = booking.tour?.location || booking.destination?.location;
                              if (typeof location === 'object' && location) {
                                return `${location.city || ''}, ${location.state || ''}, ${location.country || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',');
                              }
                              return location || booking.customerInfo?.contactPerson || 'Location TBA';
                            })()}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <strong>Date:</strong> {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'TBA'}
                        </div>
                        <div>
                          <strong>Payment:</strong> 
                          <span className={`ml-1 ${booking.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                            {booking.paymentStatus || 'pending'}
                          </span>
                        </div>
                        <div>
                          <strong>Amount:</strong> ${booking.totalPrice || booking.amount || '0'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* My Reviews Tab */}
          {activeTab === 'reviews' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Star className="text-blue-500" />
                My Reviews
              </h2>
              {reviews.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No reviews submitted yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{review.tour?.name || 'Tour Review'}</h3>
                          <p className="text-gray-600">Guide: {review.guide?.name || 'Unknown'}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3">{review.comment}</p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Submitted on {new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Payment History Tab */}
          {activeTab === 'payments' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="text-blue-500" />
                Payment History
              </h2>
              {payments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No payment history</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{payment.tourName}</h3>
                          <p className="text-gray-600">Transaction ID: {payment.transactionId}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">${payment.amount} {payment.currency}</p>
                          <span className={`px-2 py-1 rounded text-sm ${
                            payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                            payment.status === 'failed' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {payment.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Paid on {new Date(payment.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Security Settings Tab */}
          {activeTab === 'security' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Shield className="text-blue-500" />
                Security Settings
              </h2>
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Password</h3>
                  <p className="text-gray-600 mb-3">Change your account password</p>
                  <button 
                    onClick={() => setShowPasswordModal(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Change Password
                  </button>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Two-Factor Authentication</h3>
                  <p className="text-gray-600 mb-3">Add an extra layer of security to your account</p>
                  <button className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                    Enable 2FA (Coming Soon)
                  </button>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Active Sessions</h3>
                  <p className="text-gray-600 mb-3">Log out of all devices</p>
                  <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Log Out All Sessions
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Bell className="text-blue-500" />
                Notifications
              </h2>
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className={`border rounded-lg p-4 ${notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{notification.title}</h3>
                        <span className="text-sm text-gray-500">{new Date(notification.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-700">{notification.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Delete Account Section */}
        <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </h3>
          <p className="text-red-700 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete My Account
          </button>
        </div>
      </div>

      {/* Password Change Modal */}
      <Dialog open={showPasswordModal} onClose={() => setShowPasswordModal(false)}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Current Password</label>
              <input 
                type="password" 
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">New Password</label>
              <input 
                type="password" 
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Confirm New Password</label>
              <input 
                type="password" 
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div className="flex gap-2 pt-4">
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Change Password
              </button>
              <button 
                type="button" 
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Delete Account Modal */}
      <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-red-800">Delete Account</h3>
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
          </p>
          <div className="flex gap-2">
            <button 
              onClick={handleAccountDeletion}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Yes, Delete My Account
            </button>
            <button 
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Profile;
