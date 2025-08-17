import React, { useState } from 'react';
import { Star, Award, Users, Globe, Shield, Heart, ArrowRight, CheckCircle, MapPin } from 'lucide-react';
import TourGuideRegistrationModal from '../components/TourGuideRegistrationModal';

/**
 * Partners Page Component - Modernized
 * Showcases travel partners, certifications, and testimonials with modern design
 */
import { useEffect } from "react"
import { useLocation } from "react-router-dom"
const Partners = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [location]);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  
  // Partner companies data
  const partners = [
    {
      id: 1,
      name: 'Mountain Adventures Co.',
      logo: 'https://images.pexels.com/photos/1586298/pexels-photo-1586298.jpeg',
      type: 'Adventure Tours',
      description: 'Specializing in high-altitude trekking and mountaineering expeditions across the Karakoram and Hindukush ranges.',
      experience: '8+ years',
      rating: 4.9
    },
    {
      id: 2,
      name: 'Heritage Walks Pakistan',
      logo: 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg',
      type: 'Cultural Tours',
      description: 'Expert guides for historical and cultural tours throughout Pakistan\'s UNESCO World Heritage sites.',
      experience: '7+ years',
      rating: 4.8
    },
    {
      id: 3,
      name: 'Northern Hospitality',
      logo: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg',
      type: 'Accommodation',
      description: 'Premium accommodation provider with eco-friendly lodges and guesthouses in Northern Pakistan.',
      experience: '10+ years',
      rating: 4.7
    },
    {
      id: 4,
      name: 'Silk Route Transport',
      logo: 'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg',
      type: 'Transportation',
      description: 'Reliable transportation services with experienced drivers familiar with mountain roads and routes.',
      experience: '9+ years',
      rating: 4.9
    }
  ];

  // Certifications and awards
  const certifications = [
    {
      title: 'Pakistan Tourism Board',
      description: 'Licensed tour operator',
      icon: Award
    },
    {
      title: 'International Tour Guide',
      description: 'Certified guides',
      icon: Users
    },
    {
      title: 'Eco Tourism Certified',
      description: 'Sustainable travel practices',
      icon: Globe
    },
    {
      title: 'Safety Standards',
      description: 'International safety protocols',
      icon: Shield
    }
  ];

  // Client testimonials
  const testimonials = [
    {
      id: 1,
      name: 'Ahsan Ali',
      country: 'Pakistan',
      image: '/images/testimonials/Ahsan ali jagga.jpg',
      rating: 5,
      text: 'The most incredible journey of my life! The team\'s expertise and local connections made our Hunza Valley experience unforgettable.',
      tour: 'Hunza Valley Discovery'
    },
    {
      id: 2,
      name: 'Muhammad Luqmn',
      country: 'Pakistan',
      image: '/images/testimonials/luqman.jpg',
      rating: 5,
      text: 'Professional, safe, and truly authentic. Our K2 base camp trek was challenging but incredibly rewarding thanks to the excellent guidance.',
      tour: 'K2 Base Camp Trek'
    },
    {
      id: 3,
      name: 'Shakeel Khan',
      country: 'Germany',
      image: '/images/testimonials/shakeel.jpg',
      rating: 5,
      text: 'Beautiful cultural immersion in Lahore. The heritage tour opened my eyes to Pakistan\'s rich history and warm hospitality.',
      tour: 'Lahore Heritage Tour'
    }
  ];

  return (
    <div className="partners-page">
      {/* Hero Section */}
  <section className="partners-hero relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
          {/* Removed hero-badge '🤝 Trusted Partners' from hero section */}
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight">
            Our Trusted
            <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              Travel Partners
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-4xl mx-auto leading-relaxed">
            Collaborating with the finest local operators, accommodations, and service providers 
            to deliver exceptional travel experiences across Pakistan.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button className="modern-btn modern-btn-primary group">
              <span>Meet Our Partners</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => setIsRegistrationModalOpen(true)}
              className="modern-btn modern-btn-secondary"
            >
              <span>Join Our Network</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16">
            <div className="bg-white/10 backdrop-blur-md p-6 text-center rounded-2xl border border-white/20 shadow-xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-center mb-3">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">50+ Partners</h3>
              <p className="text-blue-200 text-sm">Trusted collaborators</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 text-center rounded-2xl border border-white/20 shadow-xl hover:scale-105 transition-all duration-300">
              <div className="text-3xl mb-3">🏔️</div>
              <h3 className="text-xl font-bold mb-2">10+ Years</h3>
              <p className="text-blue-200 text-sm">Combined experience</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 text-center rounded-2xl border border-white/20 shadow-xl hover:scale-105 transition-all duration-300">
              <div className="text-3xl mb-3">🌟</div>
              <h3 className="text-xl font-bold mb-2">4.8 Rating</h3>
              <p className="text-blue-200 text-sm">Average partner rating</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 text-center rounded-2xl border border-white/20 shadow-xl hover:scale-105 transition-all duration-300">
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="text-xl font-bold mb-2">Fully Licensed</h3>
              <p className="text-blue-200 text-sm">Certified operators</p>
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

      {/* Partners Grid */}
      <section className="relative py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-semibold mb-6">
              <Users className="w-4 h-4 mr-2" />
              Our Partners
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Meet Our Local 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {' '}Partners
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Trusted professionals who make your journey safe and memorable through their local expertise and dedication
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {partners.map((partner, index) => (
              <div 
                key={partner.id} 
                className="modern-card group hover:scale-105 transition-all duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="relative">
                      <img 
                        src={partner.logo} 
                        alt={partner.name}
                        className="w-16 h-16 rounded-xl object-cover ring-4 ring-white shadow-lg"
                      />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-3 border-white"></div>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{partner.name}</h3>
                      <span className="modern-badge">{partner.type}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">{partner.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Award className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="font-medium">{partner.experience}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm font-bold text-gray-900">{partner.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="relative py-20 bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 text-white overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-white text-sm font-semibold mb-6 backdrop-blur-md border border-white/20">
              <Shield className="w-4 h-4 mr-2" />
              Our Standards
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Certifications &
              <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Standards
              </span>
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              We maintain the highest standards of safety, quality, and sustainability in everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {certifications.map((cert, index) => (
              <div 
                key={index} 
                className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl group text-center hover:scale-105 transition-all duration-500 rounded-3xl p-8"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <cert.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{cert.title}</h3>
                <p className="text-blue-200 leading-relaxed">{cert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-semibold mb-6">
              <Heart className="w-4 h-4 mr-2" />
              Testimonials
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What Our Travelers
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Say About Us
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Real experiences from real travelers who discovered Pakistan with our trusted partners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id} 
                className="modern-card group hover:scale-105 transition-all duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="relative">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="w-14 h-14 rounded-full object-cover ring-4 ring-white shadow-lg"
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-bold text-gray-900">{testimonial.name}</h4>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>{testimonial.country}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <blockquote className="text-gray-600 italic mb-4 leading-relaxed">
                    "{testimonial.text}"
                  </blockquote>
                  
                  <div className="text-sm font-semibold text-blue-600">
                    Tour: {testimonial.tour}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership CTA */}
      <section className="relative py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-400 to-red-500 rounded-3xl mb-8 shadow-2xl">
            <Heart className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Interested in 
            <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              Partnering with Us?
            </span>
          </h2>
          
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            We're always looking for reliable local partners who share our commitment to 
            providing authentic and sustainable travel experiences in Pakistan.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="modern-btn modern-btn-white group">
              <span>Become a Partner</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="modern-btn modern-btn-outline-white">
              <span>Learn More</span>
            </button>
          </div>
        </div>
      </section>

      {/* Tour Guide Registration Modal */}
      <TourGuideRegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
      />
    </div>
  );
};

export default Partners;
