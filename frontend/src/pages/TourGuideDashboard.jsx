import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  UserCircle, Mail, Phone, Calendar, Star, CreditCard, Shield, Bell, Trash2, MapPin, Clock, CheckCircle, XCircle, Eye, Edit, AlertTriangle, Download, LogOut, Users, Settings, DollarSign
} from 'lucide-react';

const TourGuideDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [guide, setGuide] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [availability, setAvailability] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Guide profile
      const profileRes = await fetch('/api/guide/profile', { headers });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setGuide(profileData.guide);
      }

      // Bookings
      const bookingsRes = await fetch('/api/guide/bookings', { headers });
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData.bookings || []);
      }

      // Reviews
      const reviewsRes = await fetch('/api/guide/reviews', { headers });
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData.reviews || []);
      }

      // Earnings (mocked for now)
      setEarnings([]); // Implement if you have an endpoint

      // Availability
      const availabilityRes = await fetch('/api/guide/availability', { headers });
      if (availabilityRes.ok) {
        const availabilityData = await availabilityRes.json();
        setAvailability(availabilityData.availability || {});
      }

      // Notifications
      const notificationsRes = await fetch('/api/guide/notifications', { headers });
      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json();
        setNotifications(notificationsData.notifications || []);
      }
    } catch (e) {
      setMessage('Failed to load guide data');
    } finally {
      setLoading(false);
    }
  };

  // ...existing code...

  if (loading) {
    return <div className="text-center py-20">Loading...</div>;
  }


  const tabs = [
    { id: 'personal', name: 'Personal Info', icon: UserCircle },
    { id: 'bookings', name: 'Assigned Bookings', icon: Calendar },
    { id: 'reviews', name: 'Reviews', icon: Star },
    { id: 'earnings', name: 'Earnings', icon: DollarSign },
    { id: 'availability', name: 'Availability', icon: Clock },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            {guide?.profilePhoto && (
              <img src={`/uploads/guides/${guide.profilePhoto}`} alt="Profile" className="w-16 h-16 rounded-full object-cover border-4 border-blue-200" />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{guide?.firstName} {guide?.lastName || ''}</h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Tour Guide Account
              </p>
              <p className="text-sm text-gray-500">{guide?.email}</p>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 overflow-x-auto p-4">
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

          {/* Personal Info Tab */}
          {activeTab === 'personal' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <UserCircle className="text-blue-500" />
                Personal Information
              </h2>
              {guide && (
                <div className="space-y-6 max-w-lg">
                  <div>
                    <label className="block mb-2 font-medium text-gray-800">Full Name</label>
                    <input value={guide.firstName + ' ' + (guide.lastName || '')} disabled className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg bg-gray-100 text-gray-500" />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-gray-800">Email Address</label>
                    <input value={guide.email} disabled className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg bg-gray-100 text-gray-500" />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-gray-800">Phone Number</label>
                    <input value={guide.phone} disabled className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg bg-gray-100 text-gray-500" />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-gray-800">Languages</label>
                    <input value={guide.languages?.join(', ')} disabled className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg bg-gray-100 text-gray-500" />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-gray-800">Specializations</label>
                    <input value={guide.specializations?.join(', ')} disabled className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg bg-gray-100 text-gray-500" />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-gray-800">Preferred Regions</label>
                    <input value={guide.preferredRegions?.join(', ')} disabled className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg bg-gray-100 text-gray-500" />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-gray-800">Hourly Rate</label>
                    <input value={guide.hourlyRate ? `PKR ${guide.hourlyRate}` : ''} disabled className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg bg-gray-100 text-gray-500" />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-gray-800">Status</label>
                    <div className={`p-3 rounded-lg border ${guide.status === 'approved' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                      <span className={`font-medium ${guide.status === 'approved' ? 'text-green-700' : 'text-yellow-700'}`}>{guide.status === 'approved' ? 'Active Guide' : guide.status}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Assigned Bookings Tab */}
          {activeTab === 'bookings' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="text-blue-500" />
                Assigned Bookings ({bookings.length})
              </h2>
              {bookings.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No bookings assigned yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking, index) => (
                    <div key={booking._id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{booking.tour?.title || `Booking #${index + 1}`}</h3>
                          <p className="text-gray-600 flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {booking.tour?.location || 'Location TBA'}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <strong>Date:</strong> {booking.tourDate ? new Date(booking.tourDate).toLocaleDateString() : 'TBA'}
                        </div>
                        <div>
                          <strong>Tourist:</strong> {booking.user?.firstName} {booking.user?.lastName}
                        </div>
                        <div>
                          <strong>Group Size:</strong> {booking.groupSize}
                        </div>
                        <div>
                          <strong>Total Amount:</strong> PKR {booking.totalAmount?.toLocaleString()}
                        </div>
                      </div>
                      {booking.specialRequests && (
                        <div className="mt-2 text-sm text-gray-600">
                          <strong>Special Requests:</strong> {booking.specialRequests}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Star className="text-blue-500" />
                Reviews
              </h2>
              {reviews.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No reviews yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{review.tour?.title || 'Tour Review'}</h3>
                          <p className="text-gray-600">Tourist: {review.user?.firstName} {review.user?.lastName}</p>
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
                        <span className="px-2 py-1 rounded bg-green-100 text-green-700">Approved</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Earnings Tab */}
          {activeTab === 'earnings' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <DollarSign className="text-blue-500" />
                Earnings
              </h2>
              <div className="text-center py-12 text-gray-500">
                <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Earnings summary coming soon</p>
              </div>
            </div>
          )}

          {/* Availability Tab */}
          {activeTab === 'availability' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Clock className="text-blue-500" />
                Availability
              </h2>
              <div className="text-center py-12 text-gray-500">
                <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Availability calendar coming soon</p>
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
                    <div key={notification._id} className={`border rounded-lg p-4 ${notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{notification.title}</h3>
                        <span className="text-sm text-gray-500">{new Date(notification.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-700">{notification.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
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
                  <button onClick={() => setShowPasswordModal(true)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Change Password</button>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Two-Factor Authentication</h3>
                  <p className="text-gray-600 mb-3">Add an extra layer of security to your account</p>
                  <button className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">Enable 2FA (Coming Soon)</button>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Active Sessions</h3>
                  <p className="text-gray-600 mb-3">Log out of all devices</p>
                  <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"><LogOut className="w-4 h-4" />Log Out All Sessions</button>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Settings className="text-blue-500" />
                Account Settings
              </h2>
              <div className="space-y-4">
                <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notification Preferences</p>
                      <p className="text-sm text-gray-600">Manage email and push notifications</p>
                    </div>
                    <Bell className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
                <button onClick={logout} className="w-full text-left p-4 border border-red-200 rounded-lg hover:bg-red-50 text-red-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Logout</p>
                      <p className="text-sm">Sign out of your account</p>
                    </div>
                    <XCircle className="w-5 h-5" />
                  </div>
                </button>
              </div>
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
          <button onClick={() => setShowDeleteModal(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default TourGuideDashboard;
