import { memo } from 'react'
import { Calendar, Users, Star, MapPin, ArrowRight, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

const TourCard = memo(({ tour }) => {
  console.log("🏷️ TourCard rendering tour:", { id: tour._id, title: tour.title || tour.name })
  
  let tourImg = null;
  if (tour.images && tour.images[0]) {
    if (typeof tour.images[0] === 'string') tourImg = tour.images[0];
    else if (tour.images[0] && typeof tour.images[0] === 'object' && tour.images[0].url) tourImg = tour.images[0].url;
  }
  return (
    <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col w-full max-w-xs mx-auto border border-slate-200 group">
      {/* Tour Image */}
      <div className="relative w-full h-48 rounded-t-2xl overflow-hidden">
        {tourImg ? (
          <img
            src={tourImg}
            alt={tour.name || tour.title || 'Tour'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow">{tour.category || 'Tour'}</div>
      </div>
      {/* Tour Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="text-lg font-bold text-blue-800 truncate">{tour.name || tour.title || 'Untitled Tour'}</h3>
        <p className="text-slate-600 text-sm line-clamp-2 min-h-[38px]">{tour.description?.substring(0, 90) || 'No description.'}</p>
        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
          <span className="flex items-center gap-1"><Calendar size={14}/> {tour.duration?.days || 'N/A'}d</span>
          <span className="flex items-center gap-1"><Users size={14}/> {tour.maxGroupSize || 'N/A'}</span>
          <span className="flex items-center gap-1"><Star size={14} className="text-yellow-400"/> {tour.rating?.average?.toFixed(1) || 'New'}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-xl font-bold text-blue-700">${tour.price?.toLocaleString() || 'Contact'}</div>
          <Link 
            to={tour._id ? `/tours/${tour._id}` : '#'}
            className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-4 py-2 rounded-xl font-semibold text-sm shadow flex items-center gap-2 transition-all"
            onClick={e => {
              console.log("🔗 Tour card clicked:", { id: tour._id, title: tour.title || tour.name })
              if (!tour._id) {
                console.error("❌ No tour._id found:", tour)
                e.preventDefault();
                alert('No tour id found.');
              } else {
                console.log("✅ Navigating to tour details:", `/tours/${tour._id}`)
              }
            }}
          >
            View Details <ArrowRight size={16}/>
          </Link>
        </div>
      </div>
    </div>
  )
})

TourCard.displayName = 'TourCard'

export default TourCard
