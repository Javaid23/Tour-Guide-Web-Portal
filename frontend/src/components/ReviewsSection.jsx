"use client"

import { useState, useEffect } from "react"
import { Star, ThumbsUp, Calendar, Send, Award } from "lucide-react"
import { useAuth } from "../hooks/useAuth.tsx"
import { reviewAPI } from "../services/api.js"

const ReviewsSection = ({ tourId }) => {
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "",
    travelDate: "",
  })
  const { isAuthenticated, user } = useAuth()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchReviews()
    // eslint-disable-next-line
  }, [tourId])

  const fetchReviews = async () => {
    try {
      console.log("🔍 Fetching reviews for tour ID:", tourId)
      setLoading(true)
      const data = await reviewAPI.getTourReviews(tourId)
      console.log("✅ Reviews API response:", data)
      
      // Ensure we always set an array
      if (Array.isArray(data)) {
        setReviews(data)
      } else if (data && Array.isArray(data.reviews)) {
        setReviews(data.reviews)
      } else if (data && Array.isArray(data.data)) {
        setReviews(data.data)
      } else {
        console.warn("⚠️ Reviews data is not an array:", data)
        setReviews([])
      }
      
      setLoading(false)
    } catch (err) {
      console.error('❌ Error fetching reviews:', err)
      setReviews([]) // Ensure reviews is always an array
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setSubmitting(true)
    
    console.log("🔄 Submitting review:", { tourId, newReview, user })
    console.log("🔑 Authentication status:", { isAuthenticated, user })
    console.log("🔑 Token in localStorage:", localStorage.getItem("token") ? "EXISTS" : "MISSING")
    
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      setError("Please log in to submit a review");
      setSubmitting(false);
      return;
    }
    
    // Validation
    if (newReview.comment.length < 10) {
      setError("Comment must be at least 10 characters long");
      setSubmitting(false);
      return;
    }
    
    if (!newReview.travelDate) {
      setError("Please select when you traveled");
      setSubmitting(false);
      return;
    }
    
    // Validate travel date is not in the future
    const travelDate = new Date(newReview.travelDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today
    
    if (travelDate > today) {
      setError("Travel date cannot be in the future");
      setSubmitting(false);
      return;
    }
    
    try {
      const reviewData = {
        tour: tourId,
        rating: parseInt(newReview.rating), // Ensure it's a number
        comment: newReview.comment.trim(),
        travelDate: newReview.travelDate
      };
      
      console.log("📤 Review data being sent:", reviewData)
      
      await reviewAPI.createReview(reviewData);
      console.log("✅ Review submitted successfully")
      
      // Dispatch event to refresh profile reviews
      window.dispatchEvent(new CustomEvent('reviewCreated', { 
        detail: { tourId, reviewData } 
      }));
      
      setSuccess(true);
      setNewReview({ rating: 5, comment: "", travelDate: "" });
      fetchReviews();
      
      // Auto-close form after success
      setTimeout(() => {
        setShowReviewForm(false);
        setSuccess(false);
      }, 2000);
      
    } catch (err) {
      console.error('❌ Review submission error:', err);
      console.error('❌ Error response data:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      console.error('❌ Full error object:', JSON.stringify(err, null, 2));
      
      // More specific error messages
      if (err.response?.status === 401) {
        setError("Please log in to submit a review");
      } else if (err.response?.status === 400) {
        setError(err.response.data?.message || "Invalid review data");
      } else if (err.response?.status === 500) {
        setError("Server error - please try again later");
      } else {
        setError(err.message || "Failed to submit review");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-blue-900">Reviews</h2>
        {isAuthenticated ? (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors" onClick={() => setShowReviewForm(!showReviewForm)}>
            {showReviewForm ? "Cancel" : "Write a Review"}
          </button>
        ) : (
          <div className="text-sm text-gray-600">
            <a href="/auth" className="text-blue-600 hover:text-blue-800 font-medium">Login</a> to write a review
          </div>
        )}
      </div>
      {showReviewForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Your Rating:</span>
            {[1,2,3,4,5].map(star => (
              <button
                type="button"
                key={star}
                onClick={() => setNewReview(r => ({...r, rating: star}))}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', outline: 'none' }}
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <Star
                  size={28}
                  className={newReview.rating >= star ? "text-yellow-400" : "text-gray-300"}
                  style={{
                    transition: 'color 0.2s',
                    color: newReview.rating >= star ? '#fbbf24' : '#d1d5db',
                    filter: newReview.rating >= star ? 'drop-shadow(0 0 4px #fbbf24)' : 'none',
                    transform: newReview.rating === star ? 'scale(1.2)' : 'scale(1)'
                  }}
                />
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              When did you travel?
            </label>
            <input
              type="date"
              className="border rounded-lg p-2 w-full"
              required
              max={new Date().toISOString().split('T')[0]}
              value={newReview.travelDate}
              onChange={e => setNewReview(r => ({...r, travelDate: e.target.value}))}
            />
          </div>
          <textarea
            className="w-full border rounded-lg p-2"
            rows={3}
            required
            minLength={10}
            placeholder="Share your experience... (at least 10 characters)"
            value={newReview.comment}
            onChange={e => setNewReview(r => ({...r, comment: e.target.value}))}
          />
          <div className="text-sm text-gray-500">
            Character count: {newReview.comment.length}/1000 (minimum 10)
          </div>
          {error && <div className="text-red-600 bg-red-50 p-2 rounded border">{error}</div>}
          {success && <div className="text-green-600 bg-green-50 p-2 rounded border">Review submitted successfully!</div>}
          <div className="flex gap-2">
            <button 
              type="submit" 
              disabled={submitting || newReview.comment.length < 10}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button 
              type="button" 
              onClick={() => setShowReviewForm(false)}
              disabled={submitting}
              className="bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {loading ? (
        <div>Loading reviews...</div>
      ) : (
        <ul className="space-y-4">
          {(!reviews || !Array.isArray(reviews) || reviews.length === 0) && (
            <li className="text-gray-500">No reviews yet.</li>
          )}
          {Array.isArray(reviews) && reviews.map((r, i) => (
            <li key={r._id || i} className="border-b pb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold">{r.user?.name || "Anonymous"}</span>
                <span className="flex items-center text-yellow-500">{[...Array(r.rating)].map((_,i) => <Star key={i} size={16} />)}</span>
                <span className="text-gray-400 text-xs ml-2">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}</span>
              </div>
              <div>{r.comment}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ReviewsSection
