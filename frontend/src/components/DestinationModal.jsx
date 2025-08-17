import React, { useState } from "react";
import { Star, MapPin, Clock, Users } from "lucide-react";

const DestinationModal = ({ isOpen, onClose, destination }) => {
  // Debug: log the destination object
  console.log('DestinationModal destination:', destination);

  // State to track which image path to try
  const [imgIdx, setImgIdx] = useState(0);
  const [imgError, setImgError] = useState(false);
  if (!isOpen || !destination) return null;

  // Helper to get region folder (preserve case and spaces)
  const getRegionFolder = () => {
    // Map common province/region names to folder names
    const regionRaw = destination.province || destination.region || '';
    if (!regionRaw) return 'other';
    // Add mappings as needed
    const regionMap = {
      'kpk': 'kp',
      'khyber pakhtunkhwa': 'kp',
      'gilgit-baltistan': 'gilgit_baltistan',
      'gilgit baltistan': 'gilgit_baltistan',
      'punjab': 'punjab',
      'sindh': 'sindh',
      'balochistan': 'balochistan',
      'islamabad': 'islamabad',
      // Add more mappings as needed
    };
    const normalized = regionRaw.toString().trim().toLowerCase();
    return regionMap[normalized] || normalized || 'other';
  };

  // Helper to get image path (try all extensions)
  const getImagePaths = () => {
    if (destination.image) {
      // Debug: log the image path being used
      console.log('DestinationModal using image:', destination.image);
      return [destination.image];
    }
    // Normalization helpers
    const normalize = str =>
      (str || 'unknown')
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_\-]/g, '');
    const allRegions = [
      'punjab', 'kpk', 'gilgit-baltistan', 'balochistan', 'sindh', 'islamabad', 'azad-kashmir'
    ];
    const regionRaw = getRegionFolder() || 'other';
    const nameRaw = destination.name || 'unknown';
    const regionNorm = normalize(regionRaw);
    const nameNorm = normalize(nameRaw);
    const exts = ['jpg', 'jpeg', 'png'];
    let paths = [];
    // Try specified region first (normalized and raw)
    exts.forEach(ext => {
      paths.push(`/images/destinations/${regionNorm}/${nameNorm}.${ext}`);
      paths.push(`/images/destinations/${regionRaw}/${nameRaw}.${ext}`);
    });
    // Then try all other regions (normalized and raw)
    allRegions.forEach(region => {
      exts.forEach(ext => {
        paths.push(`/images/destinations/${region}/${nameNorm}.${ext}`);
        paths.push(`/images/destinations/${region}/${nameRaw}.${ext}`);
      });
    });
    // Debug: log all paths being tried
    console.log('DestinationModal all image paths tried:', paths);
    return paths;
  };

  const imgPaths = getImagePaths();
  // Debug: log the image paths being tried
  console.log('DestinationModal image paths tried:', imgPaths);

  // Helper for location
  const getLocation = () => {
    if (destination.destinations && destination.destinations[0] && destination.destinations[0].location) {
      const loc = destination.destinations[0].location;
      return typeof loc === 'object' ? (loc.city || loc.state || loc.address || 'Pakistan') : loc;
    } else if (destination.location) {
      const loc = destination.location;
      return typeof loc === 'object' ? (loc.city || loc.state || loc.address || 'Pakistan') : loc;
    } else if (destination.province) {
      return destination.province;
    } else {
      return 'Pakistan';
    }
  };

  // Helper for category color
  const getTypeColor = (category) => {
    switch (category) {
      case "adventure": return "#dc2626";
      case "cultural": return "#7c3aed";
      case "historical": return "#059669";
      case "nature": return "#10b981";
      case "religious": return "#d97706";
      default: return "#2563eb";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 relative z-10 overflow-hidden">
          {/* Image */}
          {!imgError ? (
            <img
              src={imgPaths[imgIdx]}
              alt={destination.name || 'Destination'}
              className="w-full h-64 object-cover rounded-t-2xl"
              style={{ objectPosition: 'center' }}
              onError={() => {
                if (imgIdx < imgPaths.length - 1) {
                  setImgIdx(imgIdx + 1);
                } else {
                  setImgError(true);
                }
              }}
            />
          ) : (
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-400 rounded-t-2xl text-lg font-semibold">
              No Image Available
            </div>
          )}
          <div className="p-6">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-2xl font-bold text-gray-800">
                {destination.name || 'Untitled Destination'}
              </h2>
              {/* Rating */}
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-base font-semibold">
                  {destination.rating?.average ? destination.rating.average.toFixed(1) : "New"}
                </span>
              </div>
            </div>
            {/* Location */}
            <div className="flex items-center text-gray-500 text-sm mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              {getLocation()}
            </div>
            {/* Category */}
            <div className="mb-2">
              <span className="inline-block px-3 py-1 rounded-full text-white text-xs font-medium" style={{ backgroundColor: getTypeColor(destination.category) }}>
                {destination.category || 'General'}
              </span>
            </div>
            {/* Description */}
            <p className="text-gray-700 mb-4">
              {destination.description || 'No description available.'}
            </p>
            {/* Trip Details */}
            <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {destination.duration?.days ? `${destination.duration.days} days` : 'TBD'}
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                Max {destination.maxGroupSize || 'N/A'}
              </div>
            </div>
            {/* Highlights */}
            {destination.highlights && destination.highlights.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {destination.highlights.slice(0, 3).map((highlight, idx) => (
                    <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium">
                      {typeof highlight === 'object' ? JSON.stringify(highlight) : highlight}
                    </span>
                  ))}
                  {destination.highlights.length > 3 && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs font-medium">
                      +{destination.highlights.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
            {/* Price */}
            <div className="mb-6">
              <span className="text-2xl font-bold text-blue-600">
                ${typeof destination.price === 'object' && destination.price?.amount 
                  ? destination.price.amount 
                  : destination.price || 'TBD'}
              </span>
              <span className="text-sm text-gray-500 ml-1">per person</span>
            </div>
            <button 
              onClick={onClose}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all w-full font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>

  );
};

export default DestinationModal;
