import React, { memo, useState, useEffect } from 'react';
import { ArrowRight, Star, Users, Camera, Mountain, Award, Shield, Heart, CheckCircle, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { tourAPI as destinationAPI } from '../services/api';

// Memoized destination card component for performance
const DestinationCard = memo(({ destination, index }) => (
  <div 
    className="modern-card group hover:scale-105 transition-all duration-500"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div className="relative overflow-hidden rounded-2xl">
      <img 
        src={destination.image} 
        alt={destination.alt || destination.name}
        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      <div className="absolute bottom-6 left-6 text-white">
        <h4 className="text-xl font-bold mb-1">{destination.name}</h4>
        <div className="flex items-center text-sm opacity-90">
          <Camera className="w-4 h-4 mr-1" />
          <span>Featured Destination</span>
        </div>
      </div>
      <div className="absolute top-4 right-4">
        <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
          <Heart className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
    <div className="p-6">
      <p className="text-gray-600 leading-relaxed">
        {destination.description}
      </p>
    </div>
  </div>
));

DestinationCard.displayName = 'DestinationCard';

/**
 * Home Page Component
 * Landing page showcasing Pakistan's beauty and tour offerings
 */
import { useLocation } from "react-router-dom"
const Home = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [location]);
  // State for featured destinations
  const [featuredDestinations, setFeaturedDestinations] = useState([
    {
      name: 'Badshahi Mosque, Lahore',
      image: '/images/featured/lahore.jpg',
      description: 'Magnificent Mughal architecture in Pakistan\'s cultural capital',
      alt: 'Badshahi Mosque, Lahore'
    },
    {
      name: 'Skardu Valley',
      image: '/images/featured/skardu.jpg',
      description: 'Paradise lakes and dramatic mountain landscapes',
      alt: 'Skardu Valley'
    },
    {
      name: 'Hunza Valley',
      image: '/images/featured/hunza.jpg',
      description: 'Breathtaking mountain landscapes and traditional Hunza culture',
      alt: 'Hunza Valley'
    }
  ]);

  // Fetch featured destinations from API (fallback to hardcoded if API fails)
  useEffect(() => {
    const fetchFeaturedDestinations = async () => {
      try {
        console.log('🔄 Attempting to fetch featured destinations from API...');
        
        const response = await destinationAPI.getCompleteMetadata();
        console.log('📡 API Response:', response);
        
        if (response.success && response.data.featuredDestinations?.forHomePage) {
          const apiDestinations = response.data.featuredDestinations.forHomePage.map(dest => ({
            name: dest.name,
            image: dest.imageUrl,
            description: dest.description,
            slug: dest.tourSlug,
            alt: dest.alt
          }));
          
          console.log(' Using API data for featured destinations:', apiDestinations);
          setFeaturedDestinations(apiDestinations);
        } else {
          console.log('API response invalid, using hardcoded featured destinations');
        }
      } catch (error) {
        console.log(' API failed, using hardcoded featured destinations:', error.message);
        // Keep the hardcoded Wikipedia images that are already set in state
      }
    };

    fetchFeaturedDestinations();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section
        className="home-hero relative min-h-screen flex items-center justify-center overflow-hidden pt-24 md:pt-32"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.95) 0%, rgba(59, 130, 246, 0.9) 100%), url("https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg") center/cover',
          padding: '120px 0 80px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Hero Image Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage: 'url("https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg")'
          }}
        ></div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
            Discover Pakistan's
            <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              Hidden Treasures
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-4xl mx-auto leading-relaxed">
            From the majestic peaks of the Himalayas to the ancient streets of Lahore, 
            embark on a journey through Pakistan's breathtaking landscapes and rich cultural heritage.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/tours" className="modern-btn modern-btn-primary group">
              <span>Explore Tours</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/destinations" className="modern-btn modern-btn-secondary group">
              <Camera className="w-5 h-5 mr-2" />
              <span>View Destinations</span>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10 mb-2 relative z-20">
            <div className="glass-card p-6 text-center rounded-full flex flex-col items-center justify-center">
              <MapPin className="w-8 h-8 mb-2 text-blue-400" />
              <h3 className="text-xl font-bold mb-0">150+ Destinations</h3>
            </div>
            <div className="glass-card p-6 text-center rounded-full flex flex-col items-center justify-center">
              <Users className="w-8 h-8 mb-2 text-blue-400" />
              <h3 className="text-xl font-bold mb-0">1000+ Happy Travelers</h3>
            </div>
            <div className="glass-card p-6 text-center rounded-full flex flex-col items-center justify-center">
              <Award className="w-8 h-8 mb-2 text-blue-400" />
              <h3 className="text-xl font-bold mb-0">10 Years Experience</h3>
            </div>
            <div className="glass-card p-6 text-center rounded-full flex flex-col items-center justify-center">
              <Shield className="w-8 h-8 mb-2 text-blue-400" />
              <h3 className="text-xl font-bold mb-0">24/7 Support</h3>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="relative py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-5 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-semibold mb-6">
              <Camera className="w-4 h-4 mr-2" />
              Featured Destinations 
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ marginTop: '1.5rem', marginBottom: '1.5rem', position: 'relative', zIndex: 2 }}>
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Discover Pakistan's</span>
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Most Stunning Locations
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From mountain peaks to ancient heritage sites, explore the diverse beauty of Pakistan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {featuredDestinations.map((destination, index) => (
              <DestinationCard 
                key={`destination-${index}`}
                destination={destination}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      
      <section
        className="relative py-20 min-h-[60vh] flex items-center justify-center overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, rgba(30, 64, 175, 0.95) 0%, rgba(59, 130, 246, 0.9) 100%), url(https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg) center/cover',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Hero Image Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage:
              'url(https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg)',
          }}
        ></div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Why Choose
              <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Tour Guide
              </span>
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Your gateway to extraordinary experiences across Pakistan with unmatched expertise and dedication
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card group p-8 text-center hover:scale-105 transition-all duration-500 rounded-full flex flex-col items-center justify-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                <Star className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Expert Guides</h3>
              <p className="text-blue-200 leading-relaxed">
                Local experts with deep knowledge of Pakistan's culture, history, and hidden gems
              </p>
            </div>

            <div className="glass-card group p-8 text-center hover:scale-105 transition-all duration-500 rounded-full flex flex-col items-center justify-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Small Groups</h3>
              <p className="text-blue-200 leading-relaxed">
                Intimate group sizes for personalized attention and authentic experiences
              </p>
            </div>

            <div className="glass-card group p-8 text-center hover:scale-105 transition-all duration-500 rounded-full flex flex-col items-center justify-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-400 to-pink-500 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                <Mountain className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Unique Adventures</h3>
              <p className="text-blue-200 leading-relaxed">
                Access to remote locations and exclusive experiences off the beaten path
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section
        className="relative py-20 min-h-[50vh] flex items-center justify-center overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, rgba(30, 64, 175, 0.95) 0%, rgba(59, 130, 246, 0.9) 100%), url(https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg) center/cover',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage:
              'url(https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg)',
          }}
        ></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-400 to-red-500 rounded-3xl mb-8 shadow-2xl">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready for Your
            <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              Adventure?
            </span>
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Start planning your unforgettable journey through Pakistan today and create memories that will last a lifetime
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/tours" className="modern-btn modern-btn-white group">
              <span>Book Your Tour Now</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/destinations" className="modern-btn modern-btn-outline-white">
              <span>Explore Destinations</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default memo(Home);
