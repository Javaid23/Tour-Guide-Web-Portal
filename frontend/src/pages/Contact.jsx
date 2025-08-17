import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from 'lucide-react';

/**
 * Contact Page Component
 * Contact information, inquiry form, and office locations
 */
import { useEffect } from "react"
import { useLocation } from "react-router-dom"
const Contact = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [location]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    tourInterest: '',
    message: '',
    travelDate: ''
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission logic would go here
    console.log('Form submitted:', formData);
    alert('Thank you for your inquiry! We\'ll get back to you within 24 hours.');
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      tourInterest: '',
      message: '',
      travelDate: ''
    });
  };

  // Contact information
  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      details: ['+92 21 1234 5678', '+92 300 1234567'],
      description: 'Available 9 AM - 6 PM (PKT)'
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['info@pakistantours.com', 'booking@pakistantours.com'],
      description: 'We respond within 24 hours'
    },
    {
      icon: MapPin,
      title: 'Office',
      details: ['123 Clifton Road', 'Karachi, Pakistan'],
      description: 'Visit us Monday - Saturday'
    },
    {
      icon: Clock,
      title: 'Hours',
      details: ['Mon - Sat: 9:00 AM - 6:00 PM', 'Sunday: 10:00 AM - 4:00 PM'],
      description: 'Pakistan Standard Time (PKT)'
    }
  ];

  // Office locations
  const offices = [
    {
      city: 'Karachi',
      address: '123 Clifton Road, Clifton Block 2, Karachi',
      phone: '+92 21 1234 5678',
      type: 'Main Office'
    },
    {
      city: 'Islamabad',
      address: '456 Blue Area, F-7, Islamabad',
      phone: '+92 51 2345 678',
      type: 'Northern Operations'
    },
    {
      city: 'Lahore',
      address: '789 MM Alam Road, Gulberg III, Lahore',
      phone: '+92 42 3456 789',
      type: 'Cultural Tours Hub'
    }
  ];

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
        className="contact-hero relative min-h-screen flex items-center justify-center overflow-hidden"
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
          {/* Removed hero-badge '📞 Get In Touch' from hero section */}
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
            Let's Plan Your
            <span className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              Perfect Adventure
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white max-w-4xl mx-auto leading-relaxed">
            Ready to explore Pakistan's incredible beauty? Our expert team is here to help you plan an unforgettable journey tailored to your interests and budget.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button className="modern-btn modern-btn-primary group">
              <MessageCircle className="w-5 h-5 mr-2" />
              <span>Start Planning</span>
            </button>
            <button className="modern-btn modern-btn-secondary">
              <Phone className="w-5 h-5 mr-2" />
              <span>Call Now</span>
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

      {/* Contact Form and Info Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="card">
              <div className="card-content">
                <div className="flex mb-3" style={{ alignItems: 'center' }}>
                  <MessageCircle size={24} style={{ color: 'var(--primary-blue)', marginRight: '8px' }} />
                  <h2 style={{ margin: 0 }}>Send us a Message</h2>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Name and Email Row */}
                  <div className="grid grid-2" style={{ marginBottom: '20px' }}>
                    <div className="form-group">
                      <label htmlFor="name" className="form-label">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email" className="form-label">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  {/* Phone and Travel Date Row */}
                  <div className="grid grid-2" style={{ marginBottom: '20px' }}>
                    <div className="form-group">
                      <label htmlFor="phone" className="form-label">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="travelDate" className="form-label">
                        Preferred Travel Date
                      </label>
                      <input
                        type="date"
                        id="travelDate"
                        name="travelDate"
                        value={formData.travelDate}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="form-group">
                    <label htmlFor="subject" className="form-label">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="What can we help you with?"
                    />
                  </div>

                  {/* Tour Interest */}
                  <div className="form-group">
                    <label htmlFor="tourInterest" className="form-label">
                      Tour Interest
                    </label>
                    <select
                      id="tourInterest"
                      name="tourInterest"
                      value={formData.tourInterest}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Select a tour type</option>
                      <option value="adventure">Adventure Tours</option>
                      <option value="cultural">Cultural Heritage</option>
                      <option value="family">Family Tours</option>
                      <option value="luxury">Luxury Tours</option>
                      <option value="custom">Custom Tour</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div className="form-group">
                    <label htmlFor="message" className="form-label">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="form-textarea"
                      placeholder="Tell us about your travel preferences, group size, budget, or any questions you have..."
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <button type="submit" className="btn btn-primary w-100">
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Send size={20} />
                      Send Message
                    </span>
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              {/* Contact Details */}
              <div className="grid grid-2 mb-4">
                {contactInfo.map((info, index) => (
                  <div key={index} className="contact-card">
                    <div className="contact-icon">
                      <info.icon size={24} />
                    </div>
                    <h3 style={{ fontSize: '1.1rem' }}>{info.title}</h3>
                    <div style={{ marginBottom: '8px' }}>
                      {info.details.map((detail, idx) => (
                        <p key={idx} style={{ margin: '4px 0', color: 'var(--dark-gray)' }}>{detail}</p>
                      ))}
                    </div>
                    <p className="text-small text-secondary">{info.description}</p>
                  </div>
                ))}
              </div>

              {/* Office Locations */}
              <div className="card">
                <div className="card-content">
                  <h3>Our Offices</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {offices.map((office, index) => (
                      <div key={index} style={{ borderLeft: '4px solid var(--primary-blue)', paddingLeft: '16px' }}>
                        <div className="flex-between mb-1">
                          <h4 style={{ margin: 0, color: 'var(--dark-gray)' }}>{office.city}</h4>
                          <span className="badge text-small">
                            {office.type}
                          </span>
                        </div>
                        <p className="text-secondary text-small mb-1">{office.address}</p>
                        <p className="text-primary text-small">{office.phone}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="card mt-3" style={{ border: '2px solid #ef4444', background: '#fef2f2' }}>
                <div className="card-content">
                  <h3 style={{ color: '#dc2626' }}>Emergency Contact</h3>
                  <p className="text-small mb-2" style={{ color: '#b91c1c' }}>
                    For urgent matters during your tour or travel emergencies:
                  </p>
                  <p style={{ color: '#dc2626', fontWeight: '600' }}>24/7 Emergency Line: +92 300 9999 999</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section bg-light">
        <div className="container">
          <div className="text-center mb-4">
            <h2>Frequently Asked Questions</h2>
            <p className="text-large text-secondary">
              Quick answers to common questions about traveling in Pakistan
            </p>
          </div>

          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card mb-3">
              <div className="card-content">
                <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>
                  How far in advance should I book my tour?
                </h3>
                <p className="text-secondary">
                  We recommend booking at least 4-6 weeks in advance, especially for peak seasons (April-June and September-November). 
                  This ensures better availability and allows time for necessary permits and preparations.
                </p>
              </div>
            </div>

            <div className="card mb-3">
              <div className="card-content">
                <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>
                  What documents do I need to travel to Pakistan?
                </h3>
                <p className="text-secondary">
                  Most visitors need a valid passport and tourist visa. We can assist with visa guidance and documentation. 
                  Some regions may require additional permits, which we handle as part of our service.
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-content">
                <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>
                  Is it safe to travel in Pakistan?
                </h3>
                <p className="text-secondary">
                  Pakistan is generally safe for tourists, especially in the areas we operate. We work only with experienced local guides, 
                  maintain updated security protocols, and have 24/7 support for all our travelers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
