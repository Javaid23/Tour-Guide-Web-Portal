import { Users, Award, Globe, Heart, Star, Phone, Mail, Shield, Mountain } from "lucide-react"

import { useEffect } from "react"
import { useLocation } from "react-router-dom"
const About = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [location]);
  // Team members 
  const teamMembers = [
    {
      name: "Atif Ishaq Khan",
      position: "CEO & Founder",
      image: "/images/team/atif-ishaq-khan.jpg",
      bio: "With over 10 years in Pakistan's tourism industry, Atif founded Tour Guide to showcase the country's incredible beauty and rich culture to the world.",
      experience: "10 years",
      specialization: "Tourism Strategy & Business Development",
    },
    {
      name: "Razi ullah",
      position: "Head of Operations",
      image: "/images/team/razi-ullah.jpg",
      bio: "Razi ensures seamless operations and exceptional customer experiences. His attention to detail and passion for hospitality make every tour memorable.",
      experience: "6 years",
      specialization: "Operations Management & Customer Experience",
    },
    {
      name: "Muhammad Javaid Butt",
      position: "Senior Mountain Guide",
      image: "/images/team/muhammad-javaid-butt.jpg",
      bio: "A certified mountain guide with extensive experience in the Karakoram and Himalayan ranges. Javaid has successfully led over 200 expeditions to high-altitude destinations.",
      experience: "7 years",
      specialization: "High-Altitude Mountaineering & Trekking",
    },
    {
      name: "Ahsan Ali",
      position: "Cultural Heritage Expert",
      image: "/images/team/ahsan-ali.jpg",
      bio: "Ahsan holds a PhD in Pakistani History and Archaeology. He brings historical sites to life with his deep knowledge of Pakistan's rich cultural heritage.",
      experience: "5 years",
      specialization: "Pakistani History, Archaeology & Cultural Studies",
    },
  ]

  const stats = [
    { icon: Users, label: "Happy Travelers", value: "5,000+" },
    { icon: Award, label: "Years Experience", value: "10+" },
    { icon: Globe, label: "Destinations", value: "50+" },
    { icon: Heart, label: "Customer Rating", value: "4.9/5" },
  ]

  const values = [
    {
      title: "Authentic Experiences",
      description:
        "We provide genuine cultural immersion and authentic local experiences that showcase the real Pakistan.",
      icon: <Shield className="w-8 h-8 text-blue-400" />,
    },
    {
      title: "Safety First",
      description:
        "Your safety is our top priority. We maintain the highest safety standards and work with certified guides.",
      icon: <Shield className="w-8 h-8 text-blue-400" />,
    },
    {
      title: "Sustainable Tourism",
      description:
        "We promote responsible tourism that benefits local communities and preserves Pakistan's natural heritage.",
      icon: <Mountain className="w-8 h-8 text-blue-400" />,
    },
    {
      title: "Expert Guidance",
      description:
        "Our team of local experts and certified guides ensure you get the most out of your Pakistani adventure.",
      icon: <Users className="w-8 h-8 text-blue-400" />,
    },
  ]

  return (
    <div>
      {/* Hero Section with Modern Design */}
      <section
        style={{
          background:
            'linear-gradient(135deg, rgba(30, 64, 175, 0.95) 0%, rgba(59, 130, 246, 0.9) 100%), url("https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg") center/cover',
          padding: '120px 0 80px',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="about-hero relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Animated Background Elements (optional, keep or remove as desired) */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '5%',
            width: '100px',
            height: '100px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            animation: 'float 8s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '20%',
            right: '10%',
            width: '150px',
            height: '150px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            animation: 'float 6s ease-in-out infinite reverse',
          }}
        />
        {/* Hero Content (no text color override needed, text is white by default) */}
        <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto">
          {/* Removed hero-badge '✨ About Tour Guide' from hero section */}
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight">
            Your Gateway to
            <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              Pakistan's Wonders
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white max-w-4xl mx-auto leading-relaxed">
            We are passionate about showcasing Pakistan's incredible beauty, rich culture, and warm hospitality to travelers from around the world. From the towering peaks of the Karakoram to ancient civilizations, we create unforgettable experiences.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button className="modern-btn modern-btn-primary group">
              <span>Our Story</span>
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <button className="modern-btn modern-btn-secondary" onClick={() => {
              document.getElementById('team-section')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              <span>Meet Our Team</span>
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Stats Section with Modern Design */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="modern-icon-card mb-6 group-hover:scale-110 transition-all duration-300">
                  <stat.icon size={32} className="text-white" />
                </div>
                <h3 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </h3>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story with Modern Design */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="hero-badge mb-6">
                <span className="text-sm font-semibold px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full">
                  🌟 Our Journey
                </span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Our Story
              </h2>
              
              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p>
                  Founded in 2015, Tour Guide began as a dream to share Pakistan's hidden treasures with the world.
                  What started as a small local tour company has grown into Pakistan's leading adventure and cultural
                  tourism operator.
                </p>
                <p>
                  We believe that Pakistan is one of the world's most underrated travel destinations. From the mighty
                  peaks of K2 and Nanga Parbat to the ancient cities of Lahore and Multan, from the pristine valleys of
                  Hunza and Swat to the coastal beauty of Balochistan - Pakistan offers experiences that few places on
                  Earth can match.
                </p>
                <p>
                  Our mission is to provide safe, authentic, and transformative travel experiences while supporting local
                  communities and preserving Pakistan's natural and cultural heritage for future generations.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <div className="flex items-center bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-full">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-green-700 font-medium">Sustainable Tourism</span>
                </div>
                <div className="flex items-center bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-2 rounded-full">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-blue-700 font-medium">Expert Guidance</span>
                </div>
                <div className="flex items-center bg-gradient-to-r from-orange-50 to-red-50 px-4 py-2 rounded-full">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                  <span className="text-orange-700 font-medium">Cultural Immersion</span>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-blue-100 bg-gradient-to-br from-blue-800 via-indigo-700 to-blue-600 flex items-center justify-center h-96">
                <div className="text-center px-10 py-8 max-w-md">
                  <div className="text-sm tracking-[0.4em] font-semibold text-blue-200 mb-4">SINCE 2015</div>
                  <h3 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight bg-gradient-to-br from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
                    Tour <span className="text-transparent bg-gradient-to-r from-cyan-200 to-blue-300 bg-clip-text">Guide</span>
                  </h3>
                  <p className="mt-6 text-base md:text-lg text-blue-100/90 leading-relaxed font-medium">
                    Crafting authentic journeys across Pakistan’s mountains, cultures & heritage.
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-3 text-[11px] md:text-xs font-semibold tracking-wide text-blue-100/80">
                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15">TRUSTED</span>
                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15">LOCAL EXPERTS</span>
                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15">NATIONWIDE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values with Modern Design */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <div className="hero-badge mb-6">
              <span className="text-sm font-semibold px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full">
                <Star className="w-4 h-4 inline mr-2" />Our Core Values
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              What We Stand For
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do and shape every experience we create
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div key={index} className="modern-card group hover:scale-105 transition-all duration-300">
                <div className="p-8">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    {value.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-blue-600 transition-colors">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section with Modern Design */}
      <section id="team-section" className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <div className="hero-badge mb-6">
              <span className="text-sm font-semibold px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 text-green-700 rounded-full">
                <Users className="w-4 h-4 inline mr-2" />Our Team
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate professionals who make your Pakistani adventure possible
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {teamMembers.map((member, index) => (
              <div key={index} className="modern-card group hover:scale-105 transition-all duration-300">
                <div className="p-8">
                  <div className="flex items-start gap-6 mb-6">
                    <div className="relative">
                      <img
                        src={member.image || "/placeholder.svg"}
                        alt={member.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-gradient-to-r from-blue-400 to-purple-400"
                      />
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                        {member.name}
                      </h3>
                      <p className="text-blue-600 font-semibold mb-2">{member.position}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                          {member.experience}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 leading-relaxed mb-4">{member.bio}</p>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Specialization:</p>
                    <p className="text-blue-600 font-medium">{member.specialization}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us with Modern Design */}
      <section className="py-20 text-white" style={{background: 'linear-gradient(135deg,#2563eb 0%,#3b82f6 100%)'}}>
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Choose Tour Guide?</h2>
            <p className="text-xl max-w-3xl mx-auto text-blue-50 font-medium tracking-wide">
              We're not just a tour company - we're your gateway to experiencing the real Pakistan
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 text-center group hover:scale-105 transition-all duration-300 rounded-2xl border shadow-xl" style={{background: 'linear-gradient(135deg,#2563eb 0%,#3b82f6 100%)', borderColor: 'rgba(255,255,255,0.25)'}}>
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl mb-6 mx-auto group-hover:scale-110 transition-transform duration-300" style={{background:'rgba(255,255,255,0.18)', backdropFilter:'blur(4px)'}}>
                <Mountain className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold mb-4 text-white">Local Expertise</h4>
              <p className="text-blue-50 leading-relaxed">
                Born and raised in Pakistan, we know the hidden gems and authentic experiences that guidebooks miss.
              </p>
            </div>
            <div className="p-8 text-center group hover:scale-105 transition-all duration-300 rounded-2xl border shadow-xl" style={{background: 'linear-gradient(135deg,#2563eb 0%,#3b82f6 100%)', borderColor: 'rgba(255,255,255,0.25)'}}>
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl mb-6 mx-auto group-hover:scale-110 transition-transform duration-300" style={{background:'rgba(255,255,255,0.18)', backdropFilter:'blur(4px)'}}>
                <Users className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold mb-4 text-white">Community Impact</h4>
              <p className="text-blue-50 leading-relaxed">
                We work directly with local communities, ensuring your travel creates positive economic impact.
              </p>
            </div>
            <div className="p-8 text-center group hover:scale-105 transition-all duration-300 rounded-2xl border shadow-xl" style={{background: 'linear-gradient(135deg,#2563eb 0%,#3b82f6 100%)', borderColor: 'rgba(255,255,255,0.25)'}}>
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl mb-6 mx-auto group-hover:scale-110 transition-transform duration-300" style={{background:'rgba(255,255,255,0.18)', backdropFilter:'blur(4px)'}}>
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold mb-4 text-white">Safety & Support</h4>
              <p className="text-blue-50 leading-relaxed">
                24/7 support, comprehensive insurance, and rigorous safety protocols for your peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
